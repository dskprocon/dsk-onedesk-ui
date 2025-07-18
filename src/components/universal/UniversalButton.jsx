// src/components/universal/UniversalButton.jsx
import React from "react";
import { Link } from "react-router-dom";

function UniversalButton({ to, label, icon }) {
        return (
                <Link
                        to={to}
                        className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                        {icon} {label}
                </Link>
        );
}

export default UniversalButton;
