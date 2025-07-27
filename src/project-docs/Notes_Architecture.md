\# DSK OneDesk – Architecture Notes



\## 🧱 Structure Philosophy



All modules in OneDesk follow a clear, universal pattern:



\- 🔁 Reusable universal components (layout, buttons, bell)

\- 🧩 Modular separation of Attendance, Expense, CRM...

\- 🔥 Firebase logic separated into per-system services

\- 🌐 Responsive UI across mobile, tablet, desktop



\## 📁 Core Folders



\- /components/universal → layout, notification, universal buttons

\- /components/Attendance → Register, Mark, View, Reports, Approval

\- /components/ExpenseDesk → Add, View, Approval, Ledger, Export

\- /firebase/modules → punchinService, expenseService, authService...

\- /project-docs → structure reference + dev guide



\## 🎯 Core Development Principles



1\. No logic should be repeated across modules

2\. Every screen must use UniversalLayout

3\. All system-wide behavior controlled from SettingsScreen

4\. Only approved styles and folder placements allowed



\## 📌 Maintainer Note



This architecture is actively enforced by:

\*\*Krunal Shah | Director, DSK Procon Pvt. Ltd.\*\*



