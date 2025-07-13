import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { uploadFileToDrive } from "../../utils/GoogleDriveUploader";
import { Link } from "react-router-dom";
import MyExpenses from "./MyExpenses";
import ApprovalTab from "./ApprovalTab";

function ExpenseDesk({ name, role }) {
    const [activeTab, setActiveTab] = useState("add");

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
                date,
                person: name,
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
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
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
                    <p className="text-gray-500 text-center">📤 Export report screen coming soon...</p>
                )}
            </div>
        </div>
    );
}

export default ExpenseDesk;
