// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDM59V-D9IS0YcKACOFosBoxrm3gHh-3RE",
  authDomain: "exora-f795f.firebaseapp.com",
  projectId: "exora-f795f",
  storageBucket: "exora-f795f.firebasestorage.app",
  messagingSenderId: "514319782309",
  appId: "1:514319782309:web:dead1b8212f8c63dd6d84c",
  measurementId: "G-1NYEJM78XS"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
let rtdb;
try {
  rtdb = getDatabase(app);
  console.log('Realtime Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize Realtime Database:', error);
  rtdb = null;
}

export { rtdb };
export const auth = getAuth(app);

