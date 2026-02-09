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
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 text-gray-100 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center gap-3">
        <div className="text-3xl bg-gray-800 w-12 h-12 rounded-xl flex items-center justify-center">📲</div>
        <div className="flex-1">
          <p className="font-bold text-sm text-gray-100">Instala MercadoCuba</p>
          <p className="text-gray-400 text-xs">Accede más rápido desde tu pantalla</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
        >
          <Download size={16} /> Instalar
        </button>
        <button onClick={handleDismiss} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
