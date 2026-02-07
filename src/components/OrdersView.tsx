import { useStore, type OrderStatus } from '../store';
import { Clock, Check, ChefHat, Truck, Package, X, MessageSquare } from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  pending: { label: 'Pendiente', color: 'text-amber-500', icon: Clock, step: 0 },
  confirmed: { label: 'Confirmado', color: 'text-blue-500', icon: Check, step: 1 },
  preparing: { label: 'Preparando', color: 'text-purple-500', icon: ChefHat, step: 2 },
  on_the_way: { label: 'En camino', color: 'text-green-500', icon: Truck, step: 3 },
  delivered: { label: 'Entregado', color: 'text-green-700', icon: Package, step: 4 },
  cancelled: { label: 'Cancelado', color: 'text-red-500', icon: X, step: -1 },
};

export function OrdersView() {
  const { orders, user, currency, setView } = useStore();
  const sym = currency === 'CUP' ? '$' : '$';

  if (!user) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4">
        <p className="text-5xl mb-4">📋</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Inicia sesión</h3>
        <p className="text-gray-500 mb-6">Para ver tus pedidos necesitas una cuenta</p>
        <button onClick={() => setView('profile')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Acceder</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4">
        <p className="text-5xl mb-4">📦</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sin pedidos aún</h3>
        <p className="text-gray-500 mb-6">¡Haz tu primer pedido ahora!</p>
        <button onClick={() => setView('catalog')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Ver catálogo</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-2">
      <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Mis Pedidos ({orders.length})</h2>
      <div className="space-y-4">
        {orders.map(order => {
          const config = STATUS_CONFIG[order.status];
          const StatusIcon = config.icon;
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">{order.orderNumber}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.color} bg-opacity-10`} style={{ backgroundColor: 'currentColor', WebkitBackgroundClip: 'unset' }}>
                    <span className={`${config.color} flex items-center gap-1`}><StatusIcon size={12} />{config.label}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('es-CU')}</p>
              </div>

              {/* Progress Bar */}
              {order.status !== 'cancelled' && (
                <div className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {[0, 1, 2, 3, 4].map(s => (
                      <div key={s} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${s <= config.step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {s < config.step ? '✓' : s + 1}
                        </div>
                        {s < 4 && <div className={`w-6 h-0.5 ${s < config.step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="p-4">
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.image} {item.product.name} x{item.quantity}</span>
                      <span className="font-medium">{sym}{((currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && <p className="text-xs text-gray-400">+{order.items.length - 3} productos más</p>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">{order.deliveryMethod === 'pickup' ? 'Recogida' : order.deliveryZone}</p>
                    <p className="font-bold text-green-600">{sym}{order.total.toFixed(2)} {currency}</p>
                  </div>
                  <div className="flex gap-2">
                    {!order.paymentVerified && order.paymentMethod !== 'cash' && (
                      <a href={`https://wa.me/5359411492?text=Comprobante pedido ${order.orderNumber}`} target="_blank" rel="noopener noreferrer"
                        className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                        <MessageSquare size={14} /> Enviar comprobante
                      </a>
                    )}
                    {order.paymentVerified && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check size={14} /> Pago verificado</span>}
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
