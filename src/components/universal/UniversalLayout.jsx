import React, { useEffect, useState } from "react";
import { triggerGoBack, triggerGoHome } from "../../utils/navigationHelper";
import { triggerLogout } from "../../utils/logoutHelper";
import useOrientation from "../../hooks/useOrientation";
import NotificationBell from "./NotificationBell";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { format } from "date-fns";

function UniversalLayout({
        title = "OneDesk",
        name = "",
        role = "",
        isRootPage = false,
        hideNavButtons = false,
        children
}) {
        const orientation = useOrientation();
        const isLandscape = orientation === "landscape";

        const [attendanceStatus, setAttendanceStatus] = useState(null); // null = loading, false = not marked, object = marked

        useEffect(() => {
                const checkTodayAttendance = async () => {
                        if (!name) return;

                        const today = format(new Date(), "yyyy-MM-dd");
                        const q = query(
                                collection(db, "attendance"),
                                where("personName", "==", name),
                                where("date", "==", today)
                        );
                        const snap = await getDocs(q);
                        if (!snap.empty) {
                                const doc = snap.docs[0].data();
                                setAttendanceStatus({
                                        time: doc.timeIn,
                                        location: doc.locationName || "📍 Location Unavailable"
                                });
                        } else {
                                setAttendanceStatus(false);
                        }
                };

                checkTodayAttendance();
        }, [name]);

        return (
                <div className="min-h-screen flex flex-col justify-start bg-[#f6f6f6] pt-20 pb-4 px-4 relative">

                        {/* 🔒 Logout */}
                        <button
                                onClick={() => triggerLogout()}
                                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
                        >
                                🔒 Logout
                        </button>

                        {/* 🔔 Notification Bell */}
                        <div className="absolute top-5 left-5 z-50">
                                <NotificationBell userName={name} role={role} />
                        </div>

                        {/* 🔝 Header */}
                        <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto px-4 text-center mb-4">
                                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 md:w-28 mb-2" />
                                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                                <p className="text-sm text-gray-500">by DSK Procon</p>
                                <p className="text-sm text-gray-600 mt-1">
                                        Logged in as: <span className="font-semibold">{name}</span> | Role: {role?.toUpperCase()}
                                </p>

                                {/* ✅ Attendance Status Bar */}
                                {attendanceStatus === null ? (
                                        <p className="text-sm text-gray-500 mt-1">Checking attendance...</p>
                                ) : attendanceStatus === false ? (
                                        <p className="text-sm font-semibold text-red-600 mt-1">
                                                🔴 Attendance not marked today
                                        </p>
                                ) : (
                                        <p className="text-sm font-semibold text-green-700 mt-1">
                                                🟢 Marked at {attendanceStatus.time} – {attendanceStatus.location}
                                        </p>
                                )}
                        </div>

                        {/* 📦 Page Content */}
                        <div className="w-full max-w-[1200px] px-4 md:px-8 mx-auto">
                                {children}
                        </div>

                        {/* 🏠 Home + 🔙 Back Buttons */}
                        {!hideNavButtons && (
                                <div className="mt-12 flex justify-center gap-6">
                                        <button
                                                onClick={triggerGoHome}
                                                className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                        >
                                                🏠 Home
                                        </button>
                                        {!isRootPage && (
                                                <button
                                                        onClick={triggerGoBack}
                                                        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                                >
                                                        🔙 Back
                                                </button>
                                        )}
                                </div>
                        )}

                        {/* 🔻 Footer */}
                        <div className="mt-auto pt-12 text-center text-sm text-gray-500">
                                Made by <span className="font-semibold">DSK Synapse</span>
                        </div>
                </div>
        );
}

export default UniversalLayout;
