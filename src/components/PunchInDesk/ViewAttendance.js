// src/components/PunchInDesk/ViewAttendance.js

import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalTable from "../universal/UniversalTable";
import { universalInputClass, universalLabelClass } from "../universal/UniversalStyles";
import Select from "react-select";
import { getUserAssignment } from "../../firebase/services/punchinService";

function ViewAttendance({ name, role }) {
    const [attendanceData, setAttendanceData] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [personFilter, setPersonFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [siteOptions, setSiteOptions] = useState([]);
    const [selectedSites, setSelectedSites] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [userSites, setUserSites] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);
        setEndDate(today);

        const fetchData = async () => {
            const assignment = await getUserAssignment(name);
            setUserSites(assignment.sites || []);

            const [attSnap, regSnap, siteSnap] = await Promise.all([
                getDocs(collection(db, "attendance")),
                getDocs(query(collection(db, "registrations"), where("status", "==", "approved"))),
                getDocs(collection(db, "sites"))
            ]);

            setAttendanceData(attSnap.docs.map(doc => doc.data()));
            setRegistrations(regSnap.docs.map(doc => doc.data()));
            setSiteOptions(siteSnap.docs.map(doc => ({
                label: doc.data().name,
                value: doc.data().name
            })));
        };

        fetchData();
    }, [name]);

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
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    const team = data.teams?.[0] || data.teamName;
                    if (team) teamSet.add(team);
                });
            }

            setTeamOptions(Array.from(teamSet).map(t => ({ label: t, value: t })));
        };

        fetchTeams();
    }, [selectedSites]);

    useEffect(() => {
        const attMap = new Map();
        attendanceData.forEach(d => {
            attMap.set(`${d.personName}_${d.date}`, d); // ✅ Match dd-mm-yyyy
        });

        const getDateRange = (start, end) => {
            const dates = [];
            const curr = new Date(start);
            const last = new Date(end);
            while (curr <= last) {
                const dd = String(curr.getDate()).padStart(2, "0");
                const mm = String(curr.getMonth() + 1).padStart(2, "0");
                const yyyy = curr.getFullYear();
                dates.push(`${dd}-${mm}-${yyyy}`); // ✅ Match attendance format
                curr.setDate(curr.getDate() + 1);
            }
            return dates;
        };

        const applyFilters = () => {
            const result = [];
            const dates = getDateRange(startDate, endDate);

            registrations.forEach(reg => {
                const fullName = reg.personName || "";
                const personName = fullName.split(" (ID-")[0];
                const category = reg.category;
                const siteName = reg.siteName || reg.sites?.[0] || "—";
                const teamName = reg.teamName || reg.teams?.[0] || "—";

                dates.forEach(date => {
                    const key = `${reg.personName}_${date}`;
                    const att = attMap.get(key);

                    const row = {
                        Date: date,
                        Name: personName,
                        Category: category,
                        Site: category === "Head Office" ? "—" : siteName,
                        Team: category === "Head Office" ? "—" : teamName,
                        "Time In": att?.timeIn || "—",
                        Late: att?.isLate ? "Yes" : "—",
                        "Half Day": att?.halfDay ? "Yes" : "—",
                        "Marked By": att?.markedBy || "❌ Not Marked"
                    };

                    const passesCategory = categoryFilter === "All" || row.Category === categoryFilter;
                    const passesPerson = !personFilter || personName.toLowerCase().includes(personFilter.toLowerCase());
                    const passesSite = selectedSites.length === 0 || selectedSites.some(s => s.value === row.Site);
                    const passesTeam = selectedTeams.length === 0 || selectedTeams.some(t => t.value === row.Team);

                    // ✅ Access control
                    const isAllowed =
                        role === "ADMIN"
                            ? true
                            : personName === name || userSites.includes(row.Site);

                    if (passesCategory && passesPerson && passesSite && passesTeam && isAllowed) {
                        result.push(row);
                    }
                });
            });

            result.sort((a, b) => {
                const dateA = new Date(a.Date.split("-").reverse().join("-"));
                const dateB = new Date(b.Date.split("-").reverse().join("-"));
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
                if (a.Site < b.Site) return -1;
                if (a.Site > b.Site) return 1;
                if (a.Team < b.Team) return -1;
                if (a.Team > b.Team) return 1;
                return a.Name.localeCompare(b.Name);
            });

            setFilteredData(result);
        };

        applyFilters();
    }, [attendanceData, registrations, startDate, endDate, personFilter, categoryFilter, selectedSites, selectedTeams, role, userSites]);

    const headers = [
        "Date", "Name", "Category", "Site", "Team",
        "Time In", "Late", "Half Day", "Marked By"
    ];

    return (
        <UniversalLayout name={name} role={role}>
            <div className="w-full max-w-[1200px] px-4 md:px-8 mx-auto py-8 space-y-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={universalLabelClass}>📅 Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className={universalInputClass}
                        />
                    </div>
                    <div>
                        <label className={universalLabelClass}>📅 End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className={universalInputClass}
                        />
                    </div>
                    <div>
                        <label className={universalLabelClass}>🔎 Person Name</label>
                        <input
                            type="text"
                            value={personFilter}
                            onChange={e => setPersonFilter(e.target.value)}
                            className={universalInputClass}
                            placeholder="Search by name..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={universalLabelClass}>🏷 Category</label>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className={universalInputClass}
                        >
                            <option value="All">All</option>
                            <option value="Head Office">Head Office</option>
                            <option value="Site">Site</option>
                        </select>
                    </div>
                    <div>
                        <label className={universalLabelClass}>📍 Site</label>
                        <Select
                            isMulti
                            options={siteOptions}
                            value={selectedSites}
                            onChange={setSelectedSites}
                            styles={{
                                control: base => ({
                                    ...base,
                                    border: "1px solid #9ca3af",
                                    borderRadius: "0.375rem",
                                    padding: "0.15rem 0.25rem",
                                    fontSize: "1rem"
                                })
                            }}
                        />
                    </div>
                    <div>
                        <label className={universalLabelClass}>👥 Team</label>
                        <Select
                            isMulti
                            options={teamOptions}
                            value={selectedTeams}
                            onChange={setSelectedTeams}
                            styles={{
                                control: base => ({
                                    ...base,
                                    border: "1px solid #9ca3af",
                                    borderRadius: "0.375rem",
                                    padding: "0.15rem 0.25rem",
                                    fontSize: "1rem"
                                })
                            }}
                        />
                    </div>
                </div>

                <UniversalTable headers={headers} rows={filteredData} />
            </div>
        </UniversalLayout>
    );
}

export default ViewAttendance;
