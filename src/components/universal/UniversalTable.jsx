// src/components/universal/UniversalTable.jsx

import React from "react";

function UniversalTable({ headers = [], rows = [] }) {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-400">
            <table className="w-full text-[15px] text-gray-800 border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-5 py-3 text-left uppercase tracking-wide text-[13px] font-bold text-gray-600 border-b border-r border-gray-400"
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
                                colSpan={headers.length}
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
                                {headers.map((key, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-5 py-3 align-top text-gray-800 whitespace-pre-line border-r border-gray-300"
                                    >
                                        {row[key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UniversalTable;
