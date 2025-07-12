import React from "react";
import { Link } from "react-router-dom";

function Home({ onLogout, role, name }) {
    const isAdmin = role === "admin";

    return (
        <div className="min-h-screen bg-[#f8f8f8] flex flex-col justify-between py-8 px-4 relative">
            {/* 🔒 Logout Button */}
            <button
                onClick={onLogout}
                className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
                🔒 Logout
            </button>

            {/* 🔝 Logo and Welcome */}
            <div className="flex flex-col items-center mt-4 w-full max-w-screen-sm mx-auto px-4 text-center">
                <img
                    src="/dsk_logo.png"
                    alt="DSK Procon"
                    className="w-36 sm:w-44 mb-4"
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Welcome to OneDesk Pro
                </h1>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-2">
                    {name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Role: {role.toUpperCase()}
                </p>
            </div>

            {/* 🔘 Module Buttons */}
            <div className="flex flex-1 items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl w-full px-4 sm:px-6">
                    {/* ✅ Visible to all users */}
                    <Link
                        to="/expense"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        💼 Expense Desk
                    </Link>

                    {/* 🔐 Admin-Only Buttons */}
                    {isAdmin && (
                        <>
                            <Link
                                to="/partition"
                                className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                            >
                                📁 Partition System
                            </Link>
                            <Link
                                to="/ceiling"
                                className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                            >
                                🧱 Ceiling System
                            </Link>
                            <Link
                                to="/attendance"
                                className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                            >
                                🧑‍💼 Attendance
                            </Link>
                            <Link
                                to="/crm"
                                className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                            >
                                📊 Project CRM
                            </Link>
                            <Link
                                to="/settings"
                                className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-4 py-5 sm:px-6 sm:py-6 rounded-xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 transition"
                            >
                                ⚙️ Settings / Export
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ⬇️ Footer */}
            <div className="mt-16 text-sm text-center text-gray-500 px-4">
                Made by <span className="font-semibold">DSK Synapse</span>
            </div>
        </div>
    );
}

export default Home;
