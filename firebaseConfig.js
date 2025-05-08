// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIzuUjqxMNa33ly4aTHO0lycekd3EJPzI",
  authDomain: "balanco-ceupex-26c5e.firebaseapp.com",
  projectId: "balanco-ceupex-26c5e",
  storageBucket: "balanco-ceupex-26c5e.firebasestorage.app",
  messagingSenderId: "987883761284",
  appId: "1:987883761284:web:e294e475a7ede4881b9cd1",
  measurementId: "G-HK2ZFPH02T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);