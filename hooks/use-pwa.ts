import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') {
      return;
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
          setSwRegistration(registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setIsInstallable(true);
      setInstallPrompt(event as unknown as PWAInstallPrompt);
      console.log('[PWA] Install prompt available');
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      console.log('[PWA] App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      console.warn('[PWA] Install prompt not available');
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('[PWA] Installation error:', error);
    }
  };

  const updateApp = async () => {
    if (!swRegistration) {
      console.warn('[PWA] Service Worker not registered');
      return;
    }

    try {
      const registration = await swRegistration.update();
      if (registration.waiting) {
        console.log('[PWA] Update available');
        // Notify user about update
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('[PWA] Update check error:', error);
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    updateApp,
    swRegistration,
  };
}
