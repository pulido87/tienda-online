import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem('mc_pwa_dismissed');
    if (alreadyDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('mc_pwa_dismissed', 'true');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50 animate-slideUp">
      <div className="bg-green-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="text-3xl">📲</div>
        <div className="flex-1">
          <p className="font-bold text-sm">Instala MercadoCuba</p>
          <p className="text-green-200 text-xs">Accede mas rapido desde tu pantalla</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Download size={16} /> Instalar
        </button>
        <button onClick={handleDismiss} className="p-1 text-green-200">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
