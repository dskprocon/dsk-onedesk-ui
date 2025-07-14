import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";

import ExpenseMenu from "./components/ExpenseDesk/ExpenseMenu";
import AddExpense from "./components/ExpenseDesk/AddExpense";
import MyExpenses from "./components/ExpenseDesk/MyExpenses";
import ApprovalTab from "./components/ExpenseDesk/ApprovalTab";
import ExportTab from "./components/ExpenseDesk/ExportTab";
import BatchUpload from "./components/ExpenseDesk/BatchUpload";

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
                        {/* 🟢 Login + Home Routing */}
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
                                element={
                                        <Home onLogout={handleLogout} name={userName} role={userRole} />
                                }
                        />

                        {/* 📦 Expense Desk Routes */}
                        <Route path="/expense" element={<ExpenseMenu />} />
                        <Route path="/expense/add" element={<AddExpense name={userName} role={userRole} />} />
                        <Route path="/expense/my" element={<MyExpenses name={userName} role={userRole} />} />
                        <Route path="/expense/approval" element={<ApprovalTab />} />
                        <Route path="/expense/export" element={<ExportTab />} />
                        <Route path="/expense/batch" element={<BatchUpload name={userName} role={userRole} />} />

                        {/* ⚙️ Settings */}
                        <Route path="/settings" element={<SettingsScreen />} />
                </Routes>
        );
}

export default App;
