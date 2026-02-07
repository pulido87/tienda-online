import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFab: React.FC = () => (
  <a href="https://wa.me/5359411492?text=Hola!%20Quiero%20hacer%20un%20pedido%20en%20MercadoCuba" target="_blank" rel="noopener noreferrer"
    className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 active:scale-90 transition z-40 animate-pulse-green">
    <MessageCircle className="w-7 h-7" />
  </a>
);
