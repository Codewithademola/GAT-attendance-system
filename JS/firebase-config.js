import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7B6FUSREF5ToxfQ2MT5oaCfyxvpCLilQ",
  authDomain: "web-based-attendance-c18f4.firebaseapp.com",
  projectId: "web-based-attendance-c18f4",
  storageBucket: "web-based-attendance-c18f4.firebasestorage.app",
  messagingSenderId: "559915861198",
  appId: "1:559915861198:web:536cffb94f51357b203c9f",
  measurementId: "G-W80SSHBEMP"
};


const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);