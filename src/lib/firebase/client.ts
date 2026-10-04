import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/*
 * Firebase web config is public by design (it identifies the project, it does
 * not authorise anything). Access is controlled by the authorised-domains list
 * and the phone-auth settings in the Firebase console, and the server verifies
 * every ID token before a session is created.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAmtkPdG1CzM1HtT7j0BCJtgXK9xVOnMFw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "grahakavach-60438.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "grahakavach-60438",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "grahakavach-60438.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "901030374565",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:901030374565:web:118cbaf31a35e4b962714c",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  auth.languageCode = "en";
  return auth;
}
