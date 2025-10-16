import { supabase } from './supabaseClient';

// Supabase authentication service
export const authService = {
  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Get current session
  getSession() {
    return supabase.auth.getSession();
  },

  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            ...userData,
          },
        },
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated (synchronous)
  isAuthenticated() {
    const session = supabase.auth.getSession();
    return session?.data?.session?.user != null;
  },

  // Check session validity (async)
  async checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user != null;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Get user ID
  getUserId() {
    const session = supabase.auth.getSession();
    return session?.data?.session?.user?.id || null;
  },

  // Get user email
  getUserEmail() {
    const session = supabase.auth.getSession();
    return session?.data?.session?.user?.email || null;
  },

  // Get user metadata
  getUserMetadata() {
    const session = supabase.auth.getSession();
    return session?.data?.session?.user?.user_metadata || {};
  },
};
