// src/firebase/services/punchinService.js
import { db, storage } from "../firebaseConfig";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 🔁 Upload file and return URL
const uploadFileToStorage = async (personName, file, label) => {
    const fileName = `${label}_${Date.now()}_${file.name}`;
    const cleanName = personName.replace(/\s+/g, "_");
    const storageRef = ref(storage, `registrations/${cleanName}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
};

// 🔢 Auto-generate Employee ID for Head Office
const generateEmployeeID = async () => {
    const q = query(
        collection(db, "registrations"),
        where("category", "==", "Head Office"),
        where("employeeID", ">=", "DSK-EMP-0000"),
        orderBy("employeeID", "desc"),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const lastID = snapshot.docs[0].data().employeeID;
        const lastNum = parseInt(lastID?.split("-")[2] || "0");
        return `DSK-EMP-${(lastNum + 1).toString().padStart(4, "0")}`;
    } else {
        return "DSK-EMP-0001";
    }
};

// ✅ Submit multi-member registration
export const submitRegistration = async ({ category, siteName, teamName, submittedBy, members }) => {
    const finalMembers = [];

    for (const member of members) {
        const {
            personName,
            aadhaarFile,
            photoFile,
            pfFile,
            panFile
        } = member;

        const urls = {};
        if (aadhaarFile) urls.aadhaarURL = await uploadFileToStorage(personName, aadhaarFile, "Aadhaar");
        if (photoFile) urls.photoURL = await uploadFileToStorage(personName, photoFile, "Photo");
        if (pfFile) urls.pfURL = await uploadFileToStorage(personName, pfFile, "PF");
        if (panFile) urls.panURL = await uploadFileToStorage(personName, panFile, "PAN");

        const employeeID = category === "Head Office" ? await generateEmployeeID() : null;

        finalMembers.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            personName,
            ...urls,
            employeeID
        });
    }

    const docRef = await addDoc(collection(db, "registrations"), {
        category,
        siteName,
        teamName,
        members: finalMembers,
        submittedBy,
        submittedAt: serverTimestamp(),
        status: "pending"
    });

    return docRef.id;
};

// ✅ Fetch all pending registrations
export const fetchPendingRegistrations = async () => {
    const q = query(collection(db, "registrations"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Approve/Reject specific member from a group
export const updateRegistrationStatus = async (parentId, memberId, action, remark, reviewedBy) => {
    const regRef = doc(db, "registrations", parentId);
    const snapshot = await getDocs(query(collection(db, "registrations"), where("__name__", "==", parentId)));
    if (snapshot.empty) return;

    const data = snapshot.docs[0].data();
    const members = data.members || [];
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const approvedDoc = {
        ...target,
        parentId,
        category: data.category,
        siteName: data.siteName || null,
        teamName: data.teamName || null,
        status: action,
        remark,
        reviewedBy,
        reviewedAt: serverTimestamp()
    };

    await addDoc(collection(db, "approved_members"), approvedDoc);

    const updatedMembers = members.filter((m) => m.id !== memberId);
    await updateDoc(regRef, { members: updatedMembers });

    if (updatedMembers.length === 0) {
        await updateDoc(regRef, { status: "processed" });
    }
};

// ✅ Get all users from Firestore
export const getAllUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

// ✅ Get all site names from Firestore
export const getAllSites = async () => {
    const snapshot = await getDocs(collection(db, "sites"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get all team names from Firestore
export const getAllTeams = async () => {
    const snapshot = await getDocs(collection(db, "teams"));
    return snapshot.docs.map(doc => doc.data().teamName);
};

// ✅ Update site, team, role, and status for a user
export const updateUserAssignment = async (uid, data) => {
    const ref = doc(db, "users", uid);
    const isActive = data.status === "Active";

    await updateDoc(ref, {
        sites: data.sites,
        teams: data.teams,
        status: data.status,
        role: data.role,
        isActive: isActive,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedAt: serverTimestamp()
    });
};
