import { useState } from 'react';
import { useStore, registerLocalUser, loginLocalUser, type UserRole } from '../store';
import { Eye, EyeOff, Shield, Lock, AlertTriangle, Loader2, User, ChevronLeft } from 'lucide-react';
import { db, isSupabaseConfigured } from '../lib/supabase';

const FALLBACK_ADMIN_KEY = 'MERCADOCUBA_ADMIN_2025';
const FALLBACK_VENDOR_KEY = 'MERCADOCUBA_VENDOR_2025';

export function AuthView() {
  const store = useStore();

  const [screen, setScreen] = useState<string>('menu');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [registerRole, setRegisterRole] = useState<UserRole>('admin');

  const resetFields = () => {
    setName(''); setPhone(''); setEmail(''); setPassword('');
    setConfirmPassword(''); setSecretKey(''); setError(''); setSuccess('');
    setShowPassword(false); setLoading(false);
  };

  const goTo = (s: string) => { resetFields(); setScreen(s); };

  const startLock = () => {
    setLocked(true);
    let t = 900;
    setLockTimer(t);
    const interval = setInterval(() => {
      t -= 1;
      setLockTimer(t);
      if (t <= 0) { clearInterval(interval); setLocked(false); setAttempts(0); }
    }, 1000);
  };

  // ===================== LOGIN CLIENTE =====================
  const handleLoginClient = async () => {
    setError('');
    const contact = phone.trim() || email.trim();
    if (!contact) { setError('Ingresa tu teléfono o correo'); return; }
    if (!password) { setError('Ingresa tu contraseña'); return; }

    setLoading(true);

    // 1. Intentar con Supabase
    if (isSupabaseConfigured) {
      try {
        const authEmail = contact.includes('@') ? contact : `${contact.replace(/\D/g, '')}@mercadocuba.local`;
        const { data, error: err } = await db.signIn(authEmail, password);
        if (!err && data?.user) {
          const { data: profile } = await db.getProfile(data.user.id);
          if (profile) {
            store.login(profile.name, profile.phone || contact, profile.role as UserRole);
            setSuccess(`¡Bienvenido, ${profile.name}!`);
            setTimeout(() => store.setView('home'), 500);
            setLoading(false);
            return;
          }
        }
      } catch (e) { console.log('Supabase login falló:', e); }
    }

    // 2. Login local
    const result = loginLocalUser(contact, password);
    if (result.success && result.user) {
      store.login(result.user.name, result.user.phone, result.user.role);
      setSuccess(`¡Bienvenido, ${result.user.name}!`);
      setTimeout(() => store.setView('home'), 500);
    } else {
      setError(result.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  // ===================== LOGIN ADMIN =====================
  const handleLoginAdmin = async () => {
    setError('');
    const contact = phone.trim() || email.trim();
    if (!contact) { setError('Ingresa tu teléfono o correo de administrador'); return; }
    if (!password) { setError('Ingresa tu contraseña'); return; }

    setLoading(true);

    // 1. Intentar con Supabase
    if (isSupabaseConfigured) {
      try {
        const authEmail = contact.includes('@') ? contact : `${contact.replace(/\D/g, '')}@mercadocuba.local`;
        const { data, error: err } = await db.signIn(authEmail, password);
        if (!err && data?.user) {
          const { data: profile } = await db.getProfile(data.user.id);
          if (profile) {
            if (profile.role === 'admin' || profile.role === 'vendor') {
              store.login(profile.name, profile.phone || contact, profile.role as UserRole);
              setSuccess(`¡Bienvenido ${profile.role === 'admin' ? 'Administrador' : 'Vendedor'} ${profile.name}!`);
              setTimeout(() => store.setView('admin'), 500);
              setLoading(false);
              return;
            } else {
              setError('Esta cuenta no tiene permisos de administrador.');
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) { console.log('Supabase admin login falló:', e); }
    }

    // 2. Login local - buscar usuario
    const result = loginLocalUser(contact, password);
    if (result.success && result.user) {
      if (result.user.role === 'admin' || result.user.role === 'vendor') {
        store.login(result.user.name, result.user.phone, result.user.role);
        setSuccess(`¡Bienvenido ${result.user.role === 'admin' ? 'Administrador' : 'Vendedor'} ${result.user.name}!`);
        setTimeout(() => store.setView('admin'), 500);
      } else {
        setError('Esta cuenta es de cliente, no de administrador. Usa el login de cliente o regístrate como admin con la clave secreta.');
      }
    } else {
      setError(result.error || 'Credenciales incorrectas. Verifica tu teléfono/correo y contraseña.');
    }
    setLoading(false);
  };

  // ===================== REGISTRO CLIENTE =====================
  const handleRegisterClient = async () => {
    setError('');
    if (!name.trim()) { setError('Ingresa tu nombre'); return; }
    if (!phone.trim() && !email.trim()) { setError('Ingresa teléfono o correo'); return; }
    if (!password || password.length < 4) { setError('La contraseña debe tener mínimo 4 caracteres'); return; }

    setLoading(true);

    // Guardar en localStorage SIEMPRE
    registerLocalUser(name, phone, email, password, 'client');

    // También en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        const authEmail = email.trim() || `${phone.replace(/\D/g, '')}@mercadocuba.local`;
        const { data, error: err } = await db.signUp(authEmail, password);
        if (!err && data?.user) {
          await db.createProfile({
            id: data.user.id, name: name.trim(), phone: phone.trim(),
            email: email.trim(), whatsapp: phone.trim(), role: 'client',
          });
        }
      } catch (e) { console.log('Registro Supabase falló:', e); }
    }

    store.login(name.trim(), phone.trim(), 'client');
    setSuccess('¡Cuenta creada exitosamente!');
    setTimeout(() => store.setView('home'), 500);
    setLoading(false);
  };

  // ===================== REGISTRO ADMIN/VENDOR =====================
  const handleRegisterAdmin = async () => {
    setError('');
    if (!name.trim()) { setError('Ingresa tu nombre'); return; }
    if (!phone.trim() && !email.trim()) { setError('Ingresa teléfono o correo'); return; }
    if (!secretKey) { setError('Ingresa la clave secreta'); return; }
    if (!password || password.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (locked) { setError('Registro bloqueado por demasiados intentos'); return; }

    // Validar clave secreta
    let validKey = false;
    if (isSupabaseConfigured) {
      validKey = await db.validateSecretKey(secretKey, registerRole as 'admin' | 'vendor');
    }
    if (!validKey) {
      const fallbackKey = registerRole === 'admin' ? FALLBACK_ADMIN_KEY : FALLBACK_VENDOR_KEY;
      validKey = secretKey === fallbackKey;
    }

    if (!validKey) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) startLock();
      setError(`Clave secreta incorrecta. Intento ${newAttempts}/5`);
      return;
    }

    setLoading(true);

    // Guardar en localStorage SIEMPRE con el rol correcto
    registerLocalUser(name, phone, email, password, registerRole);

    // También en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        const authEmail = email.trim() || `${phone.replace(/\D/g, '')}@mercadocuba.local`;
        const { data, error: err } = await db.signUp(authEmail, password);
        if (!err && data?.user) {
          await db.createProfile({
            id: data.user.id, name: name.trim(), phone: phone.trim(),
            email: email.trim(), whatsapp: phone.trim(), role: registerRole,
          });
        }
      } catch (e) { console.log('Registro admin Supabase falló:', e); }
    }

    // Login inmediato con el ROL CORRECTO
    store.login(name.trim(), phone.trim(), registerRole);
    setSuccess(`¡Cuenta de ${registerRole === 'admin' ? 'Administrador' : 'Vendedor'} creada!`);
    setTimeout(() => store.setView('admin'), 500);
    setLoading(false);
  };

  const pwStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;

  // ===================== PANTALLA MENÚ PRINCIPAL =====================
  if (screen === 'menu') {
    return (
      <div className="animate-fadeIn px-4 pt-8 pb-8">
        <div className="text-center mb-8">
          <p className="text-6xl mb-3">🛒</p>
          <h2 className="text-2xl font-bold text-gray-800">MercadoCuba</h2>
          <p className="text-gray-500 text-sm">Pinar del Río</p>
          {store.supabaseConnected && (
            <p className="text-green-500 text-[10px] mt-1">🟢 Base de datos conectada</p>
          )}
        </div>
        <div className="space-y-3 max-w-sm mx-auto">
          <button onClick={() => goTo('loginClient')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
            <User size={22} /> Iniciar Sesión — Cliente
          </button>
          <button onClick={() => goTo('loginAdmin')}
            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
            <Shield size={22} /> Iniciar Sesión — Admin
          </button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">¿No tienes cuenta?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button onClick={() => goTo('registerClient')}
            className="w-full border-2 border-green-600 text-green-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <User size={20} /> Crear Cuenta — Cliente
          </button>
          <button onClick={() => { setRegisterRole('admin'); goTo('registerAdmin'); }}
            className="w-full border-2 border-amber-600 text-amber-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <Shield size={20} /> Crear Cuenta — Admin
          </button>
          <button onClick={() => store.setView('home')} className="w-full text-gray-400 py-3 text-sm">
            Continuar sin cuenta →
          </button>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-[10px]">Desarrollado por Yosmani Pulido</p>
          <p className="text-gray-300 text-[10px]">© 2025 MercadoCuba</p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN CLIENTE =====================
  if (screen === 'loginClient') {
    return (
      <div className="animate-fadeIn px-4 pt-4 pb-8">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm">Accede como cliente</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">o Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" type="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Contraseña</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña"
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">❌ {error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">✅ {success}</p>}
          <button onClick={handleLoginClient} disabled={loading}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Ingresando...</> : 'Iniciar Sesión'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-3">
            ¿No tienes cuenta? <button onClick={() => goTo('registerClient')} className="text-green-600 font-bold">Regístrate</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN ADMIN =====================
  if (screen === 'loginAdmin') {
    return (
      <div className="animate-fadeIn px-4 pt-4 pb-8">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Panel de Administración</h2>
          <p className="text-gray-500 text-sm">Acceso exclusivo para administradores</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700 flex items-center gap-1">
            <Lock size={14} /> Solo usuarios con cuenta de administrador pueden acceder
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono de admin</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
              className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">o Correo de admin</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mercadocuba.com" type="email"
              className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Contraseña de admin</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña"
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-amber-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/30" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">❌ {error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">✅ {success}</p>}
          <button onClick={handleLoginAdmin} disabled={loading}
            className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : <><Shield size={18} /> Acceder como Admin</>}
          </button>
          <p className="text-center text-sm text-gray-400 mt-3">
            ¿No tienes cuenta de admin? <button onClick={() => { setRegisterRole('admin'); goTo('registerAdmin'); }} className="text-amber-600 font-bold">Registrar Admin</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== REGISTRO CLIENTE =====================
  if (screen === 'registerClient') {
    return (
      <div className="animate-fadeIn px-4 pt-4 pb-8">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Crear Cuenta</h2>
          <p className="text-gray-500 text-sm">Regístrate para hacer pedidos</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre completo *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Correo (recomendado)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" type="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Contraseña *</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña"
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">❌ {error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">✅ {success}</p>}
          <button onClick={handleRegisterClient} disabled={loading}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Registrando...</> : 'Crear Cuenta de Cliente'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-3">
            ¿Ya tienes cuenta? <button onClick={() => goTo('loginClient')} className="text-green-600 font-bold">Inicia sesión</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== REGISTRO ADMIN/VENDOR =====================
  if (screen === 'registerAdmin') {
    return (
      <div className="animate-fadeIn px-4 pt-4 pb-8">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 mb-4">
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Registro de {registerRole === 'admin' ? 'Administrador' : 'Vendedor'}</h2>
          <p className="text-gray-500 text-sm">Requiere clave secreta de autorización</p>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setRegisterRole('admin')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${registerRole === 'admin' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-400'}`}>
            👑 Admin
          </button>
          <button onClick={() => setRegisterRole('vendor')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${registerRole === 'vendor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}>
            🏷️ Vendedor
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Necesitas la clave secreta del propietario del negocio para crear una cuenta de {registerRole === 'admin' ? 'administrador' : 'vendedor'}.
          </p>
        </div>
        {locked ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-4">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
            <p className="font-bold text-red-700 mb-1">Registro bloqueado</p>
            <p className="text-sm text-red-600">Demasiados intentos fallidos</p>
            <p className="text-2xl font-mono font-bold text-red-700 mt-3">
              {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre completo *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Correo electrónico (recomendado)</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@correo.com" type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Lock size={14} /> Clave secreta de autorización *
              </label>
              <input value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="Ingresa la clave secreta" type="password"
                className="w-full border border-amber-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50" />
              <p className="text-[10px] text-gray-400 mt-1">Intentos: {attempts}/5</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Contraseña * (mínimo 6 caracteres)</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña segura"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= pwStrength ? (pwStrength === 3 ? 'bg-green-500' : pwStrength === 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${pwStrength === 3 ? 'text-green-600' : pwStrength === 2 ? 'text-amber-600' : 'text-red-600'}`}>
                    {pwStrength === 3 ? 'Fuerte' : pwStrength === 2 ? 'Media' : 'Débil'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Confirmar contraseña *</label>
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña"
                type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">❌ Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-500 mt-1">✅ Las contraseñas coinciden</p>
              )}
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">❌ {error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">✅ {success}</p>}
            <button onClick={handleRegisterAdmin} disabled={loading || locked}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition-transform ${
                loading || locked ? 'bg-gray-300 text-gray-500' : 'bg-amber-600 text-white active:scale-95'
              }`}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creando cuenta...</> :
                <><Shield size={18} /> Crear cuenta de {registerRole === 'admin' ? 'Admin' : 'Vendedor'}</>}
            </button>
            <p className="text-center text-sm text-gray-400 mt-3">
              ¿Ya tienes cuenta? <button onClick={() => goTo('loginAdmin')} className="text-amber-600 font-bold">Inicia sesión</button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
