// src/components/ControlDesk/ManageMembers.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalDropdown from "../universal/UniversalDropdown";
import UniversalTable from "../universal/UniversalTable";
import { getAllMembers } from "../../firebase/services/registrationService";
import { Users } from "lucide-react";

function ManageMembers({ name, role }) {
    const navigate = useNavigate();
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [members, setMembers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    const [teamOptions, setTeamOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [nameOptions, setNameOptions] = useState([]);

    const [selectedName, setSelectedName] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [statusFilter, setStatusFilter] = useState("active");

    // ✅ Fetch Members
    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            try {
                const all = await getAllMembers();
                setMembers(all);
                setFiltered(all);

                const siteMembers = all.filter(m => m.category !== "Head Office");

                const siteNameList = [...new Set(siteMembers.flatMap(m => m.sites || []))];
                setSiteOptions(siteNameList.map(name => ({ label: name, value: name })));

                const teamNameList = [...new Set(siteMembers.flatMap(m => m.teams || []))];
                setTeamOptions(teamNameList.map(name => ({ label: name, value: name })));

                const nameList = all.map(m => ({ label: m.personName, value: m.personName }));
                setNameOptions(nameList);
            } catch (err) {
                console.error("❌ Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    // ✅ Apply Filters
    useEffect(() => {
        let result = [...members];

        if (selectedName) result = result.filter(m => m.personName === selectedName.value);
        if (selectedCategory) result = result.filter(m => m.category === selectedCategory.value);
        if (selectedTeam) result = result.filter(m => (m.teams || []).includes(selectedTeam.value));
        if (selectedSite) result = result.filter(m => (m.sites || []).includes(selectedSite.value));

        if (statusFilter !== "all") {
            result = result.filter(m => {
                const status = (m.status || "approved").toLowerCase();
                return statusFilter === "active" ? status === "approved" : status === "relieved";
            });
        }

        setFiltered(result);
    }, [selectedName, selectedCategory, selectedTeam, selectedSite, statusFilter, members]);

    const handleClearFilters = () => {
        setSelectedName(null);
        setSelectedCategory(null);
        setSelectedTeam(null);
        setSelectedSite(null);
        setStatusFilter("active");
    };

    // ✅ Table Headers (Simplified)
    const headers = [
        "#", "Name", "Category", "Site(s)", "Team(s)", "Role", "Email", "Status"
    ];

    // ✅ Sorted Rows
    const sortedFiltered = [...filtered].sort((a, b) => {
        const catA = (a.category || "").toLowerCase();
        const catB = (b.category || "").toLowerCase();
        if (catA !== catB) {
            if (catA === "head office") return -1;
            if (catB === "head office") return 1;
        }
        const siteA = (a.sites?.[0] || "").toLowerCase();
        const siteB = (b.sites?.[0] || "").toLowerCase();
        if (siteA !== siteB) return siteA.localeCompare(siteB);

        const teamA = (a.teams?.[0] || "").toLowerCase();
        const teamB = (b.teams?.[0] || "").toLowerCase();
        if (teamA !== teamB) return teamA.localeCompare(teamB);

        return (a.personName || "").localeCompare(b.personName || "");
    });

    // ✅ Grouped Rows
    const groupedRows = [];
    let currentCategory = "";
    let currentSite = "";
    let currentTeam = "";

    sortedFiltered.forEach((m, index) => {
        if (m.category !== currentCategory) {
            groupedRows.push({ isGroup: true, label: m.category === "Head Office" ? "🏢 Head Office" : "🏗 Sites" });
            currentCategory = m.category;
            currentSite = "";
            currentTeam = "";
        }

        if (m.category !== "Head Office" && m.sites?.[0] !== currentSite) {
            groupedRows.push({ isGroup: true, label: `📍 Site: ${m.sites?.[0]}` });
            currentSite = m.sites?.[0];
            currentTeam = "";
        }

        if (m.category !== "Head Office" && m.teams?.[0] !== currentTeam) {
            groupedRows.push({ isGroup: true, label: `👥 Team: ${m.teams?.[0]}` });
            currentTeam = m.teams?.[0];
        }

        groupedRows.push({
            "#": index + 1,
            "Name": (
                <span
                    onClick={() => navigate(`/control/member/${m.id}`)}
                    className="text-blue-600 cursor-pointer hover:underline"
                >
                    {m.personName}
                </span>
            ),
            "Category": m.category,
            "Site(s)": (m.sites || []).join(", "),
            "Team(s)": (m.teams || []).join(", "),
            "Role": m.role || "-",
            "Email": m.email || "-",
            "Status": (m.status === "approved" ? "Active" : m.status || "-").toUpperCase()
        });
    });

    const rows = groupedRows.map(row => {
        if (row.isGroup) {
            return {
                "#": "",
                "Name": `🔹 ${row.label}`,
                "Category": "",
                "Site(s)": "",
                "Team(s)": "",
                "Role": "",
                "Email": "",
                "Status": ""
            };
        }
        return row;
    });

    if (!isAdmin) return <p className="text-center mt-10 text-red-600 font-semibold">❌ Access Denied</p>;

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center gap-2">
                    <Users size={22}/> Manage Members
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <UniversalDropdown label="Name" options={nameOptions} value={selectedName} onChange={setSelectedName}/>
                    <UniversalDropdown label="Category" options={[
                        { label: "Head Office", value: "Head Office" },
                        { label: "Site", value: "Site" }
                    ]} value={selectedCategory} onChange={setSelectedCategory}/>
                    <UniversalDropdown label="Team" options={teamOptions} value={selectedTeam} onChange={setSelectedTeam}/>
                    <UniversalDropdown label="Site" options={siteOptions} value={selectedSite} onChange={setSelectedSite}/>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        >
                            <option value="active">Active</option>
                            <option value="relieved">Relieved</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <div className="mb-4 flex items-end">
                        <button
                            onClick={handleClearFilters}
                            className="w-full bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-4 py-2 rounded shadow"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded shadow">
                    {loading ? (
                        <p className="text-center py-6 text-gray-500">Loading members...</p>
                    ) : (
                        <UniversalTable headers={headers} rows={rows} />
                    )}
                </div>
            </div>
        </UniversalLayout>
    );
}

export default ManageMembers;
