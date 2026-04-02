// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1UBXhVtbQohlfeJam-VM8-cNYbq4zhBc",
  authDomain: "spotapp-4a327.firebaseapp.com",
  projectId: "spotapp-4a327",
  storageBucket: "spotapp-4a327.firebasestorage.app",
  messagingSenderId: "680550237125",
  appId: "1:680550237125:web:2c64af1461508c66aec1ac",
  measurementId: "G-SJJZ42LS4V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);