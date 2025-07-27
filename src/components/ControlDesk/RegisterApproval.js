// src/components/ControlDesk/RegisterApproval.js

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UniversalLayout from "../universal/UniversalLayout";
import {
    fetchPendingRegistrations,
    updateRegistrationStatus
} from "../../firebase/services/registrationService";

function RegisterApproval({ name, role }) {
    const [pendingList, setPendingList] = useState([]);
    const [remarks, setRemarks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        setLoading(true);
        try {
            const list = await fetchPendingRegistrations();
            setPendingList(list);
        } catch (err) {
            console.error("❌ Failed to fetch:", err);
        }
        setLoading(false);
    };

    const handleAction = async (entryId, action) => {
        try {
            const remark = remarks[entryId] || "";
            await updateRegistrationStatus(entryId, action, remark, name);
            setPendingList(prev => prev.filter(p => p.id !== entryId));
            toast.success(`✅ Successfully ${action}`);
        } catch (err) {
            console.error("❌ Approval failed:", err);
            alert("Something went wrong.");
        }
    };

    if (role?.toUpperCase() !== "ADMIN") {
        return (
            <UniversalLayout name={name} role={role}>
                <div className="text-red-600 text-center font-bold mt-20 text-xl">Access Denied</div>
            </UniversalLayout>
        );
    }

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-6">🧾 Member Approval Requests</h2>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : pendingList.length === 0 ? (
                    <p className="text-center text-green-600 font-semibold">✅ No pending requests.</p>
                ) : (
                    <div className="space-y-10">
                        {pendingList.map((entry) => (
                            <div key={entry.id} className="bg-gray-100 p-4 rounded-xl border border-gray-400 shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                                    <div><strong>Name:</strong> {entry.personName}</div>
                                    <div><strong>Category:</strong> {entry.category}</div>
                                    <div><strong>Submitted By:</strong> {entry.submittedBy}</div>
                                    <div>
                                        <strong>Submitted At:</strong>{" "}
                                        {entry.submittedAt && typeof entry.submittedAt.toDate === "function"
                                            ? entry.submittedAt.toDate().toLocaleDateString("en-IN")
                                            : "N/A"}
                                    </div>
                                    {entry.category === "Site" && (
                                        <>
                                            <div><strong>Sites:</strong> {entry.sites?.join(", ")}</div>
                                            <div><strong>Teams:</strong> {entry.teams?.join(", ")}</div>
                                        </>
                                    )}
                                    {entry.role && <div><strong>Role:</strong> {entry.role}</div>}
                                    {entry.email && <div><strong>Email:</strong> {entry.email}</div>}
                                </div>

                                {/* Document Links */}
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                    {entry.documents?.aadhaarURL && (
                                        <a href={entry.documents.aadhaarURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                            📄 Aadhaar
                                        </a>
                                    )}
                                    {entry.documents?.photoURL && (
                                        <a href={entry.documents.photoURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                            🖼️ Photo
                                        </a>
                                    )}
                                    {entry.documents?.pfURL && (
                                        <a href={entry.documents.pfURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                            📑 PF Declaration
                                        </a>
                                    )}
                                    {entry.documents?.panURL && (
                                        <a href={entry.documents.panURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                            🧾 PAN Card
                                        </a>
                                    )}
                                </div>

                                {/* Remark + Buttons */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">Remark:</label>
                                    <input
                                        type="text"
                                        value={remarks[entry.id] || ""}
                                        onChange={(e) => setRemarks({ ...remarks, [entry.id]: e.target.value })}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-4">
                                    <button
                                        onClick={() => handleAction(entry.id, "approved")}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(entry.id, "rejected")}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}

export default RegisterApproval;
