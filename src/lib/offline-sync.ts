
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { getFirestore, collection, addDoc, GeoPoint, Timestamp } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';

const DB_NAME = 'MultiShopDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingOperations';

interface PendingOperation {
  id?: number;
  type: 'ADD_CLIENT' | 'ADD_PRODUCT' | 'CREATE_INVOICE' | 'ADD_STORE';
  payload: any;
  timestamp: string;
}

interface MultiShopDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: PendingOperation;
    indexes: { 'by-timestamp': string };
  };
}

let dbPromise: Promise<IDBPDatabase<MultiShopDBSchema>> | null = null;

const getDb = () => {
    if (typeof window === 'undefined') {
        // Return a dummy promise or handle server-side case appropriately
        return Promise.reject(new Error("IndexedDB is not available on the server."));
    }
    if (!dbPromise) {
        dbPromise = openDB<MultiShopDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true,
                });
                store.createIndex('by-timestamp', 'timestamp');
            },
        });
    }
    return dbPromise;
};


export const addPendingOperation = async (operation: Omit<PendingOperation, 'id'>) => {
  const db = await getDb();
  await db.add(STORE_NAME, operation as PendingOperation);
};

export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
};

export const clearPendingOperation = async (id: number) => {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
};

export const clearAllPendingOperations = async () => {
    const db = await getDb();
    await db.clear(STORE_NAME);
}

export const processSyncQueue = async (): Promise<{ successCount: number, failureCount: number}> => {
  const firebaseApp = getApps().length > 0 ? getApp() : null;
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado.');
  }
  const db = getFirestore(firebaseApp);
  
  const operations = await getPendingOperations();
  if (operations.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'ADD_CLIENT':
            const clientData = op.payload;
            const location = clientData.location 
                ? new GeoPoint(clientData.location.latitude, clientData.location.longitude) 
                : null;
            
            await addDoc(collection(db, "clients"), {
                ...clientData,
                location,
                createdAt: new Date(clientData.createdAt),
            });
            break;
        case 'ADD_STORE':
            const storeData = op.payload;
            await addDoc(collection(db, 'stores'), {
                ...storeData,
                licenseExpires: Timestamp.fromDate(new Date(storeData.licenseExpires)),
                createdAt: new Date(storeData.createdAt),
            });
            break;
        // Add cases for other operation types here
        // case 'ADD_PRODUCT':
        //   await addDoc(collection(db, 'products'), op.payload);
        //   break;
        default:
          console.warn(`Tipo de operación desconocido: ${op.type}`);
          // Don't count as failure, but don't delete either
          continue;
      }
      // If successful, remove from the queue
      await clearPendingOperation(op.id!);
      successCount++;
    } catch (error) {
      console.error(`Error sincronizando operación ${op.id}:`, error);
      failureCount++;
      // We don't delete failed operations, so they can be retried later
    }
  }
  
  return { successCount, failureCount };
};
