// src/components/ControlDesk/AssignSiteTeam.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalDropdown from "../universal/UniversalDropdown";
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
import { showSuccess, showError } from "../../utils/alertUtils";
import { MapPin, Users, User, ClipboardList } from "lucide-react";

function AssignSiteTeam({ name, role }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [selectedSites, setSelectedSites] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getMemberById(id);
                setMember(data);
                setSelectedSites(data.sites || []);
                setSelectedTeam(data.teams || []);
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
            await updateMemberFields(id, {
                sites: selectedSites,
                teams: selectedTeam,
                assignedBy: name,
                assignedAt: serverTimestamp()
            });

            if (member?.category === "Head Office") {
                const allMembers = await getAllMembers();
                const managedSites = selectedSites;

                const siteMembersToUpdate = allMembers.filter(m =>
                    m.category === "Site" &&
                    m.sites?.some(site => managedSites.includes(site))
                );

                for (const siteMember of siteMembersToUpdate) {
                    await updateMemberFields(siteMember.id, {
                        assignedBy: member.personName,
                        assignedAt: serverTimestamp()
                    });
                }
            }

            showSuccess("✅ Site & Team assigned successfully");
            navigate(`/control/member/${id}`, { replace: true });
        } catch (err) {
            console.error("❌ Failed to assign:", err);
            showError("❌ Failed to save site/team");
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
                <h2 className="text-2xl font-bold text-center mb-8 flex items-center gap-2 text-gray-800">
                    <MapPin size={22} /> Assign Site & Team
                </h2>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 space-y-8 text-gray-800 text-base">

                    {/* Summary */}
                    <div className="space-y-2">
                        <p className="flex items-center gap-2"><User size={16}/> <strong>Member:</strong> {member.personName}</p>
                        <p className="flex items-center gap-2"><ClipboardList size={16}/> <strong>Category:</strong> {member.category}</p>
                        <p className="flex items-center gap-2"><MapPin size={16}/> <strong>Assigned Sites:</strong> {member.sites?.join(", ") || "-"}</p>
                        <p className="flex items-center gap-2"><Users size={16}/> <strong>Assigned Team:</strong> {(member.teams || []).join(", ") || "-"}</p>
                        <p><strong>Managed By:</strong> {member.assignedBy || "-"}</p>
                    </div>

                    {/* Select Sites */}
                    <UniversalDropdown
                        label="Select Site(s)"
                        options={siteOptions}
                        value={siteOptions.filter(opt => selectedSites.includes(opt.value))}
                        onChange={(selected) => setSelectedSites(selected.map(s => s.value))}
                        isMulti
                    />

                    {/* Select Teams */}
                    <UniversalDropdown
                        label="Select Team(s)"
                        options={teamOptions}
                        value={teamOptions.filter(opt => selectedTeam.includes(opt.value))}
                        onChange={(selected) => setSelectedTeam(selected.map(s => s.value))}
                        isMulti
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6">
                        <button
                            onClick={handleCancel}
                            className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-6 py-2 rounded shadow"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white font-semibold px-6 py-2 rounded-xl shadow hover:scale-105 hover:shadow-2xl transition-all duration-200"
                        >
                            Save Assignment
                        </button>
                    </div>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default AssignSiteTeam;
