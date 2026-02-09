import { useState } from 'react';
import { useStore, type Product, type Category, type OrderStatus } from '../store';
import { supabase } from '../lib/supabase';
import { ProductImage } from './ProductImage';
import { Package, ClipboardList, TrendingUp, AlertTriangle, Plus, Search, X, Upload, Trash2, Edit, Check, Play, Pause, Phone, MapPin, MessageCircle, ArrowRight, DollarSign, CreditCard } from 'lucide-react';

// =============================================
// ADMIN VIEW - PROFESSIONAL DARK THEME
// =============================================

export function AdminView() {
  const [tab, setTab] = useState<string>('productos');

  return (
    <div className="pb-24 min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <div className="bg-gray-950/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-800">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold m-0 flex items-center justify-center gap-2 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
              Admin Panel
            </span>
          </h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">MercadoCuba Management</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide justify-center">
          {[
            { id: 'productos', label: 'Productos', icon: Package },
            { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
            { id: 'ventas', label: 'Ventas', icon: TrendingUp },
            { id: 'pagos', label: 'Pagos', icon: CreditCard },
            { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
                    : 'bg-gray-900 text-gray-500 border border-gray-800 hover:bg-gray-800 hover:text-gray-300'}
                `}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'productos' && <ProductosTab />}
        {tab === 'pedidos' && <PedidosTab />}
        {tab === 'ventas' && <VentasTab />}
        {tab === 'pagos' && <PagosTab />}
        {tab === 'alertas' && <AlertasTab />}
      </div>
    </div>
  );
}

// =============================================
// TAB: PRODUCTOS
// =============================================
function ProductosTab() {
  const { products, addProduct, updateProduct, deleteProduct, addToast } = useStore();
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('alimentos');
  const [formPriceCUP, setFormPriceCUP] = useState('');
  const [formPriceMLC, setFormPriceMLC] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formUnit, setFormUnit] = useState('unidad');
  const [formImage, setFormImage] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formExpiry, setFormExpiry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormName(''); setFormDesc(''); setFormCategory('alimentos');
    setFormPriceCUP(''); setFormPriceMLC(''); setFormStock('');
    setFormMinStock('5'); setFormUnit('unidad'); setFormImage('');
    setFormFeatured(false); setFormExpiry('');
    setEditingProduct(null);
  };

  const openNewForm = () => {
    resetForm();
    setMode('form');
  };

  const openEditForm = (p: Product) => {
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormCategory(p.category);
    setFormPriceCUP(String(p.priceCUP));
    setFormPriceMLC(String(p.priceMLC || ''));
    setFormStock(String(p.stock));
    setFormMinStock(String(p.minStock || 5));
    setFormUnit(p.unit || 'unidad');
    setFormImage(p.image || '');
    setFormFeatured(p.isFeatured || false);
    setFormExpiry(p.expiryDate || '');
    setEditingProduct(p);
    setMode('form');
  };

  const handleSave = async () => {
    if (!formName.trim()) { addToast('Escribe el nombre del producto', 'error'); return; }
    if (!formPriceCUP || Number(formPriceCUP) <= 0) { addToast('Escribe un precio válido en CUP', 'error'); return; }
    if (!formStock || Number(formStock) < 0) { addToast('Escribe el stock disponible', 'error'); return; }

    setSaving(true);

    const productData: Omit<Product, 'id'> & { id?: string } = {
      name: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      priceCUP: Number(formPriceCUP),
      priceMLC: Number(formPriceMLC) || 0,
      stock: Number(formStock),
      minStock: Number(formMinStock) || 5,
      unit: formUnit,
      image: formImage,
      isFeatured: formFeatured,
      isActive: true,
      salesCount: editingProduct?.salesCount || 0,
      expiryDate: formExpiry || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      addToast('Producto actualizado correctamente', 'success');
    } else {
      addProduct({ ...productData, id: 'prod_' + Date.now() } as Product);
      addToast('Producto creado correctamente', 'success');
    }

    setSaving(false);
    resetForm();
    setMode('list');
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      addToast('La imagen no puede ser mayor a 5MB', 'error');
      return;
    }

    setUploading(true);

    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => setFormImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Supabase Upload
    try {
      if (supabase) {
        const fileName = `product_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);
          setFormImage(urlData.publicUrl);
        }
      }
    } catch (err) {
      console.log('Upload to Supabase failed, using local preview', err);
    }

    setUploading(false);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteProduct(id);
    addToast('Producto eliminado', 'info');
    setConfirmDeleteId(null);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  // ========== FORM VIEW ==========
  if (mode === 'form') {
    return (
      <div className="animate-slideUp">
        <div className={`
          bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 shadow-2xl border
          ${editingProduct ? 'border-emerald-500/50' : 'border-gray-800'}
        `}>
          {/* Form Title */}
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold flex items-center gap-3 ${editingProduct ? 'text-emerald-400' : 'text-white'}`}>
              {editingProduct ? <Edit size={24} /> : <Plus size={24} />}
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button
              onClick={() => { resetForm(); setMode('list'); }}
              className="bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 p-2.5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre del producto</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Ej: Arroz suelto"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Descripción</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Descripción breve..."
                rows={2}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            {/* Categoría + Unidad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Categoría</label>
                <div className="relative">
                  <select 
                    value={formCategory} 
                    onChange={e => setFormCategory(e.target.value as Category)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                  >
                    <option value="alimentos">🍚 Alimentos</option>
                    <option value="cervezas">🍺 Cervezas</option>
                    <option value="refrescos">🥤 Refrescos</option>
                    <option value="aseo">🧴 Aseo</option>
                    <option value="combos">📦 Combos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Unidad</label>
                <div className="relative">
                  <select 
                    value={formUnit} 
                    onChange={e => setFormUnit(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="libra">Libra</option>
                    <option value="kg">Kilogramo</option>
                    <option value="litro">Litro</option>
                    <option value="caja">Caja</option>
                    <option value="paquete">Paquete</option>
                    <option value="saco">Saco</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Precio CUP</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" value={formPriceCUP} onChange={e => setFormPriceCUP(e.target.value)} placeholder="0" 
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Precio MLC</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" value={formPriceMLC} onChange={e => setFormPriceMLC(e.target.value)} placeholder="0.00" step="0.01" 
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono" />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Stock actual</label>
                <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} placeholder="0" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Stock mínimo</label>
                <input type="number" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} placeholder="5" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono" />
              </div>
            </div>

            {/* Fecha vencimiento */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Vencimiento (opcional)</label>
              <input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)} 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            {/* Upload foto */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Imagen del producto</label>
              
              <div className="flex gap-4 items-start">
                 {/* URL Input */}
                 <div className="flex-1">
                    <input
                      type="url"
                      value={formImage.startsWith('data:') ? '' : formImage}
                      onChange={e => setFormImage(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                    />
                 </div>
                 
                 {/* Upload Button */}
                 <div className="relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <button className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl border border-gray-700 transition-colors">
                      {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" /> : <Upload size={20} />}
                    </button>
                 </div>
              </div>

              {/* Preview */}
              {formImage && (
                <div className="mt-4 relative group w-full h-48 bg-gray-950 rounded-2xl overflow-hidden border border-gray-800">
                  <ProductImage src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setFormImage('')}
                      className="bg-red-500/80 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-sm hover:bg-red-600 transition-colors"
                    >
                      Quitar Imagen
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Destacado */}
            <div 
              onClick={() => setFormFeatured(!formFeatured)}
              className={`
                flex items-center gap-4 p-5 rounded-2xl cursor-pointer border transition-all
                ${formFeatured ? 'bg-amber-500/10 border-amber-500/50' : 'bg-gray-950 border-gray-800 hover:border-gray-700'}
              `}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formFeatured ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`}>
                {formFeatured && <Check size={14} className="text-black" />}
              </div>
              <div>
                <span className={`block font-bold ${formFeatured ? 'text-amber-400' : 'text-gray-300'}`}>Producto Destacado</span>
                <span className="text-xs text-gray-500">Aparecerá en la sección principal de la tienda</span>
              </div>
            </div>
          </div>

          {/* Botones guardar / cancelar */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={() => { resetForm(); setMode('list'); }}
              className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`
                flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg
                flex items-center justify-center gap-2
                ${editingProduct ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all
              `}
            >
              {saving ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== LIST VIEW ==========
  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header with Add button */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Inventario</h2>
          <p className="text-gray-500 text-sm">Gestiona tu catálogo de productos</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        {/* Horizontal Category Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-[50%] scrollbar-hide items-center">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'alimentos', label: '🍚' },
            { id: 'cervezas', label: '🍺' },
            { id: 'refrescos', label: '🥤' },
            { id: 'aseo', label: '🧴' },
            { id: 'combos', label: '📦' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`
                px-4 py-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                ${filterCat === c.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-gray-900 text-gray-500 border-gray-800 hover:bg-gray-800 hover:text-gray-300'}
              `}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Package className="text-gray-600" size={40} />
          </div>
          <h3 className="text-gray-300 font-bold text-lg mb-1">No se encontraron productos</h3>
          <p className="text-gray-500 text-sm mb-6">Intenta con otra búsqueda o crea un nuevo producto</p>
          <button onClick={openNewForm} className="text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-4">
            Crear producto ahora
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`
              group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border transition-all hover:bg-gray-900 hover:border-gray-700
              ${p.stock === 0 ? 'border-red-900/30 bg-red-900/5' : !p.isActive ? 'border-gray-800 opacity-60' : 'border-gray-800'}
            `}>
              {/* Product info row */}
              <div className="flex gap-4 items-start">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-gray-950 flex-shrink-0 overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors">
                  <ProductImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-base font-bold text-white truncate">{p.name}</span>
                    {p.isFeatured && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">DESTACADO</span>}
                    {!p.isActive && (
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase">
                        Inactivo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <span className="text-emerald-400 font-bold font-mono">${p.priceCUP} CUP</span>
                    {p.priceMLC > 0 && <span className="text-blue-400 font-bold font-mono border-l border-gray-700 pl-3">${p.priceMLC} MLC</span>}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold
                      ${p.stock === 0 ? 'bg-red-500/10 text-red-400' : p.stock <= (p.minStock || 5) ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= (p.minStock || 5) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {p.stock === 0 ? 'AGOTADO' : p.stock <= (p.minStock || 5) ? `BAJO STOCK: ${p.stock}` : `${p.stock} UNIDADES`}
                    </div>
                    
                    <span className="text-xs text-gray-500">{p.salesCount || 0} ventas</span>
                  </div>
                </div>
              </div>

              {/* Delete confirmation */}
              {confirmDeleteId === p.id ? (
                <div className="mt-4 p-4 bg-red-950/30 rounded-xl border border-red-900/50 flex items-center justify-between animate-fadeIn">
                  <span className="text-sm font-bold text-red-400">¿Eliminar definitivamente?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(p.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                /* Action buttons */
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800/50">
                  <button
                    onClick={() => openEditForm(p)}
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button
                    onClick={() => updateProduct(p.id, { isActive: !p.isActive })}
                    className={`
                      flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${p.isActive ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}
                    `}
                  >
                    {p.isActive ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Activar</>}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// =============================================
// TAB: PEDIDOS
// =============================================
function PedidosTab() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    preparing: { label: 'Preparando', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    on_the_way: { label: 'En camino', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    delivered: { label: 'Entregado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const nextStatusMap: Record<string, OrderStatus> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'on_the_way',
    on_the_way: 'delivered',
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1">Pedidos</h2>
            <p className="text-gray-500 text-sm">Seguimiento en tiempo real</p>
         </div>
         <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-700">{orders.length} Total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'pending', label: '🟡 Pendientes' },
          { id: 'confirmed', label: '🔵 Confirmados' },
          { id: 'preparing', label: '🟠 Preparando' },
          { id: 'on_the_way', label: '🚀 En camino' },
          { id: 'delivered', label: '✅ Entregados' },
        ].map(f => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                ${isActive 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-gray-900 text-gray-500 border-gray-800 hover:bg-gray-800 hover:text-gray-300'}
              `}
            >{f.label}</button>
          );
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
          <ClipboardList className="mx-auto text-gray-600 mb-4" size={40} />
          <p className="text-gray-400 font-bold">No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const isExpanded = expanded === order.id;

            return (
              <div key={order.id} className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-gray-700 shadow-2xl' : 'border-gray-800 hover:border-gray-700'}`}>
                
                {/* Header Row */}
                <div onClick={() => setExpanded(isExpanded ? null : order.id)} className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-gray-500 mb-0.5">#{order.orderNumber}</span>
                      <span className="text-base font-bold text-white">{order.customerName}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                           <span className="capitalize">{order.paymentMethod}</span>
                           {order.paymentVerified ? <Check size={12} className="text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                        <p className="text-[10px] text-gray-600">{new Date(order.createdAt).toLocaleString('es-CU')}</p>
                     </div>
                     <span className="text-lg font-bold text-emerald-400 font-mono">
                       ${order.total.toLocaleString()}
                     </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-gray-950/50 border-t border-gray-800 p-5 animate-slideUp">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Teléfono</p>
                          <a href={`tel:${order.customerPhone}`} className="text-sm font-medium text-white flex items-center gap-2 hover:text-emerald-400">
                             <Phone size={14} /> {order.customerPhone}
                          </a>
                       </div>
                       <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Dirección</p>
                          <p className="text-xs font-medium text-white flex items-start gap-2">
                             <MapPin size={14} className="mt-0.5 flex-shrink-0" /> 
                             <span className="truncate">{order.customerAddress || 'Recogida en tienda'}</span>
                          </p>
                       </div>
                    </div>

                    {order.notes && (
                      <div className="mb-6 bg-amber-900/10 border border-amber-900/30 p-3 rounded-xl">
                        <p className="text-[10px] font-bold text-amber-500 mb-1 uppercase flex items-center gap-1"><MessageCircle size={10} /> Nota del cliente</p>
                        <p className="text-xs text-amber-200/80 italic">"{order.notes}"</p>
                      </div>
                    )}

                    {/* Products List */}
                    <div className="mb-6">
                       <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Productos ({order.items.length})</p>
                       <div className="space-y-2">
                          {order.items.map((item, i) => (
                             <div key={i} className="flex justify-between items-center text-sm p-3 bg-gray-900 rounded-xl border border-gray-800">
                                <span className="text-gray-300 font-medium"><span className="text-emerald-500 font-bold">{item.quantity}x</span> {item.product.name}</span>
                                <span className="text-gray-400 font-mono text-xs">${(item.product.priceCUP * item.quantity).toLocaleString()}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2">
                      {nextStatusMap[order.status] && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatusMap[order.status])}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                        >
                          Avanzar a {statusConfig[nextStatusMap[order.status]].label} <ArrowRight size={16} />
                        </button>
                      )}
                      
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                         <button
                           onClick={() => updateOrderStatus(order.id, 'cancelled')}
                           className="px-4 py-3 bg-gray-800 hover:bg-red-900/20 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-900/30 rounded-xl font-bold text-sm transition-all"
                         >
                           Cancelar
                         </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================
// TAB: PAGOS
// =============================================
function PagosTab() {
  const { paymentInfos, addPaymentInfo, deletePaymentInfo, addToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [type, setType] = useState<any>('transfermovil');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleAdd = () => {
    if (!name.trim()) { addToast('El nombre es obligatorio', 'error'); return; }
    
    addPaymentInfo({
      id: Date.now().toString(),
      type,
      name,
      accountNumber: account,
      beneficiary,
      phone,
      instructions,
      icon: type === 'transfermovil' ? '📱' : type === 'enzona' ? '💳' : type === 'cash' ? '💵' : '🏦'
    });
    
    addToast('Método de pago agregado', 'success');
    setShowForm(false);
    setName(''); setAccount(''); setBeneficiary(''); setPhone(''); setInstructions('');
  };

  return (
    <div className="animate-fadeIn space-y-6">
       <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1">Métodos de Pago</h2>
            <p className="text-gray-500 text-sm">Gestiona las cuentas para recibir pagos</p>
         </div>
         <button 
           onClick={() => setShowForm(!showForm)}
           className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
         >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancelar' : 'Nuevo Método'}
         </button>
      </div>

      {showForm && (
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 animate-slideUp shadow-xl">
           <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
             <CreditCard size={20} /> Agregar cuenta de pago
           </h3>
           
           <div className="grid gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipo de plataforma</label>
                <div className="grid grid-cols-2 gap-2">
                  {['transfermovil', 'enzona', 'transfer', 'cash'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setType(t)}
                      className={`
                        p-3 rounded-xl text-sm font-bold border transition-all capitalize
                        ${type === t ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-800'}
                      `}
                    >
                      {t === 'transfermovil' ? '📱 Transfermóvil' : t === 'enzona' ? '💳 EnZona' : t === 'transfer' ? '🏦 Banco' : '💵 Efectivo'}
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre para mostrar</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Transfermóvil (Mi nombre)" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
             </div>

             {type !== 'cash' && (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{type === 'transfermovil' ? 'Número de teléfono' : 'Número de cuenta/tarjeta'}</label>
                      <input type="text" value={type === 'transfermovil' ? phone : account} onChange={e => type === 'transfermovil' ? setPhone(e.target.value) : setAccount(e.target.value)} 
                        placeholder={type === 'transfermovil' ? '5xxxxxxx' : '9225 xxxx xxxx xxxx'}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-mono" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre del beneficiario</label>
                      <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="Nombre del titular"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                   </div>
                 </div>
               </>
             )}
             
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Instrucciones adicionales</label>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ej: Enviar captura de pantalla al WhatsApp..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none h-20 resize-none" />
             </div>

             <button onClick={handleAdd} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all">
               Guardar Método de Pago
             </button>
           </div>
        </div>
      )}

      <div className="grid gap-4">
        {paymentInfos.map(p => (
          <div key={p.id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-800 flex items-center gap-4 group hover:border-gray-700 transition-all">
             <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
               {p.icon || '💳'}
             </div>
             <div className="flex-1">
               <h4 className="font-bold text-white text-lg">{p.name}</h4>
               <div className="flex flex-col gap-0.5 text-sm text-gray-400">
                 {p.accountNumber && <span className="font-mono text-emerald-400">{p.accountNumber}</span>}
                 {p.phone && <span className="font-mono text-emerald-400">{p.phone}</span>}
                 {p.beneficiary && <span>{p.beneficiary}</span>}
                 {p.instructions && <span className="text-xs italic opacity-70 mt-1">{p.instructions}</span>}
               </div>
             </div>
             <button onClick={() => { deletePaymentInfo(p.id); addToast('Método de pago eliminado', 'info'); }} className="p-3 bg-gray-950 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all border border-gray-800 hover:border-red-900/30">
               <Trash2 size={18} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// TABS: VENTAS & ALERTAS (Placeholders mejorados)
// =============================================
function VentasTab() {
   return (
      <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800 animate-fadeIn">
         <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-900/30">
            <TrendingUp className="text-emerald-500" size={40} />
         </div>
         <h3 className="text-white font-bold text-lg mb-2">Panel de Ventas</h3>
         <p className="text-gray-500 text-sm max-w-xs mx-auto">Próximamente podrás ver gráficas detalladas de tus ingresos diarios, semanales y mensuales.</p>
      </div>
   );
}

function AlertasTab() {
   return (
      <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800 animate-fadeIn">
         <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-900/30">
            <AlertTriangle className="text-amber-500" size={40} />
         </div>
         <h3 className="text-white font-bold text-lg mb-2">Centro de Alertas</h3>
         <p className="text-gray-500 text-sm max-w-xs mx-auto">Aquí recibirás notificaciones sobre stock bajo, pedidos atrasados y mensajes de sistema.</p>
      </div>
   );
}

export default AdminView;
