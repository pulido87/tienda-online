# 🛒 MercadoCuba - Tienda Online con Delivery

Plataforma e-commerce para MIPYME cubana en Pinar del Río. Venta online de alimentos, cervezas, refrescos y productos básicos con entrega a domicilio.

**Desarrollado por Yosmani Pulido**

## 🚀 Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS 4
- **Estado:** Zustand
- **Backend/DB:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## 📋 Funcionalidades

- ✅ Catálogo por categorías (Alimentos, Cervezas, Refrescos, Aseo, Combos)
- ✅ Carrito de compras con cálculo automático
- ✅ Checkout de 4 pasos (Datos → Entrega → Pago → Confirmar)
- ✅ 4 métodos de pago cubanos (Transfermóvil, EnZona, Transferencia, Efectivo)
- ✅ 10 zonas de entrega en Pinar del Río
- ✅ Panel Admin completo (Dashboard, Productos, Pedidos, Ventas, Alertas)
- ✅ Registro con clave secreta para Admin/Vendedor
- ✅ Protección contra fuerza bruta (5 intentos → bloqueo 15 min)
- ✅ Botón directo a WhatsApp
- ✅ Programa de fidelidad (Cliente Frecuente)
- ✅ Exportar reportes CSV
- ✅ Mobile-first, compatible Android 7+
- ✅ Integración con Supabase (PostgreSQL + Auth + Storage)

## ⚙️ Instalación Local

```bash
git clone https://github.com/tu-usuario/mercadocuba.git
cd mercadocuba
npm install
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> ⚠️ **NUNCA** subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

## 🗄️ Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** → New Query
3. Ejecuta el SQL completo (disponible en la app: Admin → Configurar Supabase)
4. Crea los buckets de Storage: `product-images` (público) y `payment-proofs` (privado)

## 🔑 Claves Secretas (Registro Admin)

Las claves por defecto están en la tabla `app_settings` de Supabase:

| Rol | Clave por defecto |
|-----|-------------------|
| Admin | `MERCADOCUBA_ADMIN_2025` |
| Vendedor | `MERCADOCUBA_VENDOR_2025` |

**Cambiar en producción:**
```sql
UPDATE app_settings SET value = 'TU_NUEVA_CLAVE' WHERE key = 'admin_secret_key';
UPDATE app_settings SET value = 'TU_NUEVA_CLAVE' WHERE key = 'vendor_secret_key';
```

## 🏃 Desarrollo

```bash
npm run dev
```

## 🌐 Deploy en Vercel

1. Sube el código a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new) → Importar repositorio
3. Agrega las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Click **Deploy**

## 📁 Estructura del Proyecto

```
src/
├── lib/supabase.ts          # Cliente Supabase + servicio DB + SQL
├── store/
│   ├── index.ts             # Store principal (Zustand)
│   ├── types.ts             # Tipos TypeScript
│   ├── data.ts              # Datos iniciales
│   └── useStore.ts          # Store secundario con sync Supabase
├── components/
│   ├── Header.tsx           # Header con búsqueda y moneda
│   ├── BottomNav.tsx        # Navegación inferior
│   ├── HomeView.tsx         # Página de inicio
│   ├── CatalogView.tsx      # Catálogo de productos
│   ├── ProductDetail.tsx    # Modal de detalle
│   ├── CartView.tsx         # Carrito de compras
│   ├── CheckoutView.tsx     # Proceso de checkout
│   ├── OrdersView.tsx       # Historial de pedidos
│   ├── AuthView.tsx         # Registro/Login con clave secreta
│   ├── AdminView.tsx        # Panel administrativo
│   ├── ProfileView.tsx      # Perfil de usuario
│   ├── SupabaseSetup.tsx    # Guía de configuración DB
│   ├── SplashScreen.tsx     # Pantalla de carga
│   └── WhatsAppFab.tsx      # Botón flotante WhatsApp
├── App.tsx                  # Componente raíz
├── main.tsx                 # Entry point
└── index.css                # Estilos globales
```

## 📄 Licencia

© 2025 MercadoCuba - Desarrollado por Yosmani Pulido
