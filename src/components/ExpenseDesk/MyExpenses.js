import React, { useEffect, useState } from "react";
import { fetchExpenses } from "../../firebase/expenseUtils";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useLocation } from "react-router-dom";
import { triggerLogout } from "../../utils/logoutHelper";
import { triggerGoHome, triggerGoBack } from "../../utils/navigationHelper";

function MyExpenses({ name, role }) {
    const db = getFirestore(app);
    const [masterExpenses, setMasterExpenses] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [selectedPerson, setSelectedPerson] = useState("");
    const [showTable, setShowTable] = useState(false);
    const [sites, setSites] = useState([]);
    const [people, setPeople] = useState([]);

    const location = useLocation();
    const isRootPage = location.pathname === "/expense/my";

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

    const handleSearch = () => {
        let data = [...masterExpenses];

        const person = role === "admin" ? selectedPerson.trim() : name;
        if (person) data = data.filter((e) => e.person === person);
        if (fromDate) data = data.filter((e) => e.date >= fromDate);
        if (toDate) data = data.filter((e) => e.date <= toDate);
        if (selectedCategory) data = data.filter((e) => e.category === selectedCategory);
        if (selectedSite) data = data.filter((e) => e.siteName === selectedSite);

        setExpenses(data);
        setFilteredExpenses(data);
        setShowTable(true);
    };

    const handleClearFilters = () => {
        setFromDate("");
        setToDate("");
        setSelectedCategory("");
        setSelectedSite("");
        setSelectedPerson("");
        setFilteredExpenses([]);
        setShowTable(false);
    };

    const fetchSites = async () => {
        const siteSnap = await getDocs(collection(db, "sites"));
        const siteNames = siteSnap.docs.map(doc => doc.data().name);
        setSites(siteNames);
    };

    const loadInitialExpenses = async () => {
        const result = await fetchExpenses();
        setMasterExpenses(result);

        // ✅ FIXED: Proper spread syntax for dropdown population
        const uniquePeople = [...new Set(result.map(item => item.person))];
        setPeople(uniquePeople);
    };

    useEffect(() => {
        fetchSites();
        loadInitialExpenses();
    }, []);

    return (
        <div className="min-h-screen bg-[#F6F6F6] pt-20 px-4 pb-10 relative">
            {/* 🔒 Logout */}
            <button
                onClick={triggerLogout}
                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
            >
                🔒 Logout
            </button>

            {/* 🔝 Universal Header */}
            <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto px-4 text-center mb-8">
                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 md:w-28 mb-4" />
                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                <p className="text-sm text-gray-500">by DSK Procon</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2F2F2F] mt-2">👤 My Expenses</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Logged in as: <span className="font-semibold">{name}</span> | Role: {role?.toUpperCase()}
                </p>
            </div>

            {/* 🔍 Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 From</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">📅 To</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">🏷 Category</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">All</option>
                        {CATEGORY_LIST.map((cat, i) => (
                            <option key={i} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">🏗 Site</label>
                    <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">All</option>
                        {sites.map((site, i) => (
                            <option key={i} value={site}>{site}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 👤 Person Dropdown (Admin Only) */}
            {role === "admin" && (
                <div className="max-w-md mx-auto mt-4">
                    <label className="block text-sm text-gray-700 mb-1">👤 Person</label>
                    <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="">All</option>
                        {people.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* ❌ Clear All */}
            <div className="flex justify-center mt-6">
                <button onClick={handleClearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded shadow">
                    ❌ Clear All
                </button>
            </div>

            {/* 📊 Table */}
            {showTable && (
                <div className="mt-8 overflow-x-auto max-w-6xl mx-auto">
                    <table className="min-w-full border border-gray-300 text-sm bg-white rounded shadow-md">
                        <thead className="bg-[#2F2F2F] text-white">
                            <tr>
                                <th className="py-2 px-4 text-left">📅 Date</th>
                                <th className="py-2 px-4 text-left">👤 Person</th>
                                <th className="py-2 px-4 text-left">🏗 Site</th>
                                <th className="py-2 px-4 text-left">🏷 Category</th>
                                <th className="py-2 px-4 text-left">💰 Amount</th>
                                <th className="py-2 px-4 text-left">🧾 Paid To</th>
                                <th className="py-2 px-4 text-left">📝 Remarks</th>
                                <th className="py-2 px-4 text-left">📌 Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((exp, index) => (
                                <tr key={index} className="border-t">
                                    <td className="py-2 px-4">{exp.date}</td>
                                    <td className="py-2 px-4">{exp.person}</td>
                                    <td className="py-2 px-4">{exp.siteName}</td>
                                    <td className="py-2 px-4">{exp.category}</td>
                                    <td className="py-2 px-4">₹{parseFloat(exp.amount).toFixed(2)}</td>
                                    <td className="py-2 px-4">{exp.paidTo}</td>
                                    <td className="py-2 px-4">{exp.remarks}</td>
                                    <td className="py-2 px-4 capitalize">{exp.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🔘 Bottom Buttons */}
            <div className="flex justify-between items-center gap-4 max-w-md mx-auto mt-10">
                <button onClick={triggerGoHome} className="w-1/3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm sm:text-base">🏠 Home</button>
                <button onClick={handleSearch} className="w-1/3 bg-[#2F2F2F] text-white px-4 py-2 rounded hover:bg-[#505050] transition text-sm sm:text-base">🔍 Search</button>
                <button onClick={triggerGoBack} className="w-1/3 bg-[#E1E1E1] hover:bg-[#D4D4D4] text-gray-800 px-4 py-2 rounded text-sm sm:text-base">🔙 Back</button>
            </div>
        </div>
    );
}

export default MyExpenses;
