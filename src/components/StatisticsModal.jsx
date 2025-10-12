import React from 'react';
import Statistics from './Statistics';

const StatisticsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>📊 Estadísticas de Ventas</h2>
          <button onClick={onClose} className="modal-close-button">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <Statistics />
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
