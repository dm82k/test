import React, { useState } from 'react';
import { databaseChecker } from '../utils/databaseChecker';

const DatabaseSetup = ({ onClose }) => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  const runChecks = async () => {
    setChecking(true);
    try {
      const checkResults = await databaseChecker.runAllChecks();
      setResults(checkResults);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true) return '✅';
    if (status === false) return '❌';
    return '❓';
  };

  return (
    <div className="migration-overlay">
      <div className="migration-modal">
        <div className="migration-header">
          <h2>🔧 Database Setup Checker</h2>
          <p>
            Verify that your database is properly configured for multi-user
            support.
          </p>
        </div>

        <div className="migration-content">
          {!results && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <button
                onClick={runChecks}
                disabled={checking}
                className="migrate-button primary"
              >
                {checking ? 'Checking...' : 'Run Database Checks'}
              </button>
            </div>
          )}

          {results && (
            <div>
              <h3>Database Status:</h3>

              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ marginRight: '10px' }}>
                    {getStatusIcon(results.userIdColumn?.exists)}
                  </span>
                  <span>user_id column exists</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ marginRight: '10px' }}>
                    {getStatusIcon(results.rls?.enabled)}
                  </span>
                  <span>Row Level Security enabled</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ marginRight: '10px' }}>
                    {getStatusIcon(results.uniqueConstraint?.exists)}
                  </span>
                  <span>Unique constraint exists</span>
                </div>
              </div>

              {results.allGood ? (
                <div className="success-message">
                  🎉 Database is properly configured!
                </div>
              ) : (
                <div className="migration-error">
                  ⚠️ Database setup incomplete. Please run the migration SQL in
                  your Supabase dashboard.
                </div>
              )}

              {results.error && (
                <div className="migration-error">Error: {results.error}</div>
              )}

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={runChecks}
                  className="migrate-button secondary"
                  style={{ marginRight: '10px' }}
                >
                  Re-check
                </button>
                <button onClick={onClose} className="migrate-button primary">
                  Continue
                </button>
              </div>
            </div>
          )}

          <div className="migration-note">
            <small>
              💡 If checks fail, copy and run the SQL from
              database-migration.sql in your Supabase SQL Editor.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
