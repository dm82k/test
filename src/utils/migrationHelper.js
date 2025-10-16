import { supabase } from '../services/supabaseClient';

// Migration helper for assigning existing addresses to users
export const migrationHelper = {
  // Get all addresses without user_id
  async getUnassignedAddresses() {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .is('user_id', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting unassigned addresses:', error);
      throw error;
    }
  },

  // Assign addresses to a specific user
  async assignAddressesToUser(userId, addressIds = null) {
    try {
      let query = supabase.from('addresses').update({ user_id: userId });

      if (addressIds) {
        // Assign specific addresses
        query = query.in('id', addressIds);
      } else {
        // Assign all unassigned addresses
        query = query.is('user_id', null);
      }

      const { data, error } = await query.select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error assigning addresses to user:', error);
      throw error;
    }
  },

  // Get current user and assign all unassigned addresses to them
  async assignUnassignedToCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const unassigned = await this.getUnassignedAddresses();
      if (unassigned.length === 0) {
        return {
          success: true,
          message: 'No unassigned addresses found',
          count: 0,
        };
      }

      const assigned = await this.assignAddressesToUser(user.id);

      return {
        success: true,
        message: `Assigned ${assigned.length} addresses to current user`,
        count: assigned.length,
      };
    } catch (error) {
      console.error('Error in migration:', error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  },

  // Check if migration is needed
  async checkMigrationStatus() {
    try {
      const unassigned = await this.getUnassignedAddresses();
      return {
        needsMigration: unassigned.length > 0,
        unassignedCount: unassigned.length,
      };
    } catch (error) {
      console.error('Error checking migration status:', error);
      return {
        needsMigration: false,
        unassignedCount: 0,
        error: error.message,
      };
    }
  },
};
