// src/firebase/services/siteService.js

import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

// ✅ Add new site with duplicate check
export const addNewSite = async (siteName, createdBy) => {
    const q = query(collection(db, "sites"), where("name", "==", siteName));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        throw new Error("Site already exists");
    }

    await addDoc(collection(db, "sites"), {
        name: siteName,
        createdAt: new Date(),
        createdBy
    });
};
