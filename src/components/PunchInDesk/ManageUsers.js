import React, { useEffect, useState } from "react";
import Select from "react-select";
import UniversalLayout from "../universal/UniversalLayout";
import {
    getAllUsers,
    getAllSites,
    getAllTeams,
    updateUserAssignment,
} from "../../firebase/services/punchinService";
import AssignSiteModal from "./AssignSiteModal";

function ManageUsers({ name, role }) {
    const [users, setUsers] = useState([]);
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [filterSite, setFilterSite] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeUser, setActiveUser] = useState(null); // for modal

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const allUsers = await getAllUsers();
        const allSites = await getAllSites();
        const allTeams = await getAllTeams();

        setUsers(allUsers);
        setSites(allSites.map((s) => s.name));
        setTeams(allTeams);
        setLoading(false);
    };

    const handleChange = (index, field, value) => {
        const updated = [...users];
        updated[index][field] = value;
        setUsers(updated);
    };

    const handleUpdate = async (user) => {
        await updateUserAssignment(user.uid, {
            sites: user.sites || [],
            teams: user.teams || [],
            status: user.status || "Active",
            role: user.role || "USER",
            lastUpdatedBy: name,
        });
        alert(`✅ ${user.name}'s profile updated successfully.`);
    };

    const filteredUsers = users.filter((u) => {
        const matchesSite = filterSite === "" || (u.sites || []).includes(filterSite);
        const matchesSearch = searchTerm === "" || u.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSite && matchesSearch;
    });

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    👥 Manage Users – Role, Status & Site Assignment
                </h2>

                {/* 🔍 Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Site Filter Dropdown */}
                    <select
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                        value={filterSite}
                        onChange={(e) => setFilterSite(e.target.value)}
                    >
                        <option value="">All Sites</option>
                        {sites.map((site) => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </select>

                    {/* Name Search Dropdown using react-select */}
                    <Select
                        options={users.map((u) => ({ label: u.name, value: u.name }))}
                        onChange={(selected) => setSearchTerm(selected ? selected.value : "")}
                        isClearable
                        placeholder="🔍 Search by name"
                        className="w-full"
                    />
                </div>

                {/* 📋 User Table */}
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user, index) => (
                            <div
                                key={user.uid}
                                className="border border-gray-300 rounded p-4 bg-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                                <div className="flex-1 space-y-1">
                                    <p><strong>Name:</strong> {user.name}</p>
                                    <p><strong>Category:</strong> {user.category}</p>
                                </div>

                                <div className="flex-1">
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                        value={user.role || ""}
                                        onChange={(e) => handleChange(index, "role", e.target.value)}
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="VIEWER">VIEWER</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                        value={user.status || "Active"}
                                        onChange={(e) => handleChange(index, "status", e.target.value)}
                                    >
                                        <option>Active</option>
                                        <option>Relieved</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        className="text-blue-700 underline"
                                        onClick={() => setActiveUser(user)}
                                    >
                                        ✏️ Assign Site
                                    </button>

                                    <button
                                        onClick={() => handleUpdate(user)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        💾 Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 📌 Assign Site Modal */}
            {activeUser && (
                <AssignSiteModal
                    user={activeUser}
                    updatedBy={name}
                    onClose={() => setActiveUser(null)}
                    onSuccess={loadData}
                />
            )}
        </UniversalLayout>
    );
}

export default ManageUsers;
