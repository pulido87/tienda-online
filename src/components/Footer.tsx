import { useStore } from '../store';

export function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 border-t border-gray-800 pt-10 pb-24 text-center animate-fadeIn">
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 mb-3">
           <span className="text-2xl">🛒</span>
        </div>
        <h4 className="font-bold text-xl text-white tracking-tight">Mercado<span className="text-emerald-500">Cuba</span></h4>
        <p className="text-gray-500 text-xs mt-1">Tu tienda online de confianza en Pinar del Río</p>
      </div>
      
      <div className="flex justify-center gap-6 mb-8">
        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">Términos</a>
        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">Privacidad</a>
        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">Contacto</a>
      </div>

      <div className="px-8 max-w-sm mx-auto">
         <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex items-center justify-center gap-3 mb-8">
            <span className="text-2xl">📞</span>
            <div className="text-left">
               <p className="text-[10px] text-gray-500 uppercase font-bold">Atención al cliente</p>
               <p className="text-white font-mono font-bold text-sm">+53 59411492</p>
            </div>
         </div>
      </div>

      <div className="border-t border-gray-800 pt-6 mx-6">
        <p className="text-gray-600 text-[10px] mb-1">Desarrollado con ❤️ por Yosmani Pulido</p>
        <p className="text-gray-700 text-[10px]">© 2026 MercadoCuba. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
