import { useStore, CATEGORIES, COMBOS } from '../store';
import { Star, TrendingUp, ChevronRight, Truck } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Footer } from './Footer';

export function HomeView() {
  const { products, currency, setView, setSelectedCategory, addToCart, cart, updateCartQty } = useStore();
  const featured = products.filter(p => p.isFeatured && p.isActive);
  const topSelling = [...products].filter(p => p.isActive).sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
  const sym = currency === 'CUP' ? '$' : '$';
  const getPrice = (cup: number, mlc: number) => currency === 'CUP' ? cup : mlc;

  return (
    <div className="animate-fadeIn pb-24">
      {/* Hero Banner */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-emerald-900 via-green-900 to-gray-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20 border border-emerald-500/10">
        <div className="absolute -right-10 -top-10 text-9xl opacity-10 rotate-12">🛒</div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">¡Bienvenido!</h2>
          <p className="text-emerald-100/80 text-sm mb-6 max-w-[200px] leading-relaxed">Productos frescos y premium con delivery express en Pinar del Río</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setView('catalog')} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit">
              Ver catálogo <ChevronRight size={16} />
            </button>
            <div className="flex items-center gap-2 text-emerald-200/60 text-xs bg-black/20 px-3 py-1 rounded-lg w-fit backdrop-blur-sm">
              <Truck size={14} /> Envío gratis +$5,000
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-amber-900/80 to-orange-900/80 rounded-2xl p-4 flex items-center gap-4 border border-amber-500/20 backdrop-blur-md">
        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-xl">🔥</div>
        <div className="flex-1">
          <p className="text-amber-100 font-bold text-sm">¡Oferta Flash!</p>
          <p className="text-amber-200/60 text-xs">Combos con 15% OFF por tiempo limitado</p>
        </div>
        <button onClick={() => setView('catalog')} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 transition-colors">Ver</button>
      </div>

      {/* Categories */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Categorías</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setView('catalog'); }}
              className="group flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-lg group-active:scale-95 transition-all group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10">
                {cat.icon}
              </div>
              <span className="text-[11px] text-gray-400 font-medium group-hover:text-emerald-400 transition-colors">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="mt-8">
        <div className="px-4 flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Star size={18} className="text-amber-400 fill-amber-400" /> Destacados
          </h3>
          <button onClick={() => setView('catalog')} className="text-emerald-400 text-xs font-bold flex items-center hover:text-emerald-300 transition-colors">
            Ver todo <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 snap-x" style={{ scrollbarWidth: 'none' }}>
          {featured.map(p => {
            const inCart = cart.find(i => i.product.id === p.id);
            return (
              <div key={p.id} className="snap-start flex-shrink-0 w-40 bg-gray-900 rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-gray-800 group hover:border-emerald-500/30 transition-all">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 h-36 flex items-center justify-center relative overflow-hidden">
                  <div className="transform transition-transform group-hover:scale-110 duration-500">
                    <ProductImage src={p.image} alt={p.name} className="text-5xl" />
                  </div>
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                      ¡Últimos!
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-200 truncate mb-1">{p.name}</p>
                  <p className="text-emerald-400 font-bold text-sm mb-3">{sym}{getPrice(p.priceCUP, p.priceMLC).toFixed(2)}</p>
                  {p.stock > 0 ? (
                    inCart ? (
                      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-1">
                        <button onClick={() => updateCartQty(p.id, inCart.quantity - 1)} className="w-7 h-7 bg-gray-700 text-white rounded-md text-sm font-bold hover:bg-gray-600 transition-colors">-</button>
                        <span className="text-xs font-bold text-white">{inCart.quantity}</span>
                        <button onClick={() => addToCart(p)} className="w-7 h-7 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-500 transition-colors">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="w-full bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 hover:border-emerald-600 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all">
                        Agregar
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-red-400/80 text-center font-medium bg-red-900/10 py-1.5 rounded-lg border border-red-900/20">Agotado</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combos */}
      <div className="px-4 mt-2 mb-8">
        <h3 className="text-lg font-bold text-white tracking-tight mb-4">Combos Especiales</h3>
        <div className="space-y-3">
          {COMBOS.map(combo => (
            <div key={combo.id} className="bg-gray-900 rounded-2xl p-4 flex items-center gap-4 border border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <ProductImage src={combo.image} alt={combo.name} className="text-4xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-100 text-sm">{combo.name}</h4>
                <p className="text-gray-400 text-xs truncate">{combo.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-400 font-bold">{sym}{getPrice(combo.priceCUP, combo.priceMLC).toFixed(2)}</span>
                  <span className="bg-red-900/30 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Ahorras {sym}{getPrice(combo.savingsCUP, combo.savingsCUP / 300).toFixed(0)}</span>
                </div>
              </div>
              <button className="bg-green-600 text-white p-2 rounded-lg active:scale-95"><ChevronRight size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling */}
      <div className="px-4 mt-5">
        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-1 mb-3"><TrendingUp size={18} className="text-green-500" /> Más vendidos</h3>
        <div className="grid grid-cols-2 gap-3">
          {topSelling.map((p, i) => (
            <div key={p.id} className="bg-gray-900 rounded-xl shadow-sm shadow-black/50 p-3 flex items-center gap-3 border border-gray-800">
              <div className="relative w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <ProductImage src={p.image} alt={p.name} className="text-3xl" />
                <span className="absolute -top-2 -left-2 bg-green-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-100 truncate">{p.name}</p>
                <p className="text-green-400 font-bold text-sm">{sym}{getPrice(p.priceCUP, p.priceMLC).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{p.salesCount} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pedir por WhatsApp */}
      <div className="px-4 mt-5 mb-8">
        <a href="https://wa.me/5359411492?text=Hola!%20Quiero%20hacer%20un%20pedido%20en%20MercadoCuba" target="_blank" rel="noopener noreferrer"
          className="block w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold text-center active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
          Pedir por WhatsApp
        </a>
      </div>

      <Footer />
    </div>
  );
}
