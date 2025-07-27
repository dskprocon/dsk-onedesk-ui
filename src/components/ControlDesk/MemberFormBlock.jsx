// src/components/ControlDesk/MemberFormBlock.jsx

import React from "react";

function MemberFormBlock({ index, member, category, onChange, onRemove, showRemove }) {
    const handleFileChange = (field, file) => {
        onChange(index, field, file);
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 mb-6 shadow-sm bg-white">
            <h4 className="text-lg font-semibold mb-3">👤 Member {index + 1}</h4>

            {/* Name */}
            <input
                type="text"
                placeholder="Full Name"
                value={member.personName}
                onChange={(e) => onChange(index, "personName", e.target.value)}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />

            {/* Designation – Only for Head Office */}
            {category === "Head Office" && (
                <input
                    type="text"
                    placeholder="Designation"
                    value={member.designation}
                    onChange={(e) => onChange(index, "designation", e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
                />
            )}

            {/* Address Fields */}
            <input
                type="text"
                placeholder="Address Line 1"
                value={member.addressLine1}
                onChange={(e) => onChange(index, "addressLine1", e.target.value)}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />
            <input
                type="text"
                placeholder="Address Line 2"
                value={member.addressLine2}
                onChange={(e) => onChange(index, "addressLine2", e.target.value)}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />
            <input
                type="text"
                placeholder="Address Line 3"
                value={member.addressLine3}
                onChange={(e) => onChange(index, "addressLine3", e.target.value)}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />

            {/* Aadhaar Number – with auto-format */}
            <input
                type="text"
                placeholder="Aadhaar Number (xxxx-xxxx-xxxx)"
                value={member.aadhaarNumber}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                    const formatted = raw.replace(/(\d{4})(\d{4})(\d{0,4})/, "$1-$2-$3").trim();
                    onChange(index, "aadhaarNumber", formatted);
                }}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />

            {/* PAN Number – Only for Head Office */}
            {category === "Head Office" && (
                <input
                    type="text"
                    placeholder="PAN Number (e.g., ABCDE1234F)"
                    value={member.panNumber}
                    onChange={(e) => onChange(index, "panNumber", e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
                />
            )}

            {/* Mobile */}
            <input
                type="text"
                placeholder="Mobile Number"
                value={member.mobileNumber}
                onChange={(e) => onChange(index, "mobileNumber", e.target.value)}
                className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
            />

            {/* Email + Password + Role – Only for Head Office */}
            {category === "Head Office" && (
                <>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={member.email}
                        onChange={(e) => onChange(index, "email", e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={member.password}
                        onChange={(e) => onChange(index, "password", e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
                    />
                    <select
                        value={member.role}
                        onChange={(e) => onChange(index, "role", e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded mb-3"
                    >
                        <option value="">Select Role</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="VIEWER">VIEWER</option>
                    </select>
                </>
            )}

            {/* Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Aadhaar Card *</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("aadhaar", e.target.files[0])}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Photo *</label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("photo", e.target.files[0])}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">PF Declaration</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("pf", e.target.files[0])}
                        className="w-full border border-gray-400 px-3 py-2 rounded"
                    />
                </div>

                {category === "Head Office" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">PAN Card *</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange("pan", e.target.files[0])}
                            className="w-full border border-gray-400 px-3 py-2 rounded"
                        />
                    </div>
                )}
            </div>

            {/* Remove Member */}
            {showRemove && (
                <div className="text-right pt-2">
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-sm text-red-600 font-medium underline"
                    >
                        ❌ Remove
                    </button>
                </div>
            )}
        </div>
    );
}

export default MemberFormBlock;
