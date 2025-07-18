// src/components/ExpenseDesk/AddExpense.jsx
import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import Select from "react-select";
import UniversalLayout from '../universal/UniversalLayout';

function AddExpense({ name, role }) {
        const db = getFirestore(app);

        const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
        const [category, setCategory] = useState("");
        const [paidTo, setPaidTo] = useState("");
        const [amount, setAmount] = useState("");
        const [remarks, setRemarks] = useState("");
        const [sites, setSites] = useState([]);
        const [selectedSite, setSelectedSite] = useState("");
        const [locationName, setLocationName] = useState("");

        const CATEGORY_LIST = [
                "Office Supplies / Stationery / Printing & Photocopy",
                "Courier & Postage",
                "Food / Hospitality & Refreshments",
                "Staff Welfare Expenses",
                "Labour Charges – Skilled / Unskilled",
                "Site Tools & Equipment",
                "Transportation – Material",
                "Loading / Unloading",
                "Misc. Site Exps.",
                "Local Travel (Auto/Taxi/Petrol)",
                "Outstation Travel (Train/Air)",
                "Hotel / Lodging",
                "Office Maintenance",
                "Other"
        ];

        useEffect(() => {
                const fetchSites = async () => {
                        const siteSnap = await getDocs(collection(db, "sites"));
                        const siteNames = siteSnap.docs.map(doc => doc.data().name);
                        setSites(siteNames);
                };
                fetchSites();
        }, []);

        const formatDate = (date) => {
                const d = new Date(date);
                return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        };

        const handleSubmit = async () => {
                if (!date || !selectedSite || !locationName || !category || !paidTo || !amount) {
                        alert("❌ Please fill all required fields.");
                        return;
                }

                try {
                        const data = {
                                date: formatDate(date),
                                dateObject: new Date(date),
                                person: name,
                                person_lower: name.trim().toLowerCase(),
                                siteName: selectedSite,
                                location: locationName,
                                category,
                                paidTo,
                                amount: parseFloat(amount),
                                remarks,
                                status: "pending",
                                createdAt: serverTimestamp(),
                        };
                        await addDoc(collection(db, "expenses"), data);
                        alert("✅ Expense saved!");

                        setSelectedSite("");
                        setLocationName("");
                        setCategory("");
                        setPaidTo("");
                        setAmount("");
                        setRemarks("");
                } catch (err) {
                        console.error("❌ Save error:", err);
                        alert("❌ Failed to save.");
                }
        };

        const siteOptions = sites.map(site => ({ label: site, value: site }));
        const categoryOptions = CATEGORY_LIST.map(cat => ({ label: cat, value: cat }));

        return (
                <UniversalLayout title="➕ Add New Expense" name={name} role={role}>
                        <div className="max-w-3xl mx-auto mt-4 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                                <label className="text-sm text-gray-700">📅 Date</label>
                                                <input
                                                        type="date"
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                        className="w-full border border-[#C0C0C0] rounded px-3 py-2 bg-[#EAEAEA]"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">🏗 Site</label>
                                                <Select
                                                        options={siteOptions}
                                                        value={siteOptions.find(o => o.value === selectedSite)}
                                                        onChange={(option) => setSelectedSite(option ? option.value : "")}
                                                        placeholder="Select site..."
                                                        isClearable
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">📍 Location</label>
                                                <input
                                                        type="text"
                                                        value={locationName}
                                                        onChange={(e) => setLocationName(e.target.value)}
                                                        className="w-full border border-[#C0C0C0] rounded px-3 py-2"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">🏷 Category</label>
                                                <Select
                                                        options={categoryOptions}
                                                        value={categoryOptions.find(o => o.value === category)}
                                                        onChange={(option) => setCategory(option ? option.value : "")}
                                                        placeholder="Select category..."
                                                        isClearable
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">🧾 Paid To</label>
                                                <input
                                                        type="text"
                                                        value={paidTo}
                                                        onChange={(e) => setPaidTo(e.target.value)}
                                                        className="w-full border border-[#C0C0C0] rounded px-3 py-2"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">💰 Amount (₹)</label>
                                                <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        className="w-full border border-[#C0C0C0] rounded px-3 py-2"
                                                />
                                        </div>
                                </div>

                                <div>
                                        <label className="text-sm text-gray-700">📝 Remarks</label>
                                        <textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                rows={3}
                                                className="w-full border border-[#C0C0C0] rounded px-3 py-2"
                                        />
                                </div>

                                <div className="flex justify-center pt-4">
                                        <button
                                                onClick={handleSubmit}
                                                className="bg-[#2F2F2F] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#505050] transition"
                                        >
                                                💾 Save Expense
                                        </button>
                                </div>
                        </div>
                </UniversalLayout>
        );
}

export default AddExpense;
