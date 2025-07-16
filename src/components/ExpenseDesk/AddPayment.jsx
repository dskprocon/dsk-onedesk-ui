import React, { useState, useEffect } from "react";
import Select from "react-select";
import { triggerGoBack, triggerGoHome } from "../../utils/navigationHelper";
import { triggerLogout } from "../../utils/logoutHelper";
import { addPaymentEntry } from "../../firebase/services/paymentService";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";

function AddPayment({ name, role }) {
    const [person, setPerson] = useState("");
    const [personList, setPersonList] = useState([]);
    const [date, setDate] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");

    // 🔄 Fetch unique person names from expenses
    useEffect(() => {
        const fetchPersons = async () => {
            const db = getFirestore(app);
            const snapshot = await getDocs(collection(db, "expenses"));
            const names = Array.from(
                new Set(snapshot.docs.map(doc => doc.data().person || ""))
            ).filter(n => n.trim() !== "");

            const formatted = names.map(name => ({
                label: name,
                value: name
            }));

            setPersonList(formatted);
        };

        fetchPersons();
    }, []);

    // 🔐 Admin Access Only
    const isAdmin = role === "admin";

    const handleSubmit = async () => {
        if (!person || !date || !amount) {
            alert("❌ Please fill all required fields");
            return;
        }

        await addPaymentEntry({ person, date, amount, remarks });
        alert("✅ Payment added successfully");
        setPerson("");
        setDate("");
        setAmount("");
        setRemarks("");
        console.log("person:", person);
        console.log("date:", date);
        console.log("amount:", amount);

    };

    return (
        <div className="min-h-screen bg-[#f6f6f6] pt-20 pb-12 px-4 max-w-screen-md mx-auto relative">
            {/* 🔒 Logout */}
            <button
                onClick={triggerLogout}
                className="absolute top-5 right-5 bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#444] transition"
            >
                🔒 Logout
            </button>

            {/* 🔐 Admin Check */}
            {!isAdmin ? (
                <div className="mt-40 text-center text-xl font-semibold text-red-600">
                    ❌ Access Denied – Admins only
                </div>
            ) : (
                <>
                    {/* 🔝 Header */}
                    <div className="text-center mb-10">
                        <img src="/dsk_logo.png" alt="DSK Logo" className="w-20 mx-auto mb-2" />
                        <h1 className="text-3xl font-bold text-gray-800">OneDesk Pro</h1>
                        <p className="text-sm text-gray-500">by DSK Procon</p>
                        <p className="text-base mt-2">Logged in as: {name} | Role: ADMIN</p>
                        <h2 className="text-xl mt-4 font-semibold">➕ Add Payment</h2>
                    </div>

                    {/* 🧾 Form */}
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
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-700 mb-1 block">💰 Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                                placeholder="Enter amount"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-700 mb-1 block">📝 Remarks</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                                placeholder="Optional remarks"
                                rows={3}
                            />
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
                </>
            )}

            {/* 🔙 Navigation */}
            <div className="mt-10 flex justify-center gap-6">
                <button
                    onClick={triggerGoHome}
                    className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                >
                    🏠 Home
                </button>
                <button
                    onClick={triggerGoBack}
                    className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                >
                    🔙 Back
                </button>
            </div>
        </div>
    );
}

export default AddPayment;
