// src/routes/PunchInRoutes.js
import React from "react";
import { Route } from "react-router-dom";
import PunchInDesk from "../components/PunchInDesk/PunchInDesk";
import RegisterMember from "../components/PunchInDesk/RegisterMember";
import RegisterApproval from "../components/PunchInDesk/RegisterApproval"; 
import MarkAttendance from "../components/PunchInDesk/MarkAttendance";
import ApproveAttendance from "../components/PunchInDesk/ApproveAttendance";
import SummaryReport from "../components/PunchInDesk/SummaryReport";
import ViewAttendance from "../components/PunchInDesk/ViewAttendance";
import ManageUsers from "../components/PunchInDesk/ManageUsers";

const punchInRoutes = (name, role) => (
  <>
    <Route path="/punch" element={<PunchInDesk name={name} role={role} />} />
    <Route path="/punch/register" element={<RegisterMember name={name} role={role} />} />
    <Route path="/punch/approval" element={<RegisterApproval name={name} role={role} />} />
    <Route path="/punch/mark" element={<MarkAttendance name={name} role={role} />} />
    <Route path="/punch/att-approval" element={<ApproveAttendance name={name} role={role} />} />
    <Route path="/punch/report" element={<SummaryReport name={name} role={role} />} />
    <Route path="/punch/view" element={<ViewAttendance name={name} role={role} />} />
    <Route path="/punch/manage-users" element={<ManageUsers name={name} role={role} />} />
  </>
);

export default punchInRoutes;