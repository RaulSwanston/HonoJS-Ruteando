# Ruteando — Web de Seguimiento de Visitas

## Stack
- **Frontend:** Hono (JSX en Edge), Vanilla JS (ESM)
- **Styling:** Minimalist, CSS puro (sin frameworks pesados)
- **Runtime:** Cloudflare Workers (via Wrangler)
- **Data:** D1 (SQLite en Edge), R2
- **Build:** Vite + `@hono/vite-build`
- **Language:** TypeScript strict
- **Deploy:** `npm run build && wrangler pages deploy`

## Proyecto
Web de seguimiento de visitas para negocios de reparto de mercancía. Permite saber qué clientes fueron visitados, cuáles faltan y establecer la mejor ruta. Orientado a mini-súper, abarroterías, bodegones y similares.

## Convenciones
- Usar `c.render(<Component />)` para respuestas HTML
- Bindings de Cloudflare vía genéricos: `new Hono<{ Bindings: CloudflareBindings }>()`
- Preferir `hono/jsx` para templates (no string concatenation)
- Los estilos van en `public/` o CSS-in-JS
- No usar librerías de UI pesadas — mantener el bundle mínimo
- SIEMPRE usar ES Modules (`import/export`), nunca CommonJS (`require`)
- SIEMPRE escribir código enfocado a entornos Edge (restringir APIs de Node pesadas)
- NUNCA instalar dependencias NPM de terceros sin preguntar primero

## Reglas para la IA
- No modificar `wrangler.jsonc` ni `vite.config.ts` sin preguntar
- Mantener bajo el límite de free tier de Cloudflare (100k requests/día)
- Preferir `Response` nativo de Hono sobre `new Response()` directo
- Archivos de ruta nuevos van en `src/` con sufijo `.tsx`

## Guías Avanzadas (divulgación progresiva)
Para tareas específicas, leer el archivo correspondiente:
- [Análisis de Negocio](./docs/business.md)
- [Arquitectura y Estructura](./docs/architecture.md)
- [Estándares de Código y Estilos](./docs/skills.md)
- [Diseño UI/UX](./docs/design.md)
- [Estado del proyecto y sesiones](./docs/memory.md)
