import React from "react";
import UniversalLayout from "./universal/UniversalLayout";
import UniversalButton from "./universal/UniversalButton";
import NotificationBell from "./universal/NotificationBell";

function Home({ onLogout, role, name }) {
        const isAdmin = role?.toUpperCase() === "ADMIN";

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
                                        <UniversalButton to="/punch" icon="🕴️" label="Punch In Desk" />

                                        {isAdmin && (
                                                <>
                                                        <UniversalButton to="/crm" icon="📊" label="Project CRM" />
                                                        <UniversalButton to="/partition" icon="📁" label="Partition System" />
                                                        <UniversalButton to="/ceiling" icon="🧱" label="Ceiling System" />
                                                        <UniversalButton to="/settings" icon="⚙️" label="Settings / Export" />
                                                </>
                                        )}
                                </div>
                        </div>
                </UniversalLayout>
        );
}

export default Home;
