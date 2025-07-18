// src/components/ExpenseDesk/ViewLedger.jsx
import React, { useEffect, useState } from "react";
import { fetchExpenses } from "../../firebase/services/expenseService";
import { fetchPayments } from "../../firebase/services/paymentService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import UniversalLayout from "../universal/UniversalLayout";

function ViewLedger({ role, name }) {
        const [fromDate, setFromDate] = useState("");
        const [toDate, setToDate] = useState("");
        const [person, setPerson] = useState("");
        const [ledger, setLedger] = useState([]);
        const [balance, setBalance] = useState({ debit: 0, credit: 0, net: 0 });
        const [allPersons, setAllPersons] = useState([]);
        const [displayInfo, setDisplayInfo] = useState("");

        useEffect(() => {
                const load = async () => {
                        const expenses = await fetchExpenses();
                        const persons = [...new Set(expenses.map(e => e.person).filter(Boolean))];
                        setAllPersons(persons);
                };
                load();
        }, []);

        const generateLedger = async () => {
                if (!fromDate || !toDate || !person) {
                        alert("❌ Please select Person and both dates.");
                        return;
                }

                const expenses = await fetchExpenses();
                const payments = await fetchPayments();
                const ledgerEntries = [];

                for (const p of payments) {
                        if (p.person === person && p.date) {
                                const [yyyy, mm, dd] = p.date.split("-");
                                const formatted = `${yyyy}-${mm}-${dd}`;
                                if (formatted >= fromDate && formatted <= toDate) {
                                        ledgerEntries.push({
                                                date: `${dd}/${mm}/${yyyy}`,
                                                particular: p.remarks || "Payment Given",
                                                debit: parseFloat(p.amount || 0),
                                                credit: 0,
                                        });
                                }
                        }
                }

                for (const e of expenses) {
                        if (e.person === person && e.date) {
                                const [dd, mm, yyyy] = e.date.split("/");
                                const formatted = `${yyyy}-${mm}-${dd}`;
                                if (formatted >= fromDate && formatted <= toDate) {
                                        ledgerEntries.push({
                                                date: e.date,
                                                particular: e.category || "Expense",
                                                debit: 0,
                                                credit: parseFloat(e.amount || 0),
                                        });
                                }
                        }
                }

                ledgerEntries.sort((a, b) => {
                        const [da, ma, ya] = a.date.split("/");
                        const [db, mb, yb] = b.date.split("/");
                        return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
                });

                const totalDebit = ledgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
                const totalCredit = ledgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0);

                setLedger(ledgerEntries);
                setBalance({
                        debit: totalDebit,
                        credit: totalCredit,
                        net: totalCredit - totalDebit,
                });

                const formattedFrom = fromDate.split("-").reverse().join("/");
                const formattedTo = toDate.split("-").reverse().join("/");
                setDisplayInfo(`Ledger: ${person} | Date: ${formattedFrom} to ${formattedTo}`);
        };

        const handleExport = () => {
                const wb = XLSX.utils.book_new();
                const wsData = [
                        ["Date", "Particular", "Debit (₹)", "Credit (₹)"],
                        ...ledger.map((e) => [
                                e.date,
                                e.particular,
                                e.debit ? e.debit : "",
                                e.credit ? e.credit : "",
                        ]),
                        ["", "Total", balance.debit.toFixed(2), balance.credit.toFixed(2)],
                        ["", "Net Balance", "", balance.net >= 0 ? `${balance.net.toFixed(2)} Receivable` : `${Math.abs(balance.net).toFixed(2)} Payable`],
                ];
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, "Ledger");

                const filename = `Ledger_${person}_${fromDate}_to_${toDate}.xlsx`;
                const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
        };

        return (
                <UniversalLayout name={name} role={role} title="📘 View Ledger">
                        <div className="max-w-screen-xl mx-auto">
                                {/* 📋 Dynamic Info */}
                                {displayInfo && (
                                        <div className="text-center font-semibold text-blue-800 text-base mt-2 mb-4">
                                                {displayInfo}
                                        </div>
                                )}

                                {/* 🔍 Filters */}
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">👤 Person</label>
                                                <select
                                                        value={person}
                                                        onChange={(e) => setPerson(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                                >
                                                        <option value="">Select person...</option>
                                                        {allPersons.map((p, i) => (
                                                                <option key={i} value={p}>{p}</option>
                                                        ))}
                                                </select>
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">📅 From</label>
                                                <input
                                                        type="date"
                                                        value={fromDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                                />
                                        </div>
                                        <div>
                                                <label className="text-sm text-gray-700 mb-1 block">📅 To</label>
                                                <input
                                                        type="date"
                                                        value={toDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                                />
                                        </div>
                                </div>

                                {/* 🔘 Actions */}
                                <div className="mt-8 text-center space-x-4">
                                        <button onClick={generateLedger} className="bg-[#2f2f2f] text-white px-6 py-2 rounded hover:bg-[#444]">
                                                📄 Generate Ledger
                                        </button>
                                        {ledger.length > 0 && (
                                                <button onClick={handleExport} className="bg-[#1a73e8] text-white px-6 py-2 rounded hover:bg-[#155cc1]">
                                                        📥 Export Excel
                                                </button>
                                        )}
                                </div>

                                {/* 📊 Ledger Table */}
                                {ledger.length > 0 && (
                                        <div className="overflow-x-auto mt-10">
                                                <table className="min-w-full border bg-white text-sm shadow-md">
                                                        <thead className="bg-[#F0F0F0] text-gray-800">
                                                                <tr>
                                                                        <th className="border px-3 py-2 text-left">Date</th>
                                                                        <th className="border px-3 py-2 text-left">Particular</th>
                                                                        <th className="border px-3 py-2 text-right">Debit (₹)</th>
                                                                        <th className="border px-3 py-2 text-right">Credit (₹)</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {ledger.map((e, i) => (
                                                                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                                <td className="border px-3 py-2">{e.date}</td>
                                                                                <td className="border px-3 py-2">{e.particular}</td>
                                                                                <td className="border px-3 py-2 text-right">{e.debit ? `₹${e.debit.toFixed(2)}` : ""}</td>
                                                                                <td className="border px-3 py-2 text-right">{e.credit ? `₹${e.credit.toFixed(2)}` : ""}</td>
                                                                        </tr>
                                                                ))}
                                                                <tr className="bg-gray-100 font-semibold">
                                                                        <td colSpan="2" className="border px-3 py-2 text-right">Total</td>
                                                                        <td className="border px-3 py-2 text-right">₹{balance.debit.toFixed(2)}</td>
                                                                        <td className="border px-3 py-2 text-right">₹{balance.credit.toFixed(2)}</td>
                                                                </tr>
                                                                <tr className="bg-[#fef6e4] font-bold">
                                                                        <td colSpan="3" className="border px-3 py-2 text-right">Net Balance</td>
                                                                        <td className="border px-3 py-2 text-right">
                                                                                {balance.net >= 0
                                                                                        ? `₹${balance.net.toFixed(2)} Receivable`
                                                                                        : `₹${Math.abs(balance.net).toFixed(2)} Payable`}
                                                                        </td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                )}
                        </div>
                </UniversalLayout>
        );
}

export default ViewLedger;
