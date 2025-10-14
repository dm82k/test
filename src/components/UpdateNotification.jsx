import React, { useState, useEffect } from 'react';
import { updateService } from '../services/updateService';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Listen for update available events
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);

    try {
      const success = await updateService.applyUpdate();
      if (success) {
        // The page will reload automatically when the new SW takes control
        console.log('Update applied, page will reload...');
      } else {
        // Fallback: manual reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Update failed:', error);
      // Fallback: manual reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="update-notification">
      <div className="update-content">
        <div className="update-icon">🔄</div>
        <div className="update-text">
          <div className="update-title">Nueva versión disponible</div>
          <div className="update-message">
            Hay una actualización de la aplicación lista para instalar
          </div>
        </div>
        <div className="update-actions">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="update-button primary"
          >
            {updating ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={handleDismiss} className="update-button secondary">
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
