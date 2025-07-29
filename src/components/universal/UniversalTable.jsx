// src/components/universal/UniversalTable.jsx

import React, { useState } from "react";

function UniversalTable({ headers = [], rows = [] }) {
    const [selectedRow, setSelectedRow] = useState(null);

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    // Define priority columns for mobile
    const getVisibleHeaders = () => {
        if (isMobile) return headers.filter(h => ["#", "Name", "Category", "Status", "Actions"].includes(h));
        if (isTablet) return headers.filter(h => !["PF Applicable", "UAN", "Emergency Contact"].includes(h));
        return headers;
    };

    const visibleHeaders = getVisibleHeaders();

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-400 relative">
            <table className="w-full text-[15px] text-gray-800 border-collapse min-w-max">
                <thead className="bg-gray-100">
                    <tr>
                        {visibleHeaders.map((header, index) => (
                            <th
                                key={index}
                                className={`px-5 py-3 text-left uppercase tracking-wide text-[13px] font-bold text-gray-600 border-b border-r border-gray-400 
                                    ${index === 0 || header === "Name" ? "sticky left-0 bg-gray-100 z-10" : ""}`}
                                style={{ minWidth: "120px" }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={visibleHeaders.length}
                                className="text-center py-6 text-gray-500 border-t border-gray-400"
                            >
                                No data available
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-t border-gray-400 hover:bg-gray-50 transition duration-100"
                            >
                                {visibleHeaders.map((key, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-5 py-3 align-top text-gray-800 whitespace-pre-line border-r border-gray-300 
                                            ${colIndex === 0 || key === "Name" ? "sticky left-0 bg-white z-10" : ""}`}
                                    >
                                        {row[key] || "-"}
                                    </td>
                                ))}

                                {/* Details button for hidden columns in mobile/tablet */}
                                {((isMobile || isTablet) && Object.keys(row).length > visibleHeaders.length) && (
                                    <td className="px-5 py-3 border-r border-gray-300">
                                        <button
                                            onClick={() => setSelectedRow(row)}
                                            className="bg-[#2F2F2F] text-white text-xs px-3 py-1 rounded hover:bg-[#1A1A1A]"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Details Modal */}
            {selectedRow && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-4">Member Details</h2>
                        <div className="space-y-2">
                            {headers.map((key, idx) => (
                                <p key={idx} className="text-sm text-gray-700">
                                    <span className="font-semibold">{key}: </span>
                                    {selectedRow[key] || "-"}
                                </p>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setSelectedRow(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UniversalTable;
