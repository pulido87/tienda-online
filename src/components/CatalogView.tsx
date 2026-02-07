import { useStore, CATEGORIES, type Product } from '../store';
import { Filter, Plus, Minus, Eye } from 'lucide-react';

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
    <div className="animate-fadeIn px-4 pt-2">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>
          <Filter size={12} className="inline mr-1" />Todos
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} productos encontrados</p>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(p => {
          const inCart = cart.find(i => i.product.id === p.id);
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center relative cursor-pointer" onClick={() => setSelectedProduct(p)}>
                <span className="text-4xl">{p.image}</span>
                {p.isFeatured && <span className="absolute top-2 left-2 bg-amber-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">⭐ TOP</span>}
                {p.stock <= p.minStock && p.stock > 0 && <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold">Poco stock</span>}
                {p.stock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Agotado</span></div>}
                <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }} className="absolute bottom-2 right-2 bg-white/80 p-1 rounded-full">
                  <Eye size={14} className="text-gray-600" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">{p.unit}</p>
                <p className="text-green-600 font-bold text-sm mt-1">{sym}{getPrice(p).toFixed(2)} <span className="text-[10px] text-gray-400">{currency}</span></p>
                {p.stock > 0 ? (
                  inCart ? (
                    <div className="flex items-center justify-between mt-2 bg-green-50 rounded-lg p-1">
                      <button onClick={() => updateCartQty(p.id, inCart.quantity - 1)} className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-green-700">{inCart.quantity}</span>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 bg-green-600 text-white rounded-md flex items-center justify-center">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1">
                      <Plus size={14} /> Agregar
                    </button>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-gray-500 font-medium">No se encontraron productos</p>
          <p className="text-gray-400 text-sm">Prueba con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
}
