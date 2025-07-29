// src/components/ControlDesk/AddSite.jsx

import React, { useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { addNewSite } from "../../firebase/services/siteService";
import { showSuccess, showError } from "../../utils/alertUtils";
import { Building2, Plus } from "lucide-react";

function AddSite({ name, role }) {
    const [siteName, setSiteName] = useState("");

    const isAdmin = role?.toUpperCase() === "ADMIN";
    if (!isAdmin) return <p className="text-center mt-10 text-red-600 font-semibold">❌ Access Denied</p>;

    const handleAddSite = async (e) => {
        e.preventDefault();

        if (!siteName.trim()) {
            showError("❌ Site name cannot be blank.");
            return;
        }

        try {
            await addNewSite(siteName.trim(), name);
            showSuccess("✅ Site added successfully.");
            setSiteName("");
        } catch (err) {
            console.error("Error adding site:", err.message);
            showError("❌ " + (err.message || "Failed to add site."));
        }
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-xl mx-auto px-4 pt-8">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-gray-800">
                    <Building2 size={22} /> Add New Site
                </h2>

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
                            className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-6 py-2 rounded-xl shadow text-base font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
                        >
                            <Plus size={16} /> Add Site
                        </button>
                    </div>
                </form>
            </div>
        </UniversalLayout>
    );
}

export default AddSite;
