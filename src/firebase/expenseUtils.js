import { getFirestore, collection, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// 🔍 Fetch expenses with optional filters
export const fetchExpenses = async (person = null, startDate = null, endDate = null) => {
            const expensesRef = collection(db, "expenses");

            const filters = [];
            if (person) filters.push(where("person", "==", person));
            if (startDate) filters.push(where("date", ">=", startDate));
            if (endDate) filters.push(where("date", "<=", endDate));

            let q;
            if (filters.length > 0) {
                        q = query(expensesRef, ...filters, orderBy("date", "desc"));
            } else {
                        q = query(expensesRef, orderBy("date", "desc"));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Update expense status with remark (used in Approval Tab)
export const updateExpenseStatus = async (id, status, remark = "") => {
            const ref = doc(db, "expenses", id);
            await updateDoc(ref, {
                        status: status,
                        remark: remark,
            });
};

