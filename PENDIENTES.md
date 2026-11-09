# PENDIENTES — El Depósito (DepositoMap)

> Última actualización: 2026-11-09
> Estado: reestructuración modular en curso en la rama `v2`. `main` sigue siendo el sitio en producción.

---

## 🧱 Reestructuración v2 (rama `v2`)

Arquitectura: una sola app Next.js organizada en **módulos independientes** (piezas Lego),
server actions en lugar de API, Supabase + Vercel ahora y VPS + Docker después.
Reglas y anatomía de un módulo: `src/modules/README.md`.

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base: `src/` modular, design system (`src/shared/ui`), env con Zod, Drizzle, adaptador de auth, bus de eventos, lint de fronteras, Vitest, Dockerfile + compose | ✅ Hecha (sin commitear) |
| 2 | Motor de reservas Coffee Tasting: experiencias, horarios, bloqueos, flujo `/reservar`, agenda admin, reservas manuales con canal | ⏳ Siguiente |
| 3 | Notificaciones por correo (confirmación, recordatorio, cancelación) | Pendiente |
| 4 | Catálogo + mapa migrados desde `src/legacy` con SSR | Pendiente |
| 5 | Cambio del sitio a v2; luego VPS, WhatsApp, chatbot | Pendiente |

**Necesario antes de la fase 2:** `.env.local` está vacío. Completar según `.env.example`
(incluye `DATABASE_URL` del *Transaction pooler* de Supabase).

---

## ✅ Completado (hasta la fecha)

- **Falencias CRÍTICAS y ALTAS** (anti-sobreventa de cupos con RPCs atómicas, eliminación de `/lote/[id]`, CTA de reservas, sesión corrupta, RLS de visibilidad, FK en cascada, paginación de 12, admin sin `alert/confirm`): implementadas, commiteadas y pusheadas.
- **Falencias MEDIAS (lotes A–D)**:
  - A: `REGIONES_CAFETERAS` centralizadas en `data/mapaData.ts`; paquetes en `data/paquetes.ts` (`PAQUETES` + `PAQUETES_MARKETING`).
  - B: migración `20260809_indices_perf.sql` — **APLICADA en Supabase** (3 índices).
  - C: race condition en `coffeeStore` (token `fetchSeq`) y suscripciones duplicadas de `onAuthStateChange` en `userStore`.
  - D: descartado — las `<img>` de la home son SVG vectorial, `next/image` no aplica.
- **Falencias BAJAS (1–5)**:
  1. Binario `@next/swc-linux-x64-gnu` eliminado de `package.json` (SWC de Windows se usa automáticamente).
  2. `Content-Security-Policy` añadida en `next.config.ts`.
  3. `localStorage` de `app/page.tsx` protegido con `try/catch`.
  4. Proxy de Supabase reemplazado por `getSupabase()` explícito (7 archivos migrados).
  5. Metadata por ruta en `/admin` y `/admin/login` (layouts server + `noindex`).
- Verificación: `npx tsc --noEmit` ✅ · `npm run build` ✅ (6 rutas estáticas).

---

## 🔍 Por verificar manualmente (importante)

| # | Qué | Dónde | Por qué |
|---|-----|-------|---------|
| 1 | **Validar el CSP en el navegador** | App completa en dev y prod | La BAJA 2 (Content-Security-Policy) no se puede validar con `tsc`/`build`; hay que probar en runtime que no rompe nada |
| 2 | Navegación entre las 4 secciones (Inicio, Mapa, Coffee Tasting, Usuario) | `app/page.tsx` | Scripts inline de Next + estilos inline de framer-motion |
| 3 | Login admin + **panel de Reservas** (usa Realtime/websocket) | `/admin` | `connect-src` cubre `wss://*.supabase.co`; verificar que las notificaciones de nuevas reservas funcionan |
| 4 | Login/registro de usuario y favoritos | Vista Usuario | `connect-src` y `img-src` |
| 5 | Reserva de Coffee Testing (RPCs) | `ReservaSidePanel` | Consulta y reserva de cupos |
| 6 | **Aplicar migración `20261109_reservas_sin_insert_directo.sql`** | Supabase → SQL Editor | Cierra el INSERT directo a `reservations` (política `WITH CHECK (true)` que permitía saltarse `reservar_cupo`). Después: probar una reserva desde la web y que el admin siga viendo/actualizando reservas |

> Si algo falla por CSP: ajustar directivas en `next.config.ts` (`buildSecurityHeaders`) y volver a probar.

---

## ⏳ Diferido por decisión propia (pendiente de una sesión dedicada)

| # | Tarea | Detalle |
|---|-------|---------|
| 1 | **ALTA #6: SSR / SEO** | Migrar contenido público a server components / `generateMetadata` por ruta (home), `sitemap.ts`, `robots.ts`. No tocar hasta nueva sesión. |
| 2 | **Refactor de god components** | `components/ReservaSidePanel.tsx` (~944 líneas) y `app/admin/page.tsx` (~733 líneas): dividir en subcomponentes. No tocar por ahora. |

---

## 📋 Backlog (mejoras detectadas, sin priorizar)

| # | Mejora | Detalle |
|---|--------|---------|
| 1 | Deduplicar precios de paquetes en admin | `components/views/AdminReservasView.tsx` (l. 12–20) define `PAQUETE_LABELS` y `PAQUETE_PRECIOS` (45000/120000) duplicando `data/paquetes.ts`. Usar `PAQUETES` canónico. |
| 2 | Scripts de calidad | `package.json` no tiene `typecheck` ni `lint`; no hay ESLint ni tests. Añadir al menos `"typecheck": "tsc --noEmit"`. |
| 3 | Preconnects de Google Fonts | `app/layout.tsx` (l. 48–49) tiene `<link rel="preconnect">` a `fonts.googleapis.com/gstatic`, pero `next/font` self-hostea las fuentes → son innecesarios (revisar). |
| 4 | Realtime del admin se re-suscribe al cambiar de tab | `app/admin/page.tsx` — el efecto de notificaciones tiene `[session, adminTab]` como deps; cada switch de tab re-crea el channel. |
| 5 | Notas de cata (UserView) | El dashboard del usuario muestra "0 Notas de cata" sin implementación detrás. |

---

## 🔧 Notas de proceso (cómo trabajamos)

- **Commits**: uno por falencia, SOLO bajo orden explícita del usuario ("haz los commits").
- **Push**: solo cuando el usuario lo pide explícitamente.
- **Migraciones SQL**: el usuario las aplica MANUALMENTE en Supabase Dashboard → SQL Editor (el repo guarda el `.sql` como registro).
- **Verificación previa a commitear**: `npx tsc --noEmit` + `npm run build`.
- **Entorno**: Windows; el shell de trabajo usa PowerShell. El binario SWC se resuelve solo por plataforma.
- **Subagentes**: en sesiones anteriores los agentes especialistas fallaron en silencio; las tareas se implementaron directamente por el coordinador. Verificar antes de delegar.

---

## 🗂️ Archivos clave

- `data/paquetes.ts` — fuente canónica de paquetes de Coffee Testing
- `data/mapaData.ts` — regiones cafeteras + `isCoffeeRegion()`
- `supabase/migrations/20260809_indices_perf.sql` — índices de rendimiento (aplicada)
- `lib/supabase.ts` — `getSupabase()` (lazy singleton)
- `next.config.ts` — headers de seguridad + CSP
- `store/coffeeStore.ts` / `store/userStore.ts` — stores con fixes de concurrencia
- `app/admin/layout.tsx` / `app/admin/login/layout.tsx` — metadata por ruta
