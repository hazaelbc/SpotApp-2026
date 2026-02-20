// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
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

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // El usuario autenticado
    const user = result.user;
    return user;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  }
};
