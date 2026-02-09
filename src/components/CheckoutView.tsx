import { useState } from 'react';
import { useStore, type PaymentMethod, type DeliveryMethod } from '../store';
import { ArrowLeft, ArrowRight, MapPin, Truck, CreditCard, Check, Phone, MessageSquare } from 'lucide-react';
import { ProductImage } from './ProductImage';

const STEPS = ['Datos', 'Entrega', 'Pago', 'Confirmar'];

export function CheckoutView() {
  const { cart, currency, cartTotal, user, addOrder, clearCart, setView, deliveryZones, paymentInfos } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Set default payment method
  if (!selectedPaymentId && paymentInfos.length > 0) {
    setSelectedPaymentId(paymentInfos[0].id);
  }

  const sym = currency === 'CUP' ? '$' : '$';
  const subtotal = cartTotal();
  const zone = deliveryZones.find(z => z.id === selectedZone);
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : (subtotal >= (currency === 'CUP' ? 5000 : 17) ? 0 : (zone ? (currency === 'CUP' ? zone.feeCUP : zone.feeMLC) : 0));
  const total = subtotal + deliveryFee;
  const selectedPaymentInfo = paymentInfos.find(p => p.id === selectedPaymentId) || paymentInfos[0];

  const waMsg = encodeURIComponent(`Hola, he realizado el pedido ${orderNumber} en MercadoCuba.
  
Nombre: ${name}
Total: ${currency === 'CUP' ? '$' : '$'}${total.toFixed(2)} ${currency}
Método de Pago: ${selectedPaymentInfo?.name || 'No definido'}

Quedo a la espera de confirmación.`);

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
      subtotal, total, 
      paymentMethod: selectedPaymentInfo?.type || 'cash', 
      paymentVerified: selectedPaymentInfo?.type === 'cash',
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
    return (
      <div className="animate-fadeIn text-center py-12 px-4 h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
          <Check size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">¡Pedido Realizado!</h2>
        <p className="text-gray-400 mb-8">Tu orden ha sido registrada correctamente</p>
        
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 text-left border border-gray-800 w-full max-w-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Check size={80} />
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Número de Orden</p>
          <p className="text-3xl font-bold text-emerald-400 mb-6 font-mono tracking-widest">{orderNumber}</p>
          
          <div className="space-y-3 border-t border-gray-800 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Total a pagar</p>
              <p className="text-lg font-bold text-white">{sym}{total.toFixed(2)} {currency}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Método de pago</p>
              <p className="text-sm font-medium text-emerald-400">{selectedPaymentInfo?.name}</p>
            </div>
          </div>

          {selectedPaymentInfo?.type !== 'cash' && (
            <div className="mt-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1.5"><CreditCard size={14} /> Datos de pago</p>
              
              {selectedPaymentInfo?.accountNumber && (
                 <div className="mb-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Cuenta / Tarjeta</p>
                    <p className="text-sm font-mono text-white tracking-wide">{selectedPaymentInfo.accountNumber}</p>
                 </div>
              )}

              {selectedPaymentInfo?.phone && (
                 <div className="mb-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Teléfono</p>
                    <p className="text-sm font-mono text-white tracking-wide">{selectedPaymentInfo.phone}</p>
                 </div>
              )}

              {selectedPaymentInfo?.beneficiary && (
                 <div className="mb-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Beneficiario</p>
                    <p className="text-xs text-gray-300">{selectedPaymentInfo.beneficiary}</p>
                 </div>
              )}

              {selectedPaymentInfo?.instructions && (
                 <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-[10px] text-gray-400 italic">{selectedPaymentInfo.instructions}</p>
                 </div>
              )}
            </div>
          )}
        </div>

        <a href={`https://wa.me/5359411492?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-4 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
          <MessageSquare size={20} /> Confirmar por WhatsApp
        </a>
        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => setView('orders')} className="flex-1 bg-gray-800 text-gray-300 py-3.5 rounded-xl font-medium text-sm hover:bg-gray-700 hover:text-white transition-colors">Ver pedidos</button>
          <button onClick={() => setView('home')} className="flex-1 bg-gray-800 text-gray-300 py-3.5 rounded-xl font-medium text-sm hover:bg-gray-700 hover:text-white transition-colors">Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : setView('cart')} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 transition-colors"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-white">Finalizar Compra</h2>
      </div>

      <div className="flex items-center gap-2 mb-8 px-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all z-10 ${i <= step ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${i <= step ? 'text-emerald-400' : 'text-gray-600'}`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${i < step ? 'bg-emerald-500/50' : 'bg-gray-800'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mb-24">
        {step === 0 && (
          <div className="space-y-4 animate-slideUp">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1">Nombre completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Juan Pérez"
                  className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1">Teléfono</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 5xxxxxxx"
                  className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600" />
              </div>
              
              <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
                <label className="block text-xs font-bold text-gray-400 mb-3">Método de entrega</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDeliveryMethod('delivery')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${deliveryMethod === 'delivery' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                    <Truck size={24} className="mb-2" />
                    <span className="text-sm font-bold">A Domicilio</span>
                  </button>
                  <button onClick={() => setDeliveryMethod('pickup')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${deliveryMethod === 'pickup' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                    <MapPin size={24} className="mb-2" />
                    <span className="text-sm font-bold">Recogida</span>
                  </button>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1">Dirección de entrega</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, entrecalles, reparto..."
                    className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600 min-h-[100px] resize-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-slideUp">
            {deliveryMethod === 'pickup' ? (
              <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                   <MapPin size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Punto de Recogida</h3>
                <p className="text-gray-400 text-sm mb-4">Calle Martí #123 e/ Colón y Recreo, Pinar del Río</p>
                <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-300">
                  Horario: Lunes a Sábado, 9:00 AM - 6:00 PM
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Selecciona tu zona</h3>
                <div className="space-y-2">
                  {deliveryZones.map(z => {
                     const isSelected = selectedZone === z.id;
                     return (
                      <button key={z.id} onClick={() => setSelectedZone(z.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{z.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}>+{sym}{currency === 'CUP' ? z.feeCUP : z.feeMLC}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slideUp">
            <h3 className="text-lg font-bold text-white mb-2">Método de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentInfos.map(p => {
                const isSelected = selectedPaymentId === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPaymentId(p.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-28 ${isSelected ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}>
                    <span className="text-3xl mb-2">{p.icon || '💳'}</span>
                    <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            
            {selectedPaymentInfo && selectedPaymentInfo.type !== 'cash' && (
               <div className="mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Detalles de pago</p>
                  <div className="space-y-1 text-sm text-gray-300">
                     {selectedPaymentInfo.accountNumber && <p>Cuenta: <span className="font-mono text-emerald-400">{selectedPaymentInfo.accountNumber}</span></p>}
                     {selectedPaymentInfo.phone && <p>Teléfono: <span className="font-mono text-emerald-400">{selectedPaymentInfo.phone}</span></p>}
                     {selectedPaymentInfo.beneficiary && <p>Beneficiario: {selectedPaymentInfo.beneficiary}</p>}
                     {selectedPaymentInfo.instructions && <p className="text-xs italic text-gray-500 mt-2">{selectedPaymentInfo.instructions}</p>}
                  </div>
               </div>
            )}
            
            <div className="mt-6">
              <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1">Notas adicionales (Opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales para la entrega..."
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600 min-h-[80px] resize-none" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-slideUp">
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 flex-1 truncate pr-4">{item.quantity}x {item.product.name}</span>
                    <span className="text-white font-medium">{sym}{((currency === 'CUP' ? item.product.priceCUP : item.product.priceMLC) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">{sym}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Envío ({deliveryMethod === 'pickup' ? 'Recogida' : zone?.name})</span>
                  <span className="text-emerald-400 font-medium">{deliveryFee === 0 ? 'GRATIS' : `${sym}${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-800">
                  <span className="font-bold text-white">Total a Pagar</span>
                  <span className="text-2xl font-bold text-emerald-400">{sym}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 text-sm">
               <div className="flex items-start gap-3 mb-2">
                 <MapPin size={16} className="text-gray-400 mt-0.5" />
                 <div>
                   <p className="font-bold text-gray-200">Entrega</p>
                   <p className="text-gray-400">{deliveryMethod === 'pickup' ? 'Recogida en tienda' : `${address} (${zone?.name})`}</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <CreditCard size={16} className="text-gray-400 mt-0.5" />
                 <div>
                   <p className="font-bold text-gray-200">Pago</p>
                   <p className="text-gray-400">{selectedPaymentInfo?.name}</p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/80 backdrop-blur-md border-t border-gray-800">
        <div className="max-w-md mx-auto">
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="w-full bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 disabled:shadow-none">
              Siguiente <ArrowRight size={20} />
            </button>
          ) : (
            <button onClick={placeOrder}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 animate-pulse-slow">
              Confirmar Pedido <Check size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}