// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBchtm5yS1ZuW1b-5DWAIncTysOv09bYX0",
  authDomain: "https://proxyusersayem-svg.github.io/KR-GAMES/",
  projectId: "kr-games",
  storageBucket: "kr-games.appspot.com",
  messagingSenderId: "882062097165",
  appId: "1:882062097165:android:3eb7501b29a3d54b06ce44",
  databaseURL: "https://kr-games-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Authentication Helpers
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile };
// Firestore Helpers
export { doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs };
// RTDB Helpers
export { ref, set, onValue, push, update, remove, onDisconnect };
