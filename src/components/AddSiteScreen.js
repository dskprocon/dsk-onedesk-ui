// src/components/SettingsScreen.js

import React, { useState } from "react";
import AddSiteTab from "./settings/AddSiteTab";
import AddUserTab from "./settings/AddUserTab";

function SettingsScreen() {
    const [activeTab, setActiveTab] = useState("site");

    const tabStyle = (tab) =>
        `px-5 py-2 rounded-t-md font-medium text-sm sm:text-base ${
            activeTab === tab
                ? "bg-white border-t-4 border-[#1A237E] text-black"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
        }`;

    return (
        <div className="min-h-screen bg-[#f9f9f9] py-6 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
                ⚙️ Settings & Export
            </h1>

            {/* 🔘 Tabs */}
            <div className="flex justify-center space-x-4 mb-6">
                <button className={tabStyle("site")} onClick={() => setActiveTab("site")}>
                    🏗 Add Site
                </button>
                <button className={tabStyle("user")} onClick={() => setActiveTab("user")}>
                    👤 Add User
                </button>
                <button className={tabStyle("export")} onClick={() => setActiveTab("export")}>
                    📤 Export Data
                </button>
            </div>

            {/* 🔄 Tab Content */}
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
                {activeTab === "site" && <AddSiteTab />}
                {activeTab === "user" && <AddUserTab />}
                {activeTab === "export" && (
                    <p className="text-gray-500 text-center">Coming soon...</p>
                )}
            </div>
        </div>
    );
}

export default SettingsScreen;
