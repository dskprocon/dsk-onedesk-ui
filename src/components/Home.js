import React from "react";
import { Link } from "react-router-dom";

function Home({ onLogout }) {
    return (
        <div className="min-h-screen bg-[#f8f8f8] flex flex-col justify-between py-8 px-4 relative">
            {/* 🔒 Logout Button */}
            <button
                onClick={onLogout}
                className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
                🔒 Logout
            </button>

            {/* 🔝 Logo and Title */}
            <div className="flex flex-col items-center mt-4">
                <img
                    src="/dsk_logo.png"
                    alt="DSK Procon"
                    className="w-44 mb-4"
                />
                <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 via-black to-gray-700 text-transparent bg-clip-text">
                    Welcome to OneDesk Pro
                </h1>
            </div>

            {/* 🔘 Module Buttons (Perfectly Centered) */}
            <div className="flex flex-1 items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl w-full px-6">
                    <Link
                        to="/partition"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        📁 Partition System
                    </Link>
                    <Link
                        to="/ceiling"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        🧱 Ceiling System
                    </Link>
                    <Link
                        to="/voucher"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        📄 Voucher Reports
                    </Link>
                    <Link
                        to="/attendance"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        🧑‍💼 Attendance
                    </Link>
                    <Link
                        to="/crm"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        📊 Project CRM
                    </Link>
                    <Link
                        to="/settings"
                        className="bg-gradient-to-br from-gray-800 to-gray-600 text-white px-6 py-6 rounded-xl shadow-xl text-lg font-semibold text-center hover:scale-105 transition"
                    >
                        ⚙️ Settings / Export
                    </Link>
                </div>
            </div>

            {/* ⬇️ Footer */}
            <div className="mt-16 text-sm text-center text-gray-500">
                Made by <span className="font-semibold">DSK Synapse</span>
            </div>
        </div>
    );
}

export default Home;
