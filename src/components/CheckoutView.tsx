import { useState } from 'react';
import { useStore, type PaymentMethod, type DeliveryMethod } from '../store';
import { ArrowLeft, ArrowRight, MapPin, Truck, CreditCard, Check, Phone, MessageSquare } from 'lucide-react';

const STEPS = ['Datos', 'Entrega', 'Pago', 'Confirmar'];
const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'transfermovil', name: 'Transfermóvil', icon: '📱' },
  { id: 'enzona', name: 'EnZona', icon: '💳' },
  { id: 'transfer', name: 'Transferencia', icon: '🏦' },
  { id: 'cash', name: 'Efectivo', icon: '💵' },
];

export function CheckoutView() {
  const { cart, currency, cartTotal, user, addOrder, clearCart, setView, deliveryZones } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [selectedZone, setSelectedZone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfermovil');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const sym = currency === 'CUP' ? '$' : '$';
  const subtotal = cartTotal();
  const zone = deliveryZones.find(z => z.id === selectedZone);
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : (subtotal >= (currency === 'CUP' ? 5000 : 17) ? 0 : (zone ? (currency === 'CUP' ? zone.feeCUP : zone.feeMLC) : 0));
  const total = subtotal + deliveryFee;

  const canNext = () => {
    if (step === 0) return name.trim() && phone.trim() && (deliveryMethod === 'pickup' || address.trim());
    if (step === 1) return deliveryMethod === 'pickup' || selectedZone;
    return true;
  };

  const placeOrder = () => {
    const num = `MC-${Date.now().toString().slice(-6)}`;
    addOrder({
      id: Date.now().toString(), orderNumber: num, items: [...cart],
      customerName: name, customerPhone: phone, customerAddress: address,
      deliveryZone: zone?.name || 'Recogida', deliveryMethod, deliveryFee,
      subtotal, total, paymentMethod, paymentVerified: paymentMethod === 'cash',
      status: 'pending', notes, createdAt: new Date().toISOString(),
    });
    setOrderNumber(num);
    setOrderPlaced(true);
    clearCart();
  };

  if (cart.length === 0 && !orderPlaced) {
    setView('cart');
    return null;
  }

  if (orderPlaced) {
    const itemsText = cart.map(i => `- ${i.product.name} x${i.quantity}`).join('%0A');
    const waMsg = `--- NUEVO PEDIDO MercadoCuba ---%0APedido: ${orderNumber}%0ACliente: ${name}%0ATel: ${phone}%0ADireccion: ${address || 'Recogida en punto'}%0A%0APRODUCTOS:%0A${itemsText}%0A%0ATotal: ${sym}${total.toFixed(2)} ${currency}%0APago: ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}%0A%0AGracias por su pedido!`;
    return (
      <div className="animate-fadeIn text-center py-12 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido realizado!</h2>
        <p className="text-gray-500 mb-2">Número de orden</p>
        <p className="text-2xl font-bold text-green-600 mb-6">{orderNumber}</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-600"><strong>Total:</strong> {sym}{total.toFixed(2)} {currency}</p>
          <p className="text-sm text-gray-600"><strong>Pago:</strong> {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}</p>
          {paymentMethod !== 'cash' && (
            <div className="mt-3 bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-medium">Datos para transferencia:</p>
              <p className="text-sm font-mono mt-1">Tarjeta: 9225 0123 4567 8901</p>
              <p className="text-sm">Titular: MercadoCuba SRL</p>
            </div>
          )}
        </div>
        <a href={`https://wa.me/5359411492?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-3">
          <MessageSquare size={20} /> Confirmar por WhatsApp
        </a>
        <div className="flex gap-3">
          <button onClick={() => setView('orders')} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm">Ver pedidos</button>
          <button onClick={() => setView('home')} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm">Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => step > 0 ? setStep(step - 1) : setView('cart')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h2 className="text-lg font-bold text-gray-800">Checkout</h2>
      </div>

      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i <= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] ${i <= step ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre completo *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1"><Phone size={14} /> Teléfono *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXX XXXX" type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Método de entrega</label>
            <div className="grid grid-cols-3 gap-2">
              {(['delivery', 'messenger', 'pickup'] as DeliveryMethod[]).map(m => (
                <button key={m} onClick={() => setDeliveryMethod(m)}
                  className={`p-3 rounded-xl text-center text-xs font-medium border-2 transition-colors ${deliveryMethod === m ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  {m === 'delivery' ? 'Delivery' : m === 'messenger' ? 'Mensajero' : 'Recogida'}
                </button>
              ))}
            </div>
          </div>
          {deliveryMethod !== 'pickup' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1"><MapPin size={14} /> Dirección *</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, entre calles, reparto..."
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          {deliveryMethod === 'pickup' ? (
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <p className="text-4xl mb-3">📍</p>
              <h3 className="font-bold text-gray-800 mb-2">Recogida en punto</h3>
              <p className="text-sm text-gray-600">Te avisaremos cuando tu pedido esté listo para recoger.</p>
              <p className="text-sm text-green-600 font-bold mt-2">Sin costo de envío</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">Selecciona tu zona de entrega:</p>
              {deliveryZones.map(z => (
                <button key={z.id} onClick={() => setSelectedZone(z.id)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-colors flex items-center justify-between ${selectedZone === z.id ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{z.name}</p>
                    <p className="text-xs text-gray-400">{z.estimatedTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {subtotal >= (currency === 'CUP' ? 5000 : 17) ? (
                        <span className="text-green-600">GRATIS</span>
                      ) : (
                        <span>{sym}{(currency === 'CUP' ? z.feeCUP : z.feeMLC).toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">Selecciona método de pago:</p>
          {PAYMENT_METHODS.map(m => (
            <button key={m.id} onClick={() => setPaymentMethod(m.id)}
              className={`w-full p-4 rounded-xl text-left border-2 transition-colors flex items-center gap-3 ${paymentMethod === m.id ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
              <span className="text-2xl">{m.icon}</span>
              <span className="font-bold text-sm">{m.name}</span>
              {paymentMethod === m.id && <Check size={18} className="text-green-600 ml-auto" />}
            </button>
          ))}
          {paymentMethod !== 'cash' && (
            <div className="bg-blue-50 rounded-xl p-4 mt-3">
              <p className="text-xs text-blue-700 font-medium mb-2"><CreditCard size={14} className="inline mr-1" />Datos para transferencia:</p>
              <p className="text-sm font-mono">Tarjeta: 9225 0123 4567 8901</p>
              <p className="text-sm">Titular: MercadoCuba SRL</p>
              <p className="text-xs text-blue-500 mt-2">Envía el comprobante por WhatsApp después de pagar</p>
            </div>
          )}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notas adicionales</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales..."
              rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h4 className="font-bold text-gray-800 mb-3">Resumen del pedido</h4>
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.product.image}</span>
                  <div>
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-sm">{sym}{((currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="font-medium">{name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Teléfono</span><span className="font-medium">{phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500"><Truck size={14} className="inline" /> Entrega</span>
                <span className="font-medium">{deliveryMethod === 'pickup' ? 'Recogida' : zone?.name || ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pago</span>
                <span className="font-medium">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}</span></div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>{sym}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-2"><span>Envío</span><span>{deliveryFee === 0 ? 'GRATIS' : `${sym}${deliveryFee.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-lg font-bold border-t border-green-200 pt-2">
              <span>Total</span><span className="text-green-600">{sym}{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 mb-4">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Atrás
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${canNext() ? 'bg-green-600 text-white active:scale-95' : 'bg-gray-200 text-gray-400'} transition-transform`}>
            Siguiente <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={placeOrder}
            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            Confirmar pedido
          </button>
        )}
      </div>
    </div>
  );
}
