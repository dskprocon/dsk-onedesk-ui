// src/components/ControlDesk/RegisterApproval.js

import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { universalButtonClass, universalInputClass, universalLabelClass } from "../universal/UniversalStyles";
import { fetchPendingRegistrations, updateRegistrationStatus } from "../../firebase/services/registrationService";
import { showSuccess, showError } from "../../utils/alertUtils";
import { User, Briefcase, Calendar, UserCircle, UserCheck, Heart, Droplet, PhoneCall, Building, Hash, MapPin, Users, FileText, FileCheck, IdCard, Mail, Phone } from "lucide-react";

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
            showSuccess(`✅ Successfully ${action}`);
        } catch (err) {
            console.error("❌ Approval failed:", err);
            showError("❌ Something went wrong.");
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
            <div className="w-full max-w-[1200px] px-4 md:px-8 mx-auto py-8">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center gap-2 text-[#1A1A1A]">
                    <FileText size={22} /> Member Approval Requests
                </h2>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : pendingList.length === 0 ? (
                    <p className="text-center text-green-600 font-semibold">✅ No pending requests.</p>
                ) : (
                    <div className="space-y-10">
                        {pendingList.map((entry) => (
                            <div key={entry.id} className="bg-white p-6 rounded-xl border border-gray-400 shadow">
                                {/* Info Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                                    <p className="flex items-center gap-2"><User size={16}/> <b>Name:</b> {entry.personName}</p>
                                    <p className="flex items-center gap-2"><Briefcase size={16}/> <b>Category:</b> {entry.category}</p>
                                    <p className="flex items-center gap-2"><User size={16}/> <b>Submitted By:</b> {entry.submittedBy}</p>
                                    <p className="flex items-center gap-2"><Calendar size={16}/> <b>Submitted At:</b> {entry.submittedAt?.toDate?.().toLocaleDateString("en-IN") || "N/A"}</p>
                                    <p className="flex items-center gap-2"><Calendar size={16}/> <b>DOB:</b> {entry.dob || "-"}</p>
                                    <p className="flex items-center gap-2"><UserCircle size={16}/> <b>Gender:</b> {entry.gender || "-"}</p>
                                    <p className="flex items-center gap-2"><UserCheck size={16}/> <b>Father Name:</b> {entry.fatherName || "-"}</p>
                                    <p className="flex items-center gap-2"><Heart size={16}/> <b>Marital Status:</b> {entry.maritalStatus || "-"}</p>
                                    <p className="flex items-center gap-2"><Droplet size={16}/> <b>Blood Group:</b> {entry.bloodGroup || "-"}</p>
                                    <p className="flex items-center gap-2"><PhoneCall size={16}/> <b>Emergency Contact:</b> {entry.emergencyContact ? `${entry.emergencyContact.name} (${entry.emergencyContact.number})` : "-"}</p>
                                    <p className="flex items-center gap-2"><Building size={16}/> <b>PF Applicable:</b> {entry.pfApplicable || "No"}</p>
                                    <p className="flex items-center gap-2"><Hash size={16}/> <b>UAN:</b> {entry.pfApplicable === "Yes" ? (entry.uanNumber || "-") : "-"}</p>

                                    {entry.category === "Site" && (
                                        <>
                                            <p className="flex items-center gap-2"><MapPin size={16}/> <b>Sites:</b> {entry.sites?.join(", ")}</p>
                                            <p className="flex items-center gap-2"><Users size={16}/> <b>Teams:</b> {entry.teams?.join(", ")}</p>
                                        </>
                                    )}
                                    {entry.role && <p className="flex items-center gap-2"><Briefcase size={16}/> <b>Role:</b> {entry.role}</p>}
                                    {entry.email && <p className="flex items-center gap-2"><Mail size={16}/> <b>Email:</b> {entry.email}</p>}
                                    {entry.mobileNumber && <p className="flex items-center gap-2"><Phone size={16}/> <b>Mobile:</b> {entry.mobileNumber}</p>}
                                </div>

                                {/* Document Links */}
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <FileText size={16}/> Documents
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                        {entry.documents?.aadhaarURL && (
                                            <a href={entry.documents.aadhaarURL} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#2F2F2F] text-white px-3 py-2 rounded-full text-center hover:bg-[#1A1A1A]">
                                                <IdCard size={14}/> Aadhaar
                                            </a>
                                        )}
                                        {entry.documents?.photoURL && (
                                            <a href={entry.documents.photoURL} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#2F2F2F] text-white px-3 py-2 rounded-full text-center hover:bg-[#1A1A1A]">
                                                <User size={14}/> Photo
                                            </a>
                                        )}
                                        {entry.documents?.pfURL && (
                                            <a href={entry.documents.pfURL} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#2F2F2F] text-white px-3 py-2 rounded-full text-center hover:bg-[#1A1A1A]">
                                                <FileCheck size={14}/> PF Declaration
                                            </a>
                                        )}
                                        {entry.documents?.panURL && (
                                            <a href={entry.documents.panURL} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#2F2F2F] text-white px-3 py-2 rounded-full text-center hover:bg-[#1A1A1A]">
                                                <FileText size={14}/> PAN Card
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Remarks Input */}
                                <div className="mt-4">
                                    <label className={universalLabelClass}>Remark:</label>
                                    <input
                                        type="text"
                                        value={remarks[entry.id] || ""}
                                        onChange={(e) => setRemarks({ ...remarks, [entry.id]: e.target.value })}
                                        className={universalInputClass}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex flex-wrap gap-4">
                                    <button
                                        onClick={() => handleAction(entry.id, "approved")}
                                        className={`${universalButtonClass} bg-green-600 hover:bg-green-700 text-white`}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(entry.id, "rejected")}
                                        className={`${universalButtonClass} bg-red-600 hover:bg-red-700 text-white`}
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
