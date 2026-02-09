import { useStore } from '../store';
import { Home, Grid3X3, ShoppingCart, ClipboardList, User, Shield } from 'lucide-react';

export function BottomNav() {
  const { currentView, setView, cartCount, user, isAdmin, orders } = useStore();

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Inicio' },
    { id: 'catalog' as const, icon: Grid3X3, label: 'Catálogo' },
    { id: 'cart' as const, icon: ShoppingCart, label: 'Carrito', badge: cartCount() },
    { id: 'orders' as const, icon: ClipboardList, label: 'Pedidos', badge: orders.filter(o => o.status === 'pending').length },
    ...(isAdmin() ? [{ id: 'admin' as const, icon: Shield, label: 'Admin' }] : []),
    { id: 'profile' as const, icon: User, label: user ? 'Perfil' : 'Acceder' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-area-pb shadow-lg shadow-black/50">
      <div className="flex justify-around items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 relative transition-all duration-300 group ${active ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-400'}`}>
              
              {/* Active Indicator Background */}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
              )}
              
              {/* Top Active Line */}
              {active && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
              
              <div className="relative group-active:scale-95 transition-transform">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]' : ''} />
                {'badge' in tab && tab.badge ? (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1 border border-gray-900 shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-emerald-400' : 'text-gray-500'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
