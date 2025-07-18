// src/components/ExpenseDesk/AddPayment.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { addPaymentEntry } from "../../firebase/services/paymentService";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import UniversalLayout from '../universal/UniversalLayout';

function AddPayment({ name, role }) {
    const [person, setPerson] = useState("");
    const [personList, setPersonList] = useState([]);
    const [date, setDate] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");

    const isAdmin = role === "admin";

    useEffect(() => {
        const fetchPersons = async () => {
            const db = getFirestore(app);
            const snapshot = await getDocs(collection(db, "expenses"));
            const names = Array.from(new Set(snapshot.docs.map(doc => doc.data().person || ""))).filter(n => n.trim() !== "");
            const formatted = names.map(name => ({ label: name, value: name }));
            setPersonList(formatted);
        };
        fetchPersons();
    }, []);

    const handleSubmit = async () => {
        if (!person || !date || !amount) {
            alert("❌ Please fill all required fields");
            return;
        }

        await addPaymentEntry({ person, date, amount, remarks });
        alert("✅ Payment added successfully");
        setPerson(""); setDate(""); setAmount(""); setRemarks("");
    };

    return (
        <UniversalLayout title="➕ Add Payment" name={name} role={role}>
            {!isAdmin ? (
                <div className="mt-40 text-center text-xl font-semibold text-red-600">
                    ❌ Access Denied – Admins only
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="text-sm text-gray-700 mb-1 block">👤 Person Name</label>
                        <Select
                            options={personList}
                            value={personList.find(opt => opt.value === person) || null}
                            onChange={(selected) => setPerson(selected?.value || "")}
                            placeholder="Search or select person..."
                            isClearable
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 mb-1 block">📅 Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 mb-1 block">💰 Amount (₹)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" placeholder="Enter amount" />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 mb-1 block">📝 Remarks</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" placeholder="Optional remarks" rows={3} />
                    </div>

                    <div className="text-center mt-4">
                        <button
                            onClick={handleSubmit}
                            className="bg-[#2e7d32] hover:bg-[#256729] text-white font-semibold px-8 py-2.5 rounded-xl shadow"
                        >
                            ✅ Save Payment
                        </button>
                    </div>
                </div>
            )}
        </UniversalLayout>
    );
}

export default AddPayment;
