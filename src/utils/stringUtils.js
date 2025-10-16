// String normalization utilities for consistent data matching

export const stringUtils = {
  // Normalize city names for consistent matching
  normalizeCity(city) {
    if (!city) return '';

    return (
      city
        .trim()
        .toLowerCase()
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        // Handle common variations
        .replace(/^barcelona\s*\/\s*/, 'barcelona / ')
        .replace(/^madrid\s*\/\s*/, 'madrid / ')
        // Normalize accents and special characters
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    );
  },

  // Normalize street names for consistent matching
  normalizeStreet(street) {
    if (!street) return '';

    return (
      street
        .trim()
        .toLowerCase()
        // Normalize common street prefixes
        .replace(/^c\.\s*/, 'carrer ')
        .replace(/^c\/\s*/, 'carrer ')
        .replace(/^av\.\s*/, 'avinguda ')
        .replace(/^avda\.\s*/, 'avinguda ')
        .replace(/^pl\.\s*/, 'plaça ')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        // Normalize accents
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    );
  },

  // Create a normalized key for address matching
  createAddressKey(houseNumber, street, city) {
    const normalizedStreet = this.normalizeStreet(street);
    const normalizedCity = this.normalizeCity(city);
    return `${houseNumber}-${normalizedStreet}-${normalizedCity}`;
  },

  // Check if two city names match (case-insensitive)
  citiesMatch(city1, city2) {
    return this.normalizeCity(city1) === this.normalizeCity(city2);
  },

  // Check if two street names match (case-insensitive)
  streetsMatch(street1, street2) {
    return this.normalizeStreet(street1) === this.normalizeStreet(street2);
  },
};
