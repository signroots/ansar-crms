import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// your Firebase config (from website)
const firebaseConfig = {
  apiKey: "AIzaSyCuPIxph8BBPf-O1KMs8FwPdC0c8DFH_rA",
  authDomain: "ansarnotification-f9dba.firebaseapp.com",
  projectId: "ansarnotification-f9dba",
  storageBucket: "ansarnotification-f9dba.firebasestorage.app",
  messagingSenderId: "989933461973",
  appId: "1:989933461973:web:bdfafbaa1e0ebda0141d5c",
};

// initialize firebase
const app = initializeApp(firebaseConfig);

// THIS is needed for notifications
export const messaging = getMessaging(app);