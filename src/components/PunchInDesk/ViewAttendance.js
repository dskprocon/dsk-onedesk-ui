// src/components/PunchInDesk/ViewAttendance.js

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import UniversalLayout from "../universal/UniversalLayout";
import Select from "react-select";

function ViewAttendance({ name, role }) {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [personFilter, setPersonFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [siteOptions, setSiteOptions] = useState([]);
    const [selectedSites, setSelectedSites] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const snap = await getDocs(collection(db, "attendance"));
            const list = snap.docs.map(doc => doc.data());
            setData(list);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchSites = async () => {
            const snap = await getDocs(collection(db, "sites"));
            const options = snap.docs.map(doc => ({
                label: doc.data().name,
                value: doc.data().name
            }));
            setSiteOptions(options);
        };
        fetchSites();
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            if (selectedSites.length === 0) {
                setTeamOptions([]);
                return;
            }

            const allTeams = new Set();

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
                    if (team) allTeams.add(team);
                });
            }

            const teamList = Array.from(allTeams).map(t => ({ label: t, value: t }));
            setTeamOptions(teamList);
        };

        fetchTeams();
    }, [selectedSites]);

    useEffect(() => {
        const applyFilters = () => {
            let result = [...data];

            if (role !== "ADMIN") {
                result = result.filter(d => d.personName?.includes(name));
            }

            if (startDate) {
                const s = new Date(startDate);
                result = result.filter(d => {
                    const [dd, mm, yyyy] = d.date.split("/");
                    const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
                    return dateObj >= s;
                });
            }

            if (endDate) {
                const e = new Date(endDate);
                result = result.filter(d => {
                    const [dd, mm, yyyy] = d.date.split("/");
                    const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
                    return dateObj <= e;
                });
            }

            if (categoryFilter !== "All") {
                result = result.filter(d => d.category === categoryFilter);
            }

            if (selectedSites.length > 0) {
                const values = selectedSites.map(s => s.value);
                result = result.filter(d => values.includes(d.siteName));
            }

            if (selectedTeams.length > 0) {
                const values = selectedTeams.map(t => t.value);
                result = result.filter(d => values.includes(d.teamName));
            }

            if (personFilter.trim()) {
                result = result.filter(d =>
                    d.personName?.toLowerCase().includes(personFilter.toLowerCase())
                );
            }

            setFilteredData(result);
        };

        applyFilters();
    }, [data, startDate, endDate, categoryFilter, selectedSites, selectedTeams, personFilter, role]);

    return (
        <UniversalLayout title="OneDesk Pro" subtitle="by DSK Procon" name={name} role={role}>
            <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">📅 Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">📅 End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">🧍 Person Name</label>
                        <input
                            type="text"
                            value={personFilter}
                            onChange={e => setPersonFilter(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                            placeholder="Search by name..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">🏷 Category</label>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        >
                            <option value="All">All</option>
                            <option value="Head Office">Head Office</option>
                            <option value="Site">Site</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">🏗 Sites</label>
                        <Select
                            options={siteOptions}
                            isMulti
                            value={selectedSites}
                            onChange={setSelectedSites}
                            className="w-full border border-gray-400 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">👥 Teams</label>
                        <Select
                            options={teamOptions}
                            isMulti
                            value={selectedTeams}
                            onChange={setSelectedTeams}
                            className="w-full border border-gray-400 rounded"
                        />
                    </div>
                </div>

                <div className="border border-gray-400 rounded max-h-[400px] overflow-y-auto mt-4">
                    <table className="w-full table-auto text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-3 py-2 border">Date</th>
                                <th className="px-3 py-2 border">Name</th>
                                <th className="px-3 py-2 border">Category</th>
                                <th className="px-3 py-2 border">Site</th>
                                <th className="px-3 py-2 border">Team</th>
                                <th className="px-3 py-2 border">Time In</th>
                                <th className="px-3 py-2 border">Late</th>
                                <th className="px-3 py-2 border">Half Day</th>
                                <th className="px-3 py-2 border">Marked By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((d, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 py-1 border">{d.date}</td>
                                    <td className="px-3 py-1 border">{d.personName}</td>
                                    <td className="px-3 py-1 border">{d.category}</td>
                                    <td className="px-3 py-1 border">{d.siteName}</td>
                                    <td className="px-3 py-1 border">{d.teamName}</td>
                                    <td className="px-3 py-1 border">{d.timeIn}</td>
                                    <td className="px-3 py-1 border">{d.isLate ? "Yes" : "No"}</td>
                                    <td className="px-3 py-1 border">{d.halfDay ? "Yes" : "No"}</td>
                                    <td className="px-3 py-1 border">{d.markedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default ViewAttendance;
