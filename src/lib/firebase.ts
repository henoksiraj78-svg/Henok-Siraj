import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4RVTTK5HsKyMjXH8tVMSYSEOZbWsrCC0",
  authDomain: "my-blog-db51a.firebaseapp.com",
  projectId: "my-blog-db51a",
  storageBucket: "my-blog-db51a.firebasestorage.app",
  messagingSenderId: "384117586872",
  appId: "1:384117586872:web:4145916609fbf81ce9ad4d",
  measurementId: "G-MXDVDLMFGE"
};

// Initialize Firebase (Checks if an app already exists to avoid errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;



