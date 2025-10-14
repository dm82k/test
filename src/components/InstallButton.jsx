import React, { useState, useEffect } from 'react';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      console.log('App installed');
      setDeferredPrompt(null);
      setShowButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="install-button"
      title="Instalar aplicación"
    >
      📱 Instalar App
    </button>
  );
};

export default InstallButton;
