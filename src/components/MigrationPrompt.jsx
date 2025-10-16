import React, { useState, useEffect } from 'react';
import { migrationHelper } from '../utils/migrationHelper';

const MigrationPrompt = ({ onComplete }) => {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState('');

  // Auto-complete if no migration needed
  useEffect(() => {
    if (migrationStatus && !migrationStatus.needsMigration) {
      onComplete && onComplete({ success: true, noMigrationNeeded: true });
    }
  }, [migrationStatus, onComplete]);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      setLoading(true);
      const status = await migrationHelper.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (err) {
      setError('Error checking migration status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      setError('');

      const result = await migrationHelper.assignUnassignedToCurrentUser();

      if (result.success) {
        onComplete && onComplete(result);
      } else {
        setError(result.error || 'Migration failed');
      }
    } catch (err) {
      setError('Error during migration');
      console.error(err);
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    onComplete && onComplete({ success: true, skipped: true });
  };

  if (loading) {
    return (
      <div className="migration-overlay">
        <div className="migration-modal">
          <div className="migration-loading">
            <div className="spinner"></div>
            <p>Verificando datos existentes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !migrationStatus?.needsMigration) {
    return null;
  }

  return (
    <div className="migration-overlay">
      <div className="migration-modal">
        <div className="migration-header">
          <h2>🔄 Migración de Datos</h2>
          <p>
            Se encontraron <strong>{migrationStatus.unassignedCount}</strong>{' '}
            direcciones existentes que necesitan ser asignadas a tu cuenta.
          </p>
        </div>

        <div className="migration-content">
          <div className="migration-info">
            <h3>¿Qué significa esto?</h3>
            <ul>
              <li>Tienes datos de direcciones guardados anteriormente</li>
              <li>Ahora el sistema es multi-usuario</li>
              <li>Necesitamos asignar estos datos a tu cuenta personal</li>
              <li>Otros usuarios no podrán ver estos datos</li>
            </ul>
          </div>

          {error && <div className="migration-error">❌ {error}</div>}

          <div className="migration-actions">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="migrate-button primary"
            >
              {migrating
                ? 'Migrando...'
                : `Asignar ${migrationStatus.unassignedCount} direcciones a mi cuenta`}
            </button>

            <button
              onClick={handleSkip}
              disabled={migrating}
              className="migrate-button secondary"
            >
              Continuar sin migrar
            </button>
          </div>

          <div className="migration-note">
            <small>
              💡 Si eliges "Continuar sin migrar", los datos existentes no se
              mostrarán en tu cuenta, pero permanecerán en la base de datos.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPrompt;
