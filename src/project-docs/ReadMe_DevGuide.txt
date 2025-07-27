DSK OneDesk – Developer Structure Guide
----------------------------------------

This guide is for all future contributors and team members.

✅ Universal Folder System
• All systems (Attendance, Expense, CRM, etc.) follow modular structure
• No files allowed directly in src/ — every feature must be in its folder

✅ Firebase Folder Policy
• All logic placed inside /firebase/modules/<system>
• Example: punchinService.js, expenseService.js, crmService.js

✅ UI Layout Standard
• Every screen uses UniversalLayout.jsx
• Top: DSK Logo + Title
• Bottom: 🏠 Home + 🔙 Back
• Top-right: 🔒 Logout (black pill)
• Top-left: 🔔 NotificationBell

✅ Input Styling Rule
• Use: className="w-full border border-gray-400 px-3 py-2 rounded"
• Applies to all input, dropdown, file upload, remarks box

✅ Project File Audit
• Refer: FolderStructureMap.xlsx
• Last generated: 24 July 2025

Maintainer: Krunal Shah
