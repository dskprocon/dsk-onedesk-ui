// src/components/PunchInDesk/MarkAttendance.js
import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { db } from "../../firebase/firebaseConfig";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import axios from "axios";
import Select from "react-select";

function MarkAttendance({ name, role }) {
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [markedAlready, setMarkedAlready] = useState(false);
    const [category, setCategory] = useState("Head Office");

    const [allUsers, setAllUsers] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedTime, setSelectedTime] = useState(getCurrentISTTime());

    function getCurrentISTTime() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toTimeString().slice(0, 5);
    }

    function getTodayDate() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toISOString().split("T")[0];
    }

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("❌ Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                setLocation(coords);

                try {
                    const gmapURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=AIzaSyBsZ9r3G8E23YLZgNHN2iEotwgevaUtcEQ`;
                    const res = await axios.get(gmapURL);
                    const results = res.data.results;
                    setLocationName(results?.[0]?.formatted_address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                } catch (err) {
                    console.error("⚠️ Google Maps API Error:", err);
                    setLocationName(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                }

                setLoading(false);
            },
            (err) => {
                console.error("❌ Geolocation Error:", err);
                setError("❌ Location permission denied.");
                setLoading(false);
            }
        );
    }, []);

    useEffect(() => {
        if (role === "ADMIN") {
            const fetchUsers = async () => {
                try {
                    const snapshot = await getDocs(collection(db, "users"));
                    const list = snapshot.docs
                        .map(doc => doc.data())
                        .filter(user => !!user.name)
                        .map(user => ({
                            label: user.name,
                            value: user.name
                        }));
                    setAllUsers(list);
                } catch (err) {
                    console.error("❌ Error fetching users:", err);
                    setError("Failed to load users.");
                }
            };
            fetchUsers();
        }
    }, [role]);

    const handleSubmit = async () => {
        setError("");
        setMarkedAlready(false);

        if (!location) {
            setError("❌ Location not available. Cannot submit.");
            return;
        }

        const personName = role === "ADMIN" ? selectedPerson?.value : name;
        if (!personName) {
            setError("❌ Please select a user.");
            return;
        }

        const timeIn = selectedTime;
        const isLate = timeIn > "09:35";

        const duplicateCheck = query(
            collection(db, "attendance"),
            where("personName", "==", personName),
            where("date", "==", selectedDate)
        );
        const snap = await getDocs(duplicateCheck);
        if (!snap.empty) {
            setMarkedAlready(true);
            setError(`❌ Already marked for ${personName} on ${selectedDate}.`);
            return;
        }

        let detectedCategory = "Head Office";
        try {
            const userDoc = await getDoc(doc(db, "users", personName));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.category === "Site") detectedCategory = "Site";
            }
        } catch (err) {
            console.warn("⚠️ Failed to fetch user category.");
        }

        setCategory(detectedCategory);

        const data = {
            personName,
            category: detectedCategory,
            siteName: "",
            teamName: "",
            timeIn,
            isLate,
            date: selectedDate,
            location,
            locationName,
            status: "pending",
            markedBy: name, // ✅ NEW FIELD
            markedAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "attendance"), data);
            setSubmitted(true);
        } catch (err) {
            console.error("❌ Error saving attendance:", err);
            setError("Failed to save attendance. Please try again.");
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-center mb-6">✅ Mark Attendance</h2>

                {loading ? (
                    <p className="text-center text-gray-600">Fetching location...</p>
                ) : error ? (
                    <p className="text-center text-red-600 font-semibold">{error}</p>
                ) : submitted ? (
                    <div className="text-center text-green-600 font-semibold space-y-2">
                        <p>✅ Attendance marked successfully for <span className="font-bold">{role === "ADMIN" ? selectedPerson?.value : name}</span> on <span className="font-bold">{selectedDate}</span>.</p>
                        <p>
                            Category:{" "}
                            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${category === "Head Office" ? "bg-green-600" : "bg-orange-500"}`}>
                                {category}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 text-left">
                        {markedAlready && (
                            <div className="text-red-600 font-semibold text-center">
                                ❌ Already marked today for {role === "ADMIN" ? selectedPerson?.value : name}
                            </div>
                        )}

                        {role === "ADMIN" && (
                            <>
                                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Select Person:</label>
                                <Select
                                    options={allUsers}
                                    value={selectedPerson}
                                    onChange={setSelectedPerson}
                                    placeholder="Search and select user"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">📅 Select Date:</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">⏱ Time In:</label>
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full border border-gray-400 px-3 py-2 rounded"
                                    />
                                </div>
                            </>
                        )}

                        <p className="text-gray-700 font-medium">
                            Your location is captured ✅
                            <br />
                            <span className="text-sm text-gray-500">{locationName}</span>
                        </p>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-xl shadow text-base font-semibold mt-6"
                        >
                            ✅ Submit Attendance
                        </button>
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}

export default MarkAttendance;
