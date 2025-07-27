// src/components/ControlDesk/MemberDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import { getMemberById, relieveMember, updateMemberFields } from "../../firebase/services/registrationService";

function MemberDetails({ name, role }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ personName: "", email: "", role: "" });

    useEffect(() => {
        const isEdit = new URLSearchParams(location.search).get("edit") === "true";
        setEditModalOpen(isEdit);
    }, [location.search]);

    useEffect(() => {
        const loadMember = async () => {
            try {
                const data = await getMemberById(id);
                setMember(data);
                setFormData({
                    personName: data.personName,
                    email: data.email,
                    role: data.role || ""
                });
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

    const handleSave = async () => {
        try {
            await updateMemberFields(id, formData);
            alert("✅ Member updated");
            setEditModalOpen(false);
            setTimeout(() => {
                navigate(`/control/member/${id}`, { replace: true });
            }, 100);
            const updated = await getMemberById(id);
            setMember(updated);
        } catch (err) {
            console.error("❌ Failed to update:", err);
            alert("Error updating member");
        }
    };

    const handleCancel = () => {
        setEditModalOpen(false);
        setTimeout(() => {
            navigate(`/control/member/${id}`, { replace: true });
        }, 100);
    };

    const handleOpenDoc = (url) => {
        if (url) window.open(url, "_blank");
        else alert("❌ Document not available");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <p className="text-center mt-10">⏳ Loading...</p>;
    if (!member) return <p className="text-center mt-10 text-red-600">❌ Member not found</p>;

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <h2 className="text-2xl font-bold text-center mb-6">👤 Member Details</h2>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-base">
                    <div className="md:col-span-2 space-y-3 text-gray-800">
                        <p><span className="font-semibold text-gray-700">👤 Name:</span> {member.personName}</p>
                        <p><span className="font-semibold text-gray-700">💼 Designation:</span> {member.designation || "-"}</p>
                        <p><span className="font-semibold text-gray-700">📱 Mobile Number:</span> {member.mobileNumber || "-"}</p>
                        <p><span className="font-semibold text-gray-700">📧 Email:</span> {member.email || "-"}</p>
                        <p><span className="font-semibold text-gray-700">🆔 Aadhaar Number:</span> {member.aadhaarNumber || "-"}</p>
                        <p><span className="font-semibold text-gray-700">🧾 PAN Number:</span> {member.panNumber || "-"}</p>
                        <p><span className="font-semibold text-gray-700">🏷️ Category:</span> {member.category}</p>
                        <p><span className="font-semibold text-gray-700">🔐 Role:</span> {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase() : "-"}</p>
                        <p><span className="font-semibold text-gray-700">⚙️ Status:</span> {member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1).toLowerCase() : "-"}</p>
                        <p><span className="font-semibold text-gray-700">📍 Sites:</span> {(member.sites || []).join(", ") || "-"}</p>
                        <p><span className="font-semibold text-gray-700">👥 Teams:</span> {(member.teams || []).join(", ") || "-"}</p>
                        <p><span className="font-semibold text-gray-700">🏠 Address:</span> {[member.addressLine1, member.addressLine2, member.addressLine3].filter(Boolean).join(", ") || "-"}</p>

                        <div className="pt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => handleOpenDoc(member.documents?.aadhaar)}
                                className="bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A]"
                            >
                                📄 View Aadhaar
                            </button>
                            <button
                                onClick={() => handleOpenDoc(member.documents?.pan)}
                                className="bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A]"
                            >
                                🧾 View PAN Card
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-1 flex justify-center md:justify-end items-start">
                        {(member?.documents?.photo || member?.documents?.photoURL) ? (
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

                <div className="flex flex-wrap gap-4 justify-center pt-6">
                    <button
                        className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]"
                        onClick={() => navigate(`/control/member/${id}?edit=true`)}
                    >
                        ✏️ Edit Info
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

                {editModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                            <h3 className="text-xl font-bold mb-4 text-center">✏️ Edit Member Info</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1 font-medium">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    >
                                        <option value="">-- Select Role --</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="USER">User</option>
                                        <option value="SITE HEAD">Site Head</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={handleCancel}
                                >
                                    ❌ Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={handleSave}
                                >
                                    💾 Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}

export default MemberDetails;
