const STORAGE_KEY = 'addressCollectorData';

export const saveToLocalStorage = (addresses) => {
  try {
    // Only save addresses that have been modified (have user data)
    const modifiedAddresses = addresses.filter(
      (addr) =>
        addr.visited !== 'No' ||
        addr.visit_date ||
        addr.interest_level ||
        addr.contact_info ||
        addr.notes ||
        addr.follow_up_date ||
        addr.status !== 'Sin Contactar'
    );

    const dataToSave = {
      addresses: modifiedAddresses,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      totalGenerated: addresses.length,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log(
      `Saved ${modifiedAddresses.length} modified addresses out of ${addresses.length} total`
    );
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // If still too big, try saving only the most recent modifications
    try {
      const recentlyModified = addresses
        .filter(
          (addr) =>
            addr.visit_date || addr.notes || addr.status !== 'Sin Contactar'
        )
        .slice(-1000); // Keep only last 1000 modified addresses

      const fallbackData = {
        addresses: recentlyModified,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        totalGenerated: addresses.length,
        note: 'Limited to recent modifications due to storage constraints',
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
      console.log(
        `Fallback: Saved ${recentlyModified.length} recent modifications`
      );
    } catch (fallbackError) {
      console.error('Even fallback save failed:', fallbackError);
    }
  }
};

export const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return [];

    const parsed = JSON.parse(savedData);

    // Handle different data formats for backward compatibility
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.addresses) {
      return parsed.addresses;
    }

    return [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
