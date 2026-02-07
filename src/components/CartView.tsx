import { useStore } from '../store';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck } from 'lucide-react';

export function CartView() {
  const { cart, currency, updateCartQty, removeFromCart, clearCart, cartTotal, setView } = useStore();
  const sym = currency === 'CUP' ? '$' : '$';
  const total = cartTotal();
  const freeDelivery = currency === 'CUP' ? 5000 : 17;
  const remaining = freeDelivery - total;

  if (cart.length === 0) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4">
        <p className="text-6xl mb-4">🛒</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
        <p className="text-gray-500 mb-6">Agrega productos para comenzar tu pedido</p>
        <button onClick={() => setView('catalog')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-transform">
          Ver catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={20} /> Carrito ({cart.length})</h2>
        <button onClick={clearCart} className="text-red-500 text-xs font-medium flex items-center gap-1"><Trash2 size={14} /> Vaciar</button>
      </div>

      {/* Free delivery progress */}
      {remaining > 0 && (
        <div className="bg-amber-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={16} className="text-amber-600" />
            <p className="text-xs text-amber-700">Te faltan <strong>{sym}{remaining.toFixed(2)}</strong> para envío gratis</p>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((total / freeDelivery) * 100, 100)}%` }} />
          </div>
        </div>
      )}
      {remaining <= 0 && (
        <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <p className="text-sm text-green-700 font-medium">¡Envío gratis aplicado!</p>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-3 mb-4">
        {cart.map(item => {
          const price = currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC;
          return (
            <div key={item.product.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <div className="text-3xl bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">{item.product.image}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{item.product.name}</p>
                <p className="text-green-600 font-bold text-sm">{sym}{(price * item.quantity).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{sym}{price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Minus size={14} /></button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={() => { if (item.quantity < item.product.stock) updateCartQty(item.product.id, item.quantity + 1); }}
                  className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center"><Plus size={14} /></button>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-400"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold">{sym}{total.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">Envío</span>
          <span className="text-green-600 font-medium">{remaining <= 0 ? 'GRATIS' : 'Según zona'}</span>
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="font-bold text-gray-800">Total estimado</span>
          <span className="font-bold text-xl text-green-600">{sym}{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <button onClick={() => setView('checkout')}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform mb-3">
        Hacer pedido <ArrowRight size={20} />
      </button>
      <button onClick={() => setView('catalog')} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium text-sm">
        Seguir comprando
      </button>
    </div>
  );
}
