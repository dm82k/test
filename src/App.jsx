import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import AddressTable from './components/AddressTable';
import AddressFilter from './components/AddressFilter';
import Pagination from './components/Pagination';
import { fetchAddresses } from './services/addressService';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from './services/storageService';

function App() {
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // Show 100 addresses per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Note: We no longer auto-load on mount since we generate fresh addresses
  // and merge with saved modifications during search

  // Save to localStorage whenever addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      saveToLocalStorage(addresses);
    }
  }, [addresses]);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const results = await fetchAddresses(searchParams);

      // Merge with any existing modifications from localStorage
      const savedModifications = loadFromLocalStorage();
      const mergedResults = mergeWithSavedModifications(
        results,
        savedModifications
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

  // Merge newly generated addresses with saved modifications
  const mergeWithSavedModifications = (newAddresses, savedModifications) => {
    if (!savedModifications || savedModifications.length === 0) {
      return newAddresses;
    }

    // Create a map of saved modifications by address key
    const modificationsMap = new Map();
    savedModifications.forEach((addr) => {
      const key = `${addr.house_number}-${addr.street}`;
      modificationsMap.set(key, addr);
    });

    // Apply modifications to matching addresses
    const mergedAddresses = newAddresses.map((addr) => {
      const key = `${addr.house_number}-${addr.street}`;
      const savedModification = modificationsMap.get(key);

      if (savedModification) {
        // Merge the saved modifications with the new address
        return {
          ...addr,
          visited: savedModification.visited,
          visit_date: savedModification.visit_date,
          interest_level: savedModification.interest_level,
          contact_info: savedModification.contact_info,
          notes: savedModification.notes,
          follow_up_date: savedModification.follow_up_date,
          status: savedModification.status,
        };
      }

      return addr;
    });

    console.log(
      `Merged ${savedModifications.length} saved modifications with ${newAddresses.length} new addresses`
    );
    return mergedAddresses;
  };

  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...addresses];
    const addressToUpdate = filteredAddresses[index];
    const originalIndex = addresses.findIndex(
      (addr) =>
        addr.full_address === addressToUpdate.full_address &&
        addr.latitude === addressToUpdate.latitude
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

  const clearAllData = () => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.'
      )
    ) {
      localStorage.removeItem('addressCollectorData');
      setAddresses([]);
      setFilteredAddresses([]);
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
