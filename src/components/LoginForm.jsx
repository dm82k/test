import React, { useState } from 'react';
import { authService } from '../services/authService';

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setError('El nombre completo es requerido');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        // Sign in
        const result = await authService.signIn(
          formData.email,
          formData.password
        );

        if (result.success) {
          onLogin(result.user);
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      } else {
        // Sign up
        const result = await authService.signUp(
          formData.email,
          formData.password,
          { fullName: formData.fullName }
        );

        if (result.success) {
          if (result.session) {
            // User is automatically signed in
            onLogin(result.user);
          } else {
            // Email confirmation required
            setMessage('Revisa tu email para confirmar tu cuenta');
            setIsLogin(true);
          }
        } else {
          setError(result.error || 'Error al crear la cuenta');
        }
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Introduce tu email para recuperar la contraseña');
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(formData.email);
    setLoading(false);

    if (result.success) {
      setMessage('Revisa tu email para restablecer la contraseña');
    } else {
      setError(result.error || 'Error al enviar email de recuperación');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>🏠 Sales Tracker</h1>
        <p>
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nombre completo"
                className="form-input"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-input"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña"
              className="form-input"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmar contraseña"
                className="form-input"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
            disabled={loading}
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="link-button forgot-password"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
