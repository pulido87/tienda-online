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
    <div className="fixed inset-0 bg-gradient-to-b from-green-600 to-green-800 flex flex-col items-center justify-center z-50">
      <div className="animate-bounce mb-6">
        <div className="text-7xl">🛒</div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-1">MercadoCuba</h1>
      <p className="text-green-200 text-sm mb-1">Tu tienda online • Pinar del Río</p>
      <p className="text-green-300 text-[10px] mb-8">Desarrollado por Yosmani Pulido</p>
      <div className="w-48 h-1.5 bg-green-900 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-green-200 text-xs">{message}</p>
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
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative shadow-2xl">
      {!isLoading && supabaseConnected && (
        <div className="bg-green-500 text-white text-[10px] text-center py-0.5 font-medium">
          🟢 Conectado a Supabase — Datos sincronizados
        </div>
      )}
      {user && (user.role === 'admin' || user.role === 'vendor') && (
        <div className="bg-amber-500 text-white text-[10px] text-center py-0.5 font-medium">
          👑 Modo {user.role === 'admin' ? 'Administrador' : 'Vendedor'}: {user.name}
        </div>
      )}
      <Header />
      <main className="pb-20 min-h-screen">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-gray-500 text-sm">Cargando datos...</p>
          </div>
        ) : (
          renderView()
        )}
      </main>
      <BottomNav />
      <ChatBot />
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
