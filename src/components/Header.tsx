import { useStore } from '../store';
import { Search, ShoppingCart, User, Shield } from 'lucide-react';

export function Header() {
  const { currency, toggleCurrency, cartCount, user, isAdmin, searchQuery, setSearchQuery, setView, currentView } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-lg mx-auto bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      {isAdmin() && (
        <div className="bg-amber-500/10 text-amber-500 border-b border-amber-500/20 text-center py-1 text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-sm">
          <Shield size={12} /> Modo {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
        </div>
      )}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🛒</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white tracking-tight">Mercado<span className="text-emerald-500">Cuba</span></h1>
              <p className="text-[10px] text-gray-400 font-medium">Pinar del Río • Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleCurrency} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-xs font-bold transition-colors">
              {currency}
            </button>
            <button onClick={() => setView('cart')} className="relative p-2 text-gray-300 hover:text-white transition-colors">
              <ShoppingCart size={22} />
              {cartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm border border-gray-900">
                  {cartCount()}
                </span>
              )}
            </button>
            <button onClick={() => setView(user ? 'profile' : 'profile')} className="p-2 text-gray-300 hover:text-white transition-colors">
              {user ? (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border border-emerald-400/20">
                  {user.name.charAt(0)}
                </div>
              ) : <User size={22} />}
            </button>
          </div>
        </div>
        {(currentView === 'home' || currentView === 'catalog') && (
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setView('catalog'); }}
              placeholder="Buscar productos..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all" />
          </div>
        )}
      </div>
    </header>
  );
}
