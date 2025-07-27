// src/components/ControlDesk/AssignSiteTeam.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import UniversalLayout from "../universal/UniversalLayout";
import {
        getMemberById,
        updateMemberFields,
        getAllMembers
} from "../../firebase/services/registrationService";
import {
        collection,
        getDocs,
        serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function AssignSiteTeam({ name, role }) {
        const { id } = useParams();
        const navigate = useNavigate();
        const [member, setMember] = useState(null);
        const [loading, setLoading] = useState(true);
        const [siteOptions, setSiteOptions] = useState([]);
        const [teamOptions, setTeamOptions] = useState([]);
        const [selectedSites, setSelectedSites] = useState([]);
        const [selectedTeam, setSelectedTeam] = useState(null);

        useEffect(() => {
                const loadData = async () => {
                        try {
                                const data = await getMemberById(id);
                                setMember(data);
                                setSelectedSites(data.sites || []);
                                setSelectedTeam(data.teams?.[0] || null);
                        } catch (err) {
                                console.error("❌ Failed to load member:", err);
                        } finally {
                                setLoading(false);
                        }
                };

                const loadSites = async () => {
                        const snapshot = await getDocs(collection(db, "sites"));
                        const list = snapshot.docs.map(doc => ({
                                value: doc.data().name,
                                label: doc.data().name
                        }));
                        setSiteOptions(list);
                };

                const loadTeams = async () => {
                        const allMembers = await getAllMembers();
                        const teams = [...new Set(
                                allMembers
                                        .filter(m => m.category === "Site" && m.teams?.length)
                                        .map(m => m.teams[0])
                        )];
                        const teamList = teams.map(team => ({ value: team, label: team }));
                        setTeamOptions(teamList);
                };

                loadData();
                loadSites();
                loadTeams();
        }, [id]);

        const handleSave = async () => {
                try {
                        // Update this member first
                        await updateMemberFields(id, {
                                sites: selectedSites,
                                teams: Array.isArray(selectedTeam) ? selectedTeam : selectedTeam ? [selectedTeam] : [],
                                assignedBy: name,
                                assignedAt: serverTimestamp()
                        });

                        // If Head Office, cascade update assignedBy to all Site members in those sites
                        if (member?.category === "Head Office") {
                                const allMembers = await getAllMembers();
                                const managedSites = selectedSites;

                                // Find site members whose site matches any managed site
                                const siteMembersToUpdate = allMembers.filter(m =>
                                        m.category === "Site" &&
                                        m.sites?.some(site => managedSites.includes(site))
                                );

                                // Update assignedBy for all matched site members
                                for (const siteMember of siteMembersToUpdate) {
                                        await updateMemberFields(siteMember.id, {
                                                assignedBy: member.personName,
                                                assignedAt: serverTimestamp()
                                        });
                                }
                        }

                        alert("✅ Site & Team assigned successfully");
                        navigate(`/control/member/${id}`, { replace: true });
                } catch (err) {
                        console.error("❌ Failed to assign:", err);
                        alert("Error saving site/team");
                }
        };

        const handleCancel = () => {
                navigate(`/control/member/${id}`, { replace: true });
        };

        if (loading) return <p className="text-center mt-10 text-lg">⏳ Loading...</p>;
        if (!member) return <p className="text-center mt-10 text-red-600 text-lg">❌ Member not found</p>;

        return (
                <UniversalLayout name={name} role={role}>
                        <div className="max-w-4xl mx-auto px-4 pt-8">
                                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">📍 Assign Site & Team</h2>

                                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 space-y-8 text-lg text-gray-800">

                                        {/* 🔹 Summary of Current Assignment */}
                                        <div className="space-y-2 text-base">
                                                <p><strong>👤 Member:</strong> {member.personName}</p>
                                                <p><strong>🏷️ Category:</strong> {member.category}</p>
                                                <p><strong>📍 Assigned Sites:</strong> {member.sites?.join(", ") || "-"}</p>
                                                <p><strong>👥 Assigned Team:</strong> {member.teams?.[0] || "-"}</p>
                                                <p><strong>🧑‍💼 Managed By:</strong> {member.assignedBy || "-"}</p>
                                        </div>

                                        {/* 🔘 Select Sites */}
                                        <div>
                                                <label className="block mb-2 font-semibold">Select Site(s)</label>
                                                <Select
                                                        options={siteOptions}
                                                        value={siteOptions.filter(opt => selectedSites.includes(opt.value))}
                                                        onChange={(selected) => setSelectedSites(selected.map(s => s.value))}
                                                        isMulti
                                                        isSearchable
                                                        closeMenuOnSelect={false}
                                                        hideSelectedOptions={false}
                                                        placeholder="Select site(s)..."
                                                        className="text-base"
                                                        classNamePrefix="select"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">You can assign multiple sites if needed.</p>
                                        </div>

                                        {/* 🔘 Select Team */}
                                        <div>
                                                <label className="block mb-2 font-semibold">Select Team</label>
                                                <Select
                                                        options={teamOptions}
                                                        value={teamOptions.filter(opt => selectedTeam?.includes(opt.value))}
                                                        onChange={(selected) => setSelectedTeam(selected.map(s => s.value))}
                                                        isMulti
                                                        isSearchable
                                                        closeMenuOnSelect={false}
                                                        hideSelectedOptions={false}
                                                        placeholder="Choose team(s)..."
                                                        className="text-base"
                                                        classNamePrefix="select"
                                                />
                                        </div>

                                        {/* 🔘 Action Buttons */}
                                        <div className="flex justify-between mt-8">
                                                <button
                                                        className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                                                        onClick={handleCancel}
                                                >
                                                        ❌ Cancel
                                                </button>
                                                <button
                                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                        onClick={handleSave}
                                                >
                                                        💾 Save Assignment
                                                </button>
                                        </div>
                                </div>
                        </div>
                </UniversalLayout>
        );
}

export default AssignSiteTeam;
