// src/firebase/services/registrationService.js

import {
    collection,
    setDoc,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, storage, auth } from "../firebaseConfig";

// ✅ Fetch all members (approved, relieved)
export const getAllMembers = async () => {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

// ✅ Upload a file and return its URL
const uploadFileAndGetURL = async (file, path) => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
};

// ✅ Generate Employee ID based on max existing
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

// ✅ Submit a registration entry
export const submitRegistration = async (data, files) => {
    const timestamp = Date.now();
    const cleanName = data.personName.replace(/\s+/g, "_");
    const id = `${cleanName}_${timestamp}`;

    const urls = {};
    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const safeName = `${key}_${timestamp}_${file.name}`;
            const path = `registrations/${cleanName}/${safeName}`;
            urls[key + "URL"] = await uploadFileAndGetURL(file, path);
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

// ✅ Approve or reject registration
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
                aadhaar: entry.documents?.aadhaarURL || "",
                photo: entry.documents?.photoURL || "",
                pf: entry.documents?.pfURL || "",
                pan: entry.documents?.panURL || ""
            }
        };

        await setDoc(doc(db, "users", uid), userDoc);
    }
};

// ✅ Get single member by ID
export const getMemberById = async (id) => {
    const ref = doc(db, "registrations", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id, ...snap.data() };
};

// ✅ Relieve Member
export const relieveMember = async (id) => {
    const ref = doc(db, "registrations", id);
    await updateDoc(ref, {
        status: "relieved",
        relievedAt: serverTimestamp()
    });
};

// ✅ Update selected member fields (fully dynamic now)
export const updateMemberFields = async (id, data) => {
    const ref = doc(db, "registrations", id);
    await updateDoc(ref, data);
};
