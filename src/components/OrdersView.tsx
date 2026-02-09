import { useStore, type OrderStatus } from '../store';
import { Clock, Check, ChefHat, Truck, Package, X, MessageSquare } from 'lucide-react';
import { ProductImage } from './ProductImage';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof Clock; step: number }> = {
  pending: { label: 'Pendiente', color: 'text-amber-500', bgColor: 'bg-amber-500', icon: Clock, step: 0 },
  confirmed: { label: 'Confirmado', color: 'text-blue-500', bgColor: 'bg-blue-500', icon: Check, step: 1 },
  preparing: { label: 'Preparando', color: 'text-purple-500', bgColor: 'bg-purple-500', icon: ChefHat, step: 2 },
  on_the_way: { label: 'En camino', color: 'text-emerald-500', bgColor: 'bg-emerald-500', icon: Truck, step: 3 },
  delivered: { label: 'Entregado', color: 'text-emerald-600', bgColor: 'bg-emerald-600', icon: Package, step: 4 },
  cancelled: { label: 'Cancelado', color: 'text-red-500', bgColor: 'bg-red-500', icon: X, step: -1 },
};

export function OrdersView() {
  const { orders, user, currency, setView } = useStore();
  const sym = currency === 'CUP' ? '$' : '$';

  if (!user) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4 h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 shadow-2xl">
           <p className="text-6xl opacity-50">👤</p>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Inicia sesión</h3>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">Accede a tu cuenta para ver el historial de tus pedidos.</p>
        <button onClick={() => setView('profile')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
          Acceder ahora
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4 h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 shadow-2xl">
          <p className="text-6xl opacity-50">📦</p>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Sin pedidos aún</h3>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">Tus pedidos aparecerán aquí una vez que realices tu primera compra.</p>
        <button onClick={() => setView('catalog')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
          Explorar catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-6 pb-24">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Package size={24} className="text-emerald-500" /> Mis Pedidos <span className="text-gray-500 text-sm font-normal ml-1">({orders.length})</span></h2>
      <div className="space-y-4">
        {orders.map(order => {
          const config = STATUS_CONFIG[order.status];
          const StatusIcon = config.icon;
          return (
            <div key={order.id} className="bg-gray-900 rounded-2xl shadow-lg shadow-black/20 overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              {/* Header */}
              <div className="p-5 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-gray-200 tracking-wider text-sm bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">{order.orderNumber}</span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${config.color} bg-opacity-10 border border-current border-opacity-20 flex items-center gap-1.5`} style={{ backgroundColor: 'currentColor', WebkitBackgroundClip: 'unset' }}>
                    <StatusIcon size={14} /> {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleString('es-CU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Progress Bar */}
              {order.status !== 'cancelled' && (
                <div className="px-5 py-4 bg-black/20">
                  <div className="flex items-center justify-between relative">
                    {/* Line Background */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-800 -z-0" />
                    
                    {[0, 1, 2, 3, 4].map(s => {
                      const isActive = s <= config.step;
                      const isCompleted = s < config.step;
                      return (
                        <div key={s} className="relative z-10 bg-gray-900 px-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 transition-all ${isActive ? `border-${config.color.split('-')[1]}-500 ${config.bgColor} text-white` : 'border-gray-700 bg-gray-800 text-gray-500'}`}>
                            {isCompleted ? <Check size={14} /> : s + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-medium">
                     <span>Pendiente</span>
                     <span>Entregado</span>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="p-5">
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 border border-gray-700">
                          <ProductImage src={item.product.image} alt={item.product.name} className="text-lg" />
                        </div>
                        <span className="text-gray-300 text-sm">
                          <span className="text-white font-bold">{item.quantity}x</span> {item.product.name}
                        </span>
                      </div>
                      <span className="font-bold text-gray-200">{sym}{((currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-center pt-2">
                       <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">+{order.items.length - 3} productos más</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{order.deliveryMethod === 'pickup' ? '📍 Recogida en tienda' : `📍 ${order.deliveryZone}`}</p>
                    <p className="text-xl font-bold text-emerald-400">{sym}{order.total.toFixed(2)} <span className="text-xs text-gray-500 font-normal">{currency}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {!order.paymentVerified && order.paymentMethod !== 'cash' && (
                      <a href={`https://wa.me/5359411492?text=Comprobante pedido ${order.orderNumber}`} target="_blank" rel="noopener noreferrer"
                        className="bg-emerald-500/10 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                        <MessageSquare size={16} /> Enviar Comprobante
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
