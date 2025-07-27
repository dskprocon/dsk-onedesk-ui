// src/components/PunchInDesk/MarkSelfForm.jsx

import React, { useEffect, useState } from "react";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useLocation from "../../hooks/useLocation";

function MarkSelfForm({ name, role }) {
    const isAdmin = role === "ADMIN";

    const [markedToday, setMarkedToday] = useState(false);
    const [statusInfo, setStatusInfo] = useState(null);
    const [selectedTime, setSelectedTime] = useState(getCurrentISTTime());
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [alreadyMarked, setAlreadyMarked] = useState(false);

    const docId = `${name.replace(/\s+/g, "_")}_${selectedDate.replace(/-/g, "")}`;
    const shouldFetchLocation = !alreadyMarked;

    const { location, locationName, loading, error } = useLocation(shouldFetchLocation);

    function getTodayDate() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toISOString().split("T")[0];
    }

    function getCurrentISTTime() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        return ist.toTimeString().slice(0, 5);
    }

    useEffect(() => {
        const checkIfAlreadyMarked = async () => {
            const ref = doc(db, "attendance", docId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setAlreadyMarked(true);
                setStatusInfo(data);
            }
        };

        checkIfAlreadyMarked();
    }, [docId]);

    const handleSubmit = async () => {
        if (!location || alreadyMarked) return;

        const timeInFinal = isAdmin ? selectedTime : getCurrentISTTime();
        const isLate = timeInFinal > "10:00";
        const halfDay = timeInFinal > "11:00";

        const data = {
            attendanceId: docId,
            personName: name,
            category: "Head Office",
            siteName: "",
            teamName: "",
            timeIn: timeInFinal,
            isLate,
            halfDay,
            date: selectedDate,
            location,
            locationName,
            markedBy: name,
            status: "approved",
            markedAt: new Date(),
        };

        await setDoc(doc(db, "attendance", docId), data);
        setStatusInfo(data);
        setAlreadyMarked(true);
    };

    return (
        <div className="space-y-6 text-left">
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
                {isAdmin ? (
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                ) : (
                    <div className="text-sm font-semibold text-gray-700">{getCurrentISTTime()}</div>
                )}
            </div>

            {loading && (
                <p className="text-gray-500 text-sm">📍 Detecting location...</p>
            )}

            {!loading && !error && locationName && !alreadyMarked && (
                <p className="text-sm text-gray-700">
                    📍 Current Location: <span className="text-gray-500">{locationName}</span>
                </p>
            )}

            {error && (
                <p className="text-red-600 text-sm font-semibold">{error}</p>
            )}

            {statusInfo && alreadyMarked && (
                <p className="text-green-600 text-sm font-semibold">
                    ✅ Marked at {statusInfo.timeIn} from: {statusInfo.locationName}
                </p>
            )}

            {!alreadyMarked && (
                <button
                    onClick={handleSubmit}
                    className="w-full border border-gray-400 px-3 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300"
                >
                    ✅ Submit Attendance
                </button>
            )}
        </div>
    );
}

export default MarkSelfForm;
