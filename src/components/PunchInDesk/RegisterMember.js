// src/components/PunchInDesk/RegisterMember.js

import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { submitRegistration } from "../../firebase/services/punchinService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Select from "react-select";

function RegisterMember({ name, role }) {
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [category, setCategory] = useState("Site");
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([
        { personName: "", aadhaar: null, photo: null, pf: null, pan: null }
    ]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isAdmin) {
            const loadUserAccess = async () => {
                try {
                    const ref = doc(db, "users", name);
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        const data = snap.data();
                        const allowedSites = (data.sites || []).map(site => ({ label: site, value: site }));
                        const allowedTeams = (data.teams || []).map(team => ({ label: team, value: team }));
                        setSiteOptions(allowedSites);
                        setTeamOptions(allowedTeams);
                    }
                } catch (err) {
                    console.error("❌ Failed to fetch user profile:", err);
                }
            };
            loadUserAccess();
        }
    }, [isAdmin, name]);

    const handleMemberChange = (index, field, value) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    const handleAddMember = () => {
        setMembers([...members, { personName: "", aadhaar: null, photo: null, pf: null, pan: null }]);
    };

    const handleRemoveMember = (index) => {
        const updated = [...members];
        updated.splice(index, 1);
        setMembers(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const invalidMember = members.find(m => !m.personName || !m.aadhaar || !m.photo);
        if (invalidMember) {
            setMessage("❌ Aadhaar and Photo are required for each member.");
            return;
        }

        try {
            for (const member of members) {
                const data = {
                    personName: member.personName,
                    category,
                    sites: sites.map(s => s.value),
                    teams: teams.map(t => t.value),
                    submittedBy: name
                };
                const files = {
                    aadhaar: member.aadhaar,
                    photo: member.photo,
                    pf: member.pf,
                    pan: member.pan
                };
                await submitRegistration(data, files);
            }

            setMessage("✅ All members submitted for approval.");
            setMembers([{ personName: "", aadhaar: null, photo: null, pf: null, pan: null }]);
            setSites([]);
            setTeams([]);
        } catch (err) {
            console.error("❌ Submission failed:", err);
            setMessage("❌ Submission failed. Try again.");
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-6">👤 Register Members</h2>

                {message && (
                    <p className={`text-center font-semibold mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category (Admin Only) */}
                    {isAdmin ? (
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
                    ) : (
                        <div>
                            <label className="block font-medium mb-1">Category:</label>
                            <input
                                value="Site"
                                disabled
                                className="w-full border border-gray-400 px-3 py-2 rounded bg-gray-100"
                            />
                        </div>
                    )}

                    {/* Site & Team Selection */}
                    {category === "Site" && (
                        <>
                            <div>
                                <label className="block font-medium mb-1">Select Site(s):</label>
                                <Select
                                    isMulti
                                    placeholder="Select site(s)"
                                    value={sites}
                                    onChange={setSites}
                                    options={isAdmin ? [] : siteOptions}
                                    isClearable
                                    isSearchable
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Select Team(s):</label>
                                <Select
                                    isMulti
                                    placeholder="Select team(s)"
                                    value={teams}
                                    onChange={setTeams}
                                    options={isAdmin ? [] : teamOptions}
                                    isClearable
                                    isSearchable
                                    classNamePrefix="select"
                                />
                            </div>
                        </>
                    )}

                    {/* Members Block */}
                    {members.map((member, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm space-y-4">
                            <h4 className="text-md font-semibold">👤 Member {index + 1}</h4>
                            <div>
                                <label className="block font-medium mb-1">Person Name:</label>
                                <input
                                    type="text"
                                    value={member.personName}
                                    onChange={(e) => handleMemberChange(index, "personName", e.target.value)}
                                    className="w-full border border-gray-400 px-3 py-2 rounded"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Aadhaar (Required):</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleMemberChange(index, "aadhaar", e.target.files[0])}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Photo (Required):</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleMemberChange(index, "photo", e.target.files[0])}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">PF Declaration:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleMemberChange(index, "pf", e.target.files[0])}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">PAN Card:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleMemberChange(index, "pan", e.target.files[0])}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                            </div>
                            {members.length > 1 && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(index)}
                                        className="text-red-600 text-sm underline"
                                    >
                                        ❌ Remove This Member
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Member Button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleAddMember}
                            className="text-sm font-medium text-blue-700 underline"
                        >
                            ➕ Add Another Member
                        </button>
                    </div>

                    {/* Submit */}
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
