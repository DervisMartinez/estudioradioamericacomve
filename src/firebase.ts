// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1-s6USHRtWcZnpwQz8Jk8O1BUaEL4dlw",
  authDomain: "estudio-radio-america.firebaseapp.com",
  projectId: "estudio-radio-america",
  storageBucket: "estudio-radio-america.firebasestorage.app",
  messagingSenderId: "1089218137135",
  appId: "1:1089218137135:web:68bf85e39d6463bd268ada",
  measurementId: "G-24LB1V6E6H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);