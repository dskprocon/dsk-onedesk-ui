// src/components/ControlDesk/BulkAssignSiteTeam.jsx

import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import Select from "react-select";
import { getAllMembers, updateMemberFields } from "../../firebase/services/registrationService";
import { getDocs, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function BulkAssignSiteTeam({ name, role }) {
        const [allMembers, setAllMembers] = useState([]);
        const [filtered, setFiltered] = useState([]);
        const [selectedIds, setSelectedIds] = useState([]);

        const [categoryFilter, setCategoryFilter] = useState(null);
        const [roleFilter, setRoleFilter] = useState(null);
        const [siteFilter, setSiteFilter] = useState(null);
        const [teamFilter, setTeamFilter] = useState(null);

        const [siteOptions, setSiteOptions] = useState([]);
        const [teamOptions, setTeamOptions] = useState([]);
        const [assignSites, setAssignSites] = useState([]);
        const [assignTeams, setAssignTeams] = useState([]);

        useEffect(() => {
                loadMembers();
                loadSites();
                loadTeams();
        }, []);

        const loadMembers = async () => {
                const data = await getAllMembers();
                setAllMembers(data);
                setFiltered(data);
        };

        const loadSites = async () => {
                const snap = await getDocs(collection(db, "sites"));
                const list = snap.docs.map(doc => ({ label: doc.data().name, value: doc.data().name }));
                setSiteOptions(list);
        };

        const loadTeams = async () => {
                const snap = await getDocs(collection(db, "teams"));
                const list = snap.docs.map(doc => ({ label: doc.data().name, value: doc.data().name }));
                setTeamOptions(list);
        };

        const applyFilters = () => {
                let temp = [...allMembers];
                if (categoryFilter) temp = temp.filter(m => m.category === categoryFilter);
                if (roleFilter) temp = temp.filter(m => (m.role || "").toLowerCase() === roleFilter.toLowerCase());
                if (siteFilter) temp = temp.filter(m => m.sites?.includes(siteFilter));
                if (teamFilter) temp = temp.filter(m => m.teams?.includes(teamFilter));
                setFiltered(temp);
        };

        const handleAssign = async () => {
                for (const id of selectedIds) {
                        await updateMemberFields(id, {
                                sites: assignSites,
                                teams: assignTeams,
                                assignedBy: name,
                                assignedAt: serverTimestamp()
                        });
                }
                alert("✅ Assigned successfully");
                setSelectedIds([]);
        };

        return (
                <UniversalLayout name={name} role={role}>
                        <div className="max-w-6xl mx-auto px-4 py-6">
                                <h2 className="text-2xl font-bold mb-4">📋 Bulk Assign Site / Team</h2>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <Select placeholder="Category" options={["Head Office", "Site"].map(v => ({ label: v, value: v }))} onChange={(e) => setCategoryFilter(e?.value)} isClearable />
                                        <Select placeholder="Role" options={[...new Set(allMembers.map(m => m.role || ""))].map(v => ({ label: v, value: v }))} onChange={(e) => setRoleFilter(e?.value)} isClearable />
                                        <Select placeholder="Current Site" options={siteOptions} onChange={(e) => setSiteFilter(e?.value)} isClearable />
                                        <Select placeholder="Current Team" options={teamOptions} onChange={(e) => setTeamFilter(e?.value)} isClearable />
                                </div>

                                <button onClick={applyFilters} className="mb-6 px-4 py-2 bg-gray-800 text-white rounded">🔍 Apply Filters</button>

                                <div className="overflow-auto border rounded-md">
                                        <table className="w-full text-sm">
                                                <thead className="bg-gray-100">
                                                        <tr>
                                                                <th className="p-2">✔</th>
                                                                <th>Name</th>
                                                                <th>Category</th>
                                                                <th>Role</th>
                                                                <th>Sites</th>
                                                                <th>Teams</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {filtered.map(m => (
                                                                <tr key={m.id} className="border-t">
                                                                        <td className="p-2">
                                                                                <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => setSelectedIds(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])} />
                                                                        </td>
                                                                        <td>{m.personName}</td>
                                                                        <td>{m.category}</td>
                                                                        <td>{m.role}</td>
                                                                        <td>{(m.sites || []).join(", ")}</td>
                                                                        <td>{(m.teams || []).join(", ")}</td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                        <Select options={siteOptions} isMulti placeholder="Assign Site(s)" onChange={(selected) => setAssignSites(selected.map(s => s.value))} />
                                        <Select options={teamOptions} isMulti placeholder="Assign Team(s)" onChange={(selected) => setAssignTeams(selected.map(t => t.value))} />
                                </div>

                                <button onClick={handleAssign} disabled={selectedIds.length === 0 || assignSites.length === 0} className="mt-6 px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50">
                                        💾 Assign to {selectedIds.length} member(s)
                                </button>
                        </div>
                </UniversalLayout>
        );
}

export default BulkAssignSiteTeam;
