import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { fetchPendingRegistrations, updateRegistrationStatus } from "../../firebase/services/punchinService";

function RegisterApproval({ name, role }) {
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState({});

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        setLoading(true);
        const list = await fetchPendingRegistrations();
        setPendingList(list);
        setLoading(false);
    };

    const handleAction = async (id, action) => {
        await updateRegistrationStatus(id, action, remarks[id] || "", name);
        setPendingList(prev => prev.filter(item => item.id !== id));
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
                    <div className="space-y-6">
                        {pendingList.map((entry) => (
                            <div key={entry.id} className="bg-white shadow-md rounded-xl p-4 border border-gray-300">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                                    <div><strong>Name:</strong> {entry.personName}</div>
                                    <div><strong>Category:</strong> {entry.category}</div>
                                    {entry.category === "Site" && (
                                        <>
                                            <div><strong>Site:</strong> {entry.siteName}</div>
                                            <div><strong>Team:</strong> {entry.teamName}</div>
                                        </>
                                    )}
                                    <div><strong>Submitted By:</strong> {entry.submittedBy}</div>
                                    <div><strong>Submitted At:</strong> {entry.submittedAt?.toDate().toLocaleString()}</div>
                                </div>

                                {/* 📄 Document Preview */}
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {entry.aadhaarURL && (
                                        <a href={entry.aadhaarURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            📄 Aadhaar
                                        </a>
                                    )}
                                    {entry.photoURL && (
                                        <a href={entry.photoURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            🖼️ Photo
                                        </a>
                                    )}
                                    {entry.pfURL && (
                                        <a href={entry.pfURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            📑 PF Declaration
                                        </a>
                                    )}
                                    {entry.panURL && (
                                        <a href={entry.panURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            🧾 PAN Card
                                        </a>
                                    )}
                                </div>

                                {/* ✏️ Remark Field */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-1">Remark:</label>
                                    <input
                                        type="text"
                                        value={remarks[entry.id] || ""}
                                        onChange={(e) => setRemarks({ ...remarks, [entry.id]: e.target.value })}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>

                                {/* ✅❌ Action Buttons */}
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
