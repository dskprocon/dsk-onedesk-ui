// src/components/ExpenseDesk/ExpenseDesk.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";

function ExpenseMenu({ name, role }) {
        const navigate = useNavigate();
        const location = useLocation();
        const isRootPage = location.pathname === "/expense";

        const buttonStyle =
                "w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200";

        return (
                <UniversalLayout name={name} role={role} title="Expense Desk Menu" isRootPage={isRootPage}>
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

                                {role === "admin" && (
                                        <button onClick={() => navigate("/expense/payment")} className={buttonStyle}>
                                                ➕ Add Payment
                                        </button>
                                )}

                                <button onClick={() => navigate("/expense/ledger")} className={buttonStyle}>
                                        📘 View Ledger
                                </button>
                        </div>
                </UniversalLayout>
        );
}

export default ExpenseMenu;
