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

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

/** * NETWORK OPTIMIZATION FOR STABLE UPLOADS
 * These settings help bypass "Retry Limit Exceeded" errors 
 * on slower or high-latency connections.
 */

// How long to wait for a single request to respond (increased to 1 minute)
storage.maxOperationRetryTime = 60000; 

// Total time to keep retrying an upload if it fails (increased to 5 minutes)
// This is critical for surviving "packet loss" on 3G/4G networks.
storage.maxUploadRetryTime = 300000; 

export default app;



