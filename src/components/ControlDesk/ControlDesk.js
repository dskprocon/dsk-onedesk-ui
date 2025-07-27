// src/components/ControlDesk/ControlDesk.js

import React from "react";
import { useNavigate } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalButton from "../universal/UniversalButton";

function ControlDesk({ name, role }) {
    const navigate = useNavigate();

    const controlModules = [
        { label: "Add Member", path: "/control/add-member", icon: "🧑‍💼" },
        { label: "Manage Members", path: "/control/manage-members", icon: "🧑‍💼" },
        { label: "Add Site", path: "/control/add-site", icon: "🏗️" },
        { label: "Assign Site / Team", path: "/control/assign-multi", icon: "🗂️" }, // ✅ replaced
        { label: "Approval", path: "/control/register-approval", icon: "✅" },
    ];

    return (
        <UniversalLayout
            title="Control Desk"
            subtext="Central admin panel for members, sites, and CRM"
            name={name}
            role={role}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-4 mt-10 justify-center">
                {controlModules.map((mod) => (
                    <UniversalButton
                        key={mod.path}
                        to={mod.path}
                        icon={mod.icon}
                        label={mod.label}
                    />
                ))}
            </div>
        </UniversalLayout>
    );
}

export default ControlDesk;
