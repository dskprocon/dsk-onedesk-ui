import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import app from "./firebaseConfig";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

const db = getFirestore(app);

// ✅ Fetch Expenses with Filters
export const fetchExpenses = async (person = null, fromDate = null, toDate = null) => {
    try {
        const baseQuery = person
            ? query(collection(db, "expenses"), where("person", "==", person))
            : collection(db, "expenses");

        const snapshot = await getDocs(baseQuery);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ✅ Convert and Filter by From/To Dates (stored as dd/mm/yyyy)
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);

            results = results.filter(item => {
                const [dd, mm, yyyy] = item.date.split("/");
                const expenseDate = new Date(`${yyyy}-${mm}-${dd}`);
                return expenseDate >= from && expenseDate <= to;
            });
        }

        // ✅ Sort by ascending date
        results.sort((a, b) => {
            const [ddA, mmA, yyyyA] = a.date.split("/");
            const [ddB, mmB, yyyyB] = b.date.split("/");
            return new Date(`${yyyyA}-${mmA}-${ddA}`) - new Date(`${yyyyB}-${mmB}-${ddB}`);
        });

        return results;
    } catch (err) {
        console.error("❌ fetchExpenses error:", err);
        return [];
    }
};

// ✅ For Approvals – Update status, save remark, and trigger notification
export const updateExpenseStatus = async (id, newStatus, remark) => {
    try {
        const ref = doc(db, "expenses", id);
        const snapshot = await getDoc(ref);
        const data = snapshot.data();

        await updateDoc(ref, {
            status: newStatus,
            adminRemark: remark || "",
            updatedAt: serverTimestamp()
        });

        const cleanUser = (data.person || "Unknown").trim();

        await addDoc(collection(db, "notifications"), {
            user: cleanUser,
            status: newStatus,
            expenseId: id,
            remark: remark || "",
            read: false,
            date: serverTimestamp()
        });

        return true;
    } catch (err) {
        console.error("❌ Failed to update status + notify:", err);
        return false;
    }
};

// ✅ Export Full Voucher Report (Excel + PDF)
export async function exportFullVoucherReport(data, fromDate, toDate) {
    const grouped = groupByPerson(data);
    const dateKey = toDate.replace(/-/g, "");

    // ✅ Master Sheet
    const masterSheet = XLSX.utils.json_to_sheet(data);
    const summaryData = summarizeData(data);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const wbMaster = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbMaster, masterSheet, "Master");
    XLSX.utils.book_append_sheet(wbMaster, summarySheet, "Summary");
    const masterBlob = workbookToBlob(wbMaster);
    saveAs(masterBlob, `${dateKey}_Master_Voucher_Report_Summary.xlsx`);

    // ✅ Personwise Excel + PDF
    for (const [person, entries] of Object.entries(grouped)) {
        const wb = XLSX.utils.book_new();
        const detailSheet = XLSX.utils.json_to_sheet(entries);
        XLSX.utils.book_append_sheet(wb, detailSheet, "Report");

        // Add Summary to Excel
        const summary = summarizeData(entries);
        const summarySheet = XLSX.utils.json_to_sheet(summary);
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

        const fileName = `${dateKey}_Voucher_Report_${person.replace(/\s+/g, "_")}`;
        const fileBlob = workbookToBlob(wb);
        saveAs(fileBlob, `${fileName}.xlsx`);

        // PDF Export using HTML Table
        const pdfHtml = buildPdfHtml(person, entries, summary);
        const pdfOpts = {
            filename: `${fileName}.pdf`,
            margin: 10,
            jsPDF: { format: "a4", orientation: "landscape" }
        };
        await html2pdf().set(pdfOpts).from(pdfHtml).save();
    }
}

// 🔧 Helper Functions
function groupByPerson(data) {
    const result = {};
    data.forEach(item => {
        const key = item.person || "Unknown";
        if (!result[key]) result[key] = [];
        result[key].push(item);
    });
    return result;
}

function summarizeData(data) {
    const map = {};
    data.forEach(row => {
        const key = `${row.person}|${row.siteName}|${row.category}`;
        if (!map[key]) {
            map[key] = {
                person: row.person,
                siteName: row.siteName,
                category: row.category,
                amount: 0
            };
        }
        map[key].amount += parseFloat(row.amount || 0);
    });
    return Object.values(map);
}

function workbookToBlob(wb) {
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; ++i) view[i] = wbout.charCodeAt(i) & 0xff;
    return new Blob([buf], { type: "application/octet-stream" });
}

function buildPdfHtml(person, entries, summaryRows) {
    let html = `<div style="font-family:Segoe UI;font-size:12px;padding:10px;">
        <h2 style="color:#1A237E;margin-bottom:6px;">${person} – Voucher Report</h2>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%;border-collapse:collapse;">
            <thead style="background-color:#1A237E;color:white;">
                <tr><th>Date</th><th>Account Head</th><th>Site</th><th>Expense Type</th><th>Amount</th><th>Paid To</th></tr>
            </thead><tbody>`;

    let total = 0;
    entries.forEach(row => {
        total += parseFloat(row.amount);
        html += `<tr>
            <td>${row.date}</td>
            <td>${row.person}</td>
            <td>${row.siteName}</td>
            <td>${row.category}</td>
            <td>₹${row.amount}</td>
            <td>${row.paidTo}</td>
        </tr>`;
    });

    html += `</tbody></table><br/><strong>Total: ₹${total.toFixed(2)}</strong><br/><br/>`;

    html += `<h3 style="color:#1A237E;margin-top:10px;">Summary</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%;border-collapse:collapse;">
        <thead style="background-color:#E0E0E0;">
            <tr><th>Person</th><th>Site</th><th>Expense Type</th><th>Amount</th></tr>
        </thead><tbody>`;

    summaryRows.forEach(row => {
        html += `<tr>
            <td>${row.person}</td>
            <td>${row.siteName}</td>
            <td>${row.category}</td>
            <td>₹${row.amount.toFixed(2)}</td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}
