import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import AddressTable from './components/AddressTable';
import AddressFilter from './components/AddressFilter';
import Pagination from './components/Pagination';
import { fetchAddresses } from './services/addressService';
import { databaseService } from './services/databaseService';

function App() {
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // Show 100 addresses per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Note: We no longer auto-load on mount since we generate fresh addresses
  // and merge with saved modifications during search

  // Save to database whenever addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      databaseService.saveAddresses(addresses).catch((error) => {
        console.error('Failed to save to database:', error);
        // Could show a toast notification here
      });
    }
  }, [addresses]);

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
          addr.full_address.toLowerCase().includes(searchLower) ||
          addr.city.toLowerCase().includes(searchLower) ||
          addr.postcode.toLowerCase().includes(searchLower) ||
          (addr.notes && addr.notes.toLowerCase().includes(searchLower))
      );
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

  return (
    <div className="container">
      <div className="header">
        <h1>🏠 Recolector de Direcciones</h1>
        <p>
          Encuentra direcciones en tu área objetivo y rastrea tus visitas de
          ventas
        </p>
        {addresses.length > 0 && (
          <button onClick={clearAllData} className="clear-data-button">
            🗑️ Borrar Todos los Datos
          </button>
        )}
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
    </div>
  );
}

export default App;
