import React from "react";
import { useNavigate } from "react-router-dom";

function ExpenseMenu() {
        const navigate = useNavigate();

        const buttonStyle =
                "w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200";

        return (
                <div className="min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center py-10 px-4">
                        <img
                                src="/dsk_logo.png"
                                alt="DSK Procon"
                                className="w-20 sm:w-24 md:w-28 mb-4"
                        />
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-6 text-center">
                                Expense Desk Menu
                        </h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
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
                                <button onClick={() => navigate("/")} className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gray-300 text-gray-800 px-4 py-4 rounded-2xl shadow text-base sm:text-lg font-semibold text-center hover:bg-gray-400 transition-all duration-200">
                                        ⬅ Back to Home
                                </button>
                        </div>
                </div>
        );
}

export default ExpenseMenu;
