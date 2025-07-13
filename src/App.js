import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ExpenseDesk from "./components/ExpenseDesk/ExpenseDesk";
import SettingsScreen from "./components/SettingsScreen";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");

    const handleLogin = ({ name, role }) => {
        setUserName(name);
        setUserRole(role);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
    };

    return (
        <Routes>
            <Route
                path="/"
                element={
                    isLoggedIn ? (
                        <Home onLogout={handleLogout} name={userName} role={userRole} />
                    ) : (
                        <Login onLogin={handleLogin} />
                    )
                }
            />
            <Route path="/expense" element={<ExpenseDesk name={userName} role={userRole} />} />
            <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
    );
}

export default App;
