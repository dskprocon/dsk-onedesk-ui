import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebase/firebaseConfig";

const auth = getAuth(app);

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => onLogin())
            .catch((err) => setError("Invalid email or password"));
    };

    return (
        <div style={{ padding: "50px", maxWidth: "400px", margin: "auto" }}>
            <h2>DSK OneDesk Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px", margin: "10px 0" }}
            />
            <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
                Login
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Login;
