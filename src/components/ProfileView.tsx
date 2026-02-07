import { useState } from 'react';
import { useStore } from '../store';
import { LogOut, Edit3, Save, ShoppingCart, Shield, Star, ClipboardList } from 'lucide-react';
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
    <div className="animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.role === 'admin' && <span className="bg-amber-400 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">👑 Admin</span>}
              {user.role === 'vendor' && <span className="bg-blue-400 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-bold">🏷️ Vendedor</span>}
            </div>
            <p className="text-green-200 text-sm">{user.phone || user.email}</p>
            {completedOrders >= 5 && (
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 text-[10px] px-2 py-0.5 rounded-full mt-1">
                <Star size={10} /> Cliente Frecuente
              </span>
            )}
          </div>
          <button onClick={startEdit} className="p-2 bg-white/10 rounded-full"><Edit3 size={18} /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{orders.length}</p>
            <p className="text-[10px] text-green-200">Pedidos</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">${totalSpent.toFixed(0)}</p>
            <p className="text-[10px] text-green-200">Gastado</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{completedOrders}</p>
            <p className="text-[10px] text-green-200">Completados</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3 animate-fadeIn">
            <h3 className="font-bold text-gray-800">Editar perfil</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Teléfono"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="font-bold text-gray-800 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setView('orders')} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><ClipboardList size={18} className="text-blue-600" /></div>
            <div className="text-left"><p className="text-sm font-bold text-gray-800">Pedidos</p><p className="text-[10px] text-gray-400">{orders.length} total</p></div>
          </button>
          <button onClick={() => setView('catalog')} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><ShoppingCart size={18} className="text-green-600" /></div>
            <div className="text-left"><p className="text-sm font-bold text-gray-800">Comprar</p><p className="text-[10px] text-gray-400">Ver catálogo</p></div>
          </button>
          {(user.role === 'admin' || user.role === 'vendor') && (
            <button onClick={() => setView('admin')} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 active:scale-95 transition-transform col-span-2">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><Shield size={18} className="text-amber-600" /></div>
              <div className="text-left"><p className="text-sm font-bold text-gray-800">Panel Admin</p><p className="text-[10px] text-gray-400">Gestionar tienda</p></div>
            </button>
          )}
        </div>

        {/* Frequent customer progress */}
        {completedOrders < 5 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-700">Programa de fidelidad</span>
            </div>
            <p className="text-xs text-amber-600 mb-2">{5 - completedOrders} pedidos más para ser Cliente Frecuente</p>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(completedOrders / 5) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={logout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 mb-8">
          <LogOut size={18} /> Cerrar sesión
        </button>

        <div className="text-center pb-4">
          <p className="text-gray-400 text-[10px]">Desarrollado por Yosmani Pulido</p>
          <p className="text-gray-300 text-[10px]">© 2025 MercadoCuba • Pinar del Río</p>
        </div>
      </div>
    </div>
  );
}
