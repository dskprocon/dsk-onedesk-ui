import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";

function BatchUpload({ name, role }) {
        const db = getFirestore(app);
        const [rows, setRows] = useState([]);
        const [uploading, setUploading] = useState(false);

        const handleFile = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();

                reader.onload = (evt) => {
                        const data = new Uint8Array(evt.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(sheet);
                        setRows(jsonData);
                };

                reader.readAsArrayBuffer(file);
        };

        const uploadAll = async () => {
                if (rows.length === 0) {
                        alert("❌ No data to upload.");
                        return;
                }

                setUploading(true);
                let success = 0;
                let failed = 0;

                for (const row of rows) {
                        const { Date, Site, Location, Category, PaidTo, Amount, Remarks } = row;

                        if (!Date || !Site || !Location || !Category || !PaidTo || !Amount) {
                                failed++;
                                continue;
                        }

                        try {
                                const entry = {
                                        date: Date,
                                        siteName: Site,
                                        location: Location,
                                        category: Category,
                                        paidTo: PaidTo,
                                        amount: parseFloat(Amount),
                                        remarks: Remarks || "",
                                        person: name,
                                        person_lower: name.trim().toLowerCase(),
                                        status: "pending",
                                        createdAt: serverTimestamp(),
                                };

                                await addDoc(collection(db, "expenses"), entry);
                                success++;
                        } catch {
                                failed++;
                        }
                }

                setUploading(false);
                alert(`✅ Uploaded: ${success} | ❌ Failed: ${failed}`);
                setRows([]);
        };

        return (
                <div className="min-h-screen bg-[#F6F6F6] p-6 sm:p-8 max-w-4xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#1A1A1A] mb-6">
                                📥 Batch Upload Expenses (Excel)
                        </h2>

                        <div className="mb-6 text-center">
                                <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="border px-4 py-2 rounded bg-white shadow-sm" />
                        </div>

                        {rows.length > 0 && (
                                <div className="mb-6 overflow-x-auto bg-white rounded shadow-sm border">
                                        <table className="min-w-full text-sm table-auto border-collapse">
                                                <thead>
                                                        <tr className="bg-[#EAEAEA] text-left">
                                                                {Object.keys(rows[0]).map((key) => (
                                                                        <th key={key} className="px-3 py-2 border-b font-semibold">{key}</th>
                                                                ))}
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {rows.map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-[#F9F9F9] border-b">
                                                                        {Object.values(row).map((val, i) => (
                                                                                <td key={i} className="px-3 py-2">{val}</td>
                                                                        ))}
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>
                        )}

                        {rows.length > 0 && (
                                <div className="text-center">
                                        <button
                                                onClick={uploadAll}
                                                disabled={uploading}
                                                className="bg-[#2F2F2F] text-white px-6 py-3 rounded hover:bg-[#505050] transition"
                                        >
                                                {uploading ? "Uploading..." : "📤 Upload All Entries"}
                                        </button>
                                </div>
                        )}
                </div>
        );
}

export default BatchUpload;
