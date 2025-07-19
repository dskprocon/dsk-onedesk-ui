// src/components/PunchInDesk/RegisterMember.js
import React, { useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { triggerGoHome, triggerGoBack } from "../../utils/navigationHelper";

function RegisterMember({ name, role }) {
  const [category, setCategory] = useState("Head Office");

  return (
    <UniversalLayout name={name} role={role}>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">👤 Register Member</h1>

        <label className="block text-lg font-semibold mb-2">Select Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-60 p-2 border rounded mb-6"
        >
          <option>Head Office</option>
          <option>Site</option>
        </select>

        {category === "Head Office" ? (
          <div className="space-y-4">
            <input type="text" placeholder="Person Name" className="w-full border p-2 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <input type="file" className="border p-2 rounded" />
              <input type="file" className="border p-2 rounded" />
              <input type="file" className="border p-2 rounded" />
              <input type="file" className="border p-2 rounded" />
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-xl mt-4">📥 Register</button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" placeholder="Site Name" className="w-full border p-2 rounded" />
            <input type="text" placeholder="Team Name" className="w-full border p-2 rounded" />
            <div className="mt-4 bg-gray-100 p-4 rounded">
              <p className="text-gray-600 italic">➕ Multiple member input coming soon...</p>
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-xl mt-4">📥 Register Team</button>
          </div>
        )}

        <div className="mt-10 flex justify-center gap-6">
          <button onClick={triggerGoBack} className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base">
            🔙 Back
          </button>
          <button onClick={triggerGoHome} className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-8 py-2.5 rounded-xl shadow text-base">
            🏠 Home
          </button>
        </div>
      </div>
    </UniversalLayout>
  );
}

export default RegisterMember;
