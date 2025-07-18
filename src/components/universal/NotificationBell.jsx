import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";

function NotificationBell({ userName = "", role = "" }) {
        const db = getFirestore(app);
        const [notifications, setNotifications] = useState([]);
        const [showDropdown, setShowDropdown] = useState(false);
        const unread = notifications.some(n => !n.read);

        useEffect(() => {
                const fetchNotifications = async () => {
                        if (!userName || role === "admin") return;
                        const q = query(
                                collection(db, "notifications"),
                                where("user", "==", userName),
                                orderBy("date", "desc")
                        );
                        const snapshot = await getDocs(q);
                        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setNotifications(data.slice(0, 10));
                };
                fetchNotifications();
        }, [db, userName]);

        const markAllAsRead = async () => {
                const updates = notifications.filter(n => !n.read);
                for (const noti of updates) {
                        const ref = doc(db, "notifications", noti.id);
                        await updateDoc(ref, { read: true });
                }
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        };

        return (
                <div className="relative">
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
        );
}

export default NotificationBell;
