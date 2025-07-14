import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { triggerLogout } from "../../utils/logoutHelper";
import { triggerGoHome, triggerGoBack } from "../../utils/navigationHelper";

function ExpenseMenu({ name, role }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isRootPage = location.pathname === "/expense";

    const buttonStyle =
        "w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200";

    return (
        <div className="min-h-screen bg-[#F6F6F6] pt-20 px-4 relative">

            {/* 🔒 Logout */}
            <button
                onClick={triggerLogout}
                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
            >
                🔒 Logout
            </button>

            {/* 🔝 Universal Header */}
            <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto px-4 text-center">
                <img
                    src="/dsk_logo.png"
                    alt="DSK Procon"
                    className="w-20 sm:w-24 md:w-28 mb-4"
                />
                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                <p className="text-sm text-gray-500">by DSK Procon</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2F2F2F] mt-2">
                    Expense Desk Menu
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Logged in as: <span className="font-semibold">{name}</span> | Role: {role?.toUpperCase()}
                </p>
            </div>

            {/* 📦 Expense Desk Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl mx-auto mt-10">
                <button onClick={() => navigate("/expense/add")} className={buttonStyle}>
                    ➕ Add Expense
                </button>
                <button onClick={() => navigate("/expense/my")} className={buttonStyle}>
                    👤 My Expenses
                </button>
                <button onClick={() => navigate("/expense/approval")} className={buttonStyle}>
                    ✅ Approvals
                </button>
                <button onClick={() => navigate("/expense/export")} className={buttonStyle}>
                    📤 Export Reports
                </button>
                <button onClick={() => navigate("/expense/batch")} className={buttonStyle}>
                    📥 Batch Upload
                </button>
            </div>

            {/* 🔚 Universal Footer Buttons */}
            {isRootPage ? (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={triggerGoHome}
                        className="w-1/2 max-w-xs bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm sm:text-base"
                    >
                        🏠 Home
                    </button>
                </div>
            ) : (
                <div className="flex justify-between items-center max-w-md mx-auto mt-12 gap-4">
                    <button
                        onClick={triggerGoHome}
                        className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm sm:text-base"
                    >
                        🏠 Home
                    </button>
                    <button
                        onClick={triggerGoBack}
                        className="w-1/2 bg-[#E1E1E1] hover:bg-[#D4D4D4] text-gray-800 px-4 py-2 rounded text-sm sm:text-base"
                    >
                        🔙 Back
                    </button>
                </div>
            )}

            {/* 🔻 Footer */}
            <div className="mt-10 text-sm text-center text-gray-500 px-4">
                Made by <span className="font-semibold">DSK Synapse</span>
            </div>
        </div>
    );
}

export default ExpenseMenu;
