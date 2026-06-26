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
- [ ] Crear componentes: Navbar, Hero, Footer
- [ ] Mejorar landing page con diseño real
- [ ] Conectar D1 cuando sea necesario
- [ ] Hacer deploy vía push a GitHub
