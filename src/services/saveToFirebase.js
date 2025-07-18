// src/services/saveToFirebase.js
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import app from "../firebase/firebaseConfig";

const db = getFirestore(app);

/**
 * Add a new document to a collection with auto timestamp
 * @param {string} collectionName - e.g., "expenses"
 * @param {object} data - Data object to store
 */
export async function saveNewDoc(collectionName, data) {
    try {
        const payload = {
            ...data,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, collectionName), payload);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("❌ Error saving doc:", error);
        return { success: false, error };
    }
}

/**
 * Update or create a document by ID
 * @param {string} collectionName - e.g., "expenses"
 * @param {string} docId - Firebase doc ID
 * @param {object} data - Partial update or full data
 */
export async function saveOrUpdateDoc(collectionName, docId, data) {
    try {
        const ref = doc(db, collectionName, docId);
        await setDoc(ref, {
            ...data,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("❌ Error updating doc:", error);
        return { success: false, error };
    }
}
