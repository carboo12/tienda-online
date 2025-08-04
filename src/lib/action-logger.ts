
import { getFirestore, collection, addDoc, Timestamp, Firestore } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { User } from './auth';

interface LogPayload {
    user: User;
    action: string;
    details: string;
    status: 'success' | 'failure' | 'info';
}

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

let db: Firestore;

function getDb() {
    if (!db) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
    }
    return db;
}


export const logUserAction = async (payload: LogPayload) => {
    try {
        const firestore = getDb();
        await addDoc(collection(firestore, 'action_logs'), {
            user: payload.user.name,
            role: payload.user.role,
            storeId: payload.user.storeId || null,
            action: payload.action,
            details: payload.details,
            status: payload.status,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Failed to log user action:", error);
    }
};
