// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAifKRj4XctUlIsevG6BI-AExahw_itxLk",
    authDomain: "dsk-procon.firebaseapp.com",
    projectId: "dsk-procon",
    storageBucket: "dsk-procon.appspot.com",   // ✅ Fixed here
    messagingSenderId: "781857687648",
    appId: "1:781857687648:web:4404aa262e1732168b5b05"
};

const app = initializeApp(firebaseConfig);
export default app;
