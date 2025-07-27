// src/components/PunchInDesk/MarkAttendance.js

import React, { useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import MarkSelfForm from "./MarkSelfForm";
import MarkTeamForm from "./MarkTeamForm";
import MarkOtherForm from "./MarkOtherForm";

function MarkAttendance({ name, role }) {
    const [mode, setMode] = useState("self"); // Options: 'self' | 'team' | 'other'

    const upperRole = role?.toUpperCase();
    const isAdmin = upperRole === "ADMIN";
    const isUser = upperRole === "USER";

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-center mb-6">🕓 Mark Attendance</h2>

                {/* 🔘 Role-Based Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => setMode("self")}
                        className={`w-full border border-gray-400 px-3 py-2 rounded font-semibold ${
                            mode === "self" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        ✅ Mark Self
                    </button>

                    {isUser && (
                        <button
                            onClick={() => setMode("team")}
                            className={`w-full border border-gray-400 px-3 py-2 rounded font-semibold ${
                                mode === "team" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800"
                            }`}
                        >
                            👥 Mark Team
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setMode("other")}
                            className={`w-full border border-gray-400 px-3 py-2 rounded font-semibold ${
                                mode === "other" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800"
                            }`}
                        >
                            🔁 Mark Others
                        </button>
                    )}
                </div>

                {/* 🔄 Conditional Form Loader */}
                {mode === "self" && <MarkSelfForm name={name} role={role} />}
                {mode === "team" && isUser && <MarkTeamForm name={name} role={role} />}
                {mode === "other" && isAdmin && <MarkOtherForm name={name} />}
            </div>
        </UniversalLayout>
    );
}

export default MarkAttendance;
