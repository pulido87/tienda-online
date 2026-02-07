import React from 'react';
import { ArrowLeft, Copy, CheckCircle, Database } from 'lucide-react';
import { useStore } from '../store';
import { SETUP_SQL, db } from '../lib/supabase';

export const SupabaseSetup: React.FC = () => {
  const { setView } = useStore();
  const [copied, setCopied] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = React.useState(false);

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const testConnection = async () => {
    setTesting(true);
    const result = await db.testConnection();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="pb-20 animate-fadeIn">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => setView('admin')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="font-bold text-gray-800 flex items-center gap-2"><Database className="w-5 h-5" /> Configurar Supabase</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Connection Test */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-bold text-sm mb-3">🔌 Probar Conexión</h3>
          <p className="text-xs text-gray-500 mb-2">Configurado vía variables de entorno (.env)</p>
          <button onClick={testConnection} disabled={testing}
            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition">
            {testing ? '⏳ Probando...' : '🔌 Probar Conexión'}
          </button>
          {testResult && (
            <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : '❌'}
              {testResult.message}
            </div>
          )}
        </div>

        {/* Steps */}
        {[
          { step: 1, title: 'Crear proyecto en Supabase', content: 'Ve a supabase.com → New Project → Elige un nombre y región.' },
          { step: 2, title: 'Las credenciales ya están configuradas', content: 'Tu URL y API Key ya están integradas en el código. No necesitas hacer nada más con las credenciales.' },
          { step: 3, title: 'Ejecutar SQL para crear tablas', content: 'Copia el SQL de abajo y pégalo en SQL Editor de Supabase.' },
          { step: 4, title: 'Crear buckets de Storage', content: 'Ve a Storage → New Bucket → Crea "product-images" (público) y "payment-proofs" (privado).' },
          { step: 5, title: 'Deploy en Vercel', content: 'Sube el código a GitHub y conecta con Vercel. Agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' },
        ].map(s => (
          <div key={s.step} className="bg-white rounded-xl border p-4">
            <h3 className="font-bold text-sm mb-1">Paso {s.step}: {s.title}</h3>
            <p className="text-xs text-gray-600">{s.content}</p>
          </div>
        ))}

        {/* SQL Block */}
        <div className="bg-gray-900 rounded-xl p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm">📋 SQL Completo (10 tablas)</h4>
            <button onClick={copySQL}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                copied ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
              {copied ? <><CheckCircle className="w-3 h-3" /> ¡Copiado!</> : <><Copy className="w-3 h-3" /> Copiar SQL</>}
            </button>
          </div>
          <pre className="text-green-400 text-[10px] font-mono overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
            {SETUP_SQL.slice(0, 2000)}...
          </pre>
          <p className="text-gray-400 text-[10px] mt-2">SQL completo: {SETUP_SQL.length.toLocaleString()} caracteres • Click "Copiar SQL" para obtener todo</p>
        </div>

        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-400">Desarrollado por <span className="font-semibold text-green-600">Yosmani Pulido</span></p>
        </div>
      </div>
    </div>
  );
};
