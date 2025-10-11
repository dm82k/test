import React from 'react';

const AddressTable = ({
  addresses,
  onUpdateAddress,
  totalCount,
  filteredCount,
}) => {
  const statusOptions = [
    {
      value: 'Sin Contactar',
      label: 'Sin Contactar',
      className: 'status-not-contacted',
    },
    { value: 'Contactado', label: 'Contactado', className: 'status-contacted' },
    {
      value: 'Interesado',
      label: 'Interesado',
      className: 'status-interested',
    },
    {
      value: 'No Interesado',
      label: 'No Interesado',
      className: 'status-not-interested',
    },
    { value: 'Venta', label: 'Venta', className: 'status-sale' },
    { value: 'Ausente', label: 'Ausente', className: 'status-absent' },
  ];

  const interestLevels = ['', 'Alto', 'Medio', 'Bajo', 'Ninguno'];

  const handleStatusChange = (index, value) => {
    onUpdateAddress(index, 'status', value);
  };

  const handleFieldChange = (index, field, value) => {
    onUpdateAddress(index, field, value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-count">
          📊 Mostrando {addresses.length} de {totalCount} direcciones
          {addresses.length !== totalCount && (
            <span className="filter-indicator"> (filtradas)</span>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="addresses-table">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Ciudad</th>
              <th>Provincia</th>
              <th>Visitado</th>
              <th>Fecha de Visita</th>
              <th>Estado</th>
              <th>Nivel de Interés</th>
              <th>Info de Contacto</th>
              <th>Notas</th>
              <th>Seguimiento</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address, index) => (
              <tr key={index}>
                <td>
                  <strong>{address.full_address}</strong>
                  {address.latitude && address.longitude && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      📍 {address.latitude.toFixed(4)},{' '}
                      {address.longitude.toFixed(4)}
                    </div>
                  )}
                </td>
                <td>{address.city || '-'}</td>
                <td>{address.province || '-'}</td>
                <td>
                  <select
                    value={address.visited || 'No'}
                    onChange={(e) =>
                      handleFieldChange(index, 'visited', e.target.value)
                    }
                    style={{ padding: '4px 8px', fontSize: '14px' }}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={address.visit_date || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'visit_date', e.target.value)
                    }
                    style={{ padding: '4px', fontSize: '14px', width: '140px' }}
                  />
                </td>
                <td>
                  <select
                    value={address.status || 'Sin Contactar'}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                    className={`status-select ${
                      statusOptions.find((opt) => opt.value === address.status)
                        ?.className || 'status-not-contacted'
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={address.interest_level || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'interest_level', e.target.value)
                    }
                    style={{ padding: '4px 8px', fontSize: '14px' }}
                  >
                    {interestLevels.map((level) => (
                      <option key={level} value={level}>
                        {level || 'Seleccionar...'}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={address.contact_info || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'contact_info', e.target.value)
                    }
                    placeholder="Teléfono/Email"
                    style={{ padding: '4px', fontSize: '14px', width: '120px' }}
                  />
                </td>
                <td>
                  <textarea
                    value={address.notes || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'notes', e.target.value)
                    }
                    placeholder="Tus notas..."
                    className="notes-input"
                    style={{ width: '200px', minHeight: '40px' }}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={address.follow_up_date || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'follow_up_date', e.target.value)
                    }
                    style={{ padding: '4px', fontSize: '14px', width: '140px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddressTable;
