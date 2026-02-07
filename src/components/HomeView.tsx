import { useStore, CATEGORIES, COMBOS } from '../store';
import { Star, TrendingUp, ChevronRight, Truck } from 'lucide-react';

export function HomeView() {
  const { products, currency, setView, setSelectedCategory, addToCart, cart, updateCartQty } = useStore();
  const featured = products.filter(p => p.isFeatured && p.isActive);
  const topSelling = [...products].filter(p => p.isActive).sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
  const sym = currency === 'CUP' ? '$' : '$';
  const getPrice = (cup: number, mlc: number) => currency === 'CUP' ? cup : mlc;

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-20">🛒</div>
        <h2 className="text-xl font-bold mb-1">¡Bienvenido!</h2>
        <p className="text-green-100 text-sm mb-3">Productos frescos con delivery a tu puerta en Pinar del Río</p>
        <div className="flex gap-2">
          <button onClick={() => setView('catalog')} className="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform">
            Ver catálogo
          </button>
          <div className="flex items-center gap-1 text-green-100 text-xs">
            <Truck size={14} /> Envío gratis +$5,000
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mx-4 mt-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl p-3 flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">¡Oferta especial!</p>
          <p className="text-amber-100 text-xs">Combo Familiar con 15% de descuento</p>
        </div>
        <button onClick={() => setView('catalog')} className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold">Ver</button>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Categorías</h3>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setView('catalog'); }}
              className="flex flex-col items-center bg-white rounded-xl p-3 shadow-sm active:scale-95 transition-transform">
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-[10px] text-gray-600 font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1"><Star size={18} className="text-amber-400" /> Destacados</h3>
          <button onClick={() => setView('catalog')} className="text-green-600 text-sm flex items-center">Ver más <ChevronRight size={16} /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {featured.map(p => {
            const inCart = cart.find(i => i.product.id === p.id);
            return (
              <div key={p.id} className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center text-4xl">{p.image}</div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-green-600 font-bold text-sm">{sym}{getPrice(p.priceCUP, p.priceMLC).toFixed(2)}</p>
                  {p.stock > 0 ? (
                    inCart ? (
                      <div className="flex items-center justify-between mt-2 bg-green-50 rounded-lg p-1">
                        <button onClick={() => updateCartQty(p.id, inCart.quantity - 1)} className="w-7 h-7 bg-white rounded-md text-sm font-bold shadow-sm">-</button>
                        <span className="text-sm font-bold text-green-700">{inCart.quantity}</span>
                        <button onClick={() => addToCart(p)} className="w-7 h-7 bg-green-600 text-white rounded-md text-sm font-bold">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="w-full mt-2 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform">
                        Agregar
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-red-500 mt-2 text-center font-medium">Agotado</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combos */}
      <div className="px-4 mt-5">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Combos Especiales</h3>
        <div className="space-y-3">
          {COMBOS.map(combo => (
            <div key={combo.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <div className="text-4xl bg-gradient-to-br from-amber-50 to-orange-50 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                {combo.image}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm">{combo.name}</h4>
                <p className="text-gray-500 text-xs truncate">{combo.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-600 font-bold">{sym}{getPrice(combo.priceCUP, combo.priceMLC).toFixed(2)}</span>
                  <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Ahorras {sym}{getPrice(combo.savingsCUP, combo.savingsCUP / 300).toFixed(0)}</span>
                </div>
              </div>
              <button className="bg-green-600 text-white p-2 rounded-lg active:scale-95"><ChevronRight size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling */}
      <div className="px-4 mt-5">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1 mb-3"><TrendingUp size={18} className="text-green-600" /> Más vendidos</h3>
        <div className="grid grid-cols-2 gap-3">
          {topSelling.map((p, i) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">{p.image}</span>
                <span className="absolute -top-2 -left-2 bg-green-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-green-600 font-bold text-sm">{sym}{getPrice(p.priceCUP, p.priceMLC).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{p.salesCount} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pedir por WhatsApp */}
      <div className="px-4 mt-5">
        <a href="https://wa.me/5359411492?text=Hola!%20Quiero%20hacer%20un%20pedido%20en%20MercadoCuba" target="_blank" rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white py-4 rounded-xl font-bold text-center active:scale-95 transition-transform">
          Pedir por WhatsApp
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8 bg-gray-800 text-white p-6 text-center">
        <p className="text-2xl mb-2">🛒</p>
        <h4 className="font-bold text-lg">MercadoCuba</h4>
        <p className="text-gray-400 text-xs mb-2">Tu tienda online en Pinar del Río</p>
        <p className="text-gray-400 text-xs">Tel: +53 59411492 | WhatsApp: +53 59411492</p>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-[10px]">Desarrollado por Yosmani Pulido</p>
          <p className="text-gray-600 text-[10px]">© 2025 MercadoCuba. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
