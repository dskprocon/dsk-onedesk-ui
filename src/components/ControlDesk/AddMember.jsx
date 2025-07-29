import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalDropdown from "../universal/UniversalDropdown";
import { submitRegistration, generateNextEmployeeId } from "../../firebase/services/registrationService";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import CreatableSelect from "react-select/creatable";

function AddMember({ name, role }) {
    const isAdmin = role?.toUpperCase() === "ADMIN";
    const [category, setCategory] = useState("Site");
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [existingTeamNames, setExistingTeamNames] = useState([]);
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [message, setMessage] = useState("");

    const emptyMember = {
        personName: "",
        designation: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        aadhaarNumber: "",
        panNumber: "",
        mobileNumber: "",
        role: "",
        email: "",
        password: "",
        aadhaarFront: null,
        aadhaarBack: null,
        photo: null,
        pfForm: null,
        panCard: null,
    };

    const [members, setMembers] = useState([structuredClone(emptyMember)]);

    useEffect(() => {
        const loadSitesAndTeams = async () => {
            try {
                const siteSnap = await getDocs(collection(db, "sites"));
                const teamSnap = await getDocs(collection(db, "teams"));
                setSiteOptions(siteSnap.docs.map(doc => ({ label: doc.data().name, value: doc.data().name })));
                setTeamOptions(teamSnap.docs.map(doc => ({ label: doc.data().name, value: doc.data().name })));
                setExistingTeamNames(teamSnap.docs.map(doc => doc.id.toLowerCase()));
            } catch (err) {
                console.error("❌ Failed to load site/team data:", err);
            }
        };

        const loadUserAccess = async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                const snap = await getDoc(doc(db, "users", uid));
                if (snap.exists()) {
                    const data = snap.data();
                    setSiteOptions((data.sites || []).map(site => ({ label: site, value: site })));
                    setTeamOptions((data.teams || []).map(team => ({ label: team, value: team })));
                }
            } catch (err) {
                console.error("❌ Failed to fetch user profile:", err);
            }
        };

        isAdmin ? loadSitesAndTeams() : loadUserAccess();
    }, [isAdmin]);

    const handleChange = (index, field, value) => {
        const updated = [...members];
        if (field === "aadhaarNumber") {
            value = value.replace(/\D/g, "").slice(0, 12);
            value = value.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join("-"));
        }
        if (field === "panNumber") {
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        }
        updated[index][field] = value;
        setMembers(updated);
    };

    const handleFileChange = (index, field, file) => {
        const updated = [...members];
        updated[index][field] = file;
        setMembers(updated);
    };

    const handleAddMember = () => setMembers([...members, structuredClone(emptyMember)]);
    const handleRemoveMember = (index) => {
        const updated = [...members];
        updated.splice(index, 1);
        setMembers(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("⏳ Submitting, please wait...");

        for (const m of members) {
            if (!m.personName || !m.aadhaarFront || !m.photo) {
                setMessage("❌ Aadhaar Front and Photo are mandatory.");
                return;
            }

            if (category === "Head Office") {
                if (!m.email || !m.password || !m.panCard || !m.panNumber) {
                    setMessage("❌ Email, Password, and PAN are required for Head Office.");
                    return;
                }
            }
        }

        try {
            if (category === "Site") {
                for (const team of teams.map(t => t.value)) {
                    const teamId = team.toLowerCase();
                    if (!existingTeamNames.includes(teamId)) {
                        await setDoc(doc(db, "teams", team), {
                            name: team,
                            createdAt: new Date(),
                            createdBy: name,
                            sites: sites.map(s => s.value)
                        });
                        setExistingTeamNames(prev => [...prev, teamId]);
                    }
                }
            }

            for (const m of members) {
                const employeeId = await generateNextEmployeeId(category);
                const data = {
                    ...m,
                    category,
                    employeeId,
                    sites: sites.map(s => s.value),
                    teams: teams.map(t => t.value),
                    submittedBy: name,
                };
                const files = {
                    aadhaarFront: m.aadhaarFront,
                    aadhaarBack: m.aadhaarBack,
                    panCard: m.panCard,
                    pfForm: m.pfForm,
                    photo: m.photo,
                };
                await submitRegistration(data, files);
            }

            setMessage("✅ All members submitted for approval.");
            setMembers([structuredClone(emptyMember)]);
            setSites([]);
            setTeams([]);
        } catch (err) {
            console.error("❌ Submission failed:", err);
            setMessage("❌ Submission failed. Try again.");
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-6">👥 Register Members</h2>

                {message && (
                    <p className={`text-center font-semibold mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-medium mb-1">Category:</label>
                        {isAdmin ? (
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-400 px-3 py-2 rounded">
                                <option value="Head Office">Head Office</option>
                                <option value="Site">Site</option>
                            </select>
                        ) : (
                            <input value="Site" disabled className="w-full border border-gray-400 px-3 py-2 rounded bg-gray-100" />
                        )}
                    </div>

                    {category === "Site" && (
                        <>
                            <UniversalDropdown label="Select Site(s)" options={siteOptions} value={sites} onChange={setSites} isMulti required />
                            <div>
                                <label className="block font-medium mb-1">Select or Type Team(s):</label>
                                <CreatableSelect isMulti value={teams} onChange={setTeams} options={teamOptions} placeholder="Type or select teams..." />
                            </div>
                        </>
                    )}

                    {members.map((m, i) => (
                        <div key={i} className="border border-gray-300 rounded p-4 shadow-sm bg-white">
                            <div className="font-semibold text-lg mb-3">👤 Member {i + 1}</div>

                            {[
                                ["Full Name", "personName"],
                                ["Mobile Number", "mobileNumber"],
                                ["Aadhaar Number", "aadhaarNumber"],
                                ["Address Line 1", "addressLine1"],
                                ["Address Line 2", "addressLine2"],
                                ["Address Line 3", "addressLine3"],
                            ].map(([label, key]) => (
                                <div key={key} className="mb-3">
                                    <label className="block font-medium mb-1">{label}</label>
                                    <input
                                        type="text"
                                        value={m[key]}
                                        onChange={(e) => handleChange(i, key, e.target.value)}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                            ))}

                            {category === "Head Office" && (
                                <div className="mb-3">
                                    <label className="block font-medium mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={m.designation}
                                        onChange={(e) => handleChange(i, "designation", e.target.value)}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                            )}

                            {category === "Head Office" && (
                                <>
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1">Email ID</label>
                                        <input
                                            type="email"
                                            value={m.email}
                                            onChange={(e) => handleChange(i, "email", e.target.value)}
                                            className="w-full border border-gray-400 px-3 py-2 rounded"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={m.password}
                                            onChange={(e) => handleChange(i, "password", e.target.value)}
                                            className="w-full border border-gray-400 px-3 py-2 rounded"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1">PAN Number</label>
                                        <input
                                            type="text"
                                            value={m.panNumber}
                                            onChange={(e) => handleChange(i, "panNumber", e.target.value)}
                                            className="w-full border border-gray-400 px-3 py-2 rounded"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium">Aadhaar Front (Required)</label>
                                    <input type="file" onChange={(e) => handleFileChange(i, "aadhaarFront", e.target.files[0])} className="w-full border border-gray-400 px-3 py-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block font-medium">Aadhaar Back (Optional)</label>
                                    <input type="file" onChange={(e) => handleFileChange(i, "aadhaarBack", e.target.files[0])} className="w-full border border-gray-400 px-3 py-2 rounded" />
                                </div>
                                {category === "Head Office" && (
                                    <div>
                                        <label className="block font-medium">PAN Card (Required)</label>
                                        <input type="file" onChange={(e) => handleFileChange(i, "panCard", e.target.files[0])} className="w-full border border-gray-400 px-3 py-2 rounded" required />
                                    </div>
                                )}
                                <div>
                                    <label className="block font-medium">PF Declaration Form (Optional)</label>
                                    <input type="file" onChange={(e) => handleFileChange(i, "pfForm", e.target.files[0])} className="w-full border border-gray-400 px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="block font-medium">Photo (Required)</label>
                                    <input type="file" onChange={(e) => handleFileChange(i, "photo", e.target.files[0])} className="w-full border border-gray-400 px-3 py-2 rounded" required />
                                </div>
                            </div>

                            {members.length > 1 && (
                                <div className="text-right mt-3">
                                    <button type="button" className="text-sm text-red-500 underline" onClick={() => handleRemoveMember(i)}>
                                        ❌ Remove Member
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="text-center">
                        <button type="button" onClick={handleAddMember} className="text-sm font-medium text-blue-700 underline">
                            ➕ Add Another Member
                        </button>
                    </div>

                    <div className="text-center pt-6">
                        <button type="submit" className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-6 py-2 rounded-xl shadow text-base font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200">
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </UniversalLayout>
    );
}

export default AddMember;
