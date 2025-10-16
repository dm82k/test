import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { migrationHelper } from '../utils/migrationHelper';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const loadDebugInfo = async () => {
    try {
      const {
        data: { user },
      } = await authService.getCurrentUser();
      const {
        data: { session },
      } = await authService.getSession();
      const migrationStatus = await migrationHelper.checkMigrationStatus();

      setDebugInfo({
        user: user
          ? {
              id: user.id,
              email: user.email,
              metadata: user.user_metadata,
            }
          : null,
        session: session
          ? {
              access_token: session.access_token ? 'Present' : 'Missing',
              expires_at: session.expires_at,
            }
          : null,
        migration: migrationStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (showDebug) {
      loadDebugInfo();
    }
  }, [showDebug]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <strong>Debug Info</strong>
        <button
          onClick={() => setShowDebug(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <button
        onClick={loadDebugInfo}
        style={{
          background: '#3498db',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
      >
        Refresh
      </button>

      {debugInfo && (
        <pre
          style={{
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DebugInfo;
