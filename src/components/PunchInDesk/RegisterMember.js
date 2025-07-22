// src/components/PunchInDesk/RegisterMember.js

import React, { useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { submitRegistration } from "../../firebase/services/punchinService";

function RegisterMember({ name, role }) {
    const [category, setCategory] = useState("Head Office");
    const [personName, setPersonName] = useState("");
    const [siteName, setSiteName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [aadhaarFile, setAadhaarFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [pfFile, setPfFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!personName || !aadhaarFile || !photoFile) {
            setMessage("❌ Aadhaar and Photo are required.");
            return;
        }

        const data = {
            personName,
            category,
            siteName: category === "Site" ? siteName : "",
            teamName: category === "Site" ? teamName : "",
            submittedBy: name,
        };

        const files = {
            aadhaar: aadhaarFile,
            photo: photoFile,
            pf: pfFile,
            pan: panFile
        };

        try {
            console.log("🚀 Submitting registration with data:", data);
            console.log("📎 Attached files:", files);

            await submitRegistration(data, files);

            setMessage("✅ Submitted for admin approval.");

            // Reset
            setPersonName("");
            setSiteName("");
            setTeamName("");
            setAadhaarFile(null);
            setPhotoFile(null);
            setPfFile(null);
            setPanFile(null);

            console.log("✅ Submission completed.");
        } catch (err) {
            console.error("❌ Submission failed:", err);
            setMessage("❌ Submission failed. Try again.");
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-2xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-6">👤 Register Member</h2>
                {message && (
                    <p
                        className={`text-center font-semibold mb-4 ${
                            message.startsWith("✅") ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block font-medium mb-1">Category:</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        >
                            <option value="Head Office">Head Office</option>
                            <option value="Site">Site</option>
                        </select>
                    </div>

                    {/* Site Details */}
                    {category === "Site" && (
                        <>
                            <div>
                                <label className="block font-medium mb-1">Site Name:</label>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    className="w-full border border-gray-400 px-3 py-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Team Name:</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full border border-gray-400 px-3 py-2 rounded"
                                />
                            </div>
                        </>
                    )}

                    {/* Person Name */}
                    <div>
                        <label className="block font-medium mb-1">Person Name:</label>
                        <input
                            type="text"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        />
                    </div>

                    {/* File Uploads 2x2 Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-1">Aadhaar (Required):</label>
                            <input
                                type="file"
                                onChange={(e) => setAadhaarFile(e.target.files[0])}
                                className="w-full border border-gray-400 px-3 py-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Photo (Required):</label>
                            <input
                                type="file"
                                onChange={(e) => setPhotoFile(e.target.files[0])}
                                className="w-full border border-gray-400 px-3 py-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">PF Declaration:</label>
                            <input
                                type="file"
                                onChange={(e) => setPfFile(e.target.files[0])}
                                className="w-full border border-gray-400 px-3 py-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">PAN Card:</label>
                            <input
                                type="file"
                                onChange={(e) => setPanFile(e.target.files[0])}
                                className="w-full border border-gray-400 px-3 py-2 rounded"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 text-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-6 py-2 rounded-xl shadow text-base font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
                        >
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </UniversalLayout>
    );
}

export default RegisterMember;
