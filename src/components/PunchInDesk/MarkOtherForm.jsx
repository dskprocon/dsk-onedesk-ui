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
import { showSuccess, showError } from "../../utils/alertUtils";

function MarkOtherForm({ name, role }) {
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [category, setCategory] = useState("Head Office");
    const [selectedSites, setSelectedSites] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [selectedPeople, setSelectedPeople] = useState([]);

    const [selectedDate, setSelectedDate] = useState(getTodayDateForInput());
    const [selectedTime, setSelectedTime] = useState(getCurrentISTTime());

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

    function getCurrentISTTime() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toTimeString().slice(0, 5);
    }

    useEffect(() => {
        const fetchSites = async () => {
            const snap = await getDocs(collection(db, "sites"));
            const options = snap.docs.map(doc => ({
                label: doc.data().name,
                value: doc.data().name
            }));
            setSiteOptions(options);
        };
        fetchSites();
    }, []);

    useEffect(() => {
        const fetchGroupedPeople = async () => {
            if (category === "Site") {
                const allData = [];

                for (const siteObj of selectedSites) {
                    const siteName = siteObj.value;
                    const q = query(
                        collection(db, "registrations"),
                        where("sites", "array-contains", siteName),
                        where("status", "==", "approved"),
                        where("category", "==", "Site")
                    );
                    const snap = await getDocs(q);
                    const teamMap = new Map();

                    snap.docs.forEach((doc) => {
                        const data = doc.data();
                        const team = data.teams?.[0] || data.teamName || "No Team";
                        if (!teamMap.has(team)) teamMap.set(team, []);
                        teamMap.get(team).push({ id: doc.id, name: data.personName });
                    });

                    for (const [team, members] of teamMap.entries()) {
                        allData.push({ site: siteName, team, members });
                    }
                }

                setGroupedData(allData);
            } else {
                const q = query(
                    collection(db, "registrations"),
                    where("category", "==", "Head Office"),
                    where("status", "==", "approved")
                );
                const snap = await getDocs(q);
                const list = snap.docs
                    .map((doc) => ({
                        id: doc.id,
                        name: doc.data().personName,
                    }))
                    .filter((p) => p.name !== name);
                setGroupedData([{ site: "Head Office", team: "-", members: list }]);
            }
        };

        fetchGroupedPeople();
    }, [category, selectedSites]);

    const togglePerson = (id) => {
        setSelectedPeople(prev =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIds = groupedData.flatMap(group => group.members.map(m => m.id));
        setSelectedPeople(
            selectedPeople.length === allIds.length ? [] : allIds
        );
    };

    const handleSubmit = async () => {
        if (!location) {
            showError("❌ Unable to detect location. Please try again.");
            return;
        }

        if (selectedPeople.length === 0) {
            showError("❌ Please select at least one person.");
            return;
        }

        const formattedDate = selectedDate.split("-").reverse().join("-"); // ✅ DD-MM-YYYY
        const saveDate = selectedDate.replace(/-/g, "");
        const isLate = selectedTime > "10:00";
        const halfDay = selectedTime > "11:00";

        for (const group of groupedData) {
            for (const person of group.members) {
                if (!selectedPeople.includes(person.id)) continue;

                const docId = `${person.name.replace(/\s+/g, "_")}_${group.site.replace(/\s+/g, "_")}_${group.team.replace(/\s+/g, "_")}_${saveDate}`;
                const docRef = doc(db, "attendance", docId);
                const existing = await getDoc(docRef);
                if (existing.exists()) continue;

                const data = {
                    attendanceId: docId,
                    personName: person.name,
                    category,
                    siteName: group.site,
                    teamName: group.team,
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
        }

        showSuccess(`✅ Attendance marked for ${selectedPeople.length} member(s).`);
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">🏗 Sites</label>
                        <Select
                            options={siteOptions}
                            isMulti
                            value={selectedSites}
                            onChange={setSelectedSites}
                            className="w-full border border-gray-400 rounded"
                        />
                    </div>
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
                Location: <span className="text-gray-500">{loading ? "Detecting..." : locationName}</span>
            </div>

            {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

            {groupedData.length > 0 && (
                <div className="border border-gray-400 p-3 rounded bg-white max-h-80 overflow-y-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <input
                            type="checkbox"
                            className="mr-2"
                            onChange={selectAll}
                            checked={selectedPeople.length === groupedData.flatMap(g => g.members).length}
                        />
                        Select All ({groupedData.flatMap(g => g.members).length})
                    </label>

                    {groupedData.map((group, idx) => (
                        <div key={idx} className="mb-3 border border-gray-300 rounded p-2 bg-gray-50">
                            <p className="font-semibold mb-1">🏗 {group.site} | 👥 {group.team}</p>
                            {group.members.map((p) => (
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
        </div>
    );
}

export default MarkOtherForm;
