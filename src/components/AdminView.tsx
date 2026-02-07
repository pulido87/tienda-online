import { useState } from 'react';
import { useStore, type Product, type Category, type OrderStatus } from '../store';
import { supabase } from '../lib/supabase';

// =============================================
// ADMIN VIEW - PANEL COMPLETO CON CRUD
// =============================================

export function AdminView() {
  const [tab, setTab] = useState<string>('productos');

  return (
    <div className="pb-20">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
        color: 'white',
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>⚙️ Panel de Administración</h1>
        <p style={{ fontSize: '13px', opacity: 0.8, margin: '4px 0 0' }}>Gestiona tu tienda MercadoCuba</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '10px 12px',
        background: '#f1f5f9',
        overflowX: 'auto',
      }}>
        {[
          { id: 'productos', label: '📦 Productos' },
          { id: 'pedidos', label: '📋 Pedidos' },
          { id: 'ventas', label: '📈 Ventas' },
          { id: 'alertas', label: '⚠️ Alertas' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: tab === t.id ? 'bold' : '500',
              background: tab === t.id ? '#2563eb' : 'white',
              color: tab === t.id ? 'white' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: tab === t.id ? '0 4px 12px rgba(37,99,235,0.35)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {tab === 'productos' && <ProductosTab />}
        {tab === 'pedidos' && <PedidosTab />}
        {tab === 'ventas' && <VentasTab />}
        {tab === 'alertas' && <AlertasTab />}
      </div>
    </div>
  );
}

// Alias for default export compatibility
export default AdminView;

// =============================================
// TAB: PRODUCTOS - CRUD COMPLETO
// =============================================
function ProductosTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
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
    if (!formName.trim()) { alert('Escribe el nombre del producto'); return; }
    if (!formPriceCUP || Number(formPriceCUP) <= 0) { alert('Escribe un precio válido en CUP'); return; }
    if (!formStock || Number(formStock) < 0) { alert('Escribe el stock disponible'); return; }

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
    } else {
      addProduct({ ...productData, id: 'prod_' + Date.now() } as Product);
    }

    setSaving(false);
    resetForm();
    setMode('list');
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede ser mayor a 5MB');
      return;
    }

    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setFormImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Try to upload to Supabase Storage
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
    setConfirmDeleteId(null);
  };

  // Filter products
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  // ========== FORM VIEW ==========
  if (mode === 'form') {
    return (
      <div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: editingProduct ? '3px solid #2563eb' : '3px solid #16a34a',
        }}>
          {/* Form Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: editingProduct ? '#1e40af' : '#15803d' }}>
              {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h3>
            <button
              onClick={() => { resetForm(); setMode('list'); }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Nombre */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>📝 Nombre del producto *</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Ej: Arroz suelto"
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>📋 Descripción</label>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Descripción breve del producto..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Categoría + Unidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>📂 Categoría *</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value as Category)} style={inputStyle}>
                <option value="alimentos">🍚 Alimentos</option>
                <option value="cervezas">🍺 Cervezas</option>
                <option value="refrescos">🥤 Refrescos</option>
                <option value="aseo">🧴 Aseo</option>
                <option value="combos">📦 Combos</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>📏 Unidad</label>
              <select value={formUnit} onChange={e => setFormUnit(e.target.value)} style={inputStyle}>
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

          {/* Precios */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>💰 Precio CUP *</label>
              <input type="number" value={formPriceCUP} onChange={e => setFormPriceCUP(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>💵 Precio MLC</label>
              <input type="number" value={formPriceMLC} onChange={e => setFormPriceMLC(e.target.value)} placeholder="0.00" step="0.01" style={inputStyle} />
            </div>
          </div>

          {/* Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>📊 Stock actual *</label>
              <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>⚠️ Stock mínimo</label>
              <input type="number" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} placeholder="5" style={inputStyle} />
            </div>
          </div>

          {/* Fecha vencimiento */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>📅 Fecha de vencimiento (opcional)</label>
            <input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)} style={inputStyle} />
          </div>

          {/* Imagen URL */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>🔗 URL de imagen (opcional)</label>
            <input
              type="url"
              value={formImage.startsWith('data:') ? '' : formImage}
              onChange={e => setFormImage(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              style={inputStyle}
            />
          </div>

          {/* Upload foto */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>📸 Subir foto desde tu dispositivo</label>
            <div style={{
              border: '2px dashed #93c5fd',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              background: '#eff6ff',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              {uploading ? (
                <p style={{ margin: 0, fontSize: '14px', color: '#2563eb' }}>⏳ Subiendo foto...</p>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: '28px' }}>📷</p>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#2563eb' }}>
                    Toca para seleccionar foto (máx 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Preview de imagen */}
          {formImage && (
            <div style={{ marginBottom: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Vista previa:</p>
              <img
                src={formImage}
                alt="Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: '3px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <button
                onClick={() => setFormImage('')}
                style={{
                  display: 'block',
                  margin: '8px auto 0',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >🗑️ Quitar imagen</button>
            </div>
          )}

          {/* Destacado */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            padding: '14px',
            background: formFeatured ? '#fef9c3' : '#f8fafc',
            borderRadius: '12px',
            border: formFeatured ? '2px solid #facc15' : '2px solid #e2e8f0',
            cursor: 'pointer',
          }} onClick={() => setFormFeatured(!formFeatured)}>
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={() => {}}
              style={{ width: '24px', height: '24px', accentColor: '#eab308' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '600' }}>
              ⭐ Producto destacado {formFeatured ? '(aparecerá en inicio)' : ''}
            </span>
          </div>

          {/* Botones guardar / cancelar */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                background: editingProduct
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : 'linear-gradient(135deg, #16a34a, #15803d)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            >
              {saving ? '⏳ Guardando...' : editingProduct ? '💾 Guardar Cambios' : '✅ Crear Producto'}
            </button>
            <button
              onClick={() => { resetForm(); setMode('list'); }}
              style={{
                padding: '16px 22px',
                borderRadius: '14px',
                border: '2px solid #cbd5e1',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#64748b',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== LIST VIEW ==========
  return (
    <div>
      {/* Header with Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          📦 Productos ({products.length})
        </h2>
        <button
          onClick={openNewForm}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ➕ Agregar
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Buscar producto por nombre..."
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          fontSize: '15px',
          marginBottom: '10px',
          boxSizing: 'border-box',
          background: 'white',
        }}
      />

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: '🏷️ Todos' },
          { id: 'alimentos', label: '🍚 Alimentos' },
          { id: 'cervezas', label: '🍺 Cervezas' },
          { id: 'refrescos', label: '🥤 Refrescos' },
          { id: 'aseo', label: '🧴 Aseo' },
        ].map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCat(c.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: filterCat === c.id ? 'bold' : '500',
              background: filterCat === c.id ? '#1e40af' : 'white',
              color: filterCat === c.id ? 'white' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📦</p>
          <p style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '500' }}>No se encontraron productos</p>
          <button onClick={openNewForm} style={{
            marginTop: '16px', padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: '#16a34a', color: 'white', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
          }}>
            ➕ Agregar primer producto
          </button>
        </div>
      ) : (
        filtered.map(p => (
          <div key={p.id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: p.stock === 0 ? '2px solid #fca5a5' : !p.isActive ? '2px solid #cbd5e1' : '1px solid #e2e8f0',
            opacity: p.isActive ? 1 : 0.5,
            transition: 'all 0.2s',
          }}>
            {/* Product info row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Image */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '12px', background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', flexShrink: 0, overflow: 'hidden',
              }}>
                {p.image && p.image.startsWith('http') ? (
                  <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  p.category === 'alimentos' ? '🍚' : p.category === 'cervezas' ? '🍺' :
                  p.category === 'refrescos' ? '🥤' : p.category === 'aseo' ? '🧴' : '📦'
                )}
              </div>

              {/* Text info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>{p.name}</span>
                  {p.isFeatured && <span>⭐</span>}
                  {!p.isActive && (
                    <span style={{ fontSize: '10px', background: '#94a3b8', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      INACTIVO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0' }}>
                  {p.category} · {p.unit} · {p.salesCount || 0} vendidos
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '2px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 'bold', color: '#16a34a' }}>${p.priceCUP}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>CUP</span>
                  {p.priceMLC > 0 && (
                    <>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>${p.priceMLC}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>MLC</span>
                    </>
                  )}
                </div>
                {/* Stock badge */}
                <span style={{
                  display: 'inline-block', marginTop: '4px', fontSize: '11px', fontWeight: 'bold',
                  padding: '3px 10px', borderRadius: '20px',
                  background: p.stock === 0 ? '#fef2f2' : p.stock <= (p.minStock || 5) ? '#fffbeb' : '#f0fdf4',
                  color: p.stock === 0 ? '#dc2626' : p.stock <= (p.minStock || 5) ? '#d97706' : '#16a34a',
                }}>
                  {p.stock === 0 ? '❌ AGOTADO' : p.stock <= (p.minStock || 5) ? `⚠️ Bajo: ${p.stock}` : `✅ ${p.stock} en stock`}
                </span>
              </div>
            </div>

            {/* Delete confirmation */}
            {confirmDeleteId === p.id ? (
              <div style={{
                marginTop: '12px', padding: '14px', background: '#fef2f2',
                borderRadius: '12px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626', margin: '0 0 12px' }}>
                  🗑️ ¿Eliminar "{p.name}"?
                </p>
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '0 0 12px' }}>
                  Esta acción no se puede deshacer
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleDeleteConfirm(p.id)}
                    style={{
                      padding: '10px 28px', borderRadius: '10px', border: 'none',
                      fontSize: '14px', fontWeight: 'bold', background: '#dc2626',
                      color: 'white', cursor: 'pointer',
                    }}
                  >Sí, eliminar</button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    style={{
                      padding: '10px 28px', borderRadius: '10px', border: '2px solid #d1d5db',
                      fontSize: '14px', fontWeight: 'bold', background: 'white',
                      color: '#475569', cursor: 'pointer',
                    }}
                  >Cancelar</button>
                </div>
              </div>
            ) : (
              /* Action buttons */
              <div style={{
                display: 'flex', gap: '8px', marginTop: '12px',
                paddingTop: '12px', borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  onClick={() => openEditForm(p)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
                    fontSize: '14px', fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >✏️ Editar</button>
                <button
                  onClick={() => updateProduct(p.id, { isActive: !p.isActive })}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
                    fontSize: '14px', fontWeight: 'bold',
                    background: p.isActive ? '#f59e0b' : '#16a34a',
                    color: 'white', cursor: 'pointer',
                  }}
                >{p.isActive ? '⏸️ Desactivar' : '▶️ Activar'}</button>
                <button
                  onClick={() => setConfirmDeleteId(p.id)}
                  style={{
                    padding: '11px 15px', borderRadius: '10px', border: 'none',
                    fontSize: '14px', fontWeight: 'bold',
                    background: '#dc2626', color: 'white', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                  }}
                >🗑️</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}


// =============================================
// TAB: PEDIDOS
// =============================================
function PedidosTab() {
  const { orders, updateOrderStatus, verifyPayment } = useStore();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: '🟡 Pendiente', color: '#d97706', bg: '#fffbeb' },
    confirmed: { label: '🔵 Confirmado', color: '#2563eb', bg: '#eff6ff' },
    preparing: { label: '🟠 Preparando', color: '#ea580c', bg: '#fff7ed' },
    on_the_way: { label: '🚀 En camino', color: '#7c3aed', bg: '#f5f3ff' },
    delivered: { label: '✅ Entregado', color: '#16a34a', bg: '#f0fdf4' },
    cancelled: { label: '❌ Cancelado', color: '#dc2626', bg: '#fef2f2' },
  };

  const nextStatusMap: Record<string, OrderStatus> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'on_the_way',
    on_the_way: 'delivered',
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>
        📋 Pedidos ({orders.length})
      </h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'pending', label: '🟡 Pendientes' },
          { id: 'confirmed', label: '🔵 Confirmados' },
          { id: 'preparing', label: '🟠 Preparando' },
          { id: 'on_the_way', label: '🚀 En camino' },
          { id: 'delivered', label: '✅ Entregados' },
        ].map(f => {
          const count = f.id === 'all' ? orders.length : orders.filter(o => o.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 12px', borderRadius: '20px', border: 'none',
                fontSize: '12px', fontWeight: filter === f.id ? 'bold' : '500',
                background: filter === f.id ? '#1e40af' : 'white',
                color: filter === f.id ? 'white' : '#475569',
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >{f.label} ({count})</button>
          );
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📋</p>
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>No hay pedidos</p>
        </div>
      ) : (
        filtered.map(order => {
          const cfg = statusConfig[order.status] || statusConfig.pending;
          const isExpanded = expanded === order.id;

          return (
            <div key={order.id} style={{
              background: 'white', borderRadius: '16px', padding: '14px',
              marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
            }}>
              <div onClick={() => setExpanded(isExpanded ? null : order.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>
                      #{order.orderNumber}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}>
                      {order.customerName}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                    background: cfg.bg, color: cfg.color, fontWeight: 'bold',
                  }}>{cfg.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {order.paymentMethod} {order.paymentVerified ? '✅' : '⏳'}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
                    ${order.total.toLocaleString()} CUP
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '4px 0 0' }}>
                  {new Date(order.createdAt).toLocaleString('es-CU')} {isExpanded ? '▲' : '▼'}
                </p>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>📱 {order.customerPhone}</p>
                  {order.customerAddress && (
                    <p style={{ fontSize: '13px', margin: '4px 0' }}>📍 {order.customerAddress}</p>
                  )}
                  {order.notes && (
                    <p style={{ fontSize: '13px', margin: '4px 0', fontStyle: 'italic' }}>💬 {order.notes}</p>
                  )}

                  {/* Items */}
                  <div style={{ margin: '10px 0', background: '#f8fafc', borderRadius: '10px', padding: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 6px', color: '#475569' }}>
                      Productos del pedido:
                    </p>
                    {order.items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '13px', padding: '4px 0',
                        borderBottom: i < order.items.length - 1 ? '1px solid #e2e8f0' : 'none',
                      }}>
                        <span>{item.quantity}x {item.product.name}</span>
                        <span style={{ fontWeight: 'bold' }}>${(item.product.priceCUP * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '14px', fontWeight: 'bold', paddingTop: '6px',
                      marginTop: '6px', borderTop: '2px solid #e2e8f0',
                    }}>
                      <span>Total:</span>
                      <span style={{ color: '#16a34a' }}>${order.total.toLocaleString()} CUP</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {nextStatusMap[order.status] && (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatusMap[order.status])}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                          fontSize: '13px', fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: 'white', cursor: 'pointer',
                        }}
                      >
                        Avanzar → {statusConfig[nextStatusMap[order.status]]?.label}
                      </button>
                    )}
                    {!order.paymentVerified && order.status !== 'cancelled' && (
                      <button
                        onClick={() => verifyPayment(order.id)}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                          fontSize: '13px', fontWeight: 'bold',
                          background: '#16a34a', color: 'white', cursor: 'pointer',
                        }}
                      >✅ Verificar Pago</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}


// =============================================
// TAB: VENTAS
// =============================================
function VentasTab() {
  const { orders, products } = useStore();
  const delivered = orders.filter(o => o.status === 'delivered');
  const totalSales = delivered.reduce((s, o) => s + o.total, 0);
  const todaySales = delivered
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + o.total, 0);

  const topProducts = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
  const maxSales = topProducts[0]?.salesCount || 1;

  const handleExport = () => {
    const rows = ['Pedido,Cliente,Teléfono,Total CUP,Estado,Pago,Fecha'];
    orders.forEach(o => {
      rows.push(`${o.orderNumber},${o.customerName},${o.customerPhone},${o.total},${o.status},${o.paymentMethod},${new Date(o.createdAt).toLocaleDateString()}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_mercadocuba_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '14px', color: '#1e293b' }}>📈 Ventas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Ventas Hoy', value: `$${todaySales.toLocaleString()}`, sub: 'CUP', color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total General', value: `$${totalSales.toLocaleString()}`, sub: 'CUP', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Entregados', value: String(delivered.length), sub: 'pedidos', color: '#d97706', bg: '#fffbeb' },
          { label: 'Promedio', value: `$${delivered.length ? Math.round(totalSales / delivered.length).toLocaleString() : 0}`, sub: 'por pedido', color: '#db2777', bg: '#fdf2f8' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: kpi.bg, borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: kpi.color, fontWeight: '600', margin: 0 }}>{kpi.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: kpi.color, margin: '4px 0 0' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: kpi.color, margin: 0, opacity: 0.7 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', color: '#1e293b' }}>🏆 Top 5 Más Vendidos</h3>
        {topProducts.map((p, i) => (
          <div key={p.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: '#475569' }}>{i + 1}. {p.name}</span>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{p.salesCount || 0} vendidos</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '6px', transition: 'width 0.5s',
                background: i === 0 ? 'linear-gradient(90deg, #16a34a, #22c55e)' :
                            i === 1 ? 'linear-gradient(90deg, #2563eb, #3b82f6)' :
                            'linear-gradient(90deg, #f59e0b, #fbbf24)',
                width: `${((p.salesCount || 0) / maxSales) * 100}%`,
              }} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleExport} style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        fontSize: '16px', fontWeight: 'bold', color: 'white',
        background: 'linear-gradient(135deg, #16a34a, #15803d)',
        cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
      }}>
        📥 Exportar Reporte CSV
      </button>
    </div>
  );
}


// =============================================
// TAB: ALERTAS
// =============================================
function AlertasTab() {
  const { products } = useStore();
  const outOfStock = products.filter(p => p.stock === 0 && p.isActive);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5) && p.isActive);

  const today = new Date();
  const expiringSoon = products.filter(p => {
    if (!p.expiryDate) return false;
    const d = (new Date(p.expiryDate).getTime() - today.getTime()) / 86400000;
    return d >= 0 && d <= 7;
  });
  const expired = products.filter(p => p.expiryDate && new Date(p.expiryDate) < today);
  const total = outOfStock.length + lowStock.length + expiringSoon.length + expired.length;

  const AlertSection = ({ title, color, bg, border, items, badge }: {
    title: string; color: string; bg: string; border: string;
    items: Product[]; badge: (p: Product) => string;
  }) => items.length === 0 ? null : (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{
        fontSize: '14px', fontWeight: 'bold', color,
        padding: '10px 14px', background: bg, borderRadius: '12px', marginBottom: '8px',
      }}>{title} ({items.length})</h3>
      {items.map(p => (
        <div key={p.id} style={{
          background: 'white', borderRadius: '10px', padding: '12px',
          marginBottom: '6px', borderLeft: `4px solid ${border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontSize: '14px', color: '#1e293b' }}>{p.name}</span>
          <span style={{
            fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
            background: bg, color, fontWeight: 'bold',
          }}>{badge(p)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '14px', color: '#1e293b' }}>
        ⚠️ Alertas ({total})
      </h2>

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '56px', margin: '0 0 12px' }}>✅</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>¡Todo en orden!</p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>No hay alertas activas</p>
        </div>
      )}

      <AlertSection title="❌ Productos Agotados" color="#dc2626" bg="#fef2f2" border="#dc2626"
        items={outOfStock} badge={() => 'AGOTADO'} />
      <AlertSection title="⚠️ Stock Bajo" color="#d97706" bg="#fffbeb" border="#f59e0b"
        items={lowStock} badge={p => `Quedan: ${p.stock}`} />
      <AlertSection title="🕐 Por Vencer (7 días)" color="#ea580c" bg="#fff7ed" border="#ea580c"
        items={expiringSoon} badge={p => `Vence: ${p.expiryDate}`} />
      <AlertSection title="🚫 Vencidos" color="#991b1b" bg="#fef2f2" border="#991b1b"
        items={expired} badge={p => `Venció: ${p.expiryDate}`} />
    </div>
  );
}


// =============================================
// SHARED STYLES
// =============================================
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '5px',
  color: '#475569',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  fontSize: '15px',
  boxSizing: 'border-box',
  background: 'white',
  transition: 'border-color 0.2s',
};
