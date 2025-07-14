import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

function Tool({ name, role, isLoggedIn }) {
    const navigate = useNavigate();
    const [accessChecked, setAccessChecked] = useState(false);

    useEffect(() => {
        console.log("🔁 useEffect Triggered");

        if (!isLoggedIn) {
            console.log("🚫 Not logged in – navigating to /");
            navigate("/");
            return;
        }

        if (!role) {
            console.log("⚠️ Role not yet available");
            return;
        }

        const roleTrimmed = role.toLowerCase().trim();
        console.log("🧪 roleTrimmed:", roleTrimmed);

        if (roleTrimmed !== "admin") {
            alert("❌ Access Denied. Admins Only.");
            navigate("/");
        } else {
            console.log("✅ Admin Verified – Access Granted");
            setAccessChecked(true);
        }
    }, [isLoggedIn, role, navigate]);

    if (!accessChecked) return null;

    const deleteTestExpenses = async () => {
        const enteredPassword = prompt("🔐 Enter Admin Password to confirm:");

        if (!enteredPassword || enteredPassword.trim() !== "Deep@krun22099") {
            alert("❌ Deletion Cancelled or Wrong Password.");
            return;
        }

        const db = getFirestore(app);
        const snapshot = await getDocs(collection(db, "expenses"));
        let deleted = 0;

        for (const document of snapshot.docs) {
            await deleteDoc(doc(db, "expenses", document.id));
            deleted++;
        }

        alert(`✅ Deleted ${deleted} entries.`);
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center py-10 px-4 relative">
            {/* 🔝 Header */}
            <div className="flex flex-col items-center mb-10">
                <img
                    src="/dsk_logo.png"
                    alt="DSK Procon"
                    className="w-20 sm:w-24 md:w-28 mb-4"
                />
                <h1 className="text-3xl font-bold text-[#1A1A1A] text-center">🧰 DSK Expense Tools</h1>
                <p className="text-sm text-gray-500 mt-1">by DSK Synapse</p>
            </div>

            {/* 🧹 Tool Button */}
            <button
                onClick={deleteTestExpenses}
                className="bg-gradient-to-br from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
            >
                🧹 Delete All Test Expenses
            </button>

            {/* ⚠ Warning */}
            <p className="mt-6 text-sm text-gray-600 text-center max-w-md">
                ⚠ This will permanently delete all entries from the <strong>expenses</strong> collection.
                Only use this tool for cleanup during testing or resets.
            </p>

            {/* 🔙 Back */}
            <button
                onClick={() => navigate("/home")}
                className="mt-10 bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition text-sm sm:text-base"
            >
                ⬅ Back to Home
            </button>
        </div>
    );
}

export default Tool;
