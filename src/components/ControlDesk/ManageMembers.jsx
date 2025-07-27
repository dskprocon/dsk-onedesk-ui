// src/components/ControlDesk/ManageMembers.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import { getAllMembers } from "../../firebase/services/registrationService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Select from "react-select";

function ManageMembers({ name, role }) {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [statusFilter, setStatusFilter] = useState("active");
    const [teamOptions, setTeamOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [nameOptions, setNameOptions] = useState([]);
    const [selectedName, setSelectedName] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = role?.toUpperCase() === "ADMIN";

    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            try {
                const all = await getAllMembers();
                setMembers(all);
                setFiltered(all);

                const teamSnap = await getDocs(collection(db, "teams"));
                const teamList = teamSnap.docs.map(doc => ({
                    label: doc.id,
                    value: doc.id
                }));
                setTeamOptions(teamList);

                const siteSnap = await getDocs(collection(db, "sites"));
                const siteList = siteSnap.docs.map(doc => ({
                    label: doc.data().name,
                    value: doc.data().name
                }));
                setSiteOptions(siteList);

                const nameList = all.map((m) => ({
                    label: m.personName,
                    value: m.personName
                }));
                setNameOptions(nameList);
            } catch (err) {
                console.error("❌ Failed to load members/teams/sites:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    useEffect(() => {
        let result = [...members];

        if (selectedName) {
            result = result.filter(m => m.personName === selectedName.value);
        }

        if (selectedTeam) {
            result = result.filter(m => (m.teams || []).includes(selectedTeam.value));
        }

        if (selectedSite) {
            result = result.filter(m => (m.sites || []).includes(selectedSite.value));
        }

        if (statusFilter !== "all") {
            result = result.filter(m => {
                const status = (m.status || "approved").toLowerCase();
                if (statusFilter === "active") return status === "approved";
                return status === "relieved";
            });
        }

        setFiltered(result);
    }, [selectedName, selectedTeam, selectedSite, statusFilter, members]);

    if (!isAdmin) {
        return <p className="text-center mt-10 text-red-600 font-semibold">❌ Access Denied</p>;
    }

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <h2 className="text-2xl font-bold text-center mb-4">👥 Manage Members</h2>

                {/* 🔍 Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <Select
                        options={nameOptions}
                        value={selectedName}
                        onChange={setSelectedName}
                        placeholder="Search by Name"
                        isClearable
                    />
                    <Select
                        options={teamOptions}
                        value={selectedTeam}
                        onChange={setSelectedTeam}
                        placeholder="Search by Team"
                        isClearable
                    />
                    <Select
                        options={siteOptions}
                        value={selectedSite}
                        onChange={setSelectedSite}
                        placeholder="Search by Site"
                        isClearable
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    >
                        <option value="active">Active</option>
                        <option value="relieved">Relieved</option>
                        <option value="all">All</option>
                    </select>
                    <button
                        onClick={() => {
                            setSelectedName(null);
                            setSelectedTeam(null);
                            setSelectedSite(null);
                            setStatusFilter("active");
                        }}
                        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* 📋 Table */}
                <div className="overflow-x-auto bg-white rounded shadow-md">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">#</th>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Category</th>
                                <th className="px-4 py-2 border">Site(s)</th>
                                <th className="px-4 py-2 border">Team(s)</th>
                                <th className="px-4 py-2 border">Role</th>
                                <th className="px-4 py-2 border">Email</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">Loading members...</td>
                                </tr>
                            ) : (
                                filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-gray-500">No matching members found.</td>
                                    </tr>
                                ) : (
                                    filtered.map((m, index) => (
                                        <tr key={m.id} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{index + 1}</td>
                                            <td className="border px-4 py-2 font-medium">{m.personName}</td>
                                            <td className="border px-4 py-2">{m.category}</td>
                                            <td className="border px-4 py-2">{(m.sites || []).join(", ")}</td>
                                            <td className="border px-4 py-2">{(m.teams || []).join(", ")}</td>
                                            <td className="border px-4 py-2">{m.role || "-"}</td>
                                            <td className="border px-4 py-2">{m.email || "-"}</td>
                                            <td className="border px-4 py-2 capitalize">
                                                {m.status === "approved" ? "Active" : m.status}
                                            </td>
                                            <td className="border px-4 py-2 text-center">
                                                <button
                                                    onClick={() => navigate(`/control/member/${m.id}`)}
                                                    className="bg-[#2F2F2F] text-white text-xs px-4 py-1 rounded-full hover:bg-[#1A1A1A]"
                                                >
                                                    🔍 View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default ManageMembers;
