import React from "react";
import { Route } from "react-router-dom";
import ControlDesk from "../components/ControlDesk/ControlDesk";
import AddMember from "../components/ControlDesk/AddMember";
import RegisterApproval from "../components/ControlDesk/RegisterApproval";
import AddSite from "../components/ControlDesk/AddSite";
import ManageMembers from "../components/ControlDesk/ManageMembers";
import MemberDetails from "../components/ControlDesk/MemberDetails";
import BulkAssignSiteTeam from "../components/ControlDesk/BulkAssignSiteTeam";
import AssignSiteTeam from "../components/ControlDesk/AssignSiteTeam"; // ✅ MISSING IMPORT

const controlRoutes = (name, role) => (
    <>
        <Route path="/control" element={<ControlDesk name={name} role={role} />} />
        <Route path="/control/add-member" element={<AddMember name={name} role={role} />} />
        <Route path="/control/manage-members" element={<ManageMembers name={name} role={role} />} />
        <Route path="/control/member/:id" element={<MemberDetails name={name} role={role} />} />
        <Route path="/control/add-site" element={<AddSite name={name} role={role} />} />
        <Route path="/control/register-approval" element={<RegisterApproval name={name} role={role} />} />
        <Route path="/control/assign-multi" element={<BulkAssignSiteTeam name={name} role={role} />} />
        <Route path="/control/assign-site/:id" element={<AssignSiteTeam name={name} role={role} />} /> {/* ✅ ADD THIS */}
    </>
);

export default controlRoutes;
