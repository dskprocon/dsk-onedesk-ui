// src/components/ExpenseDesk/AddExpense.jsx
import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { triggerLogout } from "../../utils/logoutHelper";
import { triggerGoHome, triggerGoBack } from "../../utils/navigationHelper";
import Select from "react-select";

function AddExpense({ name, role }) {
    const db = getFirestore(app);
    const navigate = useNavigate();
    const location = useLocation();
    const isRootPage = location.pathname === "/expense/add";

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
        <div className="min-h-screen bg-[#F6F6F6] pt-20 pb-20 px-4 relative">
            {/* 🔒 Logout */}
            <button
                onClick={triggerLogout}
                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
            >
                🔒 Logout
            </button>

            {/* 🔝 Header */}
            <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto px-4 text-center">
                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 md:w-28 mb-4" />
                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                <p className="text-sm text-gray-500">by DSK Procon</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2F2F2F] mt-2">➕ Add New Expense</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Logged in as: <span className="font-semibold">{name}</span> | Role: {role?.toUpperCase()}
                </p>
            </div>

            {/* 🎛 Form */}
            <div className="max-w-3xl mx-auto mt-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-700">📅 Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-[#C0C0C0] rounded px-3 py-2 bg-[#EAEAEA]" />
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
                        <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full border border-[#C0C0C0] rounded px-3 py-2" />
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
                        <input type="text" value={paidTo} onChange={(e) => setPaidTo(e.target.value)} className="w-full border border-[#C0C0C0] rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700">💰 Amount (₹)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-[#C0C0C0] rounded px-3 py-2" />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-gray-700">📝 Remarks</label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-[#C0C0C0] rounded px-3 py-2" />
                </div>

                {/* 🔘 Footer Buttons */}
                <div className="flex justify-between items-center gap-4 max-w-md mx-auto pt-6">
                    <button onClick={triggerGoHome} className="w-1/3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm sm:text-base">🏠 Home</button>
                    <button onClick={handleSubmit} className="w-1/3 bg-[#2F2F2F] text-white px-4 py-2 rounded hover:bg-[#505050] transition text-sm sm:text-base">💾 Save</button>
                    <button onClick={triggerGoBack} className="w-1/3 bg-[#E1E1E1] hover:bg-[#D4D4D4] text-gray-800 px-4 py-2 rounded text-sm sm:text-base">🔙 Back</button>
                </div>
            </div>

            {/* 🔻 Sticky Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
                Made by <span className="font-semibold">DSK Synapse</span>
            </div>
        </div>
    );
}

export default AddExpense;
