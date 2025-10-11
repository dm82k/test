import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions
export const addressService = {
  // Save multiple addresses (bulk insert with conflict handling)
  async saveAddresses(addresses) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .upsert(addresses, {
          onConflict: 'house_number,street,city',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving addresses:', error);
      throw error;
    }
  },

  // Update a single address
  async updateAddress(id, updates) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Get addresses with pagination and filtering
  async getAddresses({
    page = 1,
    limit = 100,
    city = null,
    status = null,
    visited = null,
    search = null,
  } = {}) {
    try {
      let query = supabase.from('addresses').select('*', { count: 'exact' });

      // Apply filters
      if (city) {
        query = query.eq('city', city);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (visited && visited !== 'all') {
        query = query.eq('visited', visited);
      }
      if (search) {
        query = query.or(
          `full_address.ilike.%${search}%,notes.ilike.%${search}%,contact_info.ilike.%${search}%`
        );
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .order('street', { ascending: true })
        .order('house_number', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        addresses: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Get addresses by city (for initial load)
  async getAddressesByCity(city) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('city', city)
        .order('street', { ascending: true })
        .order('house_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching addresses by city:', error);
      throw error;
    }
  },

  // Delete all addresses (for testing)
  async clearAllAddresses() {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing addresses:', error);
      throw error;
    }
  },

  // Get statistics
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('status, visited');

      if (error) throw error;

      const stats = {
        total: data.length,
        visited: data.filter((addr) => addr.visited === 'Sí').length,
        notVisited: data.filter((addr) => addr.visited === 'No').length,
        interested: data.filter((addr) => addr.status === 'Interesado').length,
        sales: data.filter((addr) => addr.status === 'Venta').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};
