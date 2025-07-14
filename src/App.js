import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

// 🔐 Authentication Screens
import Login from "./components/Login";
import Home from "./components/Home";

// 💼 Expense Desk Screens
import ExpenseDesk from "./components/ExpenseDesk/ExpenseDesk";
import AddExpense from "./components/ExpenseDesk/AddExpense";
import MyExpenses from "./components/ExpenseDesk/MyExpenses";
import ApprovalTab from "./components/ExpenseDesk/ApprovalTab";
import ExportTab from "./components/ExpenseDesk/ExportTab";
import BatchUpload from "./components/ExpenseDesk/BatchUpload";
import Tool from "./components/ExpenseDesk/Tool";

// ⚙️ Admin Settings
import SettingsScreen from "./components/SettingsScreen";

// 🔁 Global Actions
import { setLogoutFunction } from "./utils/logoutHelper";
import { setGoHome, setGoBack } from "./utils/navigationHelper";

function App() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");

    // 🔁 Load login info from localStorage
    useEffect(() => {
        const storedLogin = localStorage.getItem("dsk_login_status");
        const storedRole = localStorage.getItem("dsk_login_role");
        const storedName = localStorage.getItem("dsk_login_name");

        if (storedLogin === "true" && storedRole && storedName) {
            setIsLoggedIn(true);
            setUserRole(storedRole);
            setUserName(storedName);
        }
    }, []);

    // 🔐 Inactivity Auto-Logout after 5 minutes
    useEffect(() => {
        let timer;

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                alert("🕒 You were inactive for 5 minutes. Auto-logged out.");
                handleLogout();
            }, 5 * 60 * 1000); // 5 minutes
        };

        if (isLoggedIn) {
            window.addEventListener("mousemove", resetTimer);
            window.addEventListener("keydown", resetTimer);
            window.addEventListener("click", resetTimer);
            resetTimer();
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
        };
    }, [isLoggedIn]);

    // 🔑 Login Handler
    const handleLogin = ({ name, role }) => {
        setUserName(name);
        setUserRole(role);
        setIsLoggedIn(true);

        localStorage.setItem("dsk_login_status", "true");
        localStorage.setItem("dsk_login_name", name);
        localStorage.setItem("dsk_login_role", role);
    };

    // 🔓 Logout Handler
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");

        localStorage.removeItem("dsk_login_status");
        localStorage.removeItem("dsk_login_name");
        localStorage.removeItem("dsk_login_role");

        navigate("/");
    };

    // 🔁 Setup global functions
    useEffect(() => {
        setLogoutFunction(handleLogout);
        setGoHome(() => navigate("/home"));
        setGoBack(() => navigate("/expense"));
    }, [navigate]);

    return (
        <Routes>
            {/* 🔐 Login + Home Routing */}
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

            {/* 🏠 Permanent Home Route for Navigation */}
            <Route
                path="/home"
                element={<Home onLogout={handleLogout} name={userName} role={userRole} />}
            />

            {/* 💼 Expense Desk Routes */}
            <Route path="/expense" element={<ExpenseDesk name={userName} role={userRole} />} />
            <Route path="/expense/add" element={<AddExpense name={userName} role={userRole} />} />
            <Route path="/expense/my" element={<MyExpenses name={userName} role={userRole} />} />
            <Route path="/expense/approval" element={<ApprovalTab name={userName} role={userRole} />} />
            <Route path="/expense/export" element={<ExportTab />} />
            <Route path="/expense/batch" element={<BatchUpload name={userName} role={userRole} />} />
            <Route
                path="/expense/tools"
                element={<Tool name={userName} role={userRole} isLoggedIn={isLoggedIn} />}
            />

            {/* ⚙️ Settings */}
            <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
    );
}

export default App;
