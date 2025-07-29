// src/components/PunchInDesk/MarkSelfForm.jsx

import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock, CheckCircle } from "lucide-react";
import {
    collection,
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useLocation from "../../hooks/useLocation";
import { universalInputClass, universalButtonClass } from "../universal/UniversalStyles";
import { showSuccess, showError } from "../../utils/alertUtils";

function MarkSelfForm({ name, role }) {
    const isAdmin = role === "ADMIN";

    const [statusInfo, setStatusInfo] = useState(null);
    const [selectedTime, setSelectedTime] = useState(getCurrentISTTime());
    const [selectedDate, setSelectedDate] = useState(getTodayDateForInput());
    const [alreadyMarked, setAlreadyMarked] = useState(false);

    const docId = `${name.replace(/\s+/g, "_")}_${selectedDate.replace(/-/g, "")}`;
    const shouldFetchLocation = !alreadyMarked;
    const { location, locationName, loading, error } = useLocation(shouldFetchLocation);

    function getTodayDateForInput() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 19800000);
        const yyyy = ist.getFullYear();
        const mm = String(ist.getMonth() + 1).padStart(2, "0");
        const dd = String(ist.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatDateForSave(date) {
        const [yyyy, mm, dd] = date.split("-");
        return `${dd}-${mm}-${yyyy}`; // ✅ DD-MM-YYYY
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
        if (!location) {
            showError("❌ Unable to detect location. Please try again.");
            return;
        }

        if (alreadyMarked) {
            showError("❌ Attendance already marked for today.");
            return;
        }

        try {
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
                date: formatDateForSave(selectedDate),
                location,
                locationName,
                markedBy: name,
                status: "approved",
                markedAt: new Date(),
            };

            await setDoc(doc(db, "attendance", docId), data);
            setStatusInfo(data);
            setAlreadyMarked(true);
            showSuccess("✅ Attendance marked successfully.");
        } catch (err) {
            console.error("❌ Error marking attendance:", err);
            showError("❌ Failed to mark attendance.");
        }
    };

    return (
        <div className="space-y-6 text-left">
            {/* 📅 Date */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <CalendarDays className="inline-block mr-1" size={16} /> Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={universalInputClass}
                />
            </div>

            {/* ⏱ Time In */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Clock className="inline-block mr-1" size={16} /> Time In
                </label>
                {isAdmin ? (
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className={universalInputClass}
                    />
                ) : (
                    <div className="text-sm font-semibold text-gray-700">{getCurrentISTTime()}</div>
                )}
            </div>

            {/* 📍 Location */}
            {loading && <p className="text-gray-500 text-sm">📍 Detecting location...</p>}
            {!loading && !error && locationName && !alreadyMarked && (
                <p className="text-sm text-gray-700">
                    <MapPin className="inline-block mr-1" size={14} /> Current Location:{" "}
                    <span className="text-gray-500">{locationName}</span>
                </p>
            )}
            {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

            {/* ✅ Status */}
            {statusInfo && alreadyMarked && (
                <p className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle size={16} /> Marked at {statusInfo.timeIn} from: {statusInfo.locationName}
                </p>
            )}

            {/* Submit */}
            {!alreadyMarked && (
                <button
                    onClick={handleSubmit}
                    className={`${universalButtonClass} w-full bg-gray-200 hover:bg-gray-300`}
                >
                    ✅ Submit Attendance
                </button>
            )}
        </div>
    );
}

export default MarkSelfForm;
