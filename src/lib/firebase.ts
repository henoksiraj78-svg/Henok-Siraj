import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Added this
import { getStorage } from "firebase/storage";     // Added this

const firebaseConfig = {
  apiKey: "AIzaSyC4RVTTK5HsKyMjXH8tVMSYSEOZbWsrCC0",
  authDomain: "my-blog-db51a.firebaseapp.com",
  projectId: "my-blog-db51a",
  storageBucket: "my-blog-db51a.firebasestorage.app",
  messagingSenderId: "384117586872",
  appId: "1:384117586872:web:4145916609fbf81ce9ad4d",
  measurementId: "G-MXDVDLMFGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export these so you can use them in your pages
export const db = getFirestore(app);    // This fixes the red "db" error!
export const storage = getStorage(app); // This allows you to upload photos




