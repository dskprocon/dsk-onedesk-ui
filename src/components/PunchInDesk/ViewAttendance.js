// src/components/PunchInDesk/ViewAttendance.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import UniversalLayout from "../universal/UniversalLayout";

function ViewAttendance({ name, role }) {
    const [attendanceData, setAttendanceData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [personFilter, setPersonFilter] = useState("");
    const [siteFilter, setSiteFilter] = useState("");
    const [teamFilter, setTeamFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);

        const q = query(collection(db, "attendance"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(doc => doc.data());

        const filtered = allData.filter(entry => {
            const isInDateRange = entry.date >= startDate && entry.date <= endDate;
            const matchesUser = role.toUpperCase() === "ADMIN" || entry.personName === name;
            const matchesPerson = !personFilter || entry.personName?.toLowerCase().includes(personFilter.toLowerCase());
            const matchesSite = !siteFilter || entry.siteName?.toLowerCase().includes(siteFilter.toLowerCase());
            const matchesTeam = !teamFilter || entry.teamName?.toLowerCase().includes(teamFilter.toLowerCase());
            const matchesCategory = !categoryFilter || entry.category === categoryFilter;

            return (
                isInDateRange &&
                matchesUser &&
                matchesPerson &&
                matchesSite &&
                matchesTeam &&
                matchesCategory
            );
        });

        setAttendanceData(filtered);
        setLoading(false);
    };

    useEffect(() => {
        if (startDate && endDate) fetchAttendance();
    }, [startDate, endDate, personFilter, siteFilter, teamFilter, categoryFilter]);

    return (
        <UniversalLayout name={name} role={role} title="View Attendance">
            <div className="max-w-6xl mx-auto px-4">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Person Name"
                        value={personFilter}
                        onChange={e => setPersonFilter(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Site Name"
                        value={siteFilter}
                        onChange={e => setSiteFilter(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Team Name"
                        value={teamFilter}
                        onChange={e => setTeamFilter(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    >
                        <option value="">All Categories</option>
                        <option value="Head Office">Head Office</option>
                        <option value="Site">Site</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-400 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Date</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Name</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Category</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Site</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Team</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Time In</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Location</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Late?</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Remark</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Marked By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-400 px-3 py-2">{entry.date}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.personName}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.category || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.siteName || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.teamName || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.timeIn}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.locationName || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.isLate ? "Yes" : "No"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.remark || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.markedBy || "-"}</td>
                                    </tr>
                                ))}
                                {attendanceData.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}

export default ViewAttendance;
