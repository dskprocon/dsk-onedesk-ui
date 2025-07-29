// src/components/PunchInDesk/MarkTeamForm.jsx

import React, { useEffect, useState } from "react";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Select from "react-select";
import useLocation from "../../hooks/useLocation";
import { getUserAssignment } from "../../firebase/services/punchinService";
import { MapPin, Users, CalendarDays, Clock } from "lucide-react";
import { universalButtonClass } from "../universal/UniversalStyles";
import { showSuccess, showError } from "../../utils/alertUtils";

function MarkTeamForm({ name }) {
    const [selectedSites, setSelectedSites] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [groupedMembers, setGroupedMembers] = useState({});
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { location, locationName, loading, error } = useLocation(true);

    function getTodayDate() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        const dd = String(ist.getDate()).padStart(2, "0");
        const mm = String(ist.getMonth() + 1).padStart(2, "0");
        const yyyy = ist.getFullYear();
        return `${dd}-${mm}-${yyyy}`; // ✅ DD-MM-YYYY
    }

    function getCurrentISTTime() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toTimeString().slice(0, 5);
    }

    // Load assigned sites
    useEffect(() => {
        const fetchAssignedSites = async () => {
            const assignment = await getUserAssignment(name);
            const siteList = assignment.sites || [];
            setSiteOptions(siteList.map(s => ({ label: s, value: s })));
        };
        fetchAssignedSites();
    }, [name]);

    // Fetch teams based on selected sites
    useEffect(() => {
        const fetchTeams = async () => {
            if (selectedSites.length === 0) {
                setTeamOptions([]);
                return;
            }

            const teamSet = new Set();
            for (const site of selectedSites) {
                const q = query(
                    collection(db, "registrations"),
                    where("sites", "array-contains", site.value),
                    where("status", "==", "approved")
                );
                const snap = await getDocs(q);
                snap.forEach(doc => {
                    const data = doc.data();
                    const team = data.teams?.[0] || data.teamName;
                    if (team) teamSet.add(team);
                });
            }
            setTeamOptions(Array.from(teamSet).map(t => ({ label: t, value: t })));
        };
        fetchTeams();
    }, [selectedSites]);

    // Fetch members for selected sites
    useEffect(() => {
        const fetchMembers = async () => {
            if (selectedSites.length === 0) {
                setGroupedMembers({});
                return;
            }

            const membersMap = {};
            for (const site of selectedSites) {
                const q = query(
                    collection(db, "registrations"),
                    where("sites", "array-contains", site.value),
                    where("status", "==", "approved")
                );
                const snap = await getDocs(q);

                const list = snap.docs
                    .map(doc => {
                        const data = doc.data();
                        const memberTeam = data.teams?.[0] || data.teamName;
                        return {
                            id: doc.id,
                            name: data.personName,
                            site: site.value,
                            team: memberTeam,
                            category: data.category
                        };
                    })
                    .filter(m =>
                        m.name &&
                        m.category === "Site" &&
                        (!selectedTeams.length || selectedTeams.some(t => t.value === m.team))
                    );

                if (list.length > 0) {
                    const key = `${site.value}`;
                    membersMap[key] = list;
                }
            }
            setGroupedMembers(membersMap);
        };
        fetchMembers();
    }, [selectedSites, selectedTeams, name]);

    const toggleMember = (memberName) => {
        setSelectedMembers(prev =>
            prev.includes(memberName)
                ? prev.filter(p => p !== memberName)
                : [...prev, memberName]
        );
    };

    const toggleSelectAll = () => {
        const allMembers = Object.values(groupedMembers).flat().map(m => m.name);
        const allSelected = allMembers.every(m => selectedMembers.includes(m));
        setSelectedMembers(allSelected ? [] : allMembers);
    };

    const handleSubmit = async () => {
        if (!location) {
            showError("❌ Unable to detect location. Please try again.");
            return;
        }

        if (selectedMembers.length === 0) {
            showError("❌ Please select at least one member.");
            return;
        }

        const timeIn = getCurrentISTTime();
        const date = getTodayDate();
        const isLate = timeIn > "10:00";
        const halfDay = timeIn > "11:00";

        for (const memberName of selectedMembers) {
            for (const groupKey of Object.keys(groupedMembers)) {
                const member = groupedMembers[groupKey].find(m => m.name === memberName);
                if (!member) continue;

                const sitePart = member.site.replace(/\s+/g, "_");
                const teamPart = member.team.replace(/\s+/g, "_");
                const docId = `${member.name.replace(/\s+/g, "_")}_${sitePart}_${teamPart}_${date.replace(/-/g, "")}`;

                const docRef = doc(db, "attendance", docId);
                const existing = await getDoc(docRef);
                if (existing.exists()) continue;

                await setDoc(docRef, {
                    attendanceId: docId,
                    personName: member.name,
                    category: "Site",
                    siteName: member.site,
                    teamName: member.team,
                    timeIn,
                    isLate,
                    halfDay,
                    date,
                    location,
                    locationName,
                    markedBy: name,
                    status: "pending",
                    markedAt: serverTimestamp()
                });
            }
        }

        showSuccess(`✅ Attendance marked for ${selectedMembers.length} member(s).`);
        setSelectedMembers([]);
    };

    return (
        <div className="space-y-6 text-left">
            {/* Site */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <MapPin className="inline-block mr-1" size={14} /> Select Site(s)
                </label>
                <Select isMulti options={siteOptions} value={selectedSites} onChange={setSelectedSites} />
            </div>

            {/* Team */}
            {selectedSites.length > 0 && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        <Users className="inline-block mr-1" size={14} /> Select Team(s)
                    </label>
                    <Select isMulti options={teamOptions} value={selectedTeams} onChange={setSelectedTeams} />
                </div>
            )}

            {/* Date */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <CalendarDays className="inline-block mr-1" size={14} /> Date
                </label>
                <div className="text-sm font-semibold text-gray-700">{getTodayDate()}</div>
            </div>

            {/* Time */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Clock className="inline-block mr-1" size={14} /> Time In
                </label>
                <div className="text-sm font-semibold text-gray-700">{getCurrentISTTime()}</div>
            </div>

            {/* Members */}
            {Object.keys(groupedMembers).length > 0 && (
                <div className="border border-gray-400 p-3 rounded bg-white max-h-80 overflow-y-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        <input
                            type="checkbox"
                            className="mr-2"
                            onChange={toggleSelectAll}
                            checked={Object.values(groupedMembers).flat().every(m => selectedMembers.includes(m.name))}
                        />
                        Select All ({Object.values(groupedMembers).flat().length})
                    </label>

                    {Object.entries(groupedMembers).map(([site, members]) => (
                        <div key={site} className="mb-3 border border-gray-300 rounded p-2 bg-gray-50">
                            <label className="block font-semibold mb-1">
                                🏗 {site}
                            </label>
                            {members.map(m => (
                                <label key={m.id} className="block text-sm">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedMembers.includes(m.name)}
                                        onChange={() => toggleMember(m.name)}
                                    />
                                    {m.name} ({m.team})
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {selectedMembers.length > 0 && (
                <button onClick={handleSubmit} className={`${universalButtonClass} w-full bg-gray-200 hover:bg-gray-300`}>
                    ✅ Submit for {selectedMembers.length} Member(s)
                </button>
            )}
        </div>
    );
}

export default MarkTeamForm;
