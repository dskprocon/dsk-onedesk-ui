// src/components/ControlDesk/AddMember.jsx

import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { submitRegistration, generateNextEmployeeId } from "../../firebase/services/registrationService";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import MemberFormBlock from "./MemberFormBlock";

function AddMember({ name, role }) {
    const isAdmin = role?.toUpperCase() === "ADMIN";
    const [category, setCategory] = useState("Site");
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [existingTeamNames, setExistingTeamNames] = useState([]);
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [message, setMessage] = useState("");

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
            role: "",
            email: "",
            password: "",
            aadhaar: null,
            photo: null,
            pf: null,
            pan: null
        }
    ]);

    useEffect(() => {
        const loadSitesAndTeams = async () => {
            try {
                const siteSnap = await getDocs(collection(db, "sites"));
                const allSites = siteSnap.docs.map(doc => ({
                    label: doc.data().name,
                    value: doc.data().name
                }));
                setSiteOptions(allSites);

                const teamSnap = await getDocs(collection(db, "teams"));
                const allTeams = teamSnap.docs.map(doc => ({
                    label: doc.data().name,
                    value: doc.data().name
                }));
                setTeamOptions(allTeams);
                const allNames = teamSnap.docs.map(doc => doc.id.toLowerCase());
                setExistingTeamNames(allNames);
            } catch (err) {
                console.error("❌ Failed to load site/team data:", err);
            }
        };

        const loadUserAccess = async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                const ref = doc(db, "users", uid);
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

        if (isAdmin) loadSitesAndTeams();
        else loadUserAccess();
    }, [isAdmin]);

    const handleMemberChange = (index, field, value) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    const handleAddMember = () => {
        setMembers([...members, {
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
            aadhaar: null,
            photo: null,
            pf: null,
            pan: null
        }]);
    };

    const handleRemoveMember = (index) => {
        const updated = [...members];
        updated.splice(index, 1);
        setMembers(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("⏳ Submitting, please wait...");

        const aadhaarSet = new Set();
        const panSet = new Set();

        for (const m of members) {
            if (!m.personName || !m.aadhaar || !m.photo) {
                setMessage("❌ Aadhaar and Photo are required.");
                return;
            }

            if (aadhaarSet.has(m.aadhaarNumber)) {
                setMessage("❌ Duplicate Aadhaar Number found.");
                return;
            }
            aadhaarSet.add(m.aadhaarNumber);

            if (category === "Head Office") {
                if (!m.email || !m.password) {
                    setMessage("❌ Email and Password are required for Head Office members.");
                    return;
                }
                if (!m.pan || !m.panNumber) {
                    setMessage("❌ PAN Card and PAN Number are required.");
                    return;
                }
                if (panSet.has(m.panNumber)) {
                    setMessage("❌ Duplicate PAN Number found.");
                    return;
                }
                panSet.add(m.panNumber);
            }
        }

        try {
            if (category === "Site") {
                for (const team of teams.map(t => t.value)) {
                    const teamId = team.toLowerCase();
                    if (!existingTeamNames.includes(teamId)) {
                        const teamRef = doc(db, "teams", team);
                        await setDoc(teamRef, {
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
                const employeeId = await generateNextEmployeeId(category); // ✅ Clean logic

                const data = {
                    personName: m.personName,
                    designation: m.designation,
                    addressLine1: m.addressLine1,
                    addressLine2: m.addressLine2,
                    addressLine3: m.addressLine3,
                    aadhaarNumber: m.aadhaarNumber,
                    panNumber: m.panNumber,
                    mobileNumber: m.mobileNumber,
                    role: m.role || null,
                    email: m.email || null,
                    password: m.password || null,
                    category,
                    employeeId,
                    sites: sites.map(s => s.value),
                    teams: teams.map(t => t.value),
                    submittedBy: name
                };

                const files = {
                    aadhaar: m.aadhaar,
                    photo: m.photo,
                    pf: m.pf,
                    pan: m.pan
                };

                await submitRegistration(data, files);
            }

            setMessage("✅ All members submitted for approval.");
            setMembers([{
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
                aadhaar: null,
                photo: null,
                pf: null,
                pan: null
            }]);
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

                    {category === "Site" && (
                        <>
                            <div>
                                <label className="block font-medium mb-1">Select Site(s):</label>
                                <Select
                                    isMulti
                                    placeholder="Select site(s)"
                                    value={sites}
                                    onChange={setSites}
                                    options={siteOptions}
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Select or Type Team(s):</label>
                                <CreatableSelect
                                    isMulti
                                    placeholder="Select or type new team(s)"
                                    value={teams}
                                    onChange={setTeams}
                                    options={teamOptions}
                                    classNamePrefix="select"
                                />
                            </div>
                        </>
                    )}

                    {members.map((member, index) => (
                        <MemberFormBlock
                            key={index}
                            index={index}
                            category={category}
                            member={member}
                            onChange={handleMemberChange}
                            onRemove={handleRemoveMember}
                            showRemove={members.length > 1}
                        />
                    ))}

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleAddMember}
                            className="text-sm font-medium text-blue-700 underline"
                        >
                            ➕ Add Another Member
                        </button>
                    </div>

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

export default AddMember;
