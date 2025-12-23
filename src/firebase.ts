// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfciuaeJTK1nu76Q4M57r0oUg5GkYrSOg",
  authDomain: "hranolky-a-sparovky.firebaseapp.com",
  projectId: "hranolky-a-sparovky",
  storageBucket: "hranolky-a-sparovky.firebasestorage.app",
  messagingSenderId: "657740368257",
  appId: "1:657740368257:web:03c0e35169436374fc0080",
  measurementId: "G-EBTM0VBQN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);