// src/components/ExpenseDesk/MyExpenses.js
import React, { useEffect, useState } from "react";
import { fetchExpenses } from "../../firebase/services/expenseService";
import Select from "react-select";
import UniversalLayout from "../universal/UniversalLayout"; // ✅ Fixed path

function MyExpenses({ name, role }) {
        const [allExpenses, setAllExpenses] = useState([]);
        const [filteredExpenses, setFilteredExpenses] = useState([]);
        const [fromDate, setFromDate] = useState("");
        const [toDate, setToDate] = useState("");
        const [selectedSite, setSelectedSite] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("");
        const [selectedPerson, setSelectedPerson] = useState("");
        const [showResults, setShowResults] = useState(false);

        useEffect(() => {
                const getData = async () => {
                        const data = await fetchExpenses();
                        setAllExpenses(data);
                };
                getData();
        }, []);

        const uniquePersons = [...new Set(allExpenses.map(exp => exp.person))];
        const uniqueSites = [...new Set(allExpenses.map(exp => exp.siteName))];
        const uniqueCategories = [...new Set(allExpenses.map(exp => exp.category))];

        const personOptions = uniquePersons.map(p => ({ label: p, value: p }));
        const siteOptions = uniqueSites.map(s => ({ label: s, value: s }));
        const categoryOptions = uniqueCategories.map(c => ({ label: c, value: c }));

        const handleSearch = () => {
                const isAnyFilterApplied =
                        (role === "admin" && selectedPerson) ||
                        selectedSite ||
                        selectedCategory ||
                        fromDate ||
                        toDate;

                if (!isAnyFilterApplied) {
                        alert("⚠️ Please apply at least one filter.");
                        return;
                }

                let filtered = [...allExpenses];

                if (role !== "admin") {
                        filtered = filtered.filter(exp => exp.person === name);
                } else if (selectedPerson) {
                        filtered = filtered.filter(exp => exp.person === selectedPerson);
                }

                if (selectedSite) {
                        filtered = filtered.filter(exp => exp.siteName === selectedSite);
                }

                if (selectedCategory) {
                        filtered = filtered.filter(exp => exp.category === selectedCategory);
                }

                if (fromDate && toDate) {
                        const from = new Date(fromDate);
                        const to = new Date(toDate);
                        to.setHours(23, 59, 59); // include full day

                        filtered = filtered.filter(exp => {
                                let expDate;
                                if (exp.dateObject?.seconds) {
                                        expDate = new Date(exp.dateObject.seconds * 1000);
                                } else if (exp.date) {
                                        const [day, month, year] = exp.date.split("/");
                                        expDate = new Date(`${year}-${month}-${day}`);
                                } else {
                                        return false;
                                }
                                return expDate >= from && expDate <= to;
                        });
                }

                setFilteredExpenses(filtered);
                setShowResults(true);
        };

        const handleClearAll = () => {
                setFromDate("");
                setToDate("");
                setSelectedCategory("");
                setSelectedSite("");
                setSelectedPerson("");
                setFilteredExpenses([]);
                setShowResults(false);
        };

        return (
                <UniversalLayout title="👤 My Expenses" name={name} role={role}>
                        <div className="space-y-6 max-w-4xl mx-auto">
                                {/* 🔍 Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {role === "admin" && (
                                                <div>
                                                        <label className="text-sm text-gray-700">👤 Person</label>
                                                        <Select
                                                                options={personOptions}
                                                                value={personOptions.find(o => o.value === selectedPerson)}
                                                                onChange={(option) => setSelectedPerson(option ? option.value : "")}
                                                                isClearable
                                                                placeholder="Select person..."
                                                        />
                                                </div>
                                        )}
                                        <div>
                                                <label className="text-sm text-gray-700">🏗 Site</label>
                                                <Select
                                                        options={siteOptions}
                                                        value={siteOptions.find(o => o.value === selectedSite)}
                                                        onChange={(option) => setSelectedSite(option ? option.value : "")}
                                                        isClearable
                                                        placeholder="Select site..."
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">🏷 Category</label>
                                                <Select
                                                        options={categoryOptions}
                                                        value={categoryOptions.find(o => o.value === selectedCategory)}
                                                        onChange={(option) => setSelectedCategory(option ? option.value : "")}
                                                        isClearable
                                                        placeholder="Select category..."
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">📅 From</label>
                                                <input
                                                        type="date"
                                                        value={fromDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-3 py-1"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700">📅 To</label>
                                                <input
                                                        type="date"
                                                        value={toDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-3 py-1"
                                                />
                                        </div>
                                </div>

                                {/* 🔘 Action Buttons */}
                                <div className="flex justify-center gap-4 mt-4">
                                        <button
                                                onClick={handleClearAll}
                                                className="bg-[#f6dada] hover:bg-[#efbfbf] text-[#6b0000] px-5 py-1.5 rounded text-sm font-medium"
                                        >
                                                ❌ Clear All
                                        </button>
                                </div>

                                <div className="flex justify-center mt-6 gap-4">
                                        <button
                                                onClick={handleSearch}
                                                className="bg-[#2F2F2F] hover:bg-black text-white px-5 py-2 rounded text-sm sm:text-base font-semibold"
                                        >
                                                🔍 Search
                                        </button>
                                </div>

                                {/* 📊 Results */}
                                {showResults && (
                                        <div className="overflow-x-auto mt-10">
                                                <table className="min-w-full border bg-white shadow-md rounded">
                                                        <thead className="bg-[#F0F0F0]">
                                                                <tr>
                                                                        <th className="border px-3 py-2 text-sm">Date</th>
                                                                        <th className="border px-3 py-2 text-sm">Person</th>
                                                                        <th className="border px-3 py-2 text-sm">Site</th>
                                                                        <th className="border px-3 py-2 text-sm">Category</th>
                                                                        <th className="border px-3 py-2 text-sm">Paid To</th>
                                                                        <th className="border px-3 py-2 text-sm">Amount</th>
                                                                        <th className="border px-3 py-2 text-sm">Remarks</th>
                                                                        <th className="border px-3 py-2 text-sm">Status</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {filteredExpenses.map((exp, index) => (
                                                                        <tr key={index}>
                                                                                <td className="border px-3 py-2 text-sm">{exp.date}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.person}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.siteName}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.category}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.paidTo}</td>
                                                                                <td className="border px-3 py-2 text-sm">₹{exp.amount}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.remarks}</td>
                                                                                <td className="border px-3 py-2 text-sm">{exp.status}</td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                        </div>
                                )}
                        </div>
                </UniversalLayout>
        );
}

export default MyExpenses;
