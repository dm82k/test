import { supabase } from '../services/supabaseClient';

export const databaseChecker = {
  // Check if user_id column exists
  async checkUserIdColumn() {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('user_id')
        .limit(1);

      return { exists: !error, error: error?.message };
    } catch (err) {
      return { exists: false, error: err.message };
    }
  },

  // Check if RLS is enabled
  async checkRLS() {
    try {
      // Try to access addresses without authentication context
      const { data, error } = await supabase
        .from('addresses')
        .select('count')
        .limit(1);

      // If we get data without auth context, RLS might not be enabled
      return {
        enabled: error?.code === 'PGRST116' || error?.message?.includes('RLS'),
        error: error?.message,
      };
    } catch (err) {
      return { enabled: false, error: err.message };
    }
  },

  // Check if unique constraint exists
  async checkUniqueConstraint() {
    try {
      // Try to insert a duplicate to test constraint
      const testAddress = {
        house_number: 'TEST',
        street: 'TEST_STREET',
        city: 'TEST_CITY',
        user_id: 'test-user-id',
      };

      // Insert first record
      await supabase.from('addresses').insert(testAddress);

      // Try to insert duplicate
      const { error } = await supabase.from('addresses').insert(testAddress);

      // Clean up test data
      await supabase
        .from('addresses')
        .delete()
        .eq('house_number', 'TEST')
        .eq('street', 'TEST_STREET');

      return {
        exists: error?.code === '23505', // Unique violation error
        error: error?.message,
      };
    } catch (err) {
      return { exists: false, error: err.message };
    }
  },

  // Run all checks
  async runAllChecks() {
    const userIdCheck = await this.checkUserIdColumn();
    const rlsCheck = await this.checkRLS();
    const constraintCheck = await this.checkUniqueConstraint();

    return {
      userIdColumn: userIdCheck,
      rls: rlsCheck,
      uniqueConstraint: constraintCheck,
      allGood: userIdCheck.exists && rlsCheck.enabled && constraintCheck.exists,
    };
  },
};
