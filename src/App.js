// App.js
import React, { useState } from "react";
import Login from "./components/Login";
import Home from "./components/Home";
import "./index.css";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    return (
        <>
            {isLoggedIn ? (
                <Home onLogout={handleLogout} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </>
    );
}

export default App;


