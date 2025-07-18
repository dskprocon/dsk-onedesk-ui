import React from "react";
import { triggerGoBack, triggerGoHome } from "../../utils/navigationHelper";
import { triggerLogout } from "../../utils/logoutHelper";  // ✅ CORRECT
import useOrientation from "../../hooks/useOrientation";
import NotificationBell from "./NotificationBell";

function UniversalLayout({ title = "OneDesk", name = "", role = "", isRootPage = false, children }) {
        const orientation = useOrientation();
        const isLandscape = orientation === "landscape";

        return (
                <div className="min-h-screen flex flex-col justify-start bg-[#f6f6f6] pt-20 pb-4 px-4 relative">

                        {/* 🔒 Logout */}
                        <button
                                onClick={() => triggerLogout()}
                                className="absolute top-5 right-5 bg-black text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
                        >
                                🔒 Logout
                        </button>

                        {/* 🔔 Notification Bell (Top-Left) */}
                        <div className="absolute top-5 left-5 z-50">
                                <NotificationBell userName={name} role={role} />
                        </div>

                        {/* ⚠️ Orientation Warning */}
                        {isLandscape && (
                                <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold z-40">
                                        ⚠️ For best experience, please rotate to portrait mode 📱
                                </div>
                        )}

                        {/* 🔝 Header */}
                        <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto px-4 text-center mb-8">
                                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 md:w-28 mb-2" />
                                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                                <p className="text-sm text-gray-500">by DSK Procon</p>
                                <p className="text-sm text-gray-600 mt-1">
                                        Logged in as: <span className="font-semibold">{name}</span> | Role: {role?.toUpperCase()}
                                </p>
                                <h2 className="text-xl sm:text-2xl font-semibold text-[#2F2F2F] mt-2">{title}</h2>
                        </div>

                        {/* 📦 Page Content */}
                        <div className="max-w-3xl w-full mx-auto px-4">
                                {children}
                        </div>

                        {/* ⬇ Home & Back Buttons */}
                        <div className="mt-12 flex justify-center gap-6">
                                <button
                                        onClick={triggerGoHome}
                                        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                >
                                        🏠 Home
                                </button>
                                {!isRootPage && (
                                        <button
                                                onClick={triggerGoBack}
                                                className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base"
                                        >
                                                🔙 Back
                                        </button>
                                )}
                        </div>

                        {/* 🔻 Footer */}
                        <div className="mt-auto pt-12 text-center text-sm text-gray-500">
                                Made by <span className="font-semibold">DSK Synapse</span>
                        </div>
                </div>
        );
}

export default UniversalLayout;
