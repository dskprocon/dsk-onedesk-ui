// src/components/ControlDesk/AddSite.jsx

import React, { useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { addNewSite } from "../../firebase/services/siteService";

function AddSite({ name, role }) {
    const [siteName, setSiteName] = useState("");
    const [message, setMessage] = useState("");

    const isAdmin = role?.toUpperCase() === "ADMIN";
    if (!isAdmin) return <p className="text-center mt-10 text-red-600 font-semibold">❌ Access Denied</p>;

    const handleAddSite = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!siteName.trim()) {
            setMessage("❌ Site name cannot be blank.");
            return;
        }

        try {
            await addNewSite(siteName.trim(), name);
            setMessage("✅ Site added successfully.");
            setSiteName("");
        } catch (err) {
            console.error("Error adding site:", err.message);
            setMessage("❌ " + err.message);
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-xl mx-auto px-4 pt-8">
                <h2 className="text-2xl font-bold text-center mb-6">🏗️ Add New Site</h2>

                {message && (
                    <p className={`text-center font-semibold mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleAddSite} className="space-y-6">
                    <div>
                        <label className="block font-medium mb-1">Site Name:</label>
                        <input
                            type="text"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                            placeholder="Enter site name"
                        />
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-6 py-2 rounded-xl shadow text-base font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
                        >
                            ➕ Add Site
                        </button>
                    </div>
                </form>
            </div>
        </UniversalLayout>
    );
}

export default AddSite;
