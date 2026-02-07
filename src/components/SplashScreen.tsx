import React from 'react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setTimeout(onFinish, 300); return 100; }
        return p + 5;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex flex-col items-center justify-center z-[100]">
      <div className="animate-fadeIn text-center">
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
          <span className="text-5xl">🛒</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">MercadoCuba</h1>
        <p className="text-green-200 text-sm mb-8">Tu tienda online en Pinar del Río</p>
        <div className="w-48 bg-white/20 rounded-full h-1.5 mx-auto overflow-hidden">
          <div className="bg-white h-full rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-green-200 text-[10px] mt-3">Cargando...</p>
      </div>
      <p className="absolute bottom-8 text-green-300 text-[10px]">
        Desarrollado por <span className="font-semibold text-white">Yosmani Pulido</span>
      </p>
    </div>
  );
};
