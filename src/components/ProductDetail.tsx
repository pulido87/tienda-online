import { useStore, type Product } from '../store';
import { X, Plus, Minus, ShoppingCart, Star } from 'lucide-react';

export function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currency, cart, addToCart, removeFromCart, updateCartQty } = useStore();
  const cartItem = cart.find(i => i.product.id === product.id);
  const price = currency === 'CUP' ? product.priceCUP : product.priceMLC;
  const sym = currency === 'CUP' ? '$' : '$';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl animate-slideUp max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Detalle del Producto</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center mb-4">
            <span className="text-7xl">{product.image}</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              {product.isFeatured && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"><Star size={10} /> Destacado</span>}
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">{product.category}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{product.description}</p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{sym}{price.toFixed(2)} <span className="text-sm text-gray-400">{currency}</span></p>
              <p className="text-xs text-gray-400">por {product.unit}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${product.stock > product.minStock ? 'text-green-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
              </p>
              <p className="text-xs text-gray-400">{product.salesCount} vendidos</p>
            </div>
          </div>

          {product.stock > 0 ? (
            cartItem ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-xl flex-1 justify-between p-2">
                  <button onClick={() => updateCartQty(product.id, cartItem.quantity - 1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Minus size={18} />
                  </button>
                  <span className="text-xl font-bold">{cartItem.quantity}</span>
                  <button onClick={() => { if (cartItem.quantity < product.stock) addToCart(product); }}
                    className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                    <Plus size={18} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(product.id)} className="p-3 bg-red-50 text-red-500 rounded-xl">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => addToCart(product)}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <ShoppingCart size={22} /> Agregar al carrito
              </button>
            )
          ) : (
            <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold text-lg">Agotado</button>
          )}
        </div>
      </div>
    </div>
  );
}
