import { useStore, type Product } from '../store';
import { X, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { ProductImage } from './ProductImage';

export function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currency, cart, addToCart, removeFromCart, updateCartQty } = useStore();
  const cartItem = cart.find(i => i.product.id === product.id);
  const price = currency === 'CUP' ? product.priceCUP : product.priceMLC;
  const sym = currency === 'CUP' ? '$' : '$';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fadeIn" onClick={onClose}>
      <div className="bg-gray-950 w-full max-w-lg mx-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-slideUp max-h-[90vh] overflow-y-auto border-t border-gray-800 sm:border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />
          
          <div className="p-6 pb-8">
             <div className="flex justify-between items-start mb-6 relative z-10">
               <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-1 pr-4 flex items-center gap-2 border border-gray-800">
                 <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 transition-colors"><X size={20} /></button>
                 <span className="text-sm font-bold text-gray-200">Detalles</span>
               </div>
               {product.isFeatured && (
                 <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 backdrop-blur-md">
                   <Star size={12} className="fill-amber-400" /> Destacado
                 </span>
               )}
             </div>

             <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 h-72 flex items-center justify-center mb-8 relative overflow-hidden border border-gray-800 shadow-inner">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-50" />
               <div className="relative z-10 transform transition-transform hover:scale-105 duration-500">
                 <ProductImage src={product.image} alt={product.name} className="text-9xl" />
               </div>
             </div>

             <div className="mb-8">
               <div className="flex items-center gap-2 mb-3">
                 <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">{product.category}</span>
                 {product.stock <= product.minStock && product.stock > 0 && (
                   <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-1 rounded-lg font-bold">Poco stock</span>
                 )}
               </div>
               <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{product.name}</h3>
               <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
             </div>

             <div className="flex items-center justify-between bg-gray-900/50 rounded-2xl p-5 mb-8 border border-gray-800">
               <div>
                 <p className="text-3xl font-bold text-emerald-400 tracking-tight">{sym}{price.toFixed(2)}</p>
                 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Precio por {product.unit}</p>
               </div>
               <div className="text-right">
                 <p className={`text-sm font-bold mb-1 ${product.stock > product.minStock ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-500' : 'text-red-400'}`}>
                   {product.stock > 0 ? 'Disponible' : 'Agotado'}
                 </p>
                 <p className="text-xs text-gray-500">{product.salesCount} vendidos</p>
               </div>
             </div>

             <div className="sticky bottom-0 bg-gray-950 pt-2 pb-4">
               {product.stock > 0 ? (
                 cartItem ? (
                   <div className="flex items-center gap-3 animate-fadeIn">
                     <div className="flex items-center bg-gray-900 rounded-2xl flex-1 justify-between p-2 border border-gray-800">
                       <button onClick={() => updateCartQty(product.id, cartItem.quantity - 1)} 
                         className="w-12 h-12 bg-gray-800 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors active:scale-95">
                         <Minus size={20} />
                       </button>
                       <span className="text-2xl font-bold text-white">{cartItem.quantity}</span>
                       <button onClick={() => { if (cartItem.quantity < product.stock) addToCart(product); }}
                         className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95">
                         <Plus size={20} />
                       </button>
                     </div>
                     <button onClick={() => removeFromCart(product.id)} 
                       className="w-14 h-14 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center hover:bg-red-500/20 transition-colors active:scale-95">
                       <X size={24} />
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => addToCart(product)}
                     className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 group">
                     <ShoppingCart size={22} className="group-hover:animate-bounce" /> 
                     Agregar al carrito
                   </button>
                 )
               ) : (
                 <button disabled className="w-full bg-gray-900 text-gray-500 py-4 rounded-2xl font-bold text-lg border border-gray-800 cursor-not-allowed">
                   No disponible
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
