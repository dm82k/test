import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import AddressTable from './components/AddressTable';
import AddressFilter from './components/AddressFilter';
import Pagination from './components/Pagination';
import LoginForm from './components/LoginForm';
import StatisticsModal from './components/StatisticsModal';
import { fetchAddresses } from './services/addressService';
import { databaseService } from './services/databaseService';
import { authService } from './services/authService';
import { offlineService } from './services/offlineService';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import UpdateNotification from './components/UpdateNotification';
import InstallButton from './components/InstallButton';
import UserProfile from './components/UserProfile';
import MigrationPrompt from './components/MigrationPrompt';
import DebugInfo from './components/DebugInfo';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showMigration, setShowMigration] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // Show 100 addresses per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toast notifications
  const {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showSync,
    showOffline,
  } = useToast();

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await authService.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setCurrentUser(session.user);
          // Migration will be handled by auth state change listener
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        // Show migration for both initial session and new sign-ins
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setShowMigration(true);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowMigration(false);
        // Clear any user-specific data
        setAddresses([]);
        setFilteredAddresses([]);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Set up offline/online listeners
  useEffect(() => {
    offlineService.setupNetworkListeners(
      () => {
        showSync('Conexión restaurada - sincronizando datos...', 2000);
      },
      () => {
        showOffline('Sin conexión - los datos se guardarán localmente', 3000);
      }
    );
  }, [showSync, showOffline]);

  // Note: We no longer auto-load on mount since we generate fresh addresses
  // and merge with saved modifications during search

  // Save to database/offline whenever addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      offlineService.saveOffline(addresses).then((result) => {
        if (result.success) {
          if (result.synced) {
            showSuccess(result.message, 2000);
          } else {
            showOffline(result.message, 3000);
          }
        } else {
          showError(result.message, 4000);
        }
      });
    }
  }, [addresses, showSuccess, showOffline, showError]);

  // PWA Install Prompt Handler
  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      deferredPrompt = e;

      // Show a custom install button or notification
      showSuccess('¡Puedes instalar esta app en tu dispositivo!', 5000);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      showSuccess('¡App instalada correctamente!', 3000);
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showSuccess]);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const results = await fetchAddresses(searchParams);

      // Merge with saved data from database
      const mergedResults = await databaseService.loadAndMergeAddresses(
        results,
        searchParams.city
      );

      setAddresses(mergedResults);
      setFilteredAddresses(mergedResults);
    } catch (err) {
      setError(err.message);
      setAddresses([]);
      setFilteredAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (index, field, value) => {
    const updatedAddresses = [...addresses];
    const addressToUpdate = filteredAddresses[index];
    const originalIndex = addresses.findIndex(
      (addr) =>
        addr.full_address === addressToUpdate.full_address &&
        addr.house_number === addressToUpdate.house_number &&
        addr.street === addressToUpdate.street
    );

    if (originalIndex !== -1) {
      updatedAddresses[originalIndex] = {
        ...updatedAddresses[originalIndex],
        [field]: value,
      };
      setAddresses(updatedAddresses);

      // Update filtered addresses as well
      const updatedFiltered = [...filteredAddresses];
      updatedFiltered[index] = {
        ...updatedFiltered[index],
        [field]: value,
      };
      setFilteredAddresses(updatedFiltered);

      // Save individual address update to database
      try {
        await databaseService.updateAddress(updatedAddresses[originalIndex]);
      } catch (error) {
        console.error('Failed to update address in database:', error);
        // Could show a toast notification here
      }
    }
  };

  const handleFilter = (filters) => {
    let filtered = [...addresses];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (addr) =>
          addr.street.toLowerCase().includes(searchLower) ||
          addr.city.toLowerCase().includes(searchLower) ||
          (addr.notes && addr.notes.toLowerCase().includes(searchLower))
      );
    }

    // Number range filter
    if (filters.numberFrom || filters.numberTo) {
      filtered = filtered.filter((addr) => {
        const houseNum = parseInt(addr.house_number);
        if (isNaN(houseNum)) return false;

        const fromNum = filters.numberFrom ? parseInt(filters.numberFrom) : 0;
        const toNum = filters.numberTo ? parseInt(filters.numberTo) : Infinity;

        return houseNum >= fromNum && houseNum <= toNum;
      });
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((addr) => addr.status === filters.status);
    }

    // Visited filter
    if (filters.visited && filters.visited !== 'all') {
      filtered = filtered.filter((addr) => addr.visited === filters.visited);
    }

    // Interest level filter
    if (filters.interestLevel && filters.interestLevel !== 'all') {
      filtered = filtered.filter(
        (addr) => addr.interest_level === filters.interestLevel
      );
    }

    setFilteredAddresses(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAddresses = filteredAddresses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table when changing pages
    document
      .querySelector('.results-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = (user) => {
    // Auth state change will handle setting authenticated state and migration
    showSuccess(
      `¡Bienvenido, ${user.user_metadata?.fullName || user.email}!`,
      3000
    );
  };

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      // Clear user-specific offline data
      offlineService.clearUserData();

      setIsAuthenticated(false);
      setCurrentUser(null);
      setAddresses([]);
      setFilteredAddresses([]);
      setShowStatistics(false);
      showSuccess('Sesión cerrada correctamente', 2000);
    } else {
      showError('Error al cerrar sesión', 3000);
    }
  };

  const handleMigrationComplete = (result) => {
    setShowMigration(false);

    if (result.success && !result.skipped && !result.noMigrationNeeded) {
      showSuccess(
        `Migración completada: ${result.count} direcciones asignadas`,
        4000
      );
    } else if (result.skipped) {
      showWarning(
        'Migración omitida - los datos existentes no se mostrarán',
        3000
      );
    }
  };

  const handleShowStatistics = () => {
    setShowStatistics(true);
  };

  const handleCloseStatistics = () => {
    setShowStatistics(false);
  };

  const clearAllData = async () => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        await databaseService.clearAllData();
        setAddresses([]);
        setFilteredAddresses([]);
        console.log('All data cleared from database');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Error al borrar los datos. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading">🔐 Verificando autenticación...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show migration prompt if needed
  if (showMigration) {
    return <MigrationPrompt onComplete={handleMigrationComplete} />;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🏠 Recolector de Direcciones</h1>
        <p>
          Encuentra direcciones en tu área objetivo y rastrea tus visitas de
          ventas
        </p>
        <div className="header-buttons">
          <button onClick={handleShowStatistics} className="stats-button">
            📊 Ver Estadísticas
          </button>
          {addresses.length > 0 && (
            <button onClick={clearAllData} className="clear-data-button">
              🗑️ Borrar Todos los Datos
            </button>
          )}
          <UserProfile user={currentUser} onLogout={handleLogout} />
        </div>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {error && <div className="error">❌ {error}</div>}

      {loading && (
        <div className="loading">
          🔍 Buscando direcciones...
          <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
            Esto puede tardar unos segundos. Si no encuentras muchos resultados,
            prueba con una búsqueda por coordenadas o un área más amplia.
          </div>
        </div>
      )}

      {/* Address Table */}
      {addresses.length > 0 && (
        <>
          <AddressFilter addresses={addresses} onFilter={handleFilter} />
          <AddressTable
            addresses={currentAddresses}
            onUpdateAddress={updateAddress}
            totalCount={addresses.length}
            filteredCount={filteredAddresses.length}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAddresses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Statistics Modal */}
      <StatisticsModal
        isOpen={showStatistics}
        onClose={handleCloseStatistics}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Update Notification */}
      <UpdateNotification />

      {/* Install Button */}
      <InstallButton />

      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && <DebugInfo />}
    </div>
  );
}

export default App;
