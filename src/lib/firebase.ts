import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJFjuIPNLw34kjFDbrUnepwFyOPwHqBFY",
  authDomain: "mis-edpex.firebaseapp.com",
  projectId: "mis-edpex",
  storageBucket: "mis-edpex.firebasestorage.app",
  messagingSenderId: "469911386708",
  appId: "1:469911386708:web:1052a81f8fa9615035cbc1",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
