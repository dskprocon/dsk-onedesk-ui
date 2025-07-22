// src/components/PunchInDesk/MarkAttendance.js
import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import Select from "react-select";

function MarkAttendance({ name, role }) {
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

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

    // 📍 Get location with Google Geocoding using secure env key
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
                    const apiKey = process.env.REACT_APP_GEOCODING_KEY;
                    const { lat, lng } = coords;
                    const gmapURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

                    const res = await axios.get(gmapURL);
                    const results = res.data.results;

                    if (results && results.length > 0) {
                        const address = results[0].formatted_address;
                        setLocationName(address);
                    } else {
                        const fallbackLocation = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        setLocationName(fallbackLocation);
                    }
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

    // 👥 Fetch all users from Firebase (update to your structure if needed)
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

        const data = {
            personName,
            category: role === "ADMIN" ? "Head Office" : "Site",
            siteName: "",
            teamName: "",
            timeIn,
            isLate,
            date: selectedDate,
            location,
            locationName,
            status: "pending",
            markedAt: serverTimestamp()
        };

        await addDoc(collection(db, "attendance"), data);
        setSubmitted(true);
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
                    <p className="text-center text-green-600 font-semibold">
                        ✅ Attendance marked successfully for{" "}
                        {role === "ADMIN" ? selectedPerson?.value : name} on {selectedDate}.
                    </p>
                ) : (
                    <div className="space-y-6 text-left">
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
