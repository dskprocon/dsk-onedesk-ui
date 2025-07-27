// src/components/PunchInDesk/MarkOtherForm.jsx

import React, { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useLocation from "../../hooks/useLocation";
import Select from "react-select";

function MarkOtherForm({ name, role }) {
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [category, setCategory] = useState("Head Office");
    const [people, setPeople] = useState([]);
    const [selectedPeople, setSelectedPeople] = useState([]);

    const [selectedDate, setSelectedDate] = useState(getTodayDateForInput());
    const [selectedTime, setSelectedTime] = useState(getCurrentISTTime());

    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [site, setSite] = useState(null);
    const [team, setTeam] = useState(null);

    const [submitted, setSubmitted] = useState(false);

    const { location, locationName, loading, error } = useLocation(true);

    function getTodayDateForInput() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        const yyyy = ist.getFullYear();
        const mm = String(ist.getMonth() + 1).padStart(2, "0");
        const dd = String(ist.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function getTodayDateDisplay() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        const dd = String(ist.getDate()).padStart(2, "0");
        const mm = String(ist.getMonth() + 1).padStart(2, "0");
        const yyyy = ist.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    function getCurrentISTTime() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toTimeString().slice(0, 5);
    }

    useEffect(() => {
        const fetchSites = async () => {
            const snap = await getDocs(collection(db, "sites"));
            const options = snap.docs.map(doc => {
                const data = doc.data();
                return { label: data.name, value: data.name };
            });
            setSiteOptions(options);
        };
        fetchSites();
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!site) return;
            const q = query(
                collection(db, "registrations"),
                where("sites", "array-contains", site.value),
                where("status", "==", "approved")
            );
            const snap = await getDocs(q);
            const teamSet = new Set();
            snap.forEach(doc => {
                const data = doc.data();
                const team = data.teams?.[0] || data.teamName;
                if (team) teamSet.add(team);
            });
            const options = [...teamSet].map(t => ({ label: t, value: t }));
            setTeamOptions(options);
        };
        fetchTeams();
    }, [site]);

    useEffect(() => {
        const fetchPeople = async () => {
            let q;
            if (category === "Head Office") {
                q = query(
                    collection(db, "registrations"),
                    where("category", "==", "Head Office"),
                    where("status", "==", "approved")
                );
            } else {
                q = query(
                    collection(db, "registrations"),
                    where("category", "==", "Site"),
                    where("status", "==", "approved")
                );
            }

            const snap = await getDocs(q);
            const list = snap.docs.map((doc) => {
                const data = doc.data();
                const hasSite = data.sites?.includes(site?.value);
                const hasTeam = data.teams?.includes(team?.value);
                return {
                    ...data,
                    id: doc.id,
                    name: data.personName,
                    match: category === "Head Office" || (hasSite && hasTeam)
                };
            }).filter((p) => p.match);

            setPeople(list);
        };
        fetchPeople();
    }, [category, site, team]);

    const togglePerson = (id) => {
        setSelectedPeople((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedPeople(
            selectedPeople.length === people.length ? [] : people.map((p) => p.id)
        );
    };

    const handleSubmit = async () => {
        const formattedDate = selectedDate.split("-").reverse().join("/");
        const saveDate = selectedDate.replace(/-/g, "");
        const isLate = selectedTime > "10:00";
        const halfDay = selectedTime > "11:00";

        for (const personId of selectedPeople) {
            const matched = people.find((p) => p.id === personId);
            if (!matched) continue;

            const personName = matched.name;
            const sitePart = site?.value?.replace(/\s+/g, "_") || "NA";
            const teamPart = team?.value?.replace(/\s+/g, "_") || "NA";
            const docId = `${personName.replace(/\s+/g, "_")}_${sitePart}_${teamPart}_${saveDate}`;

            const docRef = doc(db, "attendance", docId);
            const existing = await getDoc(docRef);
            if (existing.exists()) continue;

            const data = {
                attendanceId: docId,
                personName: `${personName} (ID-${docId})`,
                category,
                siteName: site?.value || "",
                teamName: team?.value || "",
                timeIn: selectedTime,
                isLate,
                halfDay,
                date: formattedDate,
                location,
                locationName,
                markedBy: name,
                status: "approved",
                markedAt: serverTimestamp(),
            };

            await setDoc(docRef, data);
        }

        setSubmitted(true);
        setSelectedPeople([]);
    };

    return (
        <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">👥 Category</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">🏗 Site</label>
                            <Select
                                options={siteOptions}
                                value={site}
                                onChange={setSite}
                                className="w-full border border-gray-400 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">👨‍👩‍👧‍👦 Team</label>
                            <Select
                                options={teamOptions}
                                value={team}
                                onChange={setTeam}
                                className="w-full border border-gray-400 rounded"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">⏱ Time In</label>
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                </div>
            </div>

            <div className="text-sm text-gray-700">
                Location:{" "}
                <span className="text-gray-500">
                    {loading ? "Detecting..." : locationName}
                </span>
            </div>

            {error && (
                <p className="text-red-600 text-sm font-semibold">{error}</p>
            )}

            {people.length > 0 && (
                <div className="border border-gray-400 p-3 rounded bg-white max-h-64 overflow-y-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <input
                            type="checkbox"
                            className="mr-2"
                            onChange={selectAll}
                            checked={selectedPeople.length === people.length}
                        />
                        Select All ({people.length})
                    </label>
                    {people.map((p) => (
                        <label key={p.id} className="block text-sm">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedPeople.includes(p.id)}
                                onChange={() => togglePerson(p.id)}
                            />
                            {p.name}
                        </label>
                    ))}
                </div>
            )}

            {selectedPeople.length > 0 && (
                <button
                    onClick={handleSubmit}
                    className="w-full border border-gray-400 px-3 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300"
                >
                    ✅ Submit for {selectedPeople.length} Member(s)
                </button>
            )}

            {submitted && (
                <p className="text-green-600 font-semibold text-center">
                    ✅ Attendance marked successfully.
                </p>
            )}
        </div>
    );
}

export default MarkOtherForm;
