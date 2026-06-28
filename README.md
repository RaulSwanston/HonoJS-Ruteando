# Ruteando — Web de Seguimiento de Visitas

Web de seguimiento de visitas para negocios de reparto de mercancía. Mini-súper, abarroterías, bodegones y afines.

## Stack

- **Frontend:** Hono (JSX en Edge), Vanilla JS (ESM)
- **Runtime:** Cloudflare Workers
- **Data:** D1 (SQLite), KV (sesiones), R2 (archivos)
- **Build:** Vite + `@hono/vite-build`
- **Deploy:** Cloudflare Pages (vía GitHub)

## Desarrollo

No se ejecutan comandos locales. Todo el desarrollo se hace subiendo cambios a GitHub y Cloudflare Pages compila y despliega automáticamente.

Para generar/types sincronizados con la configuración del Worker:

```txt
npm run cf-typegen
```

Usar `CloudflareBindings` como genérico al instanciar `Hono`:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
