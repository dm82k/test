import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user ID
const getCurrentUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

// Database service functions
export const addressService = {
  // Save multiple addresses (bulk insert with conflict handling)
  async saveAddresses(addresses) {
    try {
      const userId = await getCurrentUserId();

      // Add user_id to all addresses
      const addressesWithUserId = addresses.map((addr) => ({
        ...addr,
        user_id: userId,
      }));

      // Try upsert with conflict resolution, fallback to insert if constraint doesn't exist
      let data, error;

      try {
        const result = await supabase
          .from('addresses')
          .upsert(addressesWithUserId, {
            onConflict: 'house_number,street,city,user_id',
            ignoreDuplicates: false,
          })
          .select();

        data = result.data;
        error = result.error;
      } catch (conflictError) {
        console.log('Conflict constraint not found, using insert instead');
        // Fallback to regular insert if unique constraint doesn't exist
        const result = await supabase
          .from('addresses')
          .insert(addressesWithUserId)
          .select();

        data = result.data;
        error = result.error;
      }

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
      // RLS will automatically ensure user can only update their own addresses
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
      // RLS will automatically filter to current user's addresses only
      let query = supabase.from('addresses').select('*', { count: 'exact' });

      // Apply filters
      if (city) {
        query = query.ilike('city', city); // Case-insensitive matching
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
      // RLS will automatically filter to current user's addresses only
      // Use case-insensitive matching for city names
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .ilike('city', city) // Case-insensitive LIKE
        .order('street', { ascending: true })
        .order('house_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching addresses by city:', error);
      throw error;
    }
  },

  // Delete all user's addresses (for testing)
  async clearAllAddresses() {
    try {
      // RLS will automatically ensure only user's addresses are deleted
      const { error } = await supabase
        .from('addresses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all user's addresses

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing addresses:', error);
      throw error;
    }
  },

  // Get statistics (user-specific due to RLS)
  async getStats() {
    try {
      // RLS will automatically filter to current user's addresses only
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

  // Get current user ID (utility function)
  getCurrentUserId,
};
