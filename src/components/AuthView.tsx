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
      <div className="animate-fadeIn px-4 pt-12 pb-8 min-h-screen bg-gray-950 flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/30">
            <span className="text-5xl">🛒</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">MercadoCuba</h2>
          <p className="text-gray-400 text-sm">Tu tienda online en Pinar del Río</p>
          {store.supabaseConnected && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mt-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-[10px] font-bold tracking-wide uppercase">Online</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4 max-w-sm mx-auto w-full">
          <button onClick={() => goTo('loginClient')}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-900/20 border border-emerald-500/20">
            <User size={22} /> Iniciar Sesión
          </button>
          
          <button onClick={() => goTo('loginAdmin')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all border border-gray-800">
            <Shield size={22} /> Acceso Administrativo
          </button>
          
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">O crea una cuenta</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          
          <button onClick={() => goTo('registerClient')}
            className="w-full bg-gray-900/50 hover:bg-gray-900 border-2 border-emerald-600/30 text-emerald-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
            <User size={20} /> Crear Cuenta
          </button>
          
          <button onClick={() => { setRegisterRole('admin'); goTo('registerAdmin'); }}
            className="w-full bg-gray-900/50 hover:bg-gray-900 border-2 border-amber-600/30 text-amber-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Shield size={20} /> Registro Admin
          </button>
          
          <button onClick={() => store.setView('home')} className="w-full text-gray-500 hover:text-gray-300 py-3 text-sm transition-colors mt-2">
            Continuar como invitado →
          </button>
        </div>
        
        <div className="mt-auto pt-8 text-center">
          <p className="text-gray-600 text-[10px]">Version 1.0.0 • MercadoCuba</p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN CLIENTE =====================
  if (screen === 'loginClient') {
    return (
      <div className="animate-fadeIn px-4 pt-6 pb-8 min-h-screen bg-gray-950">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} /> Volver
        </button>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
            <User size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Bienvenido de nuevo</h2>
          <p className="text-gray-400 text-sm">Ingresa tus datos para continuar</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Teléfono</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">O usa tu correo</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" type="email"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Contraseña</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>}
          {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">✅ {success}</p>}
          
          <button onClick={handleLoginClient} disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-900/20">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Ingresando...</> : 'Iniciar Sesión'}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta? <button onClick={() => goTo('registerClient')} className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">Regístrate</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN ADMIN =====================
  if (screen === 'loginAdmin') {
    return (
      <div className="animate-fadeIn px-4 pt-6 pb-8 min-h-screen bg-gray-950">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} /> Volver
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-lg shadow-amber-900/20">
            <Shield size={32} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Panel Administrativo</h2>
          <p className="text-gray-400 text-sm">Acceso restringido</p>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-amber-400 flex items-center gap-2 font-medium">
            <Lock size={14} /> Solo personal autorizado
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Teléfono o Correo</label>
            <input value={phone || email} onChange={e => {
                const val = e.target.value;
                if (val.includes('@')) { setEmail(val); setPhone(''); } else { setPhone(val); setEmail(''); }
              }} 
              placeholder="Usuario admin" 
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Contraseña</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña de acceso"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>}
          {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">✅ {success}</p>}
          
          <button onClick={handleLoginAdmin} disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-amber-900/20">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : <><Shield size={18} /> Acceder al Panel</>}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            <button onClick={() => { setRegisterRole('admin'); goTo('registerAdmin'); }} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">Registrar nuevo admin</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== REGISTRO CLIENTE =====================
  if (screen === 'registerClient') {
    return (
      <div className="animate-fadeIn px-4 pt-6 pb-8 min-h-screen bg-gray-950">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} /> Volver
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
            <User size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Crear Cuenta</h2>
          <p className="text-gray-400 text-sm">Únete a MercadoCuba</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Nombre completo *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Teléfono *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Correo (opcional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" type="email"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Contraseña *</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>}
          {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">✅ {success}</p>}
          
          <button onClick={handleRegisterClient} disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-900/20">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Registrando...</> : 'Crear Cuenta'}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta? <button onClick={() => goTo('loginClient')} className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">Inicia sesión</button>
          </p>
        </div>
      </div>
    );
  }

  // ===================== REGISTRO ADMIN/VENDOR =====================
  if (screen === 'registerAdmin') {
    return (
      <div className="animate-fadeIn px-4 pt-6 pb-8 min-h-screen bg-gray-950">
        <button onClick={() => goTo('menu')} className="flex items-center gap-1 text-gray-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} /> Volver
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-lg shadow-amber-900/20">
            <Shield size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Registro de {registerRole === 'admin' ? 'Administrador' : 'Vendedor'}</h2>
          <p className="text-gray-400 text-sm">Requiere clave de autorización</p>
        </div>
        
        <div className="flex gap-3 mb-6 bg-gray-900 p-1 rounded-2xl border border-gray-800">
          <button onClick={() => setRegisterRole('admin')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${registerRole === 'admin' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
            👑 Admin
          </button>
          <button onClick={() => setRegisterRole('vendor')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${registerRole === 'vendor' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
            🏷️ Vendedor
          </button>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Necesitas la clave secreta del propietario del negocio para crear una cuenta de {registerRole === 'admin' ? 'administrador' : 'vendedor'}.
          </p>
        </div>
        
        {locked ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-4">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
            <p className="font-bold text-red-400 mb-1">Registro bloqueado</p>
            <p className="text-sm text-red-300">Demasiados intentos fallidos</p>
            <p className="text-2xl font-mono font-bold text-red-500 mt-3">
              {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Nombre completo *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Teléfono *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+53 5XXXXXXX" type="tel"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Correo (recomendado)</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@correo.com" type="email"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
            </div>
            
            <div className="border-t border-gray-800 pt-4 mt-2">
              <label className="text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1 ml-1">
                <Lock size={14} /> Clave secreta de autorización *
              </label>
              <input value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="Ingresa la clave secreta" type="password"
                className="w-full bg-gray-900 border border-amber-500/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]" />
              <p className="text-[10px] text-gray-500 mt-1.5 ml-1">Intentos: {attempts}/5</p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Contraseña * (mínimo 6 caracteres)</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña segura"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {password && (
                <div className="flex items-center gap-2 mt-2 ml-1">
                  <div className="flex gap-1 flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex-1 transition-all duration-300 ${i <= pwStrength ? (pwStrength === 3 ? 'bg-emerald-500' : pwStrength === 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${pwStrength === 3 ? 'text-emerald-500' : pwStrength === 2 ? 'text-amber-500' : 'text-red-500'}`}>
                    {pwStrength === 3 ? 'Fuerte' : pwStrength === 2 ? 'Media' : 'Débil'}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block ml-1">Confirmar contraseña *</label>
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña"
                type="password" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"><AlertTriangle size={12} /> Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-emerald-400 mt-1 ml-1">✅ Las contraseñas coinciden</p>
              )}
            </div>
            
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>}
            {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">✅ {success}</p>}
            
            <button onClick={handleRegisterAdmin} disabled={loading || locked}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition-all shadow-lg ${
                loading || locked ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white active:scale-95 shadow-amber-900/20'
              }`}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creando cuenta...</> :
                <><Shield size={18} /> Crear cuenta de {registerRole === 'admin' ? 'Admin' : 'Vendedor'}</>}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              ¿Ya tienes cuenta? <button onClick={() => goTo('loginAdmin')} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">Inicia sesión</button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}