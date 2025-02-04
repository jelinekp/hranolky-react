    // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDgbaJXpxEKBJUGf_t0GBHR3DfiRzxVF2Y",
    authDomain: "hranolky-firestore.firebaseapp.com",
    projectId: "hranolky-firestore",
    storageBucket: "hranolky-firestore.firebasestorage.app",
    messagingSenderId: "1055149203936",
    appId: "1:1055149203936:web:c32b7ee666696693290b85",
    measurementId: "G-MF90Y152K5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);