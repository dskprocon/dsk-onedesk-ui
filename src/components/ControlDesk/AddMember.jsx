// src/components/ControlDesk/AddMember.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberFormBlock from "./MemberFormBlock";
import UniversalLayout from "../universal/UniversalLayout";
import { submitRegistration, getAllSites, getAllTeams } from "../../firebase/services/registrationService";
import { showSuccess, showError } from "../../utils/alertUtils";
import { universalButtonClass } from "../universal/UniversalStyles";
import UniversalDropdown from "../universal/UniversalDropdown";
import { UserPlus, Building2, Users } from "lucide-react";

function AddMember({ name, role }) {
    const navigate = useNavigate();
    const [category, setCategory] = useState("Head Office");
    const [siteName, setSiteName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [members, setMembers] = useState([
        {
            personName: "",
            designation: "",
            addressLine1: "",
            addressLine2: "",
            addressLine3: "",
            aadhaarNumber: "",
            panNumber: "",
            mobileNumber: "",
            email: "",
            password: "",
            role: "",
            documents: {},
        },
    ]);
    const [loading, setLoading] = useState(false);

    // Fetch Sites and Teams
    useEffect(() => {
        const fetchData = async () => {
            try {
                const sites = await getAllSites();
                if (Array.isArray(sites)) {
                    setSiteOptions(sites.map(s => ({ label: s.name, value: s.name })));
                }

                const teams = await getAllTeams();
                if (Array.isArray(teams)) {
                    setTeamOptions(teams.map(t => ({ label: t, value: t })));
                }
            } catch (error) {
                console.error("Error fetching site/team data:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (index, field, value) => {
        const updated = [...members];
        if (["aadhaar", "pan", "photo", "pf"].includes(field)) {
            updated[index].documents[field] = value;
        } else {
            updated[index][field] = value;
        }
        setMembers(updated);
    };

    const handleRemove = (index) => {
        const updated = [...members];
        updated.splice(index, 1);
        setMembers(updated);
    };

    const handleAddMore = () => {
        setMembers([
            ...members,
            {
                personName: "",
                designation: "",
                addressLine1: "",
                addressLine2: "",
                addressLine3: "",
                aadhaarNumber: "",
                panNumber: "",
                mobileNumber: "",
                email: "",
                password: "",
                role: "",
                documents: {},
            },
        ]);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitRegistration(members, category, siteName, teamName, name);
            showSuccess("✅ Member(s) added successfully.");
            navigate(-1);
        } catch (err) {
            console.error(err);
            showError("Failed to add members.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-4xl mx-auto pt-6">
                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                    <UserPlus size={22} /> Add New Member
                </h2>

                {/* Category and Site/Team Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <Users size={14} /> Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        >
                            <option value="Head Office">Head Office</option>
                            <option value="Site">Site</option>
                        </select>
                    </div>

                    {category === "Site" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                    <Building2 size={14} /> Site Name
                                </label>
                                <UniversalDropdown
                                    options={siteOptions}
                                    value={siteOptions.find(opt => opt.value === siteName) || null}
                                    onChange={(selected) => setSiteName(selected ? selected.value : "")}
                                    placeholder="Select or search site"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                    <Users size={14} /> Team Name
                                </label>
                                <UniversalDropdown
                                    options={teamOptions}
                                    value={teamOptions.find(opt => opt.value === teamName) || null}
                                    onChange={(selected) => setTeamName(selected ? selected.value : "")}
                                    placeholder="Select or search team"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Member Form Blocks */}
                {members.map((member, index) => (
                    <MemberFormBlock
                        key={index}
                        index={index}
                        member={member}
                        category={category}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        showRemove={members.length > 1}
                    />
                ))}

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={handleAddMore}
                        className="text-sm text-blue-600 font-medium underline"
                    >
                        + Add Another Member
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={universalButtonClass}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default AddMember;
