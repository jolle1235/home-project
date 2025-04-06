"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPendingChanges, clearPendingChanges } from '../utils/offlineStorage';

export default function OfflineSyncComponent() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  useEffect(() => {
    // Check if the browser is online
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Initial check
    checkOnlineStatus();

    // Cleanup
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Check for pending changes
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const changes = await getPendingChanges();
        setPendingChangesCount(changes.length);
      } catch (error) {
        console.error('Error checking pending changes:', error);
      }
    };

    checkPendingChanges();
  }, [isOnline]);

  // Function to sync data when coming back online
  const syncData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Get all pending changes
      const changes = await getPendingChanges();
      
      if (changes.length === 0) {
        setIsSyncing(false);
        return;
      }

      // Process each pending change
      for (const change of changes) {
        try {
          // Here you would implement the actual API calls to sync the data
          // For example:
          // if (change.type === 'create') {
          //   await createItem(change.data);
          // } else if (change.type === 'update') {
          //   await updateItem(change.id, change.data);
          // } else if (change.type === 'delete') {
          //   await deleteItem(change.id);
          // }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error syncing change:`, error);
          // Continue with other changes even if one fails
        }
      }
      
      // Clear all pending changes after successful sync
      await clearPendingChanges();
      setPendingChangesCount(0);
      
      toast.success('Data synchronized successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // When coming back online, attempt to sync data
    if (isOnline && pendingChangesCount > 0) {
      syncData();
    }
  }, [isOnline, pendingChangesCount]);

  // This component doesn't render anything visible
  return null;
} 