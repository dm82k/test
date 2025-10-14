import React, { useState, useEffect } from 'react';
import { addressService } from '../services/supabaseClient';
import SyncStatus from './SyncStatus';
import packageJson from '../../package.json';

const Statistics = () => {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [allAddresses, setAllAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all addresses from database on component mount
  useEffect(() => {
    loadAllAddresses();
  }, []);

  const loadAllAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all addresses from database with a large limit
      const result = await addressService.getAddresses({
        page: 1,
        limit: 50000, // Large limit to get all addresses
      });

      setAllAddresses(result.addresses);
      setFilteredAddresses(result.addresses);
      console.log(`Loaded ${result.addresses.length} addresses for statistics`);
    } catch (err) {
      console.error('Failed to load addresses for statistics:', err);
      setError('Error al cargar las estadísticas');
      setAllAddresses([]);
      setFilteredAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter addresses by date range
  useEffect(() => {
    try {
      let filtered = allAddresses;

      if (dateFilter.startDate || dateFilter.endDate) {
        filtered = allAddresses.filter((addr) => {
          if (!addr.visit_date) return false;

          const visitDate = new Date(addr.visit_date);
          const startDate = dateFilter.startDate
            ? new Date(dateFilter.startDate)
            : null;
          const endDate = dateFilter.endDate
            ? new Date(dateFilter.endDate)
            : null;

          if (startDate && visitDate < startDate) return false;
          if (endDate && visitDate > endDate) return false;

          return true;
        });
      }

      setFilteredAddresses(filtered);
    } catch (error) {
      console.error('Error filtering addresses by date:', error);
      setFilteredAddresses(allAddresses);
    }
  }, [allAddresses, dateFilter]);

  // Calculate statistics from all database addresses
  const stats = React.useMemo(() => {
    try {
      if (!allAddresses || allAddresses.length === 0) {
        return {
          total: 0,
          visited: 0,
          notVisited: 0,
          sinContactar: 0,
          contactado: 0,
          interesado: 0,
          noInteresado: 0,
          venta: 0,
          altoInteres: 0,
          medioInteres: 0,
          bajoInteres: 0,
          ningunInteres: 0,
          withNotes: 0,
          withContact: 0,
          withFollowUp: 0,
        };
      }

      return {
        total: allAddresses.length,
        visited: allAddresses.filter((addr) => addr.visited === 'Sí').length,
        notVisited: allAddresses.filter((addr) => addr.visited === 'No').length,

        // Status breakdown
        sinContactar: allAddresses.filter(
          (addr) => addr.status === 'Sin Contactar'
        ).length,
        contactado: allAddresses.filter((addr) => addr.status === 'Contactado')
          .length,
        interesado: allAddresses.filter((addr) => addr.status === 'Interesado')
          .length,
        noInteresado: allAddresses.filter(
          (addr) => addr.status === 'No Interesado'
        ).length,
        venta: allAddresses.filter((addr) => addr.status === 'Venta').length,

        // Interest levels
        altoInteres: allAddresses.filter(
          (addr) => addr.interest_level === 'Alto'
        ).length,
        medioInteres: allAddresses.filter(
          (addr) => addr.interest_level === 'Medio'
        ).length,
        bajoInteres: allAddresses.filter(
          (addr) => addr.interest_level === 'Bajo'
        ).length,
        ningunInteres: allAddresses.filter(
          (addr) => addr.interest_level === 'Ninguno'
        ).length,

        // Notes and contacts
        withNotes: allAddresses.filter(
          (addr) => addr.notes && addr.notes.trim()
        ).length,
        withContact: allAddresses.filter(
          (addr) => addr.contact_info && addr.contact_info.trim()
        ).length,
        withFollowUp: allAddresses.filter((addr) => addr.follow_up_date).length,
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        total: 0,
        visited: 0,
        notVisited: 0,
        sinContactar: 0,
        contactado: 0,
        interesado: 0,
        noInteresado: 0,
        venta: 0,
        altoInteres: 0,
        medioInteres: 0,
        bajoInteres: 0,
        ningunInteres: 0,
        withNotes: 0,
        withContact: 0,
        withFollowUp: 0,
      };
    }
  }, [allAddresses]);

  // Time-filtered statistics
  const timeStats = React.useMemo(() => {
    try {
      if (!filteredAddresses || filteredAddresses.length === 0) {
        return {
          visitsInPeriod: 0,
          interesadoInPeriod: 0,
          ventasInPeriod: 0,
          contactosInPeriod: 0,
        };
      }

      return {
        visitsInPeriod: filteredAddresses.filter((addr) => addr.visit_date)
          .length,
        interesadoInPeriod: filteredAddresses.filter(
          (addr) => addr.status === 'Interesado'
        ).length,
        ventasInPeriod: filteredAddresses.filter(
          (addr) => addr.status === 'Venta'
        ).length,
        contactosInPeriod: filteredAddresses.filter(
          (addr) => addr.contact_info && addr.contact_info.trim()
        ).length,
      };
    } catch (error) {
      console.error('Error calculating time statistics:', error);
      return {
        visitsInPeriod: 0,
        interesadoInPeriod: 0,
        ventasInPeriod: 0,
        contactosInPeriod: 0,
      };
    }
  }, [filteredAddresses]);

  // Calculate conversion rates
  const conversionRate = React.useMemo(() => {
    try {
      return stats.visited > 0
        ? ((stats.interesado / stats.visited) * 100).toFixed(1)
        : 0;
    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return 0;
    }
  }, [stats.visited, stats.interesado]);

  const salesRate = React.useMemo(() => {
    try {
      return stats.visited > 0
        ? ((stats.venta / stats.visited) * 100).toFixed(1)
        : 0;
    } catch (error) {
      console.error('Error calculating sales rate:', error);
      return 0;
    }
  }, [stats.visited, stats.venta]);

  const contactRate = React.useMemo(() => {
    try {
      return stats.visited > 0
        ? ((stats.withContact / stats.visited) * 100).toFixed(1)
        : 0;
    } catch (error) {
      console.error('Error calculating contact rate:', error);
      return 0;
    }
  }, [stats.visited, stats.withContact]);

  const handleDateChange = (field, value) => {
    try {
      console.log('Date change:', field, value);
      setDateFilter((prev) => ({
        ...prev,
        [field]: value,
      }));
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  const clearDateFilter = () => {
    try {
      setDateFilter({
        startDate: '',
        endDate: '',
      });
    } catch (error) {
      console.error('Error clearing date filter:', error);
    }
  };

  const getProgressPercentage = (value, total) => {
    try {
      if (!value || !total || total === 0) return 0;
      return ((value / total) * 100).toFixed(1);
    } catch (error) {
      console.error('Error calculating progress percentage:', error);
      return 0;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading">📊 Cargando estadísticas...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="statistics-container">
        <div className="error">
          ❌ {error}
          <button onClick={loadAllAddresses} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (allAddresses.length === 0) {
    return (
      <div className="statistics-container">
        <div className="empty-state">
          📊 No hay datos de direcciones guardados aún.
          <p>
            Las estadísticas aparecerán cuando comiences a visitar direcciones y
            guardar datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <div className="stats-summary">
          <span>
            Datos de {allAddresses.length} direcciones en la base de datos
          </span>
          <span className="app-version">v{packageJson.version}</span>
        </div>

        {/* Sync Status */}
        <SyncStatus
          onSync={(result) => {
            console.log('Sync result:', result);
            // The sync feedback will be handled by the toast system in App.jsx
          }}
        />

        {/* Date Filter */}
        <div className="date-filter">
          <div className="date-inputs">
            <div className="date-group">
              <label>Desde:</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-group">
              <label>Hasta:</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="date-input"
              />
            </div>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <button onClick={clearDateFilter} className="clear-date-button">
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {/* Overall Progress */}
        <div className="stat-card overview-card">
          <h3>📈 Progreso General</h3>
          <div className="stat-item">
            <span className="stat-label">Total de Direcciones:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visitadas:</span>
            <span className="stat-value">{stats.visited}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.visited, stats.total)}%)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pendientes:</span>
            <span className="stat-value">{stats.notVisited}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.notVisited, stats.total)}%)
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${getProgressPercentage(stats.visited, stats.total)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Time Period Stats */}
        {(dateFilter.startDate || dateFilter.endDate) && (
          <div className="stat-card period-card">
            <h3>📅 Período Seleccionado</h3>
            <div className="stat-item">
              <span className="stat-label">Visitas Realizadas:</span>
              <span className="stat-value">{timeStats.visitsInPeriod}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Interesados:</span>
              <span className="stat-value">{timeStats.interesadoInPeriod}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ventas:</span>
              <span className="stat-value">{timeStats.ventasInPeriod}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Contactos Obtenidos:</span>
              <span className="stat-value">{timeStats.contactosInPeriod}</span>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        <div className="stat-card status-card">
          <h3>📋 Estados de Contacto</h3>
          <div className="stat-item">
            <span className="stat-label">Sin Contactar:</span>
            <span className="stat-value">{stats.sinContactar}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.sinContactar, stats.total)}%)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Contactado:</span>
            <span className="stat-value">{stats.contactado}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.contactado, stats.total)}%)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Interesado:</span>
            <span className="stat-value success">{stats.interesado}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.interesado, stats.total)}%)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">No Interesado:</span>
            <span className="stat-value">{stats.noInteresado}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.noInteresado, stats.total)}%)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Venta:</span>
            <span className="stat-value success">{stats.venta}</span>
            <span className="stat-percentage">
              ({getProgressPercentage(stats.venta, stats.total)}%)
            </span>
          </div>
        </div>

        {/* Interest Levels */}
        <div className="stat-card interest-card">
          <h3>⭐ Niveles de Interés</h3>
          <div className="stat-item">
            <span className="stat-label">Alto:</span>
            <span className="stat-value success">{stats.altoInteres}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Medio:</span>
            <span className="stat-value warning">{stats.medioInteres}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Bajo:</span>
            <span className="stat-value">{stats.bajoInteres}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ninguno:</span>
            <span className="stat-value">{stats.ningunInteres}</span>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="stat-card conversion-card">
          <h3>📈 Tasas de Conversión</h3>
          <div className="stat-item">
            <span className="stat-label">Tasa de Interés:</span>
            <span className="stat-value success">{conversionRate}%</span>
            <span className="stat-detail">
              ({stats.interesado} de {stats.visited} visitadas)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tasa de Ventas:</span>
            <span className="stat-value success">{salesRate}%</span>
            <span className="stat-detail">
              ({stats.venta} de {stats.visited} visitadas)
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tasa de Contacto:</span>
            <span className="stat-value">{contactRate}%</span>
            <span className="stat-detail">
              ({stats.withContact} de {stats.visited} visitadas)
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="stat-card info-card">
          <h3>📝 Información Adicional</h3>
          <div className="stat-item">
            <span className="stat-label">Con Notas:</span>
            <span className="stat-value">{stats.withNotes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Con Seguimiento:</span>
            <span className="stat-value">{stats.withFollowUp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Con Contacto:</span>
            <span className="stat-value">{stats.withContact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
