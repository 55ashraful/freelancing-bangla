import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// আপনার ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyCqr6T_UejxohwvEytWqqZb0YWTHPr0Fhk",
  authDomain: "my-freelance-77eaf.firebaseapp.com",
  databaseURL: "https://my-freelance-77eaf-default-rtdb.firebaseio.com",
  projectId: "my-freelance-77eaf",
  storageBucket: "my-freelance-77eaf.firebasestorage.app",
  messagingSenderId: "660768747651",
  appId: "1:660768747651:web:93e21cc3ad18b7d10c2bb6",
  measurementId: "G-JB7JX1X568"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
