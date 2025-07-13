import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { fetchExpenses } from "../../firebase/expenseUtils";
import { useNavigate } from "react-router-dom";

function MyExpenses({ name, role }) {
            const db = getFirestore(app);
            const navigate = useNavigate();

            const [expenses, setExpenses] = useState([]);
            const [filteredExpenses, setFilteredExpenses] = useState([]);
            const [loading, setLoading] = useState(true);

            const [personList, setPersonList] = useState([]);
            const [siteList, setSiteList] = useState([]);
            const [categoryList, setCategoryList] = useState([]);

            const [selectedPerson, setSelectedPerson] = useState("");
            const [selectedSite, setSelectedSite] = useState("");
            const [selectedCategory, setSelectedCategory] = useState("");
            const [fromDate, setFromDate] = useState("");
            const [toDate, setToDate] = useState("");

            useEffect(() => {
                        const loadFilters = async () => {
                                    const usersSnap = await getDocs(collection(db, "users"));
                                    const sitesSnap = await getDocs(collection(db, "sites"));
                                    const expensesSnap = await getDocs(collection(db, "expenses"));

                                    const persons = usersSnap.docs.map(doc => doc.data().name).filter(Boolean);
                                    const sites = sitesSnap.docs.map(doc => doc.data().name).filter(Boolean);
                                    const categories = [...new Set(expensesSnap.docs.map(doc => doc.data().category).filter(Boolean))];

                                    setPersonList(persons);
                                    setSiteList(sites);
                                    setCategoryList(categories);
                        };

                        loadFilters();
            }, []);

            useEffect(() => {
                        const loadExpenses = async () => {
                                    setLoading(true);
                                    try {
                                                const person = role === "admin" ? (selectedPerson || null) : name;
                                                const result = await fetchExpenses(person, fromDate || null, toDate || null);
                                                setExpenses(result);
                                                filterAll(result);
                                    } catch (err) {
                                                console.error("❌ Error fetching expenses:", err);
                                    } finally {
                                                setLoading(false);
                                    }
                        };

                        loadExpenses();
            }, [name, role, selectedPerson, fromDate, toDate]);

            useEffect(() => {
                        filterAll(expenses);
            }, [selectedSite, selectedCategory]);

            const filterAll = (data) => {
                        let filtered = [...data];

                        if (selectedSite) {
                                    filtered = filtered.filter(exp => exp.siteName === selectedSite);
                        }
                        if (selectedCategory) {
                                    filtered = filtered.filter(exp => exp.category === selectedCategory);
                        }

                        setFilteredExpenses(filtered);
            };

            if (loading) {
                        return <p className="text-center text-gray-500">🔄 Loading expenses...</p>;
            }

            return (
                        <div className="space-y-6">
                                    {/* 🔍 Filter Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 justify-center items-start">
                                                <div>
                                                            <label className="block text-sm text-gray-700 mb-1">📅 From</label>
                                                            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full" />
                                                </div>
                                                <div>
                                                            <label className="block text-sm text-gray-700 mb-1">📅 To</label>
                                                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full" />
                                                </div>
                                                <div>
                                                            <label className="block text-sm text-gray-700 mb-1">🏷 Category</label>
                                                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full">
                                                                        <option value="">All Categories</option>
                                                                        {categoryList.map((cat, i) => (
                                                                                    <option key={i} value={cat}>{cat}</option>
                                                                        ))}
                                                            </select>
                                                </div>
                                                <div>
                                                            <label className="block text-sm text-gray-700 mb-1">🏗 Site</label>
                                                            <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full">
                                                                        <option value="">All Sites</option>
                                                                        {siteList.map((site, i) => (
                                                                                    <option key={i} value={site}>{site}</option>
                                                                        ))}
                                                            </select>
                                                </div>
                                                {role?.toLowerCase() === "admin" && (
                                                            <div className="col-span-full">
                                                                        <label className="block text-sm text-gray-700 mb-1">👤 Person</label>
                                                                        <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-full">
                                                                                    <option value="">All Persons</option>
                                                                                    {personList.map((p, idx) => (
                                                                                                <option key={idx} value={p}>{p}</option>
                                                                                    ))}
                                                                        </select>
                                                            </div>
                                                )}
                                    </div>

                                    {/* 📄 Table */}
                                    {filteredExpenses.length === 0 ? (
                                                <p className="text-center text-gray-500 mt-4">😕 No expenses found.</p>
                                    ) : (
                                                <div className="overflow-x-auto">
                                                            <table className="min-w-full border border-gray-300 text-sm">
                                                                        <thead className="bg-gradient-to-r from-[#2c2c2c] to-[#7a7a7a] text-white">
                                                                                    <tr>
                                                                                                <th className="px-4 py-2">📅 Date</th>
                                                                                                <th className="px-4 py-2">👤 Person</th>
                                                                                                <th className="px-4 py-2">🏗 Site</th>
                                                                                                <th className="px-4 py-2">📍 Location</th>
                                                                                                <th className="px-4 py-2">🏷 Category</th>
                                                                                                <th className="px-4 py-2">💰 Amount</th>
                                                                                                <th className="px-4 py-2">🧾 Paid To</th>
                                                                                                <th className="px-4 py-2">📎 Bill</th>
                                                                                                <th className="px-4 py-2">🔖 Status</th>
                                                                                    </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                                    {filteredExpenses.map((exp, index) => (
                                                                                                <tr key={exp.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                                                                                            <td className="px-4 py-2">{exp.date}</td>
                                                                                                            <td className="px-4 py-2">{exp.person}</td>
                                                                                                            <td className="px-4 py-2">{exp.siteName}</td>
                                                                                                            <td className="px-4 py-2">{exp.location}</td>
                                                                                                            <td className="px-4 py-2">{exp.category}</td>
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
                                                                                                                        {exp.status?.toLowerCase() === "approved" ? (
                                                                                                                                    <span className="text-green-600 font-semibold">✅ Approved</span>
                                                                                                                        ) : (
                                                                                                                                    <span className="text-yellow-600 font-semibold">🕓 Pending</span>
                                                                                                                        )}
                                                                                                            </td>
                                                                                                </tr>
                                                                                    ))}
                                                                        </tbody>
                                                            </table>
                                                </div>
                                    )}

                                    {/* 🔙 Back Button */}
                                    <div className="text-center mt-8">
                                                <button onClick={() => navigate("/")} className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition">
                                                            ⬅ Back to Home
                                                </button>
                                    </div>
                        </div>
            );
}

export default MyExpenses;
