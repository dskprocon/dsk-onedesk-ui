// src/firebase/services/registrationService.js

import {
    collection,
    setDoc,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, storage, auth } from "../firebaseConfig";

// ✅ Fetch all members
export const getAllMembers = async () => {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

// ✅ Upload a file and return its URL
export const uploadFileAndGetURL = async (file, path) => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
};

// ✅ Generate Employee ID
export const generateNextEmployeeId = async (category = "Site") => {
    const snapshot = await getDocs(collection(db, "registrations"));
    let prefix = category === "Head Office" ? "DSK_HO_" : "DSK_SITE_";
    let maxId = 0;

    snapshot.docs.forEach(doc => {
        const eid = doc.data()?.employeeId || "";
        if (eid.startsWith(prefix)) {
            const num = parseInt(eid.replace(prefix, ""), 10);
            if (!isNaN(num) && num > maxId) maxId = num;
        }
    });

    const next = String(maxId + 1).padStart(3, "0");
    return `${prefix}${next}`;
};

// ✅ Submit new registration
export const submitRegistration = async (data, files) => {
    const timestamp = Date.now();
    const cleanName = data.personName.replace(/\s+/g, "_");
    const id = `${cleanName}_${timestamp}`;

    const urls = {};
    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const safeName = `${key}_${timestamp}_${file.name}`;
            const path = `registrations/${cleanName}/${safeName}`;
            urls[key] = await uploadFileAndGetURL(file, path);
        }
    }

    const payload = {
        ...data,
        documents: urls,
        status: "pending",
        submittedAt: serverTimestamp()
    };

    await setDoc(doc(db, "registrations", id), payload);
};

// ✅ Fetch pending registrations
export const fetchPendingRegistrations = async () => {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    return querySnapshot.docs
        .map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))
        .filter((entry) => entry.status === "pending");
};

// ✅ Update approval status
export const updateRegistrationStatus = async (entryId, action, remark = "", approvedBy = "") => {
    const ref = doc(db, "registrations", entryId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Entry not found");

    const entry = snap.data();

    await updateDoc(ref, {
        status: action,
        approvalRemark: remark,
        approvedBy,
        approvedAt: serverTimestamp()
    });

    if (action === "approved" && entry.category === "Head Office") {
        const uid = `${entry.personName}_${Date.now()}`.replace(/\s+/g, "_");

        try {
            await createUserWithEmailAndPassword(auth, entry.email, entry.password);
        } catch (authErr) {
            console.error("⚠️ Firebase Auth user creation failed:", authErr);
            throw new Error("Email already exists or invalid");
        }

        const userDoc = {
            name: entry.personName,
            email: entry.email || "",
            role: entry.role || "",
            requiresLogin: true,
            uid,
            createdAt: serverTimestamp(),
            documents: {
                aadhaarFront: entry.documents?.aadhaarFront || entry.documents?.aadhaarURL || "",
                aadhaarBack: entry.documents?.aadhaarBack || "",
                panCard: entry.documents?.panCard || entry.documents?.panURL || "",
                pf: entry.documents?.pf || entry.documents?.pfURL || "",
                photo: entry.documents?.photo || entry.documents?.photoURL || ""
            }
        };

        await setDoc(doc(db, "users", uid), userDoc);
    }
};

// ✅ Get single member
export const getMemberById = async (id) => {
    const ref = doc(db, "registrations", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id, ...snap.data() };
};

// ✅ Relieve member
export const relieveMember = async (id) => {
    const ref = doc(db, "registrations", id);
    await updateDoc(ref, {
        status: "relieved",
        relievedAt: serverTimestamp()
    });
};

// ✅ Update selected fields (text OR document URLs)
export const updateMemberFields = async (id, data) => {
    const ref = doc(db, "registrations", id);
    await updateDoc(ref, data);
};

// ✅ Replace specific document in Modify flow
export const replaceDocument = async (memberName, fileKey, file) => {
    if (!file || !fileKey) return null;

    const timestamp = Date.now();
    const cleanName = memberName.replace(/\s+/g, "_");
    const safeName = `${fileKey}_${timestamp}_${file.name}`;
    const path = `registrations/${cleanName}/${safeName}`;

    const url = await uploadFileAndGetURL(file, path);
    return url;
};

// ✅ Get All Sites
export const getAllSites = async () => {
    const snapshot = await getDocs(collection(db, "sites"));
    return snapshot.docs.map(doc => doc.data().name);
};

// ✅ Get All Teams
export const getAllTeams = async () => {
    const snapshot = await getDocs(collection(db, "teams"));
    return snapshot.docs.map(doc => doc.data().teamName);
};

// ✅ Assign Site with History (New Logic)
export const assignSiteWithHistory = async (id, newSite, teams, assignedBy, autoUnassign = false) => {
    const ref = doc(db, "registrations", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Member not found");

    const member = snap.data();
    const today = new Date().toISOString().split("T")[0];
    const isTeamLeader = (member.role || "").toLowerCase() === "site head";
    const currentSite = (member.sites || [])[0];

    const siteHistory = member.siteHistory || [];

    // Block if already on different site and not a team leader
    if (!autoUnassign && currentSite && currentSite !== newSite && !isTeamLeader) {
        throw new Error(`❌ ${member.personName} is already assigned to "${currentSite}".`);
    }

    // Close old record
    if (autoUnassign && currentSite && currentSite !== newSite) {
        const last = siteHistory[siteHistory.length - 1];
        if (last && last.to === null) {
            last.to = today;
        }
    }

    // Add new entry
    siteHistory.push({
        site: newSite,
        from: today,
        to: null
    });

    await updateDoc(ref, {
        sites: [newSite],
        teams,
        assignedBy,
        assignedAt: serverTimestamp(),
        siteHistory
    });
};
