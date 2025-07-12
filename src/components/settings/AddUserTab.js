import React, { useState } from "react";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";

function AddUserTab() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user");
    const db = getFirestore(app);

    const handleAddUser = async () => {
        if (!email.trim() || !name.trim()) return alert("❌ All fields are required");
        try {
            await setDoc(doc(db, "users", email), {
                name,
                role,
                email,
                createdAt: new Date(),
            });
            alert("✅ User added successfully");
            setEmail("");
            setName("");
            setRole("user");
        } catch (err) {
            console.error("❌ Error adding user:", err);
            alert("❌ Failed to add user");
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">📧 Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="user@example.com"
            />

            <label className="block text-sm font-medium text-gray-700">🧑 Name</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Full name"
            />

            <label className="block text-sm font-medium text-gray-700">🎯 Role</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            <button
                onClick={handleAddUser}
                className="bg-[#1A237E] text-white px-4 py-2 rounded hover:bg-[#0f164e]"
            >
                ➕ Add User
            </button>
        </div>
    );
}

export default AddUserTab;
