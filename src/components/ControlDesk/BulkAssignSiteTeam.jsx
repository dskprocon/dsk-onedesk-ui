import React, { useEffect, useState } from "react";
import {
        getAllMembers,
        assignSiteWithHistory
} from "../../firebase/services/registrationService";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalDropdown from "../universal/UniversalDropdown";
import UniversalTable from "../universal/UniversalTable";

function BulkAssignSiteTeam({ name, role }) {
        const [members, setMembers] = useState([]);
        const [filtered, setFiltered] = useState([]);

        const [categoryFilter, setCategoryFilter] = useState(null);
        const [roleFilter, setRoleFilter] = useState(null);
        const [siteFilter, setSiteFilter] = useState(null);
        const [teamFilter, setTeamFilter] = useState(null);

        const [siteOptions, setSiteOptions] = useState([]);
        const [teamOptions, setTeamOptions] = useState([]);

        const [assignSites, setAssignSites] = useState([]);
        const [assignTeams, setAssignTeams] = useState([]);

        const [autoUnassign, setAutoUnassign] = useState(false);
        const [selectedIds, setSelectedIds] = useState([]);

        useEffect(() => {
                const load = async () => {
                        const all = await getAllMembers();
                        setMembers(all);
                        setFiltered(all);

                        const siteSnap = await getDocs(collection(db, "sites"));
                        const sites = siteSnap.docs.map(doc => ({
                                label: doc.data().name,
                                value: doc.data().name
                        }));
                        setSiteOptions(sites);

                        const teams = [...new Set(
                                all.filter(m => m.category === "Site" && m.teams?.length)
                                        .map(m => m.teams[0])
                        )];
                        const teamList = teams.map(team => ({ label: team, value: team }));
                        setTeamOptions(teamList);
                };

                load();
        }, []);

        const applyFilters = () => {
                let result = [...members];

                if (categoryFilter) result = result.filter(m => m.category === categoryFilter);
                if (roleFilter) result = result.filter(m => m.role === roleFilter);
                if (siteFilter) result = result.filter(m => (m.sites || []).includes(siteFilter));
                if (teamFilter) result = result.filter(m => (m.teams || []).includes(teamFilter));

                setFiltered(result);
                setSelectedIds([]); // clear selection
        };

        const toggleSelect = (id) => {
                setSelectedIds(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                );
        };

        const toggleAll = () => {
                if (selectedIds.length === filtered.length) {
                        setSelectedIds([]);
                } else {
                        setSelectedIds(filtered.map(m => m.id));
                }
        };

        const handleAssign = async () => {
                if (assignSites.length !== 1) {
                        alert("❌ Please select exactly 1 site to assign.");
                        return;
                }

                try {
                        let success = 0;
                        let failed = 0;
                        for (const id of selectedIds) {
                                try {
                                        await assignSiteWithHistory(
                                                id,
                                                assignSites[0],
                                                assignTeams,
                                                name,
                                                autoUnassign
                                        );
                                        success++;
                                } catch (err) {
                                        console.warn("⚠️ Assignment failed:", err.message);
                                        failed++;
                                }
                        }

                        alert(`✅ ${success} assigned successfully. ❌ ${failed} failed.`);
                } catch (err) {
                        alert(err.message || "❌ Something went wrong.");
                }
        };

        // Prepare UniversalTable data
        const headers = ["Select", "Name", "Category", "Role", "Sites", "Teams"];
        const rows = filtered.map((m) => ({
                Select: (
                        <input
                                type="checkbox"
                                checked={selectedIds.includes(m.id)}
                                onChange={() => toggleSelect(m.id)}
                        />
                ),
                Name: m.personName,
                Category: m.category,
                Role: m.role,
                Sites: (m.sites || []).join(", "),
                Teams: (m.teams || []).join(", ")
        }));

        return (
                <UniversalLayout name={name} role={role}>
                        <div className="max-w-7xl mx-auto px-4 pt-6">
                                <h2 className="text-2xl font-bold text-center mb-6">🗂️ Bulk Assign Site / Team</h2>

                                {/* 🔍 Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <UniversalDropdown
                                                label="Category"
                                                options={[
                                                        { label: "Head Office", value: "Head Office" },
                                                        { label: "Site", value: "Site" }
                                                ]}
                                                value={categoryFilter ? { label: categoryFilter, value: categoryFilter } : null}
                                                onChange={(e) => setCategoryFilter(e?.value || null)}
                                                isMulti={false}
                                        />
                                        <UniversalDropdown
                                                label="Role"
                                                options={[
                                                        { label: "Admin", value: "Admin" },
                                                        { label: "User", value: "User" },
                                                        { label: "Site Head", value: "Site Head" }
                                                ]}
                                                value={roleFilter ? { label: roleFilter, value: roleFilter } : null}
                                                onChange={(e) => setRoleFilter(e?.value || null)}
                                                isMulti={false}
                                        />
                                        <UniversalDropdown
                                                label="Current Site"
                                                options={siteOptions}
                                                value={siteFilter ? { label: siteFilter, value: siteFilter } : null}
                                                onChange={(e) => setSiteFilter(e?.value || null)}
                                                isMulti={false}
                                        />
                                        <UniversalDropdown
                                                label="Current Team"
                                                options={teamOptions}
                                                value={teamFilter ? { label: teamFilter, value: teamFilter } : null}
                                                onChange={(e) => setTeamFilter(e?.value || null)}
                                                isMulti={false}
                                        />
                                </div>

                                <button
                                        onClick={applyFilters}
                                        className="mb-8 bg-[#2F2F2F] hover:bg-[#505050] text-white font-semibold px-6 py-2 rounded shadow"
                                >
                                        🔍 Apply Filters
                                </button>

                                {/* 📋 Table with borders */}
                                <div className="mb-6">
                                        <UniversalTable headers={headers} rows={rows} />
                                </div>

                                {/* 🔘 Assign Section */}
                                <div className="bg-white p-6 rounded-xl border border-gray-300 space-y-6">
                                        <UniversalDropdown
                                                label="Assign Site (only one)"
                                                options={siteOptions}
                                                value={siteOptions.filter(opt => assignSites.includes(opt.value))}
                                                onChange={(selected) => setAssignSites(selected.map(s => s.value))}
                                                isMulti
                                        />
                                        <UniversalDropdown
                                                label="Assign Team(s)"
                                                options={teamOptions}
                                                value={teamOptions.filter(opt => assignTeams.includes(opt.value))}
                                                onChange={(selected) => setAssignTeams(selected.map(s => s.value))}
                                                isMulti
                                        />

                                        <div className="flex items-center gap-2">
                                                <input
                                                        type="checkbox"
                                                        checked={autoUnassign}
                                                        onChange={() => setAutoUnassign(!autoUnassign)}
                                                        className="w-4 h-4"
                                                />
                                                <label className="text-sm font-medium text-gray-700">
                                                        Auto Unassign Previous Site
                                                </label>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                                <button
                                                        onClick={handleAssign}
                                                        disabled={selectedIds.length === 0}
                                                        className={`px-6 py-2 rounded-xl font-semibold shadow ${
                                                                selectedIds.length === 0
                                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                                        : "bg-green-600 hover:bg-green-700 text-white"
                                                        }`}
                                                >
                                                        📌 Assign to {selectedIds.length} member(s)
                                                </button>
                                        </div>
                                </div>
                        </div>
                </UniversalLayout>
        );
}

export default BulkAssignSiteTeam;
