import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { fetchPendingRegistrations, updateRegistrationStatus } from "../../firebase/services/punchinService";

function RegisterApproval({ name, role }) {
    const [pendingList, setPendingList] = useState([]);
    const [remarks, setRemarks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        setLoading(true);
        const list = await fetchPendingRegistrations();
        setPendingList(list);
        setLoading(false);
    };

    const handleAction = async (parentId, memberId, action) => {
        await updateRegistrationStatus(parentId, memberId, action, remarks[memberId] || "", name);
        // Filter out only the processed member
        setPendingList(prev =>
            prev.map(entry =>
                entry.id === parentId
                    ? { ...entry, members: entry.members.filter(mem => mem.id !== memberId) }
                    : entry
            ).filter(entry => entry.members.length > 0)
        );
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
                                <div className="text-sm text-gray-700 mb-3">
                                    <strong>Submitted By:</strong> {entry.submittedBy} <br />
                                    <strong>Submitted At:</strong> {entry.submittedAt?.toDate().toLocaleString()}
                                </div>

                                {entry.members.map((mem) => (
                                    <div key={mem.id} className="bg-white p-4 mb-6 rounded-lg border border-gray-300 shadow-sm">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                                            <div><strong>Name:</strong> {mem.personName}</div>
                                            <div><strong>Category:</strong> {entry.category}</div>
                                            {entry.category === "Site" && (
                                                <>
                                                    <div><strong>Site:</strong> {entry.siteName}</div>
                                                    <div><strong>Team:</strong> {entry.teamName}</div>
                                                </>
                                            )}
                                        </div>

                                        {/* 📄 Document Links */}
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            {mem.aadhaarURL && (
                                                <a href={mem.aadhaarURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    📄 Aadhaar
                                                </a>
                                            )}
                                            {mem.photoURL && (
                                                <a href={mem.photoURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    🖼️ Photo
                                                </a>
                                            )}
                                            {mem.pfURL && (
                                                <a href={mem.pfURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    📑 PF Declaration
                                                </a>
                                            )}
                                            {mem.panURL && (
                                                <a href={mem.panURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    🧾 PAN Card
                                                </a>
                                            )}
                                        </div>

                                        {/* 📝 Remark Input */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-1">Remark:</label>
                                            <input
                                                type="text"
                                                value={remarks[mem.id] || ""}
                                                onChange={(e) => setRemarks({ ...remarks, [mem.id]: e.target.value })}
                                                className="w-full border border-gray-400 px-3 py-2 rounded"
                                            />
                                        </div>

                                        {/* ✅❌ Buttons */}
                                        <div className="mt-4 flex flex-wrap gap-4">
                                            <button
                                                onClick={() => handleAction(entry.id, mem.id, "approved")}
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(entry.id, mem.id, "rejected")}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}

export default RegisterApproval;
