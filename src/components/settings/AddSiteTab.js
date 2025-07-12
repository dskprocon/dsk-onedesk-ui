import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";

function AddSiteTab() {
    const [siteName, setSiteName] = useState("");
    const db = getFirestore(app);

    const handleAddSite = async () => {
        if (!siteName.trim()) return alert("❌ Please enter a site name");
        try {
            await addDoc(collection(db, "sites"), {
                name: siteName,
                createdAt: new Date(),
            });
            alert("✅ Site added successfully");
            setSiteName("");
        } catch (err) {
            console.error("❌ Error adding site:", err);
            alert("❌ Failed to add site");
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                🏗 Site Name
            </label>
            <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Enter new site name"
            />
            <button
                onClick={handleAddSite}
                className="bg-[#1A237E] text-white px-4 py-2 rounded hover:bg-[#0f164e]"
            >
                ➕ Add Site
            </button>
        </div>
    );
}

export default AddSiteTab;
