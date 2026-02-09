import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { AuthView } from './components/AuthView';
import { AdminView } from './components/AdminView';
import { ProfileView } from './components/ProfileView';
import { ProductDetail } from './components/ProductDetail';
import { ChatBot } from './components/ChatBot';
import { PWAInstall } from './components/PWAInstall';
import { ToastContainer } from './components/ToastContainer';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Iniciando...');

  useEffect(() => {
    const steps = [
      { p: 20, m: 'Conectando con el servidor...' },
      { p: 50, m: 'Cargando productos...' },
      { p: 75, m: 'Preparando catálogo...' },
      { p: 100, m: '¡Listo!' },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setMessage(steps[i].m);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onFinish, 300);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="animate-bounce mb-6 relative">
        <div className="text-7xl relative z-10">🛒</div>
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Mercado<span className="text-emerald-500">Cuba</span></h1>
      <p className="text-gray-400 text-sm mb-1">Tu tienda online • Pinar del Río</p>
      <p className="text-gray-600 text-[10px] mb-8">Desarrollado por Yosmani Pulido</p>
      <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3 border border-gray-800">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-emerald-500/80 text-xs font-medium animate-pulse">{message}</p>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const { currentView, selectedProduct, setSelectedProduct, syncWithSupabase, isLoading, supabaseConnected, user } = store;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const renderView = () => {
    if (currentView === 'profile' && !user) {
      return <AuthView />;
    }
    if (currentView === 'admin' && (!user || (user.role !== 'admin' && user.role !== 'vendor'))) {
      return <AuthView />;
    }

    switch (currentView) {
      case 'home': return <HomeView />;
      case 'catalog': return <CatalogView />;
      case 'cart': return <CartView />;
      case 'checkout': return <CheckoutView />;
      case 'orders': return <OrdersView />;
      case 'profile': return <ProfileView />;
      case 'admin': return <AdminView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 max-w-lg mx-auto relative shadow-2xl shadow-black border-x border-gray-900/50">
      {!isLoading && supabaseConnected && (
        <div className="bg-emerald-950/30 backdrop-blur-sm border-b border-emerald-900/30 text-emerald-400 text-[10px] text-center py-0.5 font-medium flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Conectado a Supabase — Datos sincronizados
        </div>
      )}
      {user && (user.role === 'admin' || user.role === 'vendor') && (
        <div className="bg-amber-950/30 backdrop-blur-sm border-b border-amber-900/30 text-amber-400 text-[10px] text-center py-0.5 font-medium flex items-center justify-center gap-1">
          <span>👑</span>
          Modo {user.role === 'admin' ? 'Administrador' : 'Vendedor'}: {user.name}
        </div>
      )}
      <Header />
      <main className="pb-20 min-h-screen">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
            <div className="animate-spin text-4xl mb-4 text-emerald-500">🔄</div>
            <p className="text-gray-500 text-sm animate-pulse">Cargando datos...</p>
          </div>
        ) : (
          renderView()
        )}
      </main>
      <BottomNav />
      <ChatBot />
      <PWAInstall />
      <ToastContainer />
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
