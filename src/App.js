// src/App.js
import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

// 🔐 Authentication Screens
import Login from "./components/Login";
import Home from "./components/Home";

// ⚙️ Admin Settings
import SettingsScreen from "./components/SettingsScreen";

// 🔁 Global Actions
import { setLogoutFunction } from "./utils/logoutHelper";
import { setGoHome, setGoBack } from "./utils/navigationHelper";
import { startAutoLogout } from "./utils/autoLogout";

// ✅ Route Functions that return JSX <Route> elements
import getExpenseRoutes from "./routes/ExpenseRoutes";
import getPunchInRoutes from "./routes/PunchInRoutes";

function App() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedLogin = sessionStorage.getItem("dsk_login_status");
    const storedRole = sessionStorage.getItem("dsk_login_role");
    const storedName = sessionStorage.getItem("dsk_login_name");

    if (storedLogin === "true" && storedRole && storedName) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
      setUserName(storedName);
    } else {
      setIsLoggedIn(false);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const stopTracking = startAutoLogout(() => {
      alert("🕒 You were inactive for 5 minutes. Auto-logged out.");
      handleLogout();
    }, 5 * 60 * 1000);

    return () => stopTracking();
  }, [isLoggedIn]);

  const handleLogin = ({ name, role }) => {
    setUserName(name);
    setUserRole(role);
    setIsLoggedIn(true);
    sessionStorage.setItem("dsk_login_status", "true");
    sessionStorage.setItem("dsk_login_name", name);
    sessionStorage.setItem("dsk_login_role", role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    setLogoutFunction(handleLogout);
    setGoHome(() => navigate("/home"));
    setGoBack(() => navigate(-1));
  }, [navigate]);

  return (
    <Routes>
      {/* 🔐 Login + Home */}
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
      <Route
        path="/home"
        element={<Home onLogout={handleLogout} name={userName} role={userRole} />}
      />

      {/* 💼 Expense Desk */}
      {getExpenseRoutes(userName, userRole, isLoggedIn)}

      {/* 🕴️ Punch In Desk */}
      {getPunchInRoutes(userName, userRole)}

      {/* ⚙️ Settings */}
      <Route path="/settings" element={<SettingsScreen />} />
    </Routes>
  );
}

export default App;
