// src/components/ControlDesk/MemberDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import { getMemberById, relieveMember } from "../../firebase/services/registrationService";

function MemberDetails({ name, role }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMember = async () => {
            try {
                const data = await getMemberById(id);
                setMember(data);
            } catch (err) {
                console.error("❌ Failed to load member:", err);
            } finally {
                setLoading(false);
            }
        };
        loadMember();
    }, [id]);

    const handleRelieve = async () => {
        if (!window.confirm("Are you sure you want to relieve this member?")) return;
        try {
            await relieveMember(id);
            alert("✅ Member relieved.");
            const updated = await getMemberById(id);
            setMember(updated);
        } catch (err) {
            console.error("❌ Error relieving member:", err);
            alert("❌ Failed to relieve.");
        }
    };

    const handleOpenDoc = (url) => {
        if (url) window.open(url, "_blank");
        else alert("❌ Document not available");
    };

    const getSafeUrl = (...paths) => {
        for (const p of paths) {
            if (typeof p === "string" && p.startsWith("http")) return p;
        }
        return null;
    };

    if (loading) return <p className="text-center mt-10">⏳ Loading...</p>;
    if (!member) return <p className="text-center mt-10 text-red-600">❌ Member not found</p>;

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-5xl mx-auto px-4 pt-6">
                <h2 className="text-2xl font-bold text-center mb-6">👤 Member Details</h2>

                <div className="bg-white p-8 rounded-xl shadow border border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-6 text-base text-gray-800">
                    {/* Info Section */}
                    <div className="md:col-span-2 space-y-3">
                        <p><b>👤 Name:</b> {member.personName}</p>
                        <p><b>💼 Designation:</b> {member.designation || "-"}</p>
                        <p><b>📱 Mobile Number:</b> {member.mobileNumber || "-"}</p>
                        <p><b>📧 Email:</b> {member.email || "-"}</p>
                        <p><b>🆔 Aadhaar Number:</b> {member.aadhaarNumber || "-"}</p>
                        <p><b>🧾 PAN Number:</b> {member.panNumber || "-"}</p>
                        <p><b>🏷️ Category:</b> {member.category}</p>
                        <p><b>🔐 Role:</b> {member.role || "-"}</p>
                        <p><b>⚙️ Status:</b> {(member.status || "-").charAt(0).toUpperCase() + (member.status || "-").slice(1)}</p>
                        <p><b>📍 Sites:</b> {(member.sites || []).join(", ") || "-"}</p>
                        <p><b>👥 Teams:</b> {(member.teams || []).join(", ") || "-"}</p>
                        <p><b>🏠 Address:</b> {[member.addressLine1, member.addressLine2, member.addressLine3].filter(Boolean).join(", ") || "-"}</p>

                        {/* View Buttons */}
                        <div className="pt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() =>
                                    handleOpenDoc(
                                        getSafeUrl(
                                            member.documents?.aadhaarURL,
                                            member.documents?.aadhaarFront,
                                            member.documents?.aadhaar
                                        )
                                    )
                                }
                                className="bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A]"
                            >
                                📄 View Aadhaar
                            </button>
                            <button
                                onClick={() =>
                                    handleOpenDoc(
                                        getSafeUrl(
                                            member.documents?.panURL,
                                            member.documents?.panCard,
                                            member.documents?.pan
                                        )
                                    )
                                }
                                className="bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A]"
                            >
                                🧾 View PAN Card
                            </button>
                        </div>
                    </div>

                    {/* Photo Section */}
                    <div className="md:col-span-1 flex justify-center md:justify-end items-start">
                        {(member.documents?.photo || member.documents?.photoURL) ? (
                            <img
                                src={member.documents?.photo || member.documents?.photoURL}
                                alt="Member"
                                className="w-48 h-56 object-cover border border-gray-400 rounded-md shadow"
                            />
                        ) : (
                            <div className="w-48 h-56 bg-gray-100 border border-gray-400 flex items-center justify-center text-gray-500 rounded-md">
                                No Photo
                            </div>
                        )}
                    </div>
                </div>

                {/* 📜 Site History */}
                {(member.siteHistory || []).length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-xl font-semibold mb-2">📜 Site Assignment History</h3>
                        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-300">
                            <table className="w-full text-sm text-gray-800 border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 border border-gray-300 text-left">#</th>
                                        <th className="px-4 py-2 border border-gray-300 text-left">Site</th>
                                        <th className="px-4 py-2 border border-gray-300 text-left">From</th>
                                        <th className="px-4 py-2 border border-gray-300 text-left">To</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {member.siteHistory.map((entry, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border border-gray-300">{idx + 1}</td>
                                            <td className="px-4 py-2 border border-gray-300">{entry.site}</td>
                                            <td className="px-4 py-2 border border-gray-300">{entry.from}</td>
                                            <td className="px-4 py-2 border border-gray-300">{entry.to || "Present"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center pt-6">
                    <button
                        className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]"
                        onClick={() => navigate(`/control/modify-member/${id}`)}
                    >
                        📝 Modify Info
                    </button>
                    <button
                        className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]"
                        onClick={() => navigate(`/control/assign-site/${id}`)}
                    >
                        📍 Assign Site / Team
                    </button>
                    <button
                        className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]"
                        onClick={handleRelieve}
                        disabled={member.status === "relieved"}
                    >
                        ❌ Relieve Member
                    </button>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default MemberDetails;
