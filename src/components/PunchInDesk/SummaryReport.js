// src/components/PunchInDesk/SummaryReport.js
import React, { useEffect, useState } from "react";
import UniversalLayout from "../universal/UniversalLayout";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";

function SummaryReport({ name, role }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const snapshot = await getDocs(collection(db, "attendance"));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(list);
    };

    const exportToMatrix = () => {
        const grouped = {};

        data.forEach(entry => {
            const key = `${entry.personName}|${entry.category}|${entry.siteName || ""}|${entry.teamName || ""}`;
            if (!grouped[key]) {
                grouped[key] = {
                    Name: entry.personName,
                    Category: entry.category,
                    Site: entry.siteName || "-",
                    Team: entry.teamName || "-",
                    "Total Present": 0,
                    "Late Days": 0,
                    "Daily Salary": "",
                    "Total Salary": "",
                    PF: "",
                    days: {}
                };
            }
            grouped[key]["days"][entry.date] = entry.isLate ? "L" : "P";
            grouped[key]["Total Present"] += 1;
            if (entry.isLate) grouped[key]["Late Days"] += 1;
        });

        const allDates = [...new Set(data.map(e => e.date))].sort();

        const finalRows = Object.values(grouped).map(person => {
            const row = {
                Name: person.Name,
                Category: person.Category,
                Site: person.Site,
                Team: person.Team,
                "Total Present": person["Total Present"],
                "Late Days": person["Late Days"],
                "Daily Salary": "",
                "Total Salary": "",
                PF: ""
            };
            allDates.forEach(d => {
                row[d] = person.days[d] || "";
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(finalRows);

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!worksheet[cell_ref]) continue;

                worksheet[cell_ref].s = {
                    font: { name: "Segoe UI", sz: 11, bold: R === 0 },
                    alignment: { vertical: "center", horizontal: "center" },
                    fill: R === 0 ? { fgColor: { rgb: "D3D3D3" } } : {},
                    border: {
                        top: { style: "thin", color: { auto: 1 } },
                        bottom: { style: "thin", color: { auto: 1 } },
                        left: { style: "thin", color: { auto: 1 } },
                        right: { style: "thin", color: { auto: 1 } }
                    }
                };
            }
        }

        worksheet['!cols'] = new Array(range.e.c + 1).fill({ wch: 15 });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Matrix Report");

        XLSX.writeFile(workbook, `Attendance_Matrix_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    return (
        <UniversalLayout name={name} role={role}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-center mb-6">📊 Attendance Summary Report</h2>

                <div className="text-center">
                    <button
                        onClick={exportToMatrix}
                        className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-900"
                    >
                        📊 Export Monthly Matrix Report
                    </button>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default SummaryReport;
