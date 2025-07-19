// src/routes/PunchInRoutes.js
import React from "react";
import { Route } from "react-router-dom";
import PunchInDesk from "../components/PunchInDesk/PunchInDesk";
import RegisterMember from "../components/PunchInDesk/RegisterMember";

const punchInRoutes = (name, role) => (
  <>
    <Route path="/punch" element={<PunchInDesk name={name} role={role} />} />
    <Route path="/punch/register" element={<RegisterMember name={name} role={role} />} />
  </>
);

export default punchInRoutes;
