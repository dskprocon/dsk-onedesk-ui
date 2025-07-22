import { db } from "../firebaseConfig";
import {
    doc,
    updateDoc,
    getDoc,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";

// 🔁 Update user's site assignment + log history
export const updateSiteAssignmentWithHistory = async (uid, newSites = [], assignedBy = "System") => {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        console.warn("User not found for site assignment.");
        return;
    }

    const userData = snapshot.data();
    const oldSites = userData.sites || [];
    const siteHistory = userData.siteHistory || [];

    const today = new Date().toISOString().split("T")[0];

    const newHistory = [...siteHistory];

    // 🔁 Step 1: Close removed sites
    for (const site of oldSites) {
        if (!newSites.includes(site)) {
            // Close any open history entries (to = null)
            const openEntryIndex = newHistory.findIndex(
                (entry) => entry.site === site && entry.to === null
            );
            if (openEntryIndex !== -1) {
                newHistory[openEntryIndex].to = today;
            }
        }
    }

    // ➕ Step 2: Add new assignments
    for (const site of newSites) {
        if (!oldSites.includes(site)) {
            newHistory.push({
                site,
                from: today,
                to: null,
                assignedBy
            });
        }
    }

    // ✅ Step 3: Save updates to Firestore
    await updateDoc(userRef, {
        sites: newSites,
        siteHistory: newHistory,
        lastUpdatedAt: serverTimestamp(),
        lastUpdatedBy: assignedBy
    });
};
