import React, { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

const SyncStatus = ({ onSync }) => {
  const [syncStatus, setSyncStatus] = useState(offlineService.getSyncStatus());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Update sync status every 30 seconds
    const interval = setInterval(() => {
      setSyncStatus(offlineService.getSyncStatus());
    }, 30000);

    // Update on network changes
    const updateStatus = () => setSyncStatus(offlineService.getSyncStatus());

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await offlineService.syncOfflineData();
      setSyncStatus(offlineService.getSyncStatus());
      onSync && onSync(result);
    } catch (error) {
      console.error('Sync failed:', error);
      onSync && onSync({ success: false, message: 'Error al sincronizar' });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (syncing) return '🔄';
    if (!syncStatus.isOnline) return '📱';
    if (syncStatus.needsSync) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (syncing) return 'Sincronizando...';
    if (!syncStatus.isOnline) return 'Sin conexión';
    if (syncStatus.needsSync) return `${syncStatus.pendingSync} pendientes`;
    return 'Sincronizado';
  };

  const getStatusClass = () => {
    if (syncing) return 'sync-status syncing';
    if (!syncStatus.isOnline) return 'sync-status offline';
    if (syncStatus.needsSync) return 'sync-status pending';
    return 'sync-status online';
  };

  return (
    <div className={getStatusClass()}>
      <div className="sync-info">
        <span className="sync-icon">{getStatusIcon()}</span>
        <div className="sync-details">
          <span className="sync-text">{getStatusText()}</span>
          <span className="sync-last">Última sync: {syncStatus.lastSync}</span>
        </div>
      </div>

      {syncStatus.isOnline && syncStatus.needsSync && !syncing && (
        <button onClick={handleSync} className="sync-button" disabled={syncing}>
          Sincronizar
        </button>
      )}
    </div>
  );
};

export default SyncStatus;
