import React from "react";
import UniversalLayout from "./universal/UniversalLayout";
import UniversalButton from "./universal/UniversalButton"; // ✅ new
import NotificationBell from "./universal/NotificationBell"; // already modular
import { triggerGoHome, triggerGoBack } from "../utils/navigationHelper";

function Home({ onLogout, role, name }) {
        const isAdmin = role === "admin";

        return (
                <UniversalLayout onLogout={onLogout} role={role} name={name}>
                        {/* 🔔 Notification Bell (Top-Left) */}
                        <div className="absolute top-5 left-5 z-50">
                                <NotificationBell userName={name} role={role} />
                        </div>

                        {/* 📦 Module Buttons */}
                        <div className="flex-1 flex items-center justify-center mt-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl px-4">
                                        <UniversalButton to="/expense" icon="💼" label="Expense Desk" />

                                        {isAdmin && (
                                                <>
                                                        <UniversalButton to="/attendance" icon="🧑‍💼" label="Attendance" />
                                                        <UniversalButton to="/crm" icon="📊" label="Project CRM" />
                                                        <UniversalButton to="/partition" icon="📁" label="Partition System" />
                                                        <UniversalButton to="/ceiling" icon="🧱" label="Ceiling System" />
                                                        <UniversalButton to="/settings" icon="⚙️" label="Settings / Export" />
                                                </>
                                        )}
                                </div>
                        </div>

                        {/* 🏠 Home + 🔙 Back Buttons */}
                        <div className="mt-12 flex justify-center gap-6">
                                <button
                                        onClick={triggerGoHome}
                                        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                >
                                        🏠 Home
                                </button>
                                <button
                                        onClick={triggerGoBack}
                                        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                >
                                        🔙 Back
                                </button>
                        </div>

                        {/* 🔻 Footer */}
                        <div className="mt-10 text-sm text-center text-gray-500 px-4">
                                Made by <span className="font-semibold">DSK Synapse</span>
                        </div>
                </UniversalLayout>
        );
}

export default Home;
