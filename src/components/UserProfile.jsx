import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const UserProfile = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data } = await authService.getCurrentUser();
        setUserInfo(data.user);
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, [user]);

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      onLogout();
    }
    setShowDropdown(false);
  };

  const getUserDisplayName = () => {
    if (userInfo?.user_metadata?.fullName) {
      return userInfo.user_metadata.fullName;
    }
    if (userInfo?.email) {
      return userInfo.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-profile">
      <button
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
        title={`${getUserDisplayName()} - ${userInfo?.email || ''}`}
      >
        {getUserInitials()}
      </button>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-name">{getUserDisplayName()}</div>
            <div className="user-email">{userInfo?.email}</div>
          </div>
          <hr className="dropdown-divider" />
          <button className="dropdown-item logout-item" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
