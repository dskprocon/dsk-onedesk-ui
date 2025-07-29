// src/components/PunchInDesk/PunchInDesk.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { format } from "date-fns";

function PunchInDesk({ name, role }) {
    const navigate = useNavigate();
    const [markedToday, setMarkedToday] = useState(null); // null = loading, true/false = result

    const buttonStyle =
        "relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200";

    useEffect(() => {
        const checkAttendance = async () => {
            const today = format(new Date(), "dd-MM-yyyy"); // ✅ Fixed date format
            const q = query(
                collection(db, "attendance"),
                where("personName", "==", name),
                where("date", "==", today)
            );
            const snapshot = await getDocs(q);
            setMarkedToday(!snapshot.empty);
        };

        if (name) checkAttendance();
    }, [name]);

    return (
        <UniversalLayout name={name} role={role} title="Punch In Desk">
            <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                    {/* ✅ 1. Mark Attendance (with green/red dot) */}
                    <button
                        onClick={() => navigate("/punch/mark")}
                        className={buttonStyle}
                    >
                        📝 Mark Attendance
                        {markedToday === true && (
                            <span className="absolute top-2 right-4 w-3 h-3 bg-green-500 rounded-full" title="Marked Today"></span>
                        )}
                        {markedToday === false && (
                            <span className="absolute top-2 right-4 w-3 h-3 bg-red-500 rounded-full" title="Not Marked"></span>
                        )}
                    </button>

                    {/* 2. View Attendance */}
                    <button onClick={() => navigate("/punch/view")} className={buttonStyle}>
                        📅 View Attendance
                    </button>

                    {/* 3. Reports */}
                    <button onClick={() => navigate("/punch/report")} className={buttonStyle}>
                        📊 Reports
                    </button>

                    {/* 4. Attendance Approval – ADMIN only */}
                    {role?.toUpperCase() === "ADMIN" && (
                        <button onClick={() => navigate("/punch/att-approval")} className={buttonStyle}>
                            🧾 Approve Attendance
                        </button>
                    )}
                </div>
            </div>
        </UniversalLayout>
    );
}

export default PunchInDesk;
