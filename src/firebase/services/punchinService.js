// src/firebase/services/punchinService.js

import { db } from "../firebaseConfig";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "firebase/firestore";

// 🔹 Get all users (with UID)
export const getAllUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

// 🔹 Get all site names
export const getAllSites = async () => {
    const snapshot = await getDocs(collection(db, "sites"));
    return snapshot.docs.map(doc => doc.data().name);
};

// 🔹 Get assigned site/team for given person name
export const getUserAssignment = async (personName) => {
    const q = query(collection(db, "registrations"), where("personName", "==", personName), where("status", "==", "approved"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        return {
            siteName: user.sites?.[0] || "",
            teamName: user.teams?.[0] || "",
            sites: user.sites || [],
            teams: user.teams || []
        };
    }
    return { siteName: "", teamName: "", sites: [], teams: [] };
};

// 🔹 Get list of team names assigned to a site
export const getTeamsBySite = async (siteName) => {
    const q = query(
        collection(db, "registrations"),
        where("sites", "array-contains", siteName),
        where("status", "==", "approved")
    );

    const snapshot = await getDocs(q);
    const teams = new Set();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const team = data.teams?.[0] || data.teamName || "";
        if (team) teams.add(team);
    });

    return Array.from(teams);
};

// 🔹 Get list of users belonging to a team at a site
export const getMembersByTeamAndSite = async (teamName, siteName) => {
    const q = query(
        collection(db, "users"),
        where("teamName", "==", teamName),
        where("sites", "array-contains", siteName)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => !!u.name);
};

// 🔹 Generate unique attendanceId based on date
export const generateAttendanceId = async (date) => {
    const snapshot = await getDocs(query(collection(db, "attendance"), where("date", "==", date)));
    const count = snapshot.size + 1;
    const padded = String(count).padStart(3, "0");
    return `ATTN_${date.replaceAll("-", "")}_${padded}`;
};

// 🔹 Get user by name (used for PunchIn display format)
export const getMemberByName = async (personName) => {
    const q = query(collection(db, "users"), where("name", "==", personName));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    return null;
};

// ✅ NEW FUNCTION: Check if today's attendance is marked
export const getTodayAttendanceStatus = async (personName) => {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

    const q = query(
        collection(db, "attendance"),
        where("personName", "==", personName),
        where("date", "==", today)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const status = snapshot.docs[0].data().status || "pending";
        return status.toLowerCase(); // 'approved', 'pending', etc.
    }

    return "not_marked"; // Default if no entry found
};
