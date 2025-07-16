// 📁 /firebase/services/paymentService.js
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "firebase/firestore";
import app from "../firebaseConfig"; // ✅ FIXED

const db = getFirestore(app);

// ✅ Add Payment Entry to Firestore
export const addPaymentEntry = async ({ person, date, amount, remarks }) => {
    try {
        const payload = {
            person,
            date,
            amount: parseFloat(amount),
            remarks: remarks || "",
            createdAt: serverTimestamp()
        };

        console.log("📤 Submitting payment:", payload);

        const docRef = await addDoc(collection(db, "payments"), payload);

        console.log("✅ Payment added to Firebase with ID:", docRef.id);
        return true;

    } catch (err) {
        console.error("❌ Failed to add payment:", err);
        return false;
    }
};

// ✅ Fetch all payments
export const fetchPayments = async () => {
    try {
        const snapshot = await getDocs(collection(db, "payments"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("❌ fetchPayments error:", err);
        return [];
    }
};

