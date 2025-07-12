import React, { useState } from "react";
import AddSiteTab from "./settings/AddSiteTab";
import AddUserTab from "./settings/AddUserTab";

function SettingsScreen() {
        const [activeTab, setActiveTab] = useState("site");

        const tabStyle = (tab) =>
                `px-6 py-2 rounded-t-lg text-sm sm:text-base font-medium ${
                        activeTab === tab
                                ? "bg-white border-t-4 border-[#1A237E] text-black"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`;

        return (
                <div className="min-h-screen bg-[#f4f4f4] p-8">
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                                ⚙️ Settings / Export
                        </h1>

                        <div className="flex justify-center space-x-4 mb-6">
                                <button className={tabStyle("site")} onClick={() => setActiveTab("site")}>
                                        🏗 Add Site
                                </button>
                                <button className={tabStyle("user")} onClick={() => setActiveTab("user")}>
                                        👥 Add User
                                </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                                {activeTab === "site" && <AddSiteTab />}
                                {activeTab === "user" && <AddUserTab />}
                        </div>
                </div>
        );
}

export default SettingsScreen;
