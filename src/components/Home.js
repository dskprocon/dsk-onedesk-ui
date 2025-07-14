import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import app from "../firebase/firebaseConfig";

function Home({ onLogout, role, name }) {
    const db = getFirestore(app);
    const isAdmin = role === "admin";

    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unread = notifications.some(n => !n.read);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!name || isAdmin) return;
            const q = query(
                collection(db, "notifications"),
                where("user", "==", name),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(data.slice(0, 10));
        };
        fetchNotifications();
    }, [db, name]);

    const markAllAsRead = async () => {
        const updates = notifications.filter(n => !n.read);
        for (const noti of updates) {
            const ref = doc(db, "notifications", noti.id);
            await updateDoc(ref, { read: true });
        }
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] flex flex-col justify-between pt-6 pb-10 px-4 relative">
            {/* 🔒 Logout */}
            <button
                onClick={onLogout}
                className="absolute top-5 right-5 bg-[#2F2F2F] text-white text-sm px-3 py-1.5 rounded-full hover:bg-[#505050] transition z-50"
            >
                🔒 Logout
            </button>

            {/* 🔔 Notification Bell (Visible to ALL) */}
            <div className="absolute top-5 left-5 z-50">
                <button
                    onClick={() => {
                        setShowDropdown(!showDropdown);
                        markAllAsRead();
                    }}
                    className="relative text-2xl bg-white px-2 py-1 rounded shadow"
                >
                    🔔
                    {unread && (
                        <span className="absolute top-0 right-0 bg-red-600 w-2 h-2 rounded-full"></span>
                    )}
                </button>
                {showDropdown && (
                    <div className="absolute mt-2 w-72 bg-white border rounded shadow-lg z-50 p-2 text-sm">
                        <h3 className="font-semibold mb-2">Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500">No notifications</p>
                        ) : (
                            <ul className="space-y-1 max-h-60 overflow-auto">
                                {notifications.map((n, idx) => (
                                    <li key={idx} className="border-b pb-1 text-gray-700">
                                        <p>
                                            Your expense dated{" "}
                                            <span className="font-semibold">
                                                {n.date?.toDate?.().toLocaleDateString?.() || "[Date]"}
                                            </span>{" "}
                                            was{" "}
                                            <span
                                                className={
                                                    n.status === "approved"
                                                        ? "text-green-600 font-semibold"
                                                        : "text-red-600 font-semibold"
                                                }
                                            >
                                                {n.status.toUpperCase()}
                                            </span>
                                            {n.status === "rejected" && n.remark && (
                                                <span className="text-gray-500">
                                                    {" "}– Remark: '{n.remark}'
                                                </span>
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* 🔝 Header */}
            <div className="flex flex-col items-center mt-4 w-full max-w-screen-sm mx-auto px-4 text-center">
                <img src="/dsk_logo.png" alt="DSK Procon" className="w-20 sm:w-24 md:w-28 mb-4" />
                <h1 className="text-3xl font-bold text-[#1A1A1A]">OneDesk Pro</h1>
                <p className="text-sm text-gray-500 mt-1">by DSK Procon</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2F2F2F] mt-3">{name}</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Role: {role.toUpperCase()}</p>
            </div>

            {/* 📦 Module Buttons */}
            <div className="flex flex-1 items-center justify-center mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mx-auto px-4">
                    {/* Always Visible */}
                    <Link
                        to="/expense"
                        className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                    >
                        💼 Expense Desk
                    </Link>

                    {/* Admin-Only Buttons */}
                    {isAdmin && (
                        <>
                            <Link
                                to="/attendance"
                                className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                            >
                                🧑‍💼 Attendance
                            </Link>
                            <Link
                                to="/crm"
                                className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                            >
                                📊 Project CRM
                            </Link>
                            <Link
                                to="/partition"
                                className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                            >
                                📁 Partition System
                            </Link>
                            <Link
                                to="/ceiling"
                                className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                            >
                                🧱 Ceiling System
                            </Link>
                            <Link
                                to="/settings"
                                className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-xl text-base sm:text-lg font-semibold text-center hover:scale-105 hover:shadow-2xl transition-all duration-200"
                            >
                                ⚙️ Settings / Export
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* 🔻 Footer */}
            <div className="mt-10 text-sm text-center text-gray-500 px-4">
                Made by <span className="font-semibold">DSK Synapse</span>
            </div>
        </div>
    );
}

export default Home;
