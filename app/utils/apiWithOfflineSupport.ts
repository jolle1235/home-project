"use client";

import { saveToStore, getAllFromStore, getFromStore, deleteFromStore, savePendingChange, STORES } from './offlineStorage';

// Generic function to handle API requests with offline support
export const apiWithOfflineSupport = {
  // GET request with offline support
  get: async <T>(url: string, options: RequestInit = {}): Promise<T[]> => {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to fetch from the network
        const response = await fetch(url, {
          ...options,
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store the data in IndexedDB for offline use
        if (Array.isArray(data)) {
          for (const item of data) {
            await saveToStore(STORES.RECIPES, item);
          }
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        // If network request fails, try to get from IndexedDB
        return getAllFromStore<T>(STORES.RECIPES);
      }
    } else {
      // If offline, get data from IndexedDB
      return getAllFromStore<T>(STORES.RECIPES);
    }
  },
  
  // GET single item with offline support
  getOne: async <T>(url: string, id: string, options: RequestInit = {}): Promise<T | null> => {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to fetch from the network
        const response = await fetch(`${url}/${id}`, {
          ...options,
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store the data in IndexedDB for offline use
        await saveToStore(STORES.RECIPES, data);
        
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        // If network request fails, try to get from IndexedDB
        return getFromStore<T>(STORES.RECIPES, id);
      }
    } else {
      // If offline, get data from IndexedDB
      return getFromStore<T>(STORES.RECIPES, id);
    }
  },
  
  // POST request with offline support
  post: async <T>(url: string, data: any, options: RequestInit = {}): Promise<T> => {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to send to the network
        const response = await fetch(url, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Store the data in IndexedDB for offline use
        await saveToStore(STORES.RECIPES, responseData);
        
        return responseData;
      } catch (error) {
        console.error('Error posting data:', error);
        // If network request fails, store in IndexedDB and add to pending changes
        const tempId = `temp-${Date.now()}`;
        const tempData = { ...data, _id: tempId };
        await saveToStore(STORES.RECIPES, tempData);
        await savePendingChange({
          type: 'create',
          store: STORES.RECIPES,
          data: data,
        });
        return tempData as T;
      }
    } else {
      // If offline, store in IndexedDB and add to pending changes
      const tempId = `temp-${Date.now()}`;
      const tempData = { ...data, _id: tempId };
      await saveToStore(STORES.RECIPES, tempData);
      await savePendingChange({
        type: 'create',
        store: STORES.RECIPES,
        data: data,
      });
      return tempData as T;
    }
  },
  
  // PUT request with offline support
  put: async <T>(url: string, id: string, data: any, options: RequestInit = {}): Promise<T> => {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to send to the network
        const response = await fetch(`${url}/${id}`, {
          ...options,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Store the data in IndexedDB for offline use
        await saveToStore(STORES.RECIPES, responseData);
        
        return responseData;
      } catch (error) {
        console.error('Error updating data:', error);
        // If network request fails, store in IndexedDB and add to pending changes
        const tempData = { ...data, _id: id };
        await saveToStore(STORES.RECIPES, tempData);
        await savePendingChange({
          type: 'update',
          store: STORES.RECIPES,
          data: data,
          id: id,
        });
        return tempData as T;
      }
    } else {
      // If offline, store in IndexedDB and add to pending changes
      const tempData = { ...data, _id: id };
      await saveToStore(STORES.RECIPES, tempData);
      await savePendingChange({
        type: 'update',
        store: STORES.RECIPES,
        data: data,
        id: id,
      });
      return tempData as T;
    }
  },
  
  // DELETE request with offline support
  delete: async (url: string, id: string, options: RequestInit = {}): Promise<void> => {
    // Check if we're online
    if (navigator.onLine) {
      try {
        // Try to send to the network
        const response = await fetch(`${url}/${id}`, {
          ...options,
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove from IndexedDB
        await deleteFromStore(STORES.RECIPES, id);
      } catch (error) {
        console.error('Error deleting data:', error);
        // If network request fails, add to pending changes
        await savePendingChange({
          type: 'delete',
          store: STORES.RECIPES,
          id: id,
        });
      }
    } else {
      // If offline, add to pending changes
      await savePendingChange({
        type: 'delete',
        store: STORES.RECIPES,
        id: id,
      });
    }
  },
}; 