# Arquitectura y Estructura

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Cloudflare Workers (Edge) |
| Framework | Hono (JSX server-side) |
| DB | D1 (SQLite en Edge) |
| Sesiones | KV (cache rápido con TTL) |
| Archivos | R2 (imágenes, avatares) |
| Build | Vite + @hono/vite-build |
| Deploy | Cloudflare Pages (vía GitHub) |

## Estructura de directorios

```
src/
├── index.tsx          → entry point, middleware global, montaje de rutas
├── renderer.tsx       → renderer JSX para c.render()
├── config.json        → configuración global
├── routes/            → handlers HTTP (uno por ruta o grupo de rutas)
│   ├── index.tsx      → GET /
│   ├── about.tsx      → GET /about
│   └── auth/          → login, registro, OAuth, cuenta
├── models/            → acceso a datos (queries D1)
│   ├── users.ts       → CRUD usuarios
│   ├── businesses.ts  → CRUD negocios + miembros
│   └── branches.ts    → CRUD sucursales
├── middleware/         → auth, roles, CSRF, rate limiting
├── components/        → UI reutilizable (JSX)
├── lib/               → utilidades compartidas
│   ├── engine.ts      → i18n, config, tipos globales
│   ├── crypto.ts      → hash/verify passwords (PBKDF2)
│   └── session.ts     → crear/verificar/destruir sesiones en KV
└── i18n/              → traducciones (es.json, en.json)
```

## Modelo de datos (D1)

### users
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| email | TEXT UNIQUE | Email del usuario |
| password_hash | TEXT | Hash PBKDF2 (NULL si solo OAuth) |
| name | TEXT | Nombre visible |
| avatar_url | TEXT | URL del avatar (R2) |
| role | TEXT | 'user' \| 'super_admin' |
| deleted_at | TEXT | Soft delete |

### businesses
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| owner_id | TEXT FK | Usuario propietario |
| name | TEXT | Nombre del negocio |
| slug | TEXT UNIQUE | Identificador para URLs |
| description | TEXT | Descripción |
| logo_url | TEXT | Logo (R2) |
| config | TEXT | JSON con configuración del negocio |
| deleted_at | TEXT | Soft delete |

### business_members
| Columna | Tipo | Descripción |
|---------|------|-------------|
| business_id | TEXT FK | Negocio |
| user_id | TEXT FK | Usuario |
| role | TEXT | 'admin' \| 'staff' \| 'consumer' |

### branches
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT PK | UUID |
| business_id | TEXT FK | Negocio al que pertenece |
| name | TEXT | Nombre de la sucursal |
| address | TEXT | Dirección física |
| lat/lng | REAL | Coordenadas geográficas |
| is_main | BOOLEAN | Sucursal principal |

## Flujo de autenticación

```
Request → Middleware de sesión (KV) → c.set('user', ...)
         → Middleware de contexto de negocio → c.set('business', ...)
         → Route handler
```

- Sesiones en KV con TTL de 7 días
- Cookie firmada con HMAC (HttpOnly, Secure, SameSite)
- OAuth: Google, GitHub, Apple
- Cuentas vinculables (un usuario puede tener email + múltiples OAuth)

## API

- Endpoints bajo `/api/v1/`
- Misma base de datos y modelos que el frontend
- Autenticación vía API keys o sesión
- Negociación de contenido (JSON para API, HTML para web)
- Rate limiting por API key o IP
