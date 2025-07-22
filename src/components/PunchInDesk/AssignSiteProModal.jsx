// ✅ FILE: AssignSiteProModal.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getAllSites } from "../../firebase/services/punchinService";
import { updateSiteAssignmentWithHistory } from "../../firebase/services/siteAssignmentService";

function AssignSiteProModal({ user, onClose, onSubmit }) {
    const [availableSites, setAvailableSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [assignedSites, setAssignedSites] = useState(user.sites || []);

    useEffect(() => {
        loadSites();
    }, []);

    const loadSites = async () => {
        const siteDocs = await getAllSites();
        const siteNames = siteDocs.map((s) => s.name);
        setAvailableSites(siteNames);
    };

    const handleAddSite = () => {
        if (selectedSite && !assignedSites.includes(selectedSite.value)) {
            setAssignedSites([...assignedSites, selectedSite.value]);
            setSelectedSite(null);
        }
    };

    const handleRemoveSite = (site) => {
        setAssignedSites(assignedSites.filter((s) => s !== site));
    };

    const handleConfirm = async () => {
        await updateSiteAssignmentWithHistory(user.uid, assignedSites, user.name);

        const updatedUser = {
            ...user,
            sites: assignedSites,
        };

        onSubmit?.(updatedUser); // Pass updated object
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg border border-gray-300">
                <h2 className="text-xl font-semibold mb-2">Assign Sites</h2>
                <p className="text-sm text-gray-700 mb-4">User: <strong>{user.name}</strong></p>

                {/* 🔍 Dropdown + Add Button */}
                <div className="flex gap-2 mb-4">
                    <Select
                        options={availableSites.map((s) => ({ label: s, value: s }))}
                        value={selectedSite}
                        onChange={setSelectedSite}
                        className="flex-1"
                        placeholder="Select site to assign..."
                        isClearable
                    />
                    <button
                        onClick={handleAddSite}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        ➕ Add
                    </button>
                </div>

                {/* ✅ Assigned Tags */}
                <div className="mb-4">
                    <label className="font-medium">Assigned Sites:</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {assignedSites.map((site) => (
                            <div key={site} className="bg-gray-200 px-3 py-1 rounded-full flex items-center text-sm">
                                {site}
                                <button
                                    onClick={() => handleRemoveSite(site)}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {assignedSites.length === 0 && (
                            <p className="text-sm text-gray-400">No site assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* 📜 Site Assignment History Table */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2">📜 Site Assignment History</h3>
                    {user.siteHistory && user.siteHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left border border-gray-300">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 border">Site</th>
                                        <th className="px-3 py-2 border">From</th>
                                        <th className="px-3 py-2 border">To</th>
                                        <th className="px-3 py-2 border">Assigned By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.siteHistory.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td className="px-3 py-2 border">{entry.site}</td>
                                            <td className="px-3 py-2 border">{entry.from}</td>
                                            <td className="px-3 py-2 border">
                                                {entry.to ? entry.to : <span className="text-green-600">Currently Active</span>}
                                            </td>
                                            <td className="px-3 py-2 border">{entry.assignedBy || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No site assignment history found.</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        ✅ Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignSiteProModal;
