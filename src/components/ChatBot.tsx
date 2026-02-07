import { useState, useRef, useEffect } from 'react';
import { X, Send, ChevronRight, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store';

// Tipos para el reconocimiento de voz
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  buttons?: { label: string; action: string }[];
}

const QUICK_ACTIONS = [
  { label: '🛒 Como pedir?', action: 'como_pedir' },
  { label: '💳 Metodos de pago', action: 'pagos' },
  { label: '🚚 Delivery', action: 'delivery' },
  { label: '📦 Ver productos', action: 'nav_catalog' },
  { label: '📋 Mis pedidos', action: 'nav_orders' },
  { label: '📞 Contactar', action: 'contacto' },
];

function getBotResponse(input: string, setView: (v: string) => void): Message {
  const text = input.toLowerCase().trim();
  const id = Date.now();

  if (text === 'como_pedir' || text.includes('pedir') || text.includes('comprar') || text.includes('ordenar')) {
    return {
      id, sender: 'bot',
      text: 'Hacer un pedido es muy facil:\n\n1. Ve al Catalogo y agrega productos al carrito\n2. Revisa tu Carrito\n3. Click en "Hacer pedido"\n4. Completa tus datos, zona de entrega y metodo de pago\n5. Confirma el pedido\n6. Recibiras confirmacion por WhatsApp\n\nEnvio gratis en compras mayores a $5,000 CUP!',
      buttons: [{ label: '📦 Ir al catalogo', action: 'nav_catalog' }],
    };
  }

  if (text === 'pagos' || text.includes('pago') || text.includes('pagar') || text.includes('transferencia')) {
    return {
      id, sender: 'bot',
      text: 'Aceptamos estos metodos de pago:\n\n📱 Transfermovil\n💳 EnZona\n🏦 Transferencia bancaria\n💵 Efectivo (contra entrega)\n\nPara pagos electronicos, te daremos los datos de la tarjeta al confirmar tu pedido. Envia el comprobante por WhatsApp.',
    };
  }

  if (text === 'delivery' || text.includes('entrega') || text.includes('envio') || text.includes('delivery') || text.includes('domicilio')) {
    return {
      id, sender: 'bot',
      text: 'Informacion de entregas:\n\n🕐 Horario: Lunes a Sabado 8AM - 8PM\n📍 Zonas: Toda Pinar del Rio\n💰 Costo: Segun tu zona (desde $100 CUP)\n🎉 GRATIS en compras +$5,000 CUP\n\nTambien puedes recoger en nuestro punto de venta sin costo adicional.',
    };
  }

  if (text === 'contacto' || text.includes('contactar') || text.includes('telefono') || text.includes('whatsapp') || text.includes('llamar')) {
    return {
      id, sender: 'bot',
      text: 'Contactanos directamente:\n\n📱 WhatsApp: +53 59411492\n📞 Telefono: +53 59411492\n🕐 Horario: Lunes a Sabado 8AM - 8PM\n\nTambien puedes escribirnos por WhatsApp para hacer pedidos rapidos!',
      buttons: [{ label: '📱 Abrir WhatsApp', action: 'whatsapp' }],
    };
  }

  if (text === 'nav_catalog' || text.includes('catalogo') || text.includes('productos')) {
    setTimeout(() => setView('catalog'), 300);
    return { id, sender: 'bot', text: 'Te llevo al catalogo de productos...' };
  }

  if (text === 'nav_orders' || text.includes('mis pedidos') || text.includes('historial')) {
    setTimeout(() => setView('orders'), 300);
    return { id, sender: 'bot', text: 'Te llevo a tus pedidos...' };
  }

  if (text === 'whatsapp') {
    window.open('https://wa.me/5359411492?text=Hola!%20Quiero%20hacer%20un%20pedido%20en%20MercadoCuba', '_blank');
    return { id, sender: 'bot', text: 'Abriendo WhatsApp...' };
  }

  if (text.includes('cerveza') || text.includes('birra')) {
    return {
      id, sender: 'bot',
      text: 'Tenemos varias cervezas disponibles:\n\n🍺 Cristal - $250 CUP\n🍻 Bucanero - $280 CUP\n🥂 Presidente - $350 CUP\n\nTodas bien frias! Tambien tenemos combos de fiesta.',
      buttons: [{ label: '🍺 Ver cervezas', action: 'nav_catalog' }],
    };
  }

  if (text.includes('arroz') || text.includes('frijol') || text.includes('alimento') || text.includes('comida')) {
    return {
      id, sender: 'bot',
      text: 'En alimentos tenemos:\n\n🍚 Arroz suelto - $250/lb\n🫘 Frijoles negros - $300/lb\n🫒 Aceite de soya - $800/L\n🍗 Pollo troceado - $1,200/kg\nY mucho mas!\n\nRevisa el catalogo completo.',
      buttons: [{ label: '🍚 Ver alimentos', action: 'nav_catalog' }],
    };
  }

  if (text.includes('combo') || text.includes('oferta') || text.includes('promo') || text.includes('descuento')) {
    return {
      id, sender: 'bot',
      text: 'Tenemos combos especiales con descuento:\n\n👨‍👩‍👧‍👦 Combo Familiar - $2,800 CUP (ahorras $500)\n🎉 Combo Fiesta - $5,500 CUP (ahorras $900)\n✨ Combo Aseo - $1,800 CUP (ahorras $350)\n🏠 Combo Basico - $1,500 CUP (ahorras $250)',
      buttons: [{ label: '📦 Ver combos', action: 'nav_catalog' }],
    };
  }

  if (text.includes('hola') || text.includes('buenas') || text.includes('buenos') || text.includes('hi') || text.includes('hey')) {
    return {
      id, sender: 'bot',
      text: 'Hola! Bienvenido a MercadoCuba! 👋\n\nSoy tu asistente de voz. Puedo ayudarte con:\n- Hacer pedidos\n- Informacion de productos\n- Metodos de pago\n- Zonas de entrega\n\nPuedes hablarme o escribirme.',
    };
  }

  if (text.includes('gracias') || text.includes('thanks') || text.includes('genial') || text.includes('perfecto')) {
    return {
      id, sender: 'bot',
      text: 'De nada! Estoy aqui para ayudarte. Si necesitas algo mas, no dudes en preguntar. Buen provecho! 😊',
    };
  }

  if (text.includes('horario') || text.includes('hora') || text.includes('abierto') || text.includes('cerrado')) {
    return {
      id, sender: 'bot',
      text: 'Nuestro horario:\n\n🕐 Lunes a Sabado: 8:00 AM - 8:00 PM\n🚫 Domingos: Cerrado\n\nLos pedidos realizados fuera de horario se procesan al dia siguiente.',
    };
  }

  if (text.includes('refresco') || text.includes('jugo') || text.includes('agua') || text.includes('bebida') || text.includes('malta')) {
    return {
      id, sender: 'bot',
      text: 'En refrescos y bebidas tenemos:\n\n🥫 Malta Bucanero - $200\n🥤 Refresco Cola - $180\n🧃 Jugo de Mango - $350\n💧 Agua Mineral - $100\n\nTodos bien frios!',
      buttons: [{ label: '🥤 Ver refrescos', action: 'nav_catalog' }],
    };
  }

  if (text.includes('jabon') || text.includes('pasta') || text.includes('aseo') || text.includes('limpieza') || text.includes('detergente')) {
    return {
      id, sender: 'bot',
      text: 'Productos de aseo disponibles:\n\n🧴 Detergente - $500/L\n🧼 Jabon de bano - $150\n🪥 Pasta dental - $300\n🧻 Papel higienico x4 - $400\n\nTenemos combo de aseo con descuento!',
      buttons: [{ label: '🧴 Ver productos de aseo', action: 'nav_catalog' }],
    };
  }

  return {
    id, sender: 'bot',
    text: 'No entendi bien tu pregunta. Intenta decir: "ver productos", "mis pedidos" o "metodos de pago".',
    buttons: [
      { label: '🛒 Como pedir', action: 'como_pedir' },
      { label: '📦 Productos', action: 'nav_catalog' },
    ],
  };
}

export function ChatBot() {
  const { setView } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1, sender: 'bot',
      text: 'Hola! 👋 Soy tu asistente de voz de MercadoCuba. Pulsa el microfono para hablarme.',
      buttons: QUICK_ACTIONS.map(a => ({ label: a.label, action: a.action })),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, isOpen]);

  // Inicializar síntesis de voz
  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancelar anterior

    // Limpiar texto para que suene mejor (quitar emojis, etc)
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '')
                          .replace(/\n/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES'; // Español
    utterance.rate = 1.05; // Un poco más rápido
    
    window.speechSynthesis.speak(utterance);
  };

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error voz:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel(); // Parar si el bot está hablando
      setInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('No se pudo iniciar reconocimiento', e);
      }
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(text, (v) => setView(v as any));
      setMessages(prev => [...prev, botResponse]);
      setTyping(false);
      speak(botResponse.text);
    }, 800 + Math.random() * 500);
  };

  const handleButtonClick = (action: string) => {
    sendMessage(action);
  };

  const openChat = () => {
    setIsOpen(true);
    // Saludo inicial hablado si es la primera vez que abre
    if (messages.length === 1) {
      speak('Hola, soy tu asistente. Pulsa el micrófono para hablar.');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-90 transition-transform hover:bg-blue-700 animate-bounce-slow"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.5)' }}
      >
        <Mic size={26} />
        <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col max-w-lg mx-auto" style={{ background: '#f0f2f5' }}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
            {isListening ? <Mic size={20} /> : '🤖'}
          </div>
          <div>
            <h3 className="font-bold text-sm">Asistente de Voz</h3>
            <p className="text-blue-200 text-[10px] flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${isListening ? 'bg-red-400' : 'bg-green-400'}`}></span>
              {isListening ? 'Escuchando...' : 'En linea'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (newMuted) window.speechSynthesis.cancel();
            }} 
            className="p-2 hover:bg-white/10 rounded-full"
            title={isMuted ? "Activar voz" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => {
              setIsOpen(false);
              window.speechSynthesis.cancel();
              recognitionRef.current?.stop();
              setIsListening(false);
            }} 
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.buttons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => handleButtonClick(btn.action)}
                      className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors border border-blue-100"
                    >
                      {btn.label}
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 h-5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {!typing && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
        <div className="px-4 pb-2 bg-gray-50">
           {/* Only show if not scrolling too much, logic handled via css scroll usually but here simple list */}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t px-3 py-3 flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full transition-all duration-300 shadow-sm ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Presiona para hablar"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
            placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
            className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isListening}
          />
        </div>
        
        {!isListening && (
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
              input.trim() ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
