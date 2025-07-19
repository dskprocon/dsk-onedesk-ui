// src/routes/ExpenseRoutes.js
import React from "react";
import { Route } from "react-router-dom";
import ExpenseDesk from "../components/ExpenseDesk/ExpenseDesk";
import AddExpense from "../components/ExpenseDesk/AddExpense";
import MyExpenses from "../components/ExpenseDesk/MyExpenses";
import ApprovalTab from "../components/ExpenseDesk/ApprovalTab";
import ExportTab from "../components/ExpenseDesk/ExportTab";
import BatchUpload from "../components/ExpenseDesk/BatchUpload";
import AddPayment from "../components/ExpenseDesk/AddPayment";
import ViewLedger from "../components/ExpenseDesk/ViewLedger";
import Tool from "../components/ExpenseDesk/Tool";

const expenseRoutes = (name, role, isLoggedIn) => (
  <>
    <Route path="/expense" element={<ExpenseDesk name={name} role={role} />} />
    <Route path="/expense/add" element={<AddExpense name={name} role={role} />} />
    <Route path="/expense/my" element={<MyExpenses name={name} role={role} />} />
    <Route path="/expense/approval" element={<ApprovalTab name={name} role={role} />} />
    <Route path="/expense/export" element={<ExportTab name={name} role={role} />} />
    <Route path="/expense/batch" element={<BatchUpload name={name} role={role} />} />
    <Route path="/expense/payment" element={<AddPayment name={name} role={role} />} />
    <Route path="/expense/ledger" element={<ViewLedger name={name} role={role} />} />
    <Route path="/expense/tools" element={<Tool name={name} role={role} isLoggedIn={isLoggedIn} />} />
  </>
);

export default expenseRoutes;
