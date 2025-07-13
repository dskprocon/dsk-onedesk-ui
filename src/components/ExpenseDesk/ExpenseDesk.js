import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { uploadFileToDrive } from "../../utils/GoogleDriveUploader";
import { Link } from "react-router-dom";
import MyExpenses from "./MyExpenses";
import ApprovalTab from "./ApprovalTab";
import ExportTab from "./ExportTab";

function ExpenseDesk({ name, role }) {
    const [activeTab, setActiveTab] = useState("add");
    const [batchData, setBatchData] = useState([]);
    const [excelFileName, setExcelFileName] = useState("");

                function formatToSlash(date) {
                                const day = String(date.getDate()).padStart(2, "0");
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const year = date.getFullYear();
                                return `${day}/${month}/${year}`;
                }

                function formatSlashDateFromSerial(serial) {
                                const date = new Date((serial - 25569) * 86400 * 1000);
                                return formatToSlash(date);
                }

                function formatSlashDateFromString(dateStr) {
                                const date = new Date(dateStr);
                                if (isNaN(date)) return formatToSlash(new Date());
                                return formatToSlash(date);
                }


                const handleExcelUpload = (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                setExcelFileName(file.name);

                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                                const bstr = evt.target.result;
                                                const wb = XLSX.read(bstr, { type: "binary" });
                                                const ws = wb.Sheets[wb.SheetNames[0]];
                                                const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

                                                // ✅ Mandatory Columns Check
                                                const requiredCols = [
                                                                "Date of Expense",
                                                                "Account Head",
                                                                "Site Name",
                                                                "Location",
                                                                "Type Of Expense",
                                                                "Amount",
                                                                "Paid To",
                                                                "Remarks"
                                                ];

                                                const sheetCols = Object.keys(json[0] || {});
                                                const missing = requiredCols.filter(col => !sheetCols.includes(col));

                                                if (missing.length > 0) {
                                                                alert("❌ Missing columns: " + missing.join(", "));
                                                                setBatchData([]);
                                                                setExcelFileName("");
                                                                return;
                                                }

                                                setBatchData(json);
                                };
                                reader.readAsBinaryString(file);
                };

                const uploadAllExpenses = async () => {
                                if (batchData.length === 0) {
                                                alert("❌ No data loaded.");
                                                return;
                                }

                                const db = getFirestore(app);
                                let success = 0;
                                let fail = 0;
                                let failedRows = [];

                                for (let i = 0; i < batchData.length; i++) {
                                                const row = batchData[i];
                                                try {
                                                                await addDoc(collection(db, "expenses"), {
                                                                                    date: typeof row["Date of Expense"] === "number"
                                                                                                    ? formatSlashDateFromSerial(row["Date of Expense"])
                                                                                                    : formatSlashDateFromString(row["Date of Expense"]),
                                                                                    person: row["Account Head"] || "",
                                                                                    person_lower: (row["Account Head"] || "").toLowerCase(),
                                                                                    siteName: row["Site Name"] || "",
                                                                                    location: row["Location"] || "",
                                                                                    category: row["Type Of Expense"] || "",
                                                                                    paidTo: row["Paid To"] || "",
                                                                                    amount: parseFloat(row["Amount"]) || 0,
                                                                                    remarks: row["Remarks"] || "",
                                                                                    billUrl: "",
                                                                                    status: "pending",
                                                                                    createdAt: serverTimestamp(),
                                                                });
                                                                success++;
                                                } catch (err) {
                                                                fail++;
                                                                failedRows.push(i + 2); // Excel row number (assuming header is row 1)
                                                }
                                }

                                let msg = `✅ Upload complete.\nSuccessful: ${success}\nFailed: ${fail}`;
                                if (fail > 0) {
                                                msg += `\n⚠️ Failed rows: ${failedRows.join(", ")}`;
                                }

                                alert(msg);
                                setBatchData([]);
                                setExcelFileName("");
                };

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [category, setCategory] = useState("");
    const [paidTo, setPaidTo] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState("");
    const [location, setLocation] = useState("");
    const [billFile, setBillFile] = useState(null);

    const db = getFirestore(app);

    useEffect(() => {
        const fetchSites = async () => {
            const siteSnapshot = await getDocs(collection(db, "sites"));
            const siteNames = siteSnapshot.docs.map(doc => doc.data().name);
            setSites(siteNames);
        };
        fetchSites();
    }, []);

    const handleSubmit = async () => {
        if (!date || !selectedSite || !location || !category || !paidTo || !amount) {
            alert("❌ Please fill all required fields.");
            return;
        }

        let fileUrl = "";

        if (billFile) {
            try {
                fileUrl = await uploadFileToDrive(billFile, date, category, name);
            } catch (err) {
                alert("❌ Upload failed. Try again.");
                return;
            }
        }

        try {
            const data = {
                date: formatToSlash(new Date(date)),
                person: name,
                person_lower: name.trim().toLowerCase(),
                siteName: selectedSite,
                location,
                category,
                paidTo,
                amount: parseFloat(amount),
                remarks,
                billUrl: fileUrl || "",
                status: "pending",
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "expenses"), data);
            alert("✅ Expense saved to Firebase!");

            setSelectedSite("");
            setLocation("");
            setCategory("");
            setPaidTo("");
            setAmount("");
            setRemarks("");
            setBillFile(null);
        } catch (err) {
            console.error("❌ Firebase Save Error:", err);
            alert("❌ Failed to save. Check console.");
        }
    };

    const tabStyle = (tab) =>
        `px-6 py-3 rounded-t-lg text-lg font-medium transition ${
            activeTab === tab
                ? "bg-white text-black border-t-4 border-[#1A237E]"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`;

    return (
        <div className="min-h-screen bg-[#f4f4f4] p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">💼 ExpenseDesk</h1>

            <div className="flex justify-center space-x-4 mb-8">
                <button className={tabStyle("add")} onClick={() => setActiveTab("add")}>➕ Add Expense</button>
                <button className={tabStyle("my")} onClick={() => setActiveTab("my")}>👤 My Expenses</button>
                <button className={tabStyle("approval")} onClick={() => setActiveTab("approval")}>✅ Approvals</button>
                <button className={tabStyle("export")} onClick={() => setActiveTab("export")}>📤 Export Reports</button>
                <button className={tabStyle("batch")} onClick={() => setActiveTab("batch")}>📥 Batch Upload</button>

            </div>

            <div className="bg-white rounded-lg shadow-md px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
                {activeTab === "add" && (
                    <div className="space-y-6">
                        {/* 📅 Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date of Expense</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2" />
                        </div>

                        {/* 👤 Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">👤 Person</label>
                            <input
                                type="text"
                                value={name || "Not Logged In"}
                                disabled
                                className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-2 text-gray-500"
                            />
                        </div>

                        {/* 🏗 Site Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🏗 Site Name</label>
                            <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2">
                                <option value="">Select Site</option>
                                {sites.map((site, index) => (
                                    <option key={index} value={site}>{site}</option>
                                ))}
                            </select>
                        </div>

                        {/* 📍 Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📍 Location</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location" className="w-full border border-gray-300 rounded px-4 py-2" />
                        </div>

                        {/* 🏷 Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🏷 Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2">
                                <option value="">Select Category</option>
                                <option value="Material">Material</option>
                                <option value="Tools & Equipment">Tools & Equipment</option>
                                <option value="Site Purchase">Site Purchase</option>
                                <option value="Labour Related">Labour Related</option>
                                <option value="Vendor Bill">Vendor Bill</option>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Communication">Communication</option>
                                <option value="Office Expense">Office Expense</option>
                                <option value="Cash Withdrawal">Cash Withdrawal</option>
                                <option value="Transfer">Transfer</option>
                                <option value="Personal Use">Personal Use</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* 🧾 Paid To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🧾 Paid To / For</label>
                            <input type="text" value={paidTo} onChange={(e) => setPaidTo(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2" />
                        </div>

                        {/* 💰 Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">💰 Amount (₹)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2" />
                        </div>

                        {/* 📝 Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📝 Remarks</label>
                            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-gray-300 rounded px-4 py-2" />
                        </div>

                        {/* 📎 Upload Bill */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📎 Upload Bill Copy (PDF)</label>
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => setBillFile(e.target.files[0])}
                                className="w-full border border-gray-300 rounded px-4 py-2"
                            />
                        </div>

                        {/* 💾 Save and ⬅ Back Buttons */}
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={handleSubmit}
                                className="bg-[#1A237E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0f164e] transition"
                            >
                                💾 Save Expense
                            </button>
                            <Link
                                to="/"
                                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                ⬅ Back to Home
                            </Link>
                        </div>
                    </div>
                )}

                {activeTab === "my" && (
                    <MyExpenses name={name} role={role} />
                )}

                {activeTab === "approval" && (
                    <ApprovalTab />
                )}

                {activeTab === "export" && (
                    <ExportTab />
                )}

                {activeTab === "batch" && (
                                <div className="space-y-6 text-sm">
                                                <div className="mb-4">
                                                                <label className="block text-gray-700 font-medium mb-1">📁 Upload Excel File</label>
                                                                <input
                                                                        type="file"
                                                                        accept=".xlsx"
                                                                        onChange={handleExcelUpload}
                                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                                />
                                                                {excelFileName && (
                                                                        <p className="text-green-600 mt-2">✅ Loaded: {excelFileName}</p>
                                                                )}
                                                </div>

                                                {batchData.length > 0 && (
                                                                <>
                                                                        <p className="text-gray-800 font-semibold">
                                                                                📋 Preview ({batchData.length} entries)
                                                                        </p>
                                                                        <div className="overflow-auto max-h-64 border border-gray-200 rounded">
                                                                                <table className="min-w-full text-xs">
                                                                                        <thead className="bg-gray-100 sticky top-0 z-10">
                                                                                                <tr>
                                                                                                        {Object.keys(batchData[0]).map((key, index) => (
                                                                                                                <th key={index} className="px-2 py-1 border">
                                                                                                                        {key}
                                                                                                                </th>
                                                                                                        ))}
                                                                                                </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                                {batchData.slice(0, 20).map((row, rowIndex) => (
                                                                                                        <tr key={rowIndex}>
                                                                                                                {Object.values(row).map((val, colIndex) => (
                                                                                                                        <td key={colIndex} className="px-2 py-1 border">
                                                                                                                                {val}
                                                                                                                        </td>
                                                                                                                ))}
                                                                                                        </tr>
                                                                                                ))}
                                                                                        </tbody>
                                                                                </table>
                                                                        </div>

                                                                        <div className="flex justify-center mt-4">
                                                                                <button
                                                                                        onClick={uploadAllExpenses}
                                                                                        className="bg-[#1A237E] text-white px-6 py-2 rounded hover:bg-[#0f164e]"
                                                                                >
                                                                                        🚀 Upload All to Firebase
                                                                                </button>
                                                                        </div>
                                                                </>
                                                )}
                                </div>
                )}

            </div>
        </div>
    );
}

export default ExpenseDesk;
