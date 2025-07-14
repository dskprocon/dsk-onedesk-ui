import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../firebase/firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", email));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;
                const name = userData.name;
                onLogin({ email, name, role });
            } else {
                setError("⚠️ User role not found in Firestore.");
            }
        } catch (err) {
            console.error(err);
            setError("❌ Invalid email or password.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-start items-center px-4 pt-[8vh] pb-8">
                {/* 🔷 Logo */}
                <img src="/dsk_logo.png" alt="DSK Logo" className="w-24 h-24 mb-3" />

                {/* 🔷 Heading */}
                <h1 className="text-3xl font-bold text-[#1F1F1F] text-center">OneDesk Pro</h1>
                <p className="text-sm text-gray-600 mb-6 text-center">by DSK Procon</p>

            {/* 🔷 Login Box */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm space-y-4 mt-2">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-4 py-2 border border-[#C2C2C2] rounded bg-[#EAEAEA] text-sm"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-4 py-2 border border-[#C2C2C2] rounded bg-[#EAEAEA] text-sm"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-[#1F1F1F] text-white py-2 rounded hover:bg-[#3A3A3A] font-semibold transition"
                >
                    🔓 Login
                </button>
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </div>

            {/* 🔷 Footer */}
            <div className="mt-auto pt-8 text-sm text-gray-500 text-center">
                Made by DSK Synapse
            </div>
        </div>
    );
}

export default Login;
