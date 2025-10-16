import { addressService } from './supabaseClient';
import { stringUtils } from '../utils/stringUtils';

// Enhanced storage service that uses Supabase database
export const databaseService = {
  // Save addresses to database (only saves modified ones for efficiency)
  async saveAddresses(addresses) {
    try {
      // Filter addresses that have been modified
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

      if (modifiedAddresses.length === 0) {
        console.log('No modified addresses to save');
        return [];
      }

      // Prepare addresses for database (remove null coordinates)
      const addressesToSave = modifiedAddresses.map((addr) => ({
        house_number: addr.house_number,
        street: addr.street,
        full_address: addr.full_address,
        city: addr.city || '',
        province: addr.province || '',
        visited: addr.visited,
        visit_date: addr.visit_date || null,
        status: addr.status,
        interest_level: addr.interest_level || null,
        contact_info: addr.contact_info || null,
        notes: addr.notes || null,
        follow_up_date: addr.follow_up_date || null,
      }));

      const result = await addressService.saveAddresses(addressesToSave);
      console.log(`Saved ${result.length} addresses to database`);
      return result;
    } catch (error) {
      console.error('Failed to save to database:', error);
      throw error;
    }
  },

  // Load addresses from database and merge with generated ones
  async loadAndMergeAddresses(generatedAddresses, city) {
    try {
      // Get saved addresses from database for this city (case-insensitive)
      const savedAddresses = await addressService.getAddressesByCity(city);

      if (savedAddresses.length === 0) {
        return generatedAddresses;
      }

      // Create a map of saved addresses by normalized address key
      const savedMap = new Map();
      savedAddresses.forEach((addr) => {
        // Use normalized key for better matching
        const key = stringUtils.createAddressKey(
          addr.house_number,
          addr.street,
          addr.city
        );
        savedMap.set(key, addr);
      });

      // Merge saved data with generated addresses
      const mergedAddresses = generatedAddresses.map((addr) => {
        // Use normalized key for matching
        const key = stringUtils.createAddressKey(
          addr.house_number,
          addr.street,
          addr.city
        );
        const savedAddr = savedMap.get(key);

        if (savedAddr) {
          return {
            ...addr,
            id: savedAddr.id, // Include database ID
            visited: savedAddr.visited,
            visit_date: savedAddr.visit_date,
            status: savedAddr.status,
            interest_level: savedAddr.interest_level,
            contact_info: savedAddr.contact_info,
            notes: savedAddr.notes,
            follow_up_date: savedAddr.follow_up_date,
          };
        }

        return addr;
      });

      console.log(
        `Merged ${savedAddresses.length} saved addresses with ${generatedAddresses.length} generated addresses (normalized matching)`
      );
      return mergedAddresses;
    } catch (error) {
      console.error('Failed to load from database:', error);
      // Return generated addresses if database fails
      return generatedAddresses;
    }
  },

  // Update a single address in the database
  async updateAddress(address) {
    try {
      if (!address.id) {
        // If no ID, this is a new modification - save it
        const result = await this.saveAddresses([address]);
        return result[0];
      } else {
        // Update existing address
        const updates = {
          visited: address.visited,
          visit_date: address.visit_date || null,
          status: address.status,
          interest_level: address.interest_level || null,
          contact_info: address.contact_info || null,
          notes: address.notes || null,
          follow_up_date: address.follow_up_date || null,
        };

        return await addressService.updateAddress(address.id, updates);
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  },

  // Get statistics from database
  async getStats() {
    try {
      return await addressService.getStats();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        total: 0,
        visited: 0,
        notVisited: 0,
        interested: 0,
        sales: 0,
      };
    }
  },

  // Clear all data (for testing)
  async clearAllData() {
    try {
      return await addressService.clearAllAddresses();
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  },
};
