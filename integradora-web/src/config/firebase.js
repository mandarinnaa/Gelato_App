import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFRJ_lHQlSUmZHeaAD6sZcHLIYK3R_KY4",
  authDomain: "pasteles-84398.firebaseapp.com",
  projectId: "pasteles-84398",
  storageBucket: "pasteles-84398.firebasestorage.app",
  messagingSenderId: "446109291782",
  appId: "1:446109291782:web:59860b7447cca3e306fa87",
  measurementId: "G-Z8F5TKX7TG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();