# Estado del proyecto y sesiones

## Sesión 1 — 2026-06-26

### Decisiones técnicas
- Nombre del proyecto: **ZonaB2B**
- Deploy: Cloudflare Pages via GitHub (sin desarrollo local)
- Se creó `src/routes/` con routers modulares
- Se creó `src/lib/engine.ts` con i18n (es/en), config, y tipos compartidos
- Renderer actualizado para usar `t()` y `lang` desde el contexto de Hono
- No se usa carpeta `functions/` manual — lo genera `@hono/vite-build/cloudflare-pages`

### Archivos creados/modificados
- `src/config.json` — configuración global (defaultLang, version)
- `src/i18n/es.json` — traducciones español
- `src/i18n/en.json` — traducciones inglés
- `src/lib/engine.ts` — getConfig, getLanguage, t, tipos (Config, Language, TranslationKey, Variables)
- `src/renderer.tsx` — ahora usa context para t() y lang
- `src/index.tsx` — middleware i18n + monta rutas modulares
- `src/routes/index.tsx` — ruta '/'
- `src/routes/about.tsx` — ruta '/about'
- `AGENTS.md` — reglas actualizadas (prohibido npm install/comandos locales)

### Próximos pasos
- [x] Crear componentes: Navbar, Hero, Footer
- [ ] Dar estilo a la landing page (CSS)
- [ ] Crear ruta /contacto
- [ ] Conectar D1 cuando sea necesario

## Sesión 2 — 2026-06-26

### Decisiones técnicas
- Se definió la arquitectura multi-negocio (multi-tenant).
- La entidad se llama **business** en código, "negocio" en conversación.
- Un usuario puede ser dueño de múltiples negocios (ej: viveres, cocina).
- Un negocio puede tener múltiples sucursales/ubicaciones.
- Un consumidor se registra una vez y puede comprar de múltiples proveedores.
- Autenticación: sesiones en KV (no JWT), cuentas vinculables (email + OAuth en una misma cuenta).
- OAuth planificado: Google + GitHub + Apple (Apple es el más complejo, requiere JWT firmado).
- Mínimas dependencias externas — priorizar Web Crypto nativo (PBKDF2 para passwords), solo instalar si es estrictamente necesario.
- API pública planeada bajo `/api/v1/` — servirá tanto para actores internos como para desarrolladores externos.
- Roles dentro de un negocio: admin (dueño), staff (empleado), consumer (cliente del negocio).
- Soft delete en todas las tablas (no borrado físico).
- Recuperación de contraseña en modo debug (token visible en pantalla) hasta tener un dominio propio para Email Sending.

### Infraestructura Cloudflare creada
- D1: `zonab2b` (region ENAM) — migración `001_init.sql` ejecutada
- KV: `zonab2b-sessions` — sesiones + reset tokens
- Secret: `SESSION_SECRET` — firma de cookies y tokens
- Bindings configurados en `wrangler.jsonc` y Pages dashboard

### Archivos creados
- `migrations/001_init.sql` — esquema D1 (users, businesses, business_members, branches)
- `src/lib/crypto.ts` — hashPassword / verifyPassword (PBKDF2 + SHA-256, Web Crypto)
- `src/lib/session.ts` — createSession / getSession / destroySession (KV + cookie HMAC)
- `src/lib/reset-token.ts` — createResetToken / verifyResetToken (KV con TTL 1h)
- `src/models/users.ts` — CRUD usuarios + soft delete
- `src/models/businesses.ts` — CRUD negocios + gestión de miembros
- `src/models/branches.ts` — CRUD sucursales
- `src/middleware/auth.ts` — extrae sesión de cookie, setea user en contexto
- `src/middleware/requireAuth.ts` — redirect a /login si no hay sesión
- `src/routes/auth/login.tsx` — formulario + POST login
- `src/routes/auth/register.tsx` — formulario + POST registro
- `src/routes/auth/logout.ts` — destruye sesión + limpia cookie
- `src/routes/auth/forgot-password.tsx` — formulario email + muestra token en debug
- `src/routes/auth/reset-password.tsx` — formulario nueva contraseña + actualiza hash

### Deuda técnica pendiente
- [ ] OAuth real (Google, GitHub, Apple) — actualmente los botones existen pero las rutas `/auth/google`, `/auth/github`, `/auth/apple` devuelven 404
- [ ] Email Sending — pendiente de tener un dominio propio. Mientras tanto, modo debug
- [ ] CSRF tokens en formularios POST — actualmente solo se confía en SameSite=Lax + Origin check
- [ ] Rate limiting en login/register — evitar fuerza bruta
- [ ] Vista de perfil de usuario (editar nombre, avatar, teléfono)
- [ ] Eliminación de cuenta (soft delete desde UI)
- [ ] Contexto de negocio (middleware que determine en qué negocio opera el usuario)
- [ ] Selector de negocio para usuarios dueños de múltiples negocios
- [ ] API endpoints (`/api/v1/`)
- [ ] Tests

### Próximos pasos (corto plazo)
- [ ] Conexión de rutas OAuth (Google, GitHub, Apple)
- [ ] Dashboard post-login
- [ ] Perfil de usuario (editar nombre, avatar, teléfono)
- [ ] Eliminación de cuenta desde UI
