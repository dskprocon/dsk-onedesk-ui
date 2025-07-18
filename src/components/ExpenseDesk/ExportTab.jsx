// src/components/ExpenseDesk/ExportTab.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { fetchExpenses } from "../../firebase/services/expenseService";
import { exportFullVoucherReport } from "../../firebase/services/excelExport";
import UniversalLayout from "../universal/UniversalLayout";

function ExportTab({ role, name }) {
        const isAdmin = role === "admin";

        const [fromDate, setFromDate] = useState("");
        const [toDate, setToDate] = useState("");
        const [site, setSite] = useState("");
        const [type, setType] = useState("");
        const [person, setPerson] = useState("");

        const [allData, setAllData] = useState([]);
        const [filteredData, setFilteredData] = useState([]);
        const [uniquePersons, setUniquePersons] = useState([]);
        const [uniqueSites, setUniqueSites] = useState([]);
        const [uniqueTypes, setUniqueTypes] = useState([]);

        useEffect(() => {
                const loadData = async () => {
                        const data = await fetchExpenses();
                        setAllData(data);

                        const persons = [...new Set(data.map(e => e.person).filter(Boolean))];
                        const sites = [...new Set(data.map(e => e.siteName).filter(Boolean))];
                        const types = [...new Set(data.map(e => e.category).filter(Boolean))];

                        setUniquePersons(persons);
                        setUniqueSites(sites);
                        setUniqueTypes(types);
                };
                loadData();
        }, []);

        const handleView = () => {
                if (!fromDate || !toDate) {
                        alert("❌ Please select From and To date");
                        return;
                }

                let filtered = allData.filter((e) => {
                        if (!e.date) return false;
                        const [dd, mm, yyyy] = e.date.split("/");
                        const formatted = `${yyyy}-${mm}-${dd}`;
                        return formatted >= fromDate && formatted <= toDate;
                });

                if (!isAdmin) {
                        filtered = filtered.filter(e => e.person === name);
                } else if (person) {
                        filtered = filtered.filter(e => e.person === person);
                }

                if (site) {
                        filtered = filtered.filter(e => e.siteName === site);
                }

                if (type) {
                        filtered = filtered.filter(e => e.category === type);
                }

                if (filtered.length === 0) {
                        alert("❌ No records found");
                }

                setFilteredData(filtered);
        };

        const handleExport = async () => {
                if (filteredData.length === 0) {
                        alert("❌ Nothing to export");
                        return;
                }
                await exportFullVoucherReport(filteredData, fromDate, toDate);
        };

        const calculateTotal = () => {
                return filteredData.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0).toFixed(2);
        };

        const personOptions = uniquePersons.map(p => ({ label: p, value: p }));
        const siteOptions = uniqueSites.map(s => ({ label: s, value: s }));
        const typeOptions = uniqueTypes.map(t => ({ label: t, value: t }));

        return (
                <UniversalLayout name={name} role={role} title="📤 Export Reports">
                        <div className="max-w-screen-xl mx-auto">
                                {/* 🎛 Filters */}
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">📅 From Date</label>
                                                <input
                                                        type="date"
                                                        value={fromDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">📅 To Date</label>
                                                <input
                                                        type="date"
                                                        value={toDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                                />
                                        </div>
                                        {isAdmin && (
                                                <div>
                                                        <label className="text-sm text-gray-700 mb-1 block">👤 Person</label>
                                                        <Select
                                                                options={personOptions}
                                                                value={personOptions.find(opt => opt.value === person)}
                                                                onChange={(selected) => setPerson(selected?.value || "")}
                                                                isClearable
                                                                placeholder="All"
                                                        />
                                                </div>
                                        )}
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">🏗 Site</label>
                                                <Select
                                                        options={siteOptions}
                                                        value={siteOptions.find(opt => opt.value === site)}
                                                        onChange={(selected) => setSite(selected?.value || "")}
                                                        isClearable
                                                        placeholder="All"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">🧾 Expense Type</label>
                                                <Select
                                                        options={typeOptions}
                                                        value={typeOptions.find(opt => opt.value === type)}
                                                        onChange={(selected) => setType(selected?.value || "")}
                                                        isClearable
                                                        placeholder="All"
                                                />
                                        </div>
                                </div>

                                {/* 🔘 Actions */}
                                <div className="mt-6 text-center space-x-4">
                                        <button
                                                onClick={handleView}
                                                className="bg-[#2f2f2f] text-white px-6 py-2 rounded hover:bg-[#444]"
                                        >
                                                🔍 Show Report
                                        </button>
                                        {isAdmin && (
                                                <button
                                                        onClick={handleExport}
                                                        className="bg-[#1a73e8] text-white px-6 py-2 rounded hover:bg-[#155cc1]"
                                                >
                                                        📥 Export Report
                                                </button>
                                        )}
                                </div>

                                {/* 📊 Table */}
                                {filteredData.length > 0 && (
                                        <div className="overflow-x-auto mt-10">
                                                <table className="min-w-full bg-white border border-gray-300 text-sm text-gray-800">
                                                        <thead className="bg-[#003366] text-white text-left">
                                                                <tr>
                                                                        <th className="py-2 px-3 border">Date</th>
                                                                        <th className="py-2 px-3 border">Person</th>
                                                                        <th className="py-2 px-3 border">Site</th>
                                                                        <th className="py-2 px-3 border">Type</th>
                                                                        <th className="py-2 px-3 border">Amount (₹)</th>
                                                                        <th className="py-2 px-3 border">Paid To</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {filteredData.map((e, i) => (
                                                                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                                <td className="py-2 px-3 border">{e.date || "-"}</td>
                                                                                <td className="py-2 px-3 border">{e.person || "-"}</td>
                                                                                <td className="py-2 px-3 border">{e.siteName || "-"}</td>
                                                                                <td className="py-2 px-3 border">{e.category || "-"}</td>
                                                                                <td className="py-2 px-3 border">₹{parseFloat(e.amount || 0).toFixed(2)}</td>
                                                                                <td className="py-2 px-3 border">{e.paidTo || "-"}</td>
                                                                        </tr>
                                                                ))}
                                                                <tr className="bg-gray-100 font-semibold">
                                                                        <td colSpan="4" className="py-2 px-3 border text-right">Total</td>
                                                                        <td className="py-2 px-3 border">₹{calculateTotal()}</td>
                                                                        <td className="py-2 px-3 border"></td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                )}
                        </div>
                </UniversalLayout>
        );
}

export default ExportTab;
