import { useStore, CATEGORIES, type Product } from '../store';
import { Filter, Plus, Minus, Eye } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Footer } from './Footer';

export function CatalogView() {
  const { products, currency, searchQuery, selectedCategory, setSelectedCategory, cart, addToCart, updateCartQty, setSelectedProduct } = useStore();
  const sym = currency === 'CUP' ? '$' : '$';
  const getPrice = (p: Product) => currency === 'CUP' ? p.priceCUP : p.priceMLC;

  const filtered = products.filter(p => {
    if (!p.isActive) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fadeIn px-4 pt-6 pb-24">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-6 -mx-4 px-4 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === 'all' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}>
          <Filter size={14} className="inline mr-2" />Todos
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}>
            <span className="mr-2">{cat.icon}</span>{cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 font-medium">{filtered.length} productos encontrados</p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(p => {
          const inCart = cart.find(i => i.product.id === p.id);
          return (
            <div key={p.id} className="bg-gray-900 rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-gray-800 group hover:border-gray-700 transition-colors">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 h-36 flex items-center justify-center relative cursor-pointer overflow-hidden" onClick={() => setSelectedProduct(p)}>
                <div className="transform transition-transform group-hover:scale-110 duration-500">
                  <ProductImage src={p.image} alt={p.name} className="text-6xl" />
                </div>
                {p.isFeatured && <span className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] px-2 py-1 rounded-md font-bold shadow-sm backdrop-blur-sm">⭐ TOP</span>}
                {p.stock <= p.minStock && p.stock > 0 && <span className="absolute top-2 right-2 bg-amber-900/80 text-amber-200 text-[9px] px-2 py-1 rounded-md font-bold backdrop-blur-sm border border-amber-500/20">Poco stock</span>}
                {p.stock === 0 && <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Agotado</span></div>}
                <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }} className="absolute bottom-2 right-2 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-colors">
                  <Eye size={16} className="text-white/80" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-gray-100 truncate mb-1">{p.name}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{p.unit}</p>
                <div className="flex items-center justify-between mt-2">
                   <p className="text-emerald-400 font-bold text-sm">{sym}{getPrice(p).toFixed(2)}</p>
                   {inCart && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">x{inCart.quantity}</span>}
                </div>
                
                {p.stock > 0 ? (
                  inCart ? (
                    <div className="flex items-center justify-between mt-3 bg-gray-800 rounded-xl p-1 border border-gray-700">
                      <button onClick={() => updateCartQty(p.id, inCart.quantity - 1)} className="w-8 h-8 bg-gray-700 text-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                        <Minus size={14} />
                      </button>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} className="w-full mt-3 bg-gray-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg">
                      <Plus size={14} /> Agregar
                    </button>
                  )
                ) : (
                  <button disabled className="w-full mt-3 bg-gray-800/50 text-gray-600 py-2 rounded-xl text-xs font-bold cursor-not-allowed border border-gray-800">
                    No disponible
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
             <p className="text-4xl opacity-50">🔍</p>
          </div>
          <p className="text-gray-300 font-bold text-lg mb-1">No encontramos nada</p>
          <p className="text-gray-500 text-sm">Intenta con otra categoría o término</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
