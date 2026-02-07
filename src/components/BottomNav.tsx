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
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 relative transition-colors ${active ? 'text-green-600' : 'text-gray-400'}`}>
              {active && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-green-600 rounded-full" />}
              <div className="relative">
                <Icon size={20} />
                {'badge' in tab && tab.badge ? (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
