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
    limit,
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

// 🔢 Generate Auto Employee ID (Head Office only)
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
        const nextID = `DSK-EMP-${(lastNum + 1).toString().padStart(4, "0")}`;
        return nextID;
    } else {
        return "DSK-EMP-0001";
    }
};

// ✅ Submit new registration request
export const submitRegistration = async (data, files) => {
    const urls = {};

    if (files.aadhaar) {
        urls.aadhaarURL = await uploadFileToStorage(data.personName, files.aadhaar, "Aadhaar");
    }
    if (files.photo) {
        urls.photoURL = await uploadFileToStorage(data.personName, files.photo, "Photo");
    }
    if (files.pf) {
        urls.pfURL = await uploadFileToStorage(data.personName, files.pf, "PF");
    }
    if (files.pan) {
        urls.panURL = await uploadFileToStorage(data.personName, files.pan, "PAN");
    }

    // 🆔 Add Employee ID only for Head Office
    if (data.category === "Head Office") {
        data.employeeID = await generateEmployeeID();
    }

    const docRef = await addDoc(collection(db, "registrations"), {
        ...data,
        ...urls,
        status: "pending",
        submittedAt: serverTimestamp()
    });

    return docRef.id;
};

// ✅ Fetch all pending approvals
export const fetchPendingRegistrations = async () => {
    const q = query(collection(db, "registrations"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Approve or Reject with remark
export const updateRegistrationStatus = async (id, action, remark, reviewedBy) => {
    const docRef = doc(db, "registrations", id);
    await updateDoc(docRef, {
        status: action,
        reviewedBy,
        reviewedAt: serverTimestamp(),
        remark
    });
};
