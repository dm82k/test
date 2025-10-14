import { databaseService } from './databaseService';

const OFFLINE_QUEUE_KEY = 'offlineQueue';
const LAST_SYNC_KEY = 'lastSync';

export const offlineService = {
  // Check if we're online
  isOnline() {
    return navigator.onLine;
  },

  // Save data locally when offline
  async saveOffline(addresses) {
    try {
      // Always save to localStorage as backup
      const modifiedAddresses = addresses.filter(
        (addr) =>
          addr.visited !== 'No' ||
          addr.visit_date ||
          addr.interest_level ||
          addr.contact_info ||
          addr.notes ||
          addr.follow_up_date ||
          addr.status !== 'Sin Contactar'
      );

      // Save to localStorage
      localStorage.setItem(
        'addressCollectorData',
        JSON.stringify({
          addresses: modifiedAddresses,
          lastUpdated: new Date().toISOString(),
          version: '1.0',
        })
      );

      // If online, try to sync to database
      if (this.isOnline()) {
        try {
          await databaseService.saveAddresses(addresses);
          this.updateLastSync();
          return {
            success: true,
            synced: true,
            message: 'Datos guardados y sincronizados',
          };
        } catch (error) {
          console.error('Failed to sync to database:', error);
          this.addToOfflineQueue(modifiedAddresses);
          return {
            success: true,
            synced: false,
            message: 'Datos guardados localmente (sin conexión)',
          };
        }
      } else {
        // Offline - add to queue
        this.addToOfflineQueue(modifiedAddresses);
        return {
          success: true,
          synced: false,
          message: 'Datos guardados localmente (sin conexión)',
        };
      }
    } catch (error) {
      console.error('Failed to save offline:', error);
      return {
        success: false,
        synced: false,
        message: 'Error al guardar datos',
      };
    }
  },

  // Add data to offline sync queue
  addToOfflineQueue(addresses) {
    try {
      const queue = this.getOfflineQueue();
      const timestamp = new Date().toISOString();

      // Add to queue with timestamp
      queue.push({
        addresses,
        timestamp,
        id: Date.now(), // Simple ID for deduplication
      });

      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Added ${addresses.length} addresses to offline queue`);
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  },

  // Get offline queue
  getOfflineQueue() {
    try {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  },

  // Sync offline data when connection is restored
  async syncOfflineData() {
    if (!this.isOnline()) {
      return { success: false, message: 'Sin conexión a internet' };
    }

    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      return {
        success: true,
        message: 'No hay datos pendientes de sincronizar',
      };
    }

    try {
      console.log(`Syncing ${queue.length} offline entries...`);

      // Merge all queued addresses (latest wins for duplicates)
      const addressMap = new Map();

      queue.forEach((entry) => {
        entry.addresses.forEach((addr) => {
          const key = `${addr.house_number}-${addr.street}`;
          const existing = addressMap.get(key);

          // Keep the latest version
          if (
            !existing ||
            new Date(entry.timestamp) > new Date(existing.timestamp)
          ) {
            addressMap.set(key, { ...addr, timestamp: entry.timestamp });
          }
        });
      });

      const addressesToSync = Array.from(addressMap.values());

      // Sync to database
      await databaseService.saveAddresses(addressesToSync);

      // Clear offline queue
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      this.updateLastSync();

      console.log(`Successfully synced ${addressesToSync.length} addresses`);
      return {
        success: true,
        message: `${addressesToSync.length} direcciones sincronizadas correctamente`,
      };
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      return { success: false, message: 'Error al sincronizar datos' };
    }
  },

  // Update last sync timestamp
  updateLastSync() {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  },

  // Get last sync time
  getLastSync() {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  },

  // Get sync status info
  getSyncStatus() {
    const queue = this.getOfflineQueue();
    const lastSync = this.getLastSync();
    const isOnline = this.isOnline();

    return {
      isOnline,
      pendingSync: queue.length,
      lastSync: lastSync ? lastSync.toLocaleString() : 'Nunca',
      needsSync: queue.length > 0,
    };
  },

  // Set up online/offline event listeners
  setupNetworkListeners(onOnline, onOffline) {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      onOnline && onOnline();
      // Auto-sync when connection is restored
      this.syncOfflineData().then((result) => {
        if (
          result.success &&
          result.message !== 'No hay datos pendientes de sincronizar'
        ) {
          console.log('Auto-sync completed:', result.message);
        }
      });
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      onOffline && onOffline();
    });
  },
};
