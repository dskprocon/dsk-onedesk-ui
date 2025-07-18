// src/components/ExpenseDesk/ApprovalTab.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { updateExpenseStatus } from "../../firebase/services/expenseService";
import UniversalLayout from '../universal/UniversalLayout';

function ApprovalTab({ name = "Unknown", role = "user" }) {
        const db = getFirestore(app);
        const [expenses, setExpenses] = useState([]);
        const [selected, setSelected] = useState([]);
        const [remark, setRemark] = useState("");
        const [modalOpen, setModalOpen] = useState(false);
        const [actionType, setActionType] = useState("");
        const [processing, setProcessing] = useState(false);

        useEffect(() => {
                const fetchData = async () => {
                        const q = role === "admin"
                                ? query(collection(db, "expenses"), where("status", "==", "pending"), orderBy("date", "desc"))
                                : query(collection(db, "expenses"), where("person", "==", name), orderBy("date", "desc"));

                        const snapshot = await getDocs(q);
                        const raw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                        if (role === "admin") {
                                setExpenses(raw);
                        } else {
                                const today = new Date();
                                const sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(today.getDate() - 7);
                                const filtered = raw.filter(item => {
                                        const [dd, mm, yyyy] = item.date.split("/");
                                        const entryDate = new Date(`${yyyy}-${mm}-${dd}`);
                                        return entryDate >= sevenDaysAgo && entryDate <= today;
                                });
                                setExpenses(filtered);
                        }
                };
                fetchData();
        }, [db, name, role]);

        const toggleSelect = (id) => {
                setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
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
                setExpenses(prev => prev.filter(e => !selected.includes(e.id)));
                setSelected([]);
                setProcessing(false);
                setModalOpen(false);
        };

        return (
                <UniversalLayout title="✅ Expense Approvals" name={name} role={role}>
                        <div className="overflow-x-auto mt-4 max-w-6xl mx-auto">
                                <table className="min-w-full border border-gray-300 text-sm bg-white">
                                        <thead className="bg-gradient-to-r from-[#2f2f2f] to-[#505050] text-white text-left">
                                                <tr>
                                                        {role === "admin" && (
                                                                <th className="px-3 py-2">
                                                                        <input type="checkbox" checked={selected.length === expenses.length} onChange={toggleSelectAll} />
                                                                </th>
                                                        )}
                                                        <th className="px-4 py-2">📅 Date</th>
                                                        {role === "admin" && <th className="px-4 py-2">👤 Person</th>}
                                                        <th className="px-4 py-2">🏗 Site</th>
                                                        <th className="px-4 py-2">🏷 Category</th>
                                                        <th className="px-4 py-2">💰 Amount</th>
                                                        <th className="px-4 py-2">🟢 Status</th>
                                                        <th className="px-4 py-2">📝 Remark</th>
                                                        {role === "admin" && <th className="px-4 py-2 text-center">✅</th>}
                                                        {role === "admin" && <th className="px-4 py-2 text-center">❌</th>}
                                                </tr>
                                        </thead>
                                        <tbody>
                                                {expenses.map(exp => (
                                                        <tr key={exp.id} className="border-b">
                                                                {role === "admin" && (
                                                                        <td className="px-3 py-2">
                                                                                <input type="checkbox" checked={selected.includes(exp.id)} onChange={() => toggleSelect(exp.id)} />
                                                                        </td>
                                                                )}
                                                                <td className="px-4 py-2">{exp.date}</td>
                                                                {role === "admin" && <td className="px-4 py-2">{exp.person}</td>}
                                                                <td className="px-4 py-2">{exp.siteName}</td>
                                                                <td className="px-4 py-2">{exp.category}</td>
                                                                <td className="px-4 py-2">₹{parseFloat(exp.amount).toFixed(2)}</td>
                                                                <td className="px-4 py-2">
                                                                        {exp.status === "approved"
                                                                                ? "✅ Approved"
                                                                                : exp.status === "rejected"
                                                                                        ? "❌ Rejected"
                                                                                        : "🕓 Pending"}
                                                                </td>
                                                                <td className="px-4 py-2">{exp.adminRemark || "—"}</td>
                                                                {role === "admin" && (
                                                                        <td className="px-4 py-2 text-center">
                                                                                <button onClick={() => openModal("approve", [exp.id])} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                                                                                        ✓
                                                                                </button>
                                                                        </td>
                                                                )}
                                                                {role === "admin" && (
                                                                        <td className="px-4 py-2 text-center">
                                                                                <button onClick={() => openModal("reject", [exp.id])} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                                                                                        ✕
                                                                                </button>
                                                                        </td>
                                                                )}
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>

                        {/* 📝 Modal */}
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
                                                        <button onClick={() => setModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                                                        <button onClick={handleSubmit} disabled={processing} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
                                                                {processing ? "Processing..." : "Submit"}
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        )}
                </UniversalLayout>
        );
}

export default ApprovalTab;
