// src/components/ControlDesk/MemberDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import { getMemberById, relieveMember } from "../../firebase/services/registrationService";
import { showConfirm, showSuccess, showError } from "../../utils/alertUtils";
import { User, Briefcase, Phone, Mail, Calendar, UserCircle, UserCheck, Heart, Droplet, PhoneCall, Building, Hash, MapPin, Users, IdCard, FileText, FileCheck } from "lucide-react";

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
        const confirmed = await showConfirm("Relieve Member", "Are you sure you want to relieve this member?");
        if (!confirmed) return;

        try {
            await relieveMember(id);
            showSuccess("✅ Member relieved.");
            const updated = await getMemberById(id);
            setMember(updated);
        } catch (err) {
            console.error("❌ Error relieving member:", err);
            showError("❌ Failed to relieve.");
        }
    };

    const handleOpenDoc = (url) => {
        if (url) {
            window.open(url, "_blank");
        } else {
            showError("❌ Document not available");
        }
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
            <div className="max-w-6xl mx-auto px-4 pt-6">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                    <User size={22} /> Member Details
                </h2>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-300 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm sm:text-base text-gray-800">
                    {/* Photo Section */}
                    <div className="flex justify-center lg:justify-end items-start order-1 lg:order-2">
                        {(member.documents?.photo || member.documents?.photoURL) ? (
                            <img
                                src={member.documents?.photo || member.documents?.photoURL}
                                alt="Member"
                                className="w-32 h-40 sm:w-40 sm:h-48 lg:w-48 lg:h-56 object-cover border border-gray-400 rounded-md shadow"
                            />
                        ) : (
                            <div className="w-32 h-40 sm:w-40 sm:h-48 lg:w-48 lg:h-56 bg-gray-100 border border-gray-400 flex items-center justify-center text-gray-500 rounded-md">
                                No Photo
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="lg:col-span-2 order-2 lg:order-1 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <p className="flex items-center gap-2"><User size={16}/> <b>Name:</b> {member.personName}</p>
                            <p className="flex items-center gap-2"><Briefcase size={16}/> <b>Designation:</b> {member.designation || "-"}</p>
                            <p className="flex items-center gap-2"><Phone size={16}/> <b>Mobile:</b> {member.mobileNumber || "-"}</p>
                            <p className="flex items-center gap-2"><Mail size={16}/> <b>Email:</b> {member.email || "-"}</p>
                            <p className="flex items-center gap-2"><Calendar size={16}/> <b>DOB:</b> {member.dob || "-"}</p>
                            <p className="flex items-center gap-2"><UserCircle size={16}/> <b>Gender:</b> {member.gender || "-"}</p>
                            <p className="flex items-center gap-2"><UserCheck size={16}/> <b>Father Name:</b> {member.fatherName || "-"}</p>
                            <p className="flex items-center gap-2"><Heart size={16}/> <b>Marital Status:</b> {member.maritalStatus || "-"}</p>
                            <p className="flex items-center gap-2"><Droplet size={16}/> <b>Blood Group:</b> {member.bloodGroup || "-"}</p>
                            <p className="flex items-center gap-2"><PhoneCall size={16}/> <b>Emergency Contact:</b> {member.emergencyContact ? `${member.emergencyContact.name} (${member.emergencyContact.number})` : "-"}</p>
                            <p className="flex items-center gap-2"><MapPin size={16}/> <b>Sites:</b> {(member.sites || []).join(", ") || "-"}</p>
                            <p className="flex items-center gap-2"><Users size={16}/> <b>Teams:</b> {(member.teams || []).join(", ") || "-"}</p>
                            <p className="flex items-center gap-2"><Building size={16}/> <b>PF Applicable:</b> {member.pfApplicable || "No"}</p>
                            <p className="flex items-center gap-2"><Hash size={16}/> <b>UAN:</b> {member.pfApplicable === "Yes" ? (member.uanNumber || "-") : "-"}</p>
                        </div>

                        {/* Documents Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <FileText size={18}/> Documents
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleOpenDoc(getSafeUrl(member.documents?.aadhaarURL, member.documents?.aadhaarFront))}
                                    className="flex items-center justify-center gap-2 bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A] w-full"
                                >
                                    <IdCard size={16}/> Aadhaar
                                </button>
                                <button
                                    onClick={() => handleOpenDoc(getSafeUrl(member.documents?.panURL, member.documents?.panCard))}
                                    className="flex items-center justify-center gap-2 bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A] w-full"
                                >
                                    <FileText size={16}/> PAN Card
                                </button>
                                {member.documents?.pfURL && (
                                    <button
                                        onClick={() => handleOpenDoc(member.documents?.pfURL)}
                                        className="flex items-center justify-center gap-2 bg-[#2F2F2F] text-white text-sm px-4 py-2 rounded-full hover:bg-[#1A1A1A] w-full"
                                    >
                                        <FileCheck size={16}/> PF Declaration
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Site History */}
                {(member.siteHistory || []).length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <MapPin size={18}/> Site Assignment History
                        </h3>
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
                    <button className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]" onClick={() => navigate(`/control/modify-member/${id}`)}>
                        📝 Modify Info
                    </button>
                    <button className="bg-[#2F2F2F] text-white text-sm px-6 py-2 rounded-full hover:bg-[#1A1A1A]" onClick={() => navigate(`/control/assign-site/${id}`)}>
                        📍 Assign Site / Team
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-6 py-2 rounded-full" onClick={handleRelieve} disabled={member.status === "relieved"}>
                        ❌ Relieve Member
                    </button>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default MemberDetails;
