import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Detecta si es móvil (sin hover, pantalla táctil)
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
}

// En móvil usa redirect (no hay popup). En desktop usa popup.
export const signInWithGoogle = async () => {
  if (isMobile()) {
    await signInWithRedirect(auth, googleProvider);
    // La página se recarga — el resultado se recoge en handleGoogleRedirect
    return null;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Llama esto al cargar la app para recoger el resultado del redirect
export const handleGoogleRedirect = () => getRedirectResult(auth);
