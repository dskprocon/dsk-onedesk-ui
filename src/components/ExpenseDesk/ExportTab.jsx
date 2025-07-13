// src/components/ExpenseDesk/ExportTab.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { exportFullVoucherReport } from "../../firebase/expenseUtils";

function ExportTab() {
    const db = getFirestore(app);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [person, setPerson] = useState("");
    const [persons, setPersons] = useState([]);

    useEffect(() => {
        const fetchPersons = async () => {
            const snapshot = await getDocs(collection(db, "expenses"));
            const all = snapshot.docs.map(doc => doc.data().person || "");
            const unique = [...new Set(all)];
            setPersons(unique);
        };
        fetchPersons();
    }, []);

    const handleExport = async () => {
        if (!fromDate || !toDate) {
            alert("❌ Please select From and To Date");
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
            const filtered = person ? allData.filter(e => e.person === person) : allData;

            if (filtered.length === 0) {
                alert("❌ No records found.");
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
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">📤 Export Voucher Reports</h2>

            {/* Filter Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 From</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 To</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">👤 Person (optional)</label>
                    <select value={person} onChange={(e) => setPerson(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full">
                        <option value="">All</option>
                        {persons.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Export Button */}
            <div className="text-center">
                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 rounded hover:bg-gray-900"
                >
                    {loading ? "⏳ Exporting..." : "📤 Export Report"}
                </button>
            </div>
        </div>
    );
}

export default ExportTab;
