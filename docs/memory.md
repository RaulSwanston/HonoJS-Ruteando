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
- Autenticación: sesiones en KV, cuentas vinculables, OAuth (Google + GitHub + Apple).
- Mínimas dependencias externas — priorizar Web Crypto nativo, solo instalar si es estrictamente necesario.
- API pública planeada bajo `/api/v1/`.
- Roles dentro de un negocio: admin (dueño), staff (empleado), consumer (cliente del negocio).

### Archivos creados
- `migrations/001_init.sql` — esquema D1 (users, businesses, business_members, branches)
- `src/models/users.ts` — CRUD de usuarios
- `src/models/businesses.ts` — CRUD de negocios + miembros
- `src/models/branches.ts` — CRUD de sucursales
- `docs/architecture.md` — actualizado con la arquitectura actual

### Próximos pasos
- [x] Implementar `lib/crypto.ts` y `lib/session.ts`
- [x] Implementar middleware de auth
- [x] Implementar rutas de auth (registro, login, logout)
- [ ] Implementar OAuth (Google, GitHub, Apple)
- [ ] Implementar vista de perfil de usuario (editar nombre, avatar)
- [ ] Implementar eliminación de cuenta (soft delete)
- [ ] Conectar D1, KV y Secrets en dashboard + wrangler.jsonc
