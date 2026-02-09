import { useState } from 'react';
import { useStore } from '../store';
import { LogOut, Edit3, Save, ShoppingCart, Shield, Star, ClipboardList, ChevronRight } from 'lucide-react';
import { AuthView } from './AuthView';

export function ProfileView() {
  const { user, logout, setView, orders, login } = useStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  if (!user) return <AuthView />;

  const totalSpent = orders.reduce((t, o) => t + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  const startEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditing(true);
  };

  const saveEdit = () => {
    login(editName, editPhone, user.role);
    setEditing(false);
  };

  return (
    <div className="animate-fadeIn pb-24 min-h-screen bg-gray-950 text-gray-100">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-gray-900 to-gray-900 text-white p-6 pb-10 rounded-b-[2.5rem] shadow-xl border-b border-gray-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-emerald-900/50 border border-emerald-400/20">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
              {user.role === 'admin' && <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">👑 Admin</span>}
              {user.role === 'vendor' && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">🏷️ Vendedor</span>}
            </div>
            <p className="text-gray-400 text-sm font-medium">{user.phone || user.email}</p>
            {completedOrders >= 5 && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-1 rounded-full mt-2 backdrop-blur-sm">
                <Star size={10} className="fill-amber-300" /> Cliente VIP
              </span>
            )}
          </div>
          <button onClick={startEdit} className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl backdrop-blur-sm transition-colors"><Edit3 size={18} className="text-emerald-400" /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
          <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 text-center hover:bg-gray-800/60 transition-colors">
            <p className="text-2xl font-bold text-white mb-1">{orders.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Pedidos</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 text-center hover:bg-gray-800/60 transition-colors">
            <p className="text-2xl font-bold text-emerald-400 mb-1">${totalSpent.toFixed(0)}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Gastado</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 text-center hover:bg-gray-800/60 transition-colors">
            <p className="text-2xl font-bold text-blue-400 mb-1">{completedOrders}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Completados</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        {/* Edit Form */}
        {editing && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-5 mb-6 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-white flex items-center gap-2"><Edit3 size={16} className="text-emerald-500" /> Editar perfil</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 ml-1 mb-1 block">Nombre completo</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-500 ml-1 mb-1 block">Teléfono de contacto</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Teléfono"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition-colors border border-gray-700">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all">
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 ml-1">Acciones rápidas</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => setView('orders')} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-800 transition-all active:scale-95 group shadow-sm">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
              <ClipboardList size={22} className="text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-200">Pedidos</p>
              <p className="text-[10px] text-gray-500">Historial y estado</p>
            </div>
          </button>
          
          <button onClick={() => setView('catalog')} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-800 transition-all active:scale-95 group shadow-sm">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <ShoppingCart size={22} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-200">Comprar</p>
              <p className="text-[10px] text-gray-500">Ir al catálogo</p>
            </div>
          </button>
          
          {(user.role === 'admin' || user.role === 'vendor') && (
            <button onClick={() => setView('admin')} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-800 transition-all active:scale-95 group col-span-2 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/40 transition-colors relative z-10">
                <Shield size={22} className="text-amber-500" />
              </div>
              <div className="text-left relative z-10">
                <p className="text-sm font-bold text-gray-200">Panel Administrativo</p>
                <p className="text-[10px] text-gray-500">Gestionar tienda, productos y usuarios</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-gray-600 group-hover:text-amber-500 transition-colors" />
            </button>
          )}
          
          <button onClick={() => logout()} className="col-span-2 bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95 mt-2">
            <LogOut size={18} />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>
        </div>
        
        <div className="text-center pb-8">
           <p className="text-[10px] text-gray-600">Versión 1.0.0 • MercadoCuba</p>
        </div>
      </div>
    </div>
  );
}
