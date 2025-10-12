// Simple authentication service
export const authService = {
  // Check if user is logged in
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  // Log in user
  login() {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', new Date().toISOString());
  },

  // Log out user
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
  },

  // Check if login has expired (optional - 24 hour sessions)
  isSessionValid() {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;

    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

    // Session expires after 24 hours
    return hoursDiff < 24;
  },

  // Auto-logout if session expired
  checkSession() {
    if (this.isAuthenticated() && !this.isSessionValid()) {
      this.logout();
      return false;
    }
    return this.isAuthenticated();
  },
};
