// src/components/Home.js

import React, { useEffect, useState } from "react";
import UniversalLayout from "./universal/UniversalLayout";
import UniversalButton from "./universal/UniversalButton";
import NotificationBell from "./universal/NotificationBell";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { format } from "date-fns";

function Home({ onLogout, role, name }) {
        const isAdmin = role?.toUpperCase() === "ADMIN";
        const [markedToday, setMarkedToday] = useState(null);

        useEffect(() => {
                const checkAttendance = async () => {
                        const today = format(new Date(), "dd-MM-yyyy");
                        const q = query(
                                collection(db, "attendance"),
                                where("personName", "==", name),
                                where("date", "==", today)
                        );
                        const snapshot = await getDocs(q);
                        setMarkedToday(!snapshot.empty);
                };

                if (name) checkAttendance();
        }, [name]);

        return (
                <UniversalLayout onLogout={onLogout} role={role} name={name} hideNavButtons={true}>
                        {/* 🔔 Notification Bell */}
                        <div className="absolute top-5 left-5 z-50">
                                <NotificationBell userName={name} role={role} />
                        </div>

                        {/* 📦 Main Menu Buttons */}
                        <div className="flex-1 flex items-center justify-center mt-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl px-4">
                                        <UniversalButton to="/expense" icon="💼" label="Expense Desk" />
                                        <UniversalButton
                                                to="/punch"
                                                icon="🕴️"
                                                label="Punch In Desk"
                                                dotColor={markedToday === true ? "green" : markedToday === false ? "red" : null}
                                        />

                                        {isAdmin && (
                                                <>
                                                        <UniversalButton to="/crm" icon="📊" label="Project CRM" />
                                                        <UniversalButton to="/partition" icon="📁" label="Partition System" />
                                                        <UniversalButton to="/ceiling" icon="🧱" label="Ceiling System" />
                                                        <UniversalButton to="/control" icon="⚙️" label="Control Desk" />
                                                </>
                                        )}
                                </div>
                        </div>
                </UniversalLayout>
        );
}

export default Home;
