import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../firebase/firebaseConfig"; // adjust if needed

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

    return (
        <div style={{ padding: "50px", maxWidth: "400px", margin: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>DSK OneDesk Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <button onClick={handleLogin} style={{ padding: "10px 20px", width: "100%" }}>
                Login
            </button>
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
    );
}

export default Login;
