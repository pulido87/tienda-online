import { useStore } from '../store';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck } from 'lucide-react';
import { ProductImage } from './ProductImage';

export function CartView() {
  const { cart, currency, updateCartQty, removeFromCart, clearCart, cartTotal, setView } = useStore();
  const sym = currency === 'CUP' ? '$' : '$';
  const total = cartTotal();
  const freeDelivery = currency === 'CUP' ? 5000 : 17;
  const remaining = freeDelivery - total;

  if (cart.length === 0) {
    return (
      <div className="animate-fadeIn text-center py-20 px-4 h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 shadow-2xl">
          <p className="text-6xl opacity-50">🛒</p>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h3>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">Explora nuestro catálogo y descubre las mejores ofertas para ti.</p>
        <button onClick={() => setView('catalog')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
          Ver catálogo <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingCart size={24} className="text-emerald-500" /> Mi Carrito</h2>
        <button onClick={clearCart} className="text-red-400/80 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-900/20 transition-colors"><Trash2 size={14} /> Vaciar todo</button>
      </div>

      {/* Free delivery progress */}
      {remaining > 0 ? (
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Truck size={48} />
           </div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <Truck size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200">Envío Gratis</p>
              <p className="text-xs text-gray-400">Te faltan <strong>{sym}{remaining.toFixed(2)}</strong> para obtenerlo</p>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 relative z-10">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all shadow-lg shadow-amber-500/20" style={{ width: `${Math.min((total / freeDelivery) * 100, 100)}%` }} />
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-emerald-500/20 backdrop-blur-sm">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-xl shadow-inner">🎉</div>
          <div>
            <p className="text-sm text-emerald-300 font-bold">¡Felicidades!</p>
            <p className="text-xs text-emerald-400/70">Tienes envío gratis en este pedido</p>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cart.map(item => {
          const price = currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC;
          return (
            <div key={item.product.id} className="bg-gray-900 rounded-2xl p-3 shadow-lg shadow-black/20 flex items-center gap-4 border border-gray-800 group hover:border-gray-700 transition-colors">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-800">
                <ProductImage src={item.product.image} alt={item.product.name} className="text-4xl" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-sm font-bold text-gray-200 truncate mb-1">{item.product.name}</p>
                <div className="flex items-center gap-2 mb-2">
                   <p className="text-emerald-400 font-bold text-sm">{sym}{(price * item.quantity).toFixed(2)}</p>
                   <p className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{sym}{price.toFixed(2)} c/u</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700">
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold text-xs text-gray-200">{item.quantity}</span>
                    <button onClick={() => { if (item.quantity < item.product.stock) updateCartQty(item.product.id, item.quantity + 1); }}
                      className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-md transition-colors"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-2xl shadow-xl shadow-black/20 p-5 mb-6 border border-gray-800">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Subtotal</span>
          <span className="font-bold text-gray-200">{sym}{total.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-gray-400">Envío</span>
          <span className={`font-medium ${remaining <= 0 ? 'text-emerald-400' : 'text-gray-200'}`}>{remaining <= 0 ? 'GRATIS' : 'Calculado al final'}</span>
        </div>
        <div className="border-t border-gray-800 pt-4 flex justify-between items-end">
          <span className="font-bold text-gray-200 text-lg">Total Estimado</span>
          <div className="text-right">
             <span className="font-bold text-2xl text-emerald-400 block leading-none">{sym}{total.toFixed(2)}</span>
             <span className="text-[10px] text-gray-500 uppercase font-medium">{currency}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button onClick={() => setView('checkout')}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 mb-3">
        Hacer pedido <ArrowRight size={20} />
      </button>
      <button onClick={() => setView('catalog')} className="w-full bg-gray-900 text-gray-400 hover:text-white py-3.5 rounded-xl font-medium text-sm hover:bg-gray-800 border border-gray-800 transition-colors">
        Seguir comprando

      </button>
    </div>
  );
}
