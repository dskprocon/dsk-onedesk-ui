// src/components/ExpenseDesk/ExportTab.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { exportFullVoucherReport } from "../../firebase/expenseUtils";
import { triggerLogout } from "../../utils/logoutHelper";
import { triggerGoHome, triggerGoBack } from "../../utils/navigationHelper";

function ExportTab({ name = "Unknown", role = "user" }) {
    const db = getFirestore(app);
    const isAdmin = role === "admin";

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [person, setPerson] = useState("");
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPersons = async () => {
            const snapshot = await getDocs(collection(db, "expenses"));
            const all = snapshot.docs.map(doc => doc.data().person || "").filter(p => p);
            const unique = [...new Set(all)];
            setPersons(unique);
        };
        fetchPersons();
    }, []);

    const handleExport = async () => {
        if (!fromDate || !toDate) {
            alert("❌ Please select both From and To dates.");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "expenses"),
                where("date", ">=", fromDate),
                where("date", "<=", toDate)
            );
            const snapshot = await getDocs(q);
            const allData = snapshot.docs.map(doc => doc.data());
            const filtered = person
                ? allData.filter(e => (e.person || "").trim().toLowerCase() === person.trim().toLowerCase())
                : allData;

            if (filtered.length === 0) {
                alert("❌ No matching records found.");
                setLoading(false);
                return;
            }

            await exportFullVoucherReport(filtered, fromDate, toDate);
            alert("✅ Report downloaded!");
        } catch (err) {
            console.error("❌ Export Error:", err);
            alert("❌ Failed to export. Check console.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] py-10 px-4 relative">
            {/* 🔒 Logout */}
            <button
                onClick={triggerLogout}
                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-gray-700 transition"
            >
                🔒 Logout
            </button>

            {/* 🔝 Header */}
            <div className="flex flex-col items-center mb-10">
                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">OneDesk Pro</h1>
                <p className="text-sm text-gray-500 -mt-1 mb-2">by DSK Procon</p>
                <h2 className="text-xl font-semibold text-purple-800">📤 Export Voucher Reports</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Logged in as: {name || "Unknown"} | Role: {role?.toUpperCase() || "UNKNOWN"}
                </p>
            </div>

            {/* 🔍 Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 From</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 To</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>
                {isAdmin && (
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">👤 Person</label>
                        <select
                            value={person}
                            onChange={(e) => setPerson(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 w-full"
                        >
                            <option value="">All</option>
                            {persons.map((p, i) => (
                                <option key={i} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 🔘 Action Buttons */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={triggerGoHome}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                >
                    🏠 Home
                </button>
                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded"
                >
                    {loading ? "⏳ Exporting..." : "🔍 Search & Export"}
                </button>
                <button
                    onClick={triggerGoBack}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                >
                    🔙 Back
                </button>
            </div>
        </div>
    );
}

export default ExportTab;
