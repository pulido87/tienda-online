import { useStore } from '../store';
import { Search, ShoppingCart, User, Shield } from 'lucide-react';

export function Header() {
  const { currency, toggleCurrency, cartCount, user, isAdmin, searchQuery, setSearchQuery, setView, currentView } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-lg mx-auto">
      {isAdmin() && (
        <div className="bg-amber-500 text-white text-center py-1 text-xs font-medium flex items-center justify-center gap-1">
          <Shield size={12} /> Modo {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
        </div>
      )}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <span className="text-2xl">🛒</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">MercadoCuba</h1>
              <p className="text-[10px] text-green-200">Pinar del Río • Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleCurrency} className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
              {currency}
            </button>
            <button onClick={() => setView('cart')} className="relative p-2">
              <ShoppingCart size={22} />
              {cartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount()}
                </span>
              )}
            </button>
            <button onClick={() => setView(user ? 'profile' : 'profile')} className="p-2">
              {user ? (
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
              ) : <User size={22} />}
            </button>
          </div>
        </div>
        {(currentView === 'home' || currentView === 'catalog') && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setView('catalog'); }}
              placeholder="Buscar productos..." className="w-full pl-9 pr-4 py-2 rounded-full bg-white text-gray-800 text-sm focus:outline-none" />
          </div>
        )}
      </div>
    </header>
  );
}
