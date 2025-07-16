// 📁 /firebase/paymentService.js
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// ✅ Add Payment Entry (used by Admin)
export const recordPayment = async (paymentData) => {
    try {
        const payload = {
            ...paymentData,
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "payments"), payload);
        return true;
    } catch (err) {
        console.error("❌ Error saving payment:", err);
        return false;
    }
};

// ✅ Fetch Payments for a Person + Date Range
export const fetchPayments = async (person, fromDate, toDate) => {
    try {
        const snapshot = await getDocs(
            query(collection(db, "payments"), where("person", "==", person))
        );

        let payments = snapshot.docs.map(doc => doc.data());

        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);

            payments = payments.filter(entry => {
                const [dd, mm, yyyy] = entry.date.split("/");
                const paymentDate = new Date(`${yyyy}-${mm}-${dd}`);
                return paymentDate >= from && paymentDate <= to;
            });
        }

        payments.sort((a, b) => {
            const [ddA, mmA, yyyyA] = a.date.split("/");
            const [ddB, mmB, yyyyB] = b.date.split("/");
            return new Date(`${yyyyA}-${mmA}-${ddA}`) - new Date(`${yyyyB}-${mmB}-${ddB}`);
        });

        return payments;
    } catch (err) {
        console.error("❌ Error fetching payments:", err);
        return [];
    }
};
