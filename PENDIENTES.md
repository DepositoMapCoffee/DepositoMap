# PENDIENTES — El Depósito (DepositoMap)

> Última actualización: 2026-11-10
> Estado: fases 1, 2a, 2b y 3 terminadas en `v2`; salida a producción (merge `v2` → `main`) el 2026-11-10.

---

## 🧱 Reestructuración v2 (rama `v2`)

Arquitectura: una sola app Next.js organizada en **módulos independientes** (piezas Lego),
server actions en lugar de API, Supabase + Vercel ahora y VPS + Docker después.
Reglas y anatomía de un módulo: `src/modules/README.md`.

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base: `src/` modular, design system (`src/shared/ui`), env con Zod, Drizzle, adaptador de auth, bus de eventos, lint de fronteras, Vitest, Dockerfile + compose | ✅ Hecha |
| 2a | Motor de reservas (público): tablas `tasting_*` + migraciones Drizzle, dominio con 30 tests (disponibilidad, festivos CO, cancelación), reserva atómica, `/reservar` y `/reserva/[codigo]` | ✅ Hecha y probada en Supabase (reserva de prueba DEP-8KEVA creada y cancelada) |
| 2b | Panel admin `/panel`: ingreso con sesión en cookies (`proxy.ts`), agenda semanal, cambio de estados con historial, reserva manual por canal (correo opcional), configuración de horarios, cierres, reglas y experiencias | ✅ Hecha (confirmar y cancelar probados; resto de acciones que escriben sin probar) |
| 3 | Correos: recibida, confirmada, cancelada, recordatorio del día anterior (cron), aviso al equipo. Adaptador `consola`/`resend`, enlaces firmados (`RESERVAS_SECRETO`) | ✅ Hecha y probada en consola (DEP-5MZ7S). **Envío real en espera del dominio** |
| 4A | Ingreso único `/ingresar` (clientes y admins, crear cuenta con consentimiento), `/cuenta` con favoritos y accesos al panel; sesión del mapa por server actions | ✅ Hecha (rama `fase-4`) |
| 4B | Panel unificado: Catálogo (cafés y chocolates) en `/panel/catalogo`; `/admin` y logins viejos retirados (redirecciones) | ✅ Hecha (rama `fase-4`) |
| 4C | Rediseño visual del sitio público: inicio, mapa, experiencias, cuenta (empieza por maqueta de la home para aprobar) | ⏳ Siguiente |
| 5 | Cambio del sitio a v2; luego VPS, WhatsApp, chatbot | Pendiente |

**Estado de la base de datos:** migraciones Drizzle 0000–0003 aplicadas en Supabase (tablas `tasting_*`,
datos iniciales, correo opcional y `recordatorio_enviado_en`). Para nuevas migraciones: `npm run db:generate` y `npm run db:migrate`.

## 🚀 Checklist para salir a producción

**Bloqueantes**
1. [x] Unificar reservas: botones de la home → `/reservar` (paquete preseleccionado o selección libre); `ReservaSidePanel` y la pestaña de reservas del `/admin` viejo retirados. Pendiente aparte: la sección "Coffee Tasting" de la home muestra precios fijos de `src/legacy/data/paquetes.ts` (se resuelve en la fase 4).
2. [x] Política de tratamiento de datos en `/privacidad` (módulo `legal`), enlazada desde la reserva, la reserva manual del panel, el registro de usuarios y el pie de página. Cada reserva guarda la versión aceptada (`POLITICA_DATOS.version`, migración 0004).
   - [ ] **Revisión por el asesor legal** (texto en `src/modules/legal/ui/PoliticaDatos.tsx`; al cambiarlo, subir `POLITICA_DATOS.version`).
   - [ ] La política promete conservar reservas 24 meses: falta la limpieza automática de reservas antiguas.
   - [ ] Solicitudes de supresión: hoy se atienden a mano (no hay botón de eliminar datos en el panel).
   - [ ] El registro de usuarios (legacy) pide aceptar la política pero no guarda la prueba (se resuelve en la fase 4).
3. [x] Variables en Vercel (cargadas el 2026-11-10; avisos y respuestas a interactivemapdeposito@gmail.com): `DATABASE_URL` (sin corchetes), `RESERVAS_SECRETO` (mismo valor que `.env.local`), `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` (URL real; hoy localhost).
4. [x] Deploy de vista previa de `v2` probado en Vercel (2026-11-10): `/reservar` con datos reales, home, `/privacidad`, fuentes, cron protegido (401) y sesión del panel con cookies httpOnly. La CSP solo bloquea la barra de comentarios de Vercel (`vercel.live`, existe únicamente en vistas previas).
5. [x] Acciones del panel probadas por el negocio (2026-11-10): reserva manual, cierres, horarios, reglas, experiencias y estados.
6. [ ] (Se sale a producción SIN correos, con `EMAIL_PROVEEDOR=consola`; el cliente recibe su enlace en pantalla.) Correos: comprar dominio → Resend (gratis: ~3.000/mes, 100/día) → `EMAIL_PROVEEDOR=resend`, `RESEND_API_KEY`, `EMAIL_REMITENTE`, `EMAIL_AVISOS_NEGOCIO`. (Decidir si se publica sin correos.)

**Recomendado**
7. [ ] Anti-spam en `/reservar` (límite por IP o Cloudflare Turnstile).
8. [ ] Limpiar datos de prueba: `DEP-8KEVA` y `DEP-5MZ7S` (canceladas) y decidir qué hacer con la reserva de la tabla `reservations` antigua.
9. [ ] Revisar plan de Supabase (pausa por inactividad y copias de seguridad en el plan gratuito).
10. [ ] Monitoreo de errores (avisos cuando falle una reserva o un correo).

**Recordatorios:**
- `DATABASE_URL` en Vercel: misma URL del *Transaction pooler*, contraseña SIN corchetes.
- Ingreso único en `/ingresar`; las cuentas admin (tabla `admins`) ven el panel `/panel` (Agenda · Catálogo · Configuración). `/admin` redirige al panel.
- Supabase envía los correos de confirmación de cuentas nuevas con su servidor propio (límite bajo de envíos por hora en el plan gratuito). Revisar en Supabase → Authentication si se exige confirmar el correo.
- Vercel marca los "Cron Jobs" como sistema antiguo frente a "Schedules": migrar cuando convenga.
- La conexión usa `max_pipeline: 1` (el pooler de Supabase se cuelga con pipelining).
- Regla de "mismo día": 2 h de anticipación mínima (antes: nada después de mediodía); editable en Panel → Configuración → Reglas.

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
