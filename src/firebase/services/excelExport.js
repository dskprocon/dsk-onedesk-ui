import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ✅ Final Export Voucher Report with Perfect Formatting
export async function exportFullVoucherReport(data, fromDate, toDate) {
    const grouped = {};
    data.forEach(e => {
        if (!grouped[e.person]) grouped[e.person] = [];
        grouped[e.person].push(e);
    });

    const dateKey = toDate.replace(/-/g, "");
    const wbMaster = new ExcelJS.Workbook();
    const master = wbMaster.addWorksheet("Master", {
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 }
    });
    const summary = wbMaster.addWorksheet("Summary", {
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 }
    });

    const headerStyle = {
        font: { bold: true, color: { argb: "FFFFFF" } },
        alignment: { horizontal: "center" },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1A237E" } },
        border: borderAll()
    };

    const headers = [
        { header: "Date of Expense", key: "date" },
        { header: "Account Head", key: "person" },
        { header: "Site Name", key: "siteName" },
        { header: "Type Of Expense", key: "category" },
        { header: "Amount", key: "amount" },
        { header: "Paid To", key: "paidTo" }
    ];

    master.columns = headers.map(col => ({ ...col, width: 30 }));
    master.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
    data.forEach(e => {
        const row = master.addRow({
            date: e.date,
            person: capitalizeWords(e.person),
            siteName: capitalizeWords(e.siteName),
            category: e.category,
            amount: e.amount,
            paidTo: e.paidTo
        });
        row.eachCell(cell => cell.border = borderAll());
    });

    const total = data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalRow = master.addRow(["", "", "", "Final Total", total, ""]);
    totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = borderAll();
        cell.alignment = {
            horizontal: colNumber === 5 ? "right" : "center",
            vertical: "middle"
        };
    });
    autoFitColumns(master);

    const summaryMap = {};
    for (const e of data) {
        const key = `${e.person}|${e.siteName}|${e.category}`;
        if (!summaryMap[key]) {
            summaryMap[key] = {
                person: capitalizeWords(e.person),
                site: capitalizeWords(e.siteName),
                category: e.category,
                amount: 0
            };
        }
        summaryMap[key].amount += parseFloat(e.amount || 0);
    }

    summary.columns = [
        { header: "Account Head", key: "person" },
        { header: "Site Name", key: "site" },
        { header: "Type Of Expense", key: "category" },
        { header: "Amount", key: "amount" }
    ];
    summary.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
    Object.values(summaryMap).forEach(r => {
        const row = summary.addRow(r);
        row.eachCell(cell => cell.border = borderAll());
    });
    const sumRow = summary.addRow(["", "", "Final Total", total]);
    sumRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = borderAll();
        cell.alignment = {
            horizontal: colNumber === 4 ? "right" : "center",
            vertical: "middle"
        };
    });
    autoFitColumns(summary);

    const masterBlob = await wbMaster.xlsx.writeBuffer();
    saveAs(new Blob([masterBlob]), `${dateKey}_Master_Voucher_Report_Summary.xlsx`);

    // 🔹 Personwise Reports
    for (const [person, rows] of Object.entries(grouped)) {
        const wb = new ExcelJS.Workbook();
        const sheet = wb.addWorksheet("Report", {
            pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 }
        });

        const add = r => sheet.addRow(r);
        const blank = () => add([]);

        // Section 1: Master Entries
        add(headers.map(h => h.header));
        sheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

        rows.forEach(e => {
            const row = add([
                e.date,
                capitalizeWords(e.person),
                capitalizeWords(e.siteName),
                e.category,
                e.amount,
                e.paidTo
            ]);
            row.eachCell(cell => cell.border = borderAll());
        });

        const personTotal = rows.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
        const totalRow1 = add(["", "", "", "Total", personTotal, ""]);
        totalRow1.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.border = borderAll();
            cell.alignment = {
                horizontal: colNumber === 5 ? "right" : "center",
                vertical: "middle"
            };
        });

        blank(); blank();

        // Section 2: Category Summary
        const map = {};
        rows.forEach(e => {
            const key = `${e.person}|${e.siteName}|${e.category}`;
            if (!map[key]) map[key] = {
                person: capitalizeWords(e.person),
                site: capitalizeWords(e.siteName),
                category: e.category,
                amount: 0
            };
            map[key].amount += parseFloat(e.amount || 0);
        });

        add(["Account Head", "Site Name", "Type Of Expense", "Amount"]);
        sheet.getRow(sheet.lastRow.number).eachCell(cell => Object.assign(cell, headerStyle));
        Object.values(map).forEach(r => {
            const row = add([r.person, r.site, r.category, r.amount]);
            row.eachCell(cell => cell.border = borderAll());
        });

        const totalRow2 = add(["", "", "Total", personTotal]);
        totalRow2.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.border = borderAll();
            cell.alignment = {
                horizontal: colNumber === 4 ? "right" : "center",
                vertical: "middle"
            };
        });

        blank(); blank();

        // Section 3: Site Total
        const siteMap = {};
        rows.forEach(e => {
            const site = capitalizeWords(e.siteName);
            siteMap[site] = (siteMap[site] || 0) + parseFloat(e.amount || 0);
        });

        add(["Site Name", "Amount"]);
        sheet.getRow(sheet.lastRow.number).eachCell(cell => Object.assign(cell, headerStyle));
        Object.entries(siteMap).forEach(([s, amt]) => {
            const row = add([s, amt]);
            row.eachCell(cell => cell.border = borderAll());
        });

        const totalRow3 = add(["Total", personTotal]);
        totalRow3.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.border = borderAll();
            cell.alignment = {
                horizontal: colNumber === 2 ? "right" : "center",
                vertical: "middle"
            };
        });

        const finalRow = add(["Final Total", personTotal]);
        finalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.border = borderAll();
            cell.alignment = {
                horizontal: colNumber === 2 ? "right" : "center",
                vertical: "middle"
            };
        });

        autoFitColumns(sheet);

        const fileBlob = await wb.xlsx.writeBuffer();
        saveAs(new Blob([fileBlob]), `${dateKey}_Voucher_Report_${capitalizeWords(person).replace(/\s+/g, "_")}.xlsx`);
    }
}

// ✅ Border for all sides
function borderAll() {
    return {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
    };
}

// ✅ Auto-fit columns based on longest value
function autoFitColumns(ws) {
    ws.columns.forEach(col => {
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, cell => {
            const val = cell.value ? cell.value.toString() : "";
            if (val.length > maxLength) maxLength = val.length;
        });
        col.width = maxLength + 2;
    });
}

// ✅ Capitalize first letter of each word
function capitalizeWords(str) {
    return (str || "").toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// 🔁 Helper (Optional but retained as backup)
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
