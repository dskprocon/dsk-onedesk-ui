// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // ✅ Added for Firebase login

const firebaseConfig = {
    apiKey: "AIzaSyAifKRj4XctUlIsevG6BI-AExahw_itxLk",
    authDomain: "dsk-procon.firebaseapp.com",
    projectId: "dsk-procon",
    storageBucket: "dsk-procon.appspot.com",
    messagingSenderId: "781857687648",
    appId: "1:781857687648:web:4404aa262e1732168b5b05"
};

const app = initializeApp(firebaseConfig);

// ✅ Updated this line to explicitly use correct bucket
export const storage = getStorage(app, "gs://dsk-procon.firebasestorage.app");

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
