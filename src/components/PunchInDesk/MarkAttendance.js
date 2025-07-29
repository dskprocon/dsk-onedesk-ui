// src/components/PunchInDesk/MarkAttendance.js

import React, { useState } from "react";
import { Users, UserCheck, RefreshCw } from "lucide-react"; // ✅ Lucide Icons
import UniversalLayout from "../universal/UniversalLayout";
import { universalButtonClass } from "../universal/UniversalStyles";
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
                <h2 className="text-2xl font-bold text-center mb-6 text-[#1A1A1A]">
                    Mark Attendance
                </h2>

                {/* 🔘 Role-Based Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => setMode("self")}
                        className={`${universalButtonClass} ${
                            mode === "self" ? "bg-green-700 text-white hover:bg-green-800" : ""
                        }`}
                    >
                        <UserCheck className="inline-block mr-2" size={18} />
                        Mark Self
                    </button>

                    {isUser && (
                        <button
                            onClick={() => setMode("team")}
                            className={`${universalButtonClass} ${
                                mode === "team" ? "bg-green-700 text-white hover:bg-green-800" : ""
                            }`}
                        >
                            <Users className="inline-block mr-2" size={18} />
                            Mark Team
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setMode("other")}
                            className={`${universalButtonClass} ${
                                mode === "other" ? "bg-green-700 text-white hover:bg-green-800" : ""
                            }`}
                        >
                            <RefreshCw className="inline-block mr-2" size={18} />
                            Mark Others
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
