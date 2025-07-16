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
    deleteDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";
import app from "../firebaseConfig";  // ✅ Required for Firestore

const db = getFirestore(app);

// ✅ Fetch Expenses with Filters
export const fetchExpenses = async (person = null, fromDate = null, toDate = null) => {
    try {
        const baseQuery = person
            ? query(collection(db, "expenses"), where("person", "==", person))
            : collection(db, "expenses");

        const snapshot = await getDocs(baseQuery);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            results = results.filter(item => {
                const [dd, mm, yyyy] = item.date.split("/");
                const expenseDate = new Date(`${yyyy}-${mm}-${dd}`);
                return expenseDate >= from && expenseDate <= to;
            });
        }

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

// ✅ Update Status + Notify
export const updateExpenseStatus = async (id, newStatus, remark) => {
    try {
        const ref = doc(db, "expenses", id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) return false;

        const data = snapshot.data();
        const cleanUser = (data.person || "Unknown").trim();

        if (newStatus === "rejected") {
            const rejectRef = doc(db, "rejectedExpenses", id); // move to new collection
            await setDoc(rejectRef, {
                ...data,
                status: "rejected",
                adminRemark: remark || "",
                rejectedAt: serverTimestamp()
            });
            await deleteDoc(ref); // remove from original
        } else {
            await updateDoc(ref, {
                status: newStatus,
                adminRemark: remark || "",
                updatedAt: serverTimestamp()
            });
        }

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
        console.error("❌ Failed to update status or move rejected expense:", err);
        return false;
    }
};
