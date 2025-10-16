import React, { useState, useEffect } from 'react';

const AddressFilter = ({ addresses, onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    numberFrom: '',
    numberTo: '',
    status: 'all',
    visited: 'all',
    interestLevel: 'all',
    showStoredOnly: false,
  });

  // Apply filters whenever filter state changes
  useEffect(() => {
    onFilter(filters);
  }, [filters]); // Remove onFilter from dependencies to prevent infinite loop

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      numberFrom: '',
      numberTo: '',
      status: 'all',
      visited: 'all',
      interestLevel: 'all',
      showStoredOnly: false,
    });
  };

  // Get unique values for filter options
  const statusOptions = [
    ...new Set(addresses.map((addr) => addr.status)),
  ].filter(Boolean);
  const interestLevels = [
    ...new Set(addresses.map((addr) => addr.interest_level)),
  ].filter(Boolean);

  const hasActiveFilters =
    filters.search ||
    filters.numberFrom ||
    filters.numberTo ||
    filters.status !== 'all' ||
    filters.visited !== 'all' ||
    filters.interestLevel !== 'all' ||
    filters.showStoredOnly;

  return (
    <div className="filter-section">
      <div className="filter-header">
        <h3>🔍 Filtrar Direcciones</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-button">
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Buscar calles, ciudad o notas..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Número de Casa</label>
          <div className="number-range">
            <input
              type="number"
              placeholder="Desde"
              value={filters.numberFrom}
              onChange={(e) => handleFilterChange('numberFrom', e.target.value)}
              className="filter-input number-input"
              min="1"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              placeholder="Hasta"
              value={filters.numberTo}
              onChange={(e) => handleFilterChange('numberTo', e.target.value)}
              className="filter-input number-input"
              min="1"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Estado</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los Estados</option>
            <option value="Sin Contactar">Sin Contactar</option>
            <option value="Contactado">Contactado</option>
            <option value="Interesado">Interesado</option>
            <option value="No Interesado">No Interesado</option>
            <option value="Venta">Venta</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Visitado</label>
          <select
            value={filters.visited}
            onChange={(e) => handleFilterChange('visited', e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="Sí">Visitado</option>
            <option value="No">No Visitado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Nivel de Interés</label>
          <select
            value={filters.interestLevel}
            onChange={(e) =>
              handleFilterChange('interestLevel', e.target.value)
            }
            className="filter-select"
          >
            <option value="all">Todos los Niveles</option>
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
            <option value="Ninguno">Ninguno</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Datos Guardados</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.showStoredOnly}
                onChange={(e) =>
                  handleFilterChange('showStoredOnly', e.target.checked)
                }
                className="filter-checkbox"
              />
              <span className="checkbox-text">
                Solo mostrar datos guardados
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressFilter;
