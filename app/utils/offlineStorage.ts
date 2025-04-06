// Utility functions for offline data storage using IndexedDB

// Database name and version
const DB_NAME = 'home-project-offline-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  SHOPPING_LIST: 'shoppingList',
  RECIPES: 'recipes',
  WEEK_PLAN: 'weekPlan',
  PENDING_CHANGES: 'pendingChanges',
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening database');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SHOPPING_LIST)) {
        db.createObjectStore(STORES.SHOPPING_LIST, { keyPath: '_id' });
      }

      if (!db.objectStoreNames.contains(STORES.RECIPES)) {
        db.createObjectStore(STORES.RECIPES, { keyPath: '_id' });
      }

      if (!db.objectStoreNames.contains(STORES.WEEK_PLAN)) {
        db.createObjectStore(STORES.WEEK_PLAN, { keyPath: '_id' });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_CHANGES)) {
        db.createObjectStore(STORES.PENDING_CHANGES, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Generic function to save data to a store
export const saveToStore = async <T>(storeName: string, data: T): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Generic function to get all data from a store
export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Generic function to get a single item from a store
export const getFromStore = async <T>(storeName: string, id: string): Promise<T | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Generic function to delete an item from a store
export const deleteFromStore = async (storeName: string, id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Function to save a pending change
export const savePendingChange = async (change: {
  type: 'create' | 'update' | 'delete';
  store: string;
  data?: any; // Make data optional
  id?: string;
}): Promise<void> => {
  return saveToStore(STORES.PENDING_CHANGES, change);
};

// Function to get all pending changes
export const getPendingChanges = async (): Promise<any[]> => {
  return getAllFromStore(STORES.PENDING_CHANGES);
};

// Function to clear pending changes
export const clearPendingChanges = async (): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PENDING_CHANGES, 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_CHANGES);
    
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}; 