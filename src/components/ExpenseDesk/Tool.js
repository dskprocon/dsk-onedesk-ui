import React, { useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

function Tool({ name, role }) {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🔐 Checking role:", role);
        // if (role?.toLowerCase() !== "admin") {
        //     alert("❌ Access Denied. Admins Only.");
        //     navigate("/");
        // }
    }, [role, navigate]);

    const deleteTestExpenses = async () => {
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">🧰 DSK Expense Tools</h1>

            <button
                onClick={deleteTestExpenses}
                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition"
            >
                🧹 Delete All Test Expenses (Abhishek Vishwakarma)
            </button>

            <p className="mt-4 text-sm text-gray-500">
                ⚠ Only use if you're sure. This cannot be undone.
            </p>
        </div>
    );
}

export default Tool;
