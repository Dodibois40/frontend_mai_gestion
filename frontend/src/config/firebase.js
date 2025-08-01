// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC1VwhprRXivPSEL_9UwCksOZLuka9de4",
  authDomain: "entreprise-organiser.firebaseapp.com",
  projectId: "entreprise-organiser",
  storageBucket: "entreprise-organiser.firebasestorage.app",
  messagingSenderId: "148962094148",
  appId: "1:148962094148:web:670deb9a62f005a5ef6011"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app; 