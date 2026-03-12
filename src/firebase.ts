// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);





