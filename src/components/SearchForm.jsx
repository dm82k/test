import React, { useState } from 'react';

const SearchForm = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'España',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.city.trim()) {
      alert('Por favor, introduce el nombre de una ciudad');
      return;
    }

    onSearch({
      type: 'city',
      city: formData.city.trim(),
      state: formData.state.trim() || null,
      country: formData.country.trim(),
    });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Ciudad *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="ej., Barcelona"
            required
          />
        </div>
        <div className="form-group">
          <label>Provincia/Región</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="ej., Barcelona"
          />
        </div>
      </div>
      <div className="form-group">
        <label>País</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="España"
        />
      </div>

      <button type="submit" className="search-button" disabled={loading}>
        {loading ? '🔍 Buscando...' : '🔍 Buscar Direcciones'}
      </button>
    </form>
  );
};

export default SearchForm;
