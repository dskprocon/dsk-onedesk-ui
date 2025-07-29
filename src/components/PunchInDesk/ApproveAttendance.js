// src/components/PunchInDesk/ApproveAttendance.js

import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { db } from "../../firebase/firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import { universalButtonClass } from "../universal/UniversalStyles";
import { showSuccess } from "../../utils/alertUtils";

function ApproveAttendance({ name, role }) {
    const [entries, setEntries] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        const q = query(collection(db, "attendance"), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(list);
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const [dd, mm, yyyy] =
                parts[0].length === 4 ? [parts[2], parts[1], parts[0]] : parts; // handle YYYY-MM-DD or DD-MM-YYYY
            return `${dd}-${mm}-${yyyy}`;
        }
        return dateStr;
    };

    const handleBulkApprove = async () => {
        for (const id of selected) {
            await updateDoc(doc(db, "attendance", id), {
                status: "approved",
                reviewedBy: name,
                reviewedAt: serverTimestamp(),
            });
        }
        showSuccess(`✅ Approved ${selected.length} attendance record(s).`);
        setSelected([]);
        fetchPending();
    };

    const handleReject = async (id) => {
        await updateDoc(doc(db, "attendance", id), {
            status: "rejected",
            reviewedBy: name,
            reviewedAt: serverTimestamp(),
        });
        showSuccess("❌ Attendance entry rejected.");
        fetchPending();
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="w-full max-w-[1200px] px-4 md:px-8 mx-auto py-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-[#1A1A1A]">🧾 Approve Attendance</h2>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-green-600 font-semibold">✅ No pending entries</p>
                ) : (
                    <>
                        <div className="text-right mb-4">
                            <button
                                onClick={handleBulkApprove}
                                className={`${universalButtonClass} bg-green-700 hover:bg-green-800 text-white`}
                                disabled={selected.length === 0}
                            >
                                ✅ Bulk Approve Selected ({selected.length})
                            </button>
                        </div>

                        <div className="space-y-4">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="border border-gray-300 rounded-xl p-4 bg-white shadow"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm text-gray-800 font-semibold">
                                            {entry.personName} – {entry.category}
                                            {entry.siteName && (
                                                <> | {entry.siteName} &gt; {entry.teamName}</>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(entry.id)}
                                            onChange={() => toggleSelect(entry.id)}
                                            className="w-5 h-5 accent-gray-600"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700">
                                        <div><strong>Date:</strong> {formatDate(entry.date)}</div>
                                        <div><strong>Time In:</strong> {entry.timeIn}</div>
                                        <div><strong>Late:</strong> {entry.isLate ? "✅ Yes" : "❌ No"}</div>
                                        <div><strong>Location:</strong> {entry.locationName || `${entry.location?.lat}, ${entry.location?.lng}`}</div>
                                    </div>

                                    <div className="text-right mt-4">
                                        <button
                                            onClick={() => handleReject(entry.id)}
                                            className={`${universalButtonClass} bg-red-600 hover:bg-red-700 text-white`}
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </UniversalLayout>
    );
}

export default ApproveAttendance;
