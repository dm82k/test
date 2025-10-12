import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple password check
    const correctPassword = import.meta.env.VITE_APP_PASSWORD;

    if (password === correctPassword) {
      onLogin();
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>🏠 Recolector de Direcciones</h1>
        <p>Introduce la contraseña para acceder</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="password-input"
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
