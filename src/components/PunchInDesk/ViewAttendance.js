// src/components/PunchInDesk/ViewAttendance.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import UniversalLayout from "../universal/UniversalLayout";
import { format } from "date-fns";

function ViewAttendance({ name, role }) {
    const [attendanceData, setAttendanceData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);

        const q = query(
            collection(db, "attendance"),
            where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(doc => doc.data());

        // Filter by date range
        const filtered = allData.filter(entry => {
            return entry.date >= startDate && entry.date <= endDate && (
                role.toUpperCase() === "ADMIN" || entry.personName === name
            );
        });

        setAttendanceData(filtered);
        setLoading(false);
    };

    useEffect(() => {
        if (startDate && endDate) fetchAttendance();
    }, [startDate, endDate]);

    return (
        <UniversalLayout name={name} role={role} title="View Attendance">
            <div className="max-w-5xl mx-auto px-4">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-400 px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-400 px-3 py-2 rounded" />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-400">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Date</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Name</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Time In</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Location</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Late?</th>
                                    <th className="border border-gray-400 px-3 py-2 text-left">Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-400 px-3 py-2">{entry.date}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.personName}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.timeIn}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.locationName || "-"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.isLate ? "Yes" : "No"}</td>
                                        <td className="border border-gray-400 px-3 py-2">{entry.remark || "-"}</td>
                                    </tr>
                                ))}
                                {attendanceData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">No records found</td>
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
