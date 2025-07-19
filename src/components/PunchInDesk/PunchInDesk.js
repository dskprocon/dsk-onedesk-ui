// src/components/PunchInDesk/PunchInDesk.js
import React from "react";
import { useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";

function PunchInDesk({ name, role }) {
  const navigate = useNavigate();
  const buttonStyle =
    "w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200";

  return (
    <UniversalLayout name={name} role={role} title="Punch In Desk">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl mx-auto mt-10">
        <button onClick={() => navigate("/punch/register")} className={buttonStyle}>
          👤 Register Member
        </button>
        <button disabled className={buttonStyle + " opacity-50 cursor-not-allowed"}>
          📝 Mark Attendance
          <div className="text-sm mt-1">(Coming in Phase-2)</div>
        </button>
        <button disabled className={buttonStyle + " opacity-50 cursor-not-allowed"}>
          📅 View Attendance
        </button>
        <button disabled className={buttonStyle + " opacity-50 cursor-not-allowed"}>
          📁 Document Viewer
        </button>
        <button disabled className={buttonStyle + " opacity-50 cursor-not-allowed"}>
          📊 Reports
        </button>
      </div>
    </UniversalLayout>
  );
}

export default PunchInDesk;
