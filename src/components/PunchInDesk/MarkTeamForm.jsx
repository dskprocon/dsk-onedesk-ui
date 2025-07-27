// src/components/PunchInDesk/MarkTeamForm.jsx

import React, { useEffect, useState } from "react";
import {
        collection,
        getDocs,
        doc,
        setDoc,
        getDoc,
        query,
        where,
        serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Select from "react-select";
import useLocation from "../../hooks/useLocation";
import { getUserAssignment } from "../../firebase/services/punchinService";

function MarkTeamForm({ name }) {
        const [selectedSite, setSelectedSite] = useState(null);
        const [siteOptions, setSiteOptions] = useState([]);

        const [selectedTeam, setSelectedTeam] = useState(null);
        const [teamOptions, setTeamOptions] = useState([]);

        const [members, setMembers] = useState([]);
        const [selectedMembers, setSelectedMembers] = useState([]);

        const [submitted, setSubmitted] = useState(false);

        const { location, locationName, loading, error } = useLocation(true);

        function getTodayDate() {
                const now = new Date();
                const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                const ist = new Date(utc + 19800000);

                const dd = String(ist.getDate()).padStart(2, "0");
                const mm = String(ist.getMonth() + 1).padStart(2, "0");
                const yyyy = ist.getFullYear();

                return `${dd}/${mm}/${yyyy}`;
        }

        function getCurrentISTTime() {
                const now = new Date();
                const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                const ist = new Date(utc + 19800000);
                return ist.toTimeString().slice(0, 5);
        }

        // 🔹 Load assigned site list from user assignment (registrations collection)
        useEffect(() => {
                const fetchAssignedData = async () => {
                        const assignment = await getUserAssignment(name);
                        const siteList = assignment.sites || [];
                        setSiteOptions(siteList.map((s) => ({ label: s, value: s })));
                };
                fetchAssignedData();
        }, []);

        // 🔹 When a site is selected, fetch dynamic team list
        useEffect(() => {
                const fetchTeamsForSite = async () => {
                        if (!selectedSite) return;

                        const q = query(
                                collection(db, "registrations"),
                                where("sites", "array-contains", selectedSite.value),
                                where("status", "==", "approved")
                        );

                        const snap = await getDocs(q);
                        const teamSet = new Set();

                        snap.forEach(doc => {
                                const data = doc.data();
                                const team = data.teams?.[0] || data.teamName;
                                if (team) teamSet.add(team);
                        });

                        const filteredTeams = [...teamSet].map(t => ({ label: t, value: t }));
                        setTeamOptions(filteredTeams);
                };

                fetchTeamsForSite();
        }, [selectedSite]);

        // 🔹 When site + team selected, fetch matching members
        useEffect(() => {
                if (selectedSite && selectedTeam) {
                        const fetchMembers = async () => {
                                const q = query(
                                        collection(db, "registrations"),
                                        where("sites", "array-contains", selectedSite.value),
                                        where("status", "==", "approved")
                                );
                                const snap = await getDocs(q);

                                const list = snap.docs
                                        .map(doc => {
                                                const data = doc.data();
                                                const team = data.teams?.[0] || data.teamName;
                                                return {
                                                        id: doc.id,
                                                        name: data.personName,
                                                        team,
                                                        category: data.category,
                                                        assignedBy: data.assignedBy || "",
                                                };
                                        })
                                        .filter(m =>
                                                m.name &&
                                                m.team === selectedTeam.value &&
                                                m.category === "Site" &&
                                                m.assignedBy === name
                                        );

                                setMembers(list);
                        };

                        fetchMembers();
                }
        }, [selectedSite, selectedTeam]);

        const toggleMember = (name) => {
                setSelectedMembers((prev) =>
                        prev.includes(name)
                                ? prev.filter((p) => p !== name)
                                : [...prev, name]
                );
        };

        const selectAll = () => {
                setSelectedMembers(
                        selectedMembers.length === members.length
                                ? []
                                : members.map((m) => m.name)
                );
        };

        const handleSubmit = async () => {
                const timeIn = getCurrentISTTime();
                const selectedDate = getTodayDate();
                const isLate = timeIn > "10:00";
                const halfDay = timeIn > "11:00";

                for (const memberName of selectedMembers) {
                        const matched = members.find((m) => m.name === memberName);
                        if (!matched) continue;

                        const sitePart = selectedSite.value.replace(/\s+/g, "_");
                        const teamPart = selectedTeam.value.replace(/\s+/g, "_");
                        const docId = `${matched.name.replace(/\s+/g, "_")}_${sitePart}_${teamPart}_${selectedDate.replace(/-/g, "")}`;

                        const docRef = doc(db, "attendance", docId);
                        const existing = await getDoc(docRef);
                        if (existing.exists()) continue;

                        const data = {
                                attendanceId: docId,
                                personName: matched.name,
                                category: "Site",
                                siteName: selectedSite.value,
                                teamName: selectedTeam.value,
                                timeIn,
                                isLate,
                                halfDay,
                                date: selectedDate,
                                location,
                                locationName,
                                markedBy: name,
                                status: "approved",
                                markedAt: serverTimestamp()
                        };

                        await setDoc(docRef, data);
                }

                setSubmitted(true);
                setSelectedMembers([]);
        };

        return (
                <div className="space-y-6 text-left">
                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">🏗 Select Site</label>
                                <Select options={siteOptions} value={selectedSite} onChange={setSelectedSite} />
                        </div>

                        {selectedSite && (
                                <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">👥 Select Team</label>
                                        <Select options={teamOptions} value={selectedTeam} onChange={setSelectedTeam} />
                                </div>
                        )}

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                                <div className="text-sm font-semibold text-gray-700">{getTodayDate()}</div>
                        </div>

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">⏱ Time In</label>
                                <div className="text-sm font-semibold text-gray-700">{getCurrentISTTime()}</div>
                        </div>

                        <div className="text-sm text-gray-700">
                                Location:{" "}
                                <span className="text-gray-500">
                                        {loading ? "Detecting..." : locationName}
                                </span>
                        </div>

                        {error && (
                                <p className="text-red-600 text-sm font-semibold">{error}</p>
                        )}

                        {members.length > 0 && (
                                <div className="border border-gray-400 p-3 rounded bg-white max-h-64 overflow-y-auto">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        onChange={selectAll}
                                                        checked={selectedMembers.length === members.length}
                                                />
                                                Select All ({members.length})
                                        </label>
                                        {members.map((m, i) => (
                                                <label key={i} className="block text-sm">
                                                        <input
                                                                type="checkbox"
                                                                className="mr-2"
                                                                checked={selectedMembers.includes(m.name)}
                                                                onChange={() => toggleMember(m.name)}
                                                        />
                                                        {m.name}
                                                </label>
                                        ))}
                                </div>
                        )}

                        {selectedMembers.length > 0 && (
                                <button
                                        onClick={handleSubmit}
                                        className="w-full border border-gray-400 px-3 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300"
                                >
                                        ✅ Submit for {selectedMembers.length} Member(s)
                                </button>
                        )}

                        {submitted && (
                                <p className="text-green-600 font-semibold text-center">
                                        ✅ Attendance marked successfully.
                                </p>
                        )}
                </div>
        );
}

export default MarkTeamForm;
