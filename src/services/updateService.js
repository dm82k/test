// Service for handling PWA updates
export const updateService = {
  registration: null,
  updateAvailable: false,

  // Initialize the update service
  init(registration) {
    this.registration = registration;
    this.setupUpdateListeners();
  },

  // Set up service worker update listeners
  setupUpdateListeners() {
    if (!this.registration) return;

    // Listen for updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version is available
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker has taken control
      window.location.reload();
    });
  },

  // Notify that an update is available
  notifyUpdateAvailable() {
    // Dispatch custom event that components can listen to
    window.dispatchEvent(
      new CustomEvent('pwa-update-available', {
        detail: { updateAvailable: true },
      })
    );
  },

  // Apply the update
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      return false;
    }

    try {
      // Tell the waiting service worker to skip waiting and become active
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('Failed to apply update:', error);
      return false;
    }
  },

  // Check for updates manually
  async checkForUpdates() {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  },

  // Get app version from package.json or build info
  getAppVersion() {
    // You can set this during build process
    return process.env.REACT_APP_VERSION || '1.0.0';
  },
};
