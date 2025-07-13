import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { updateExpenseStatus } from "../../firebase/expenseUtils";
import { useNavigate } from "react-router-dom";

function ApprovalTab() {
    const navigate = useNavigate();
    const db = getFirestore(app);

    const [expenses, setExpenses] = useState([]);
    const [selected, setSelected] = useState([]);
    const [remark, setRemark] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState(""); // "approve" or "reject"
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchExpenses = async () => {
            const q = query(
                collection(db, "expenses"),
                where("status", "==", "pending"),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(data);
        };
        fetchExpenses();
    }, []);

    const toggleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selected.length === expenses.length) {
            setSelected([]);
        } else {
            setSelected(expenses.map(exp => exp.id));
        }
    };

    const openModal = (type, ids) => {
        setActionType(type);
        setSelected(ids);
        setRemark("");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        setProcessing(true);
        for (const id of selected) {
            await updateExpenseStatus(id, actionType === "approve" ? "approved" : "rejected", remark);
        }
        setExpenses(expenses.filter(e => !selected.includes(e.id)));
        setSelected([]);
        setProcessing(false);
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* 🧾 Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gradient-to-r from-[#2c2c2c] to-[#7a7a7a] text-white">
                        <tr>
                            <th className="px-2 py-2">
                                <input
                                    type="checkbox"
                                    checked={selected.length === expenses.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2">📅 Date</th>
                            <th className="px-4 py-2">👤 Person</th>
                            <th className="px-4 py-2">🏗 Site</th>
                            <th className="px-4 py-2">💰 Amount</th>
                            <th className="px-4 py-2">🧾 Paid To</th>
                            <th className="px-4 py-2">📎 Bill</th>
                            <th className="px-4 py-2">✅ Approve</th>
                            <th className="px-4 py-2">❌ Reject</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => (
                            <tr key={exp.id} className="border-b">
                                <td className="px-2 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(exp.id)}
                                        onChange={() => toggleSelect(exp.id)}
                                    />
                                </td>
                                <td className="px-4 py-2">{exp.date}</td>
                                <td className="px-4 py-2">{exp.person}</td>
                                <td className="px-4 py-2">{exp.siteName}</td>
                                <td className="px-4 py-2">₹{parseFloat(exp.amount).toFixed(2)}</td>
                                <td className="px-4 py-2">{exp.paidTo}</td>
                                <td className="px-4 py-2 text-center">
                                    {exp.billUrl ? (
                                        <a href={exp.billUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => openModal("approve", [exp.id])}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                    >
                                        ✓
                                    </button>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to reject this expense?")) {
                                                openModal("reject", [exp.id]);
                                            }
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ Bulk Action Buttons */}
            {selected.length > 1 && (
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => openModal("approve", selected)}
                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded"
                    >
                        ✅ Approve Selected
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Reject all selected expenses?")) {
                                openModal("reject", selected);
                            }
                        }}
                        className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded"
                    >
                        ❌ Reject Selected
                    </button>
                </div>
            )}

            {/* 📝 Remark Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            {actionType === "approve" ? "✅ Approve" : "❌ Reject"} with Remark
                        </h2>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter remark..."
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
                            >
                                {processing ? "Processing..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔙 Back Button (Safe Navigation) */}
            <div className="text-center mt-8">
                <button
                    onClick={() => navigate("/")}
                    className="bg-[#2c2c2c] text-white px-6 py-2 rounded hover:bg-[#444] transition"
                >
                    ⬅ Back to Home
                </button>
            </div>
        </div>
    );
}

export default ApprovalTab;
