# Cambios Estructurales — DepositoMap

**Fecha:** 26 de Junio de 2026  
**Proyecto:** DepositoMap — Mapa interactivo de cafés de Colombia  
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion + Zustand + Supabase

---

## 1. Planificación Original

Antes de empezar a codificar, se definieron los siguientes objetivos y restricciones:

### Objetivos

1. **Nueva sección "Nuestra Historia"** en la página de inicio (Home), con un texto de bienvenida que cuente quiénes somos.
2. **Reemplazar Catálogo por Reservas** — la sección de Catálogo (que listaba cafés) se elimina y se sustituye por un sistema de agendamiento de **Coffee Testing** (sesiones de cata de café).
3. **Wizard de agendamiento de 3 pasos**:
   - Paso 1: Selección de paquete (Coffee Testing 1 o 2)
   - Paso 2: Formulario con datos personales + disponibilidad por fecha y horario
   - Paso 3: Confirmación y envío
4. **Deshabilitar navegación a detalle** desde las tarjetas del mapa (`CoffeeCard` ya no navega a `/lote/[id]`).
5. **Notificaciones in-app (toast)** — sin WhatsApp, sin email.
6. **Conservar tooltip desktop** del mapa interactivo.
7. **Conservar bottom card mobile** con información del departamento.

### Restricciones

- Los precios de los paquetes son fijos:
  - Coffee Testing 1: **$45.000 COP**
  - Coffee Testing 2: **$120.000 COP**
- Cupo máximo por horario: **4 personas**
- Horarios disponibles: **10-11, 14-15, 15-16**
- Personalización opcional del Coffee Testing se eliminó del alcance
- Footer con integrantes se implementa a futuro
- Solo notificaciones in-app (sin WhatsApp/email)
- No modificar nada sin orden explícita
- Trabajar solo en local — no subir nada al repositorio sin aprobación

---

## 2. Cambios Realizados

### 2.1 Base de datos — Migración SQL

**Archivo:** `supabase/migrations/20250626_create_reservations.sql`

Se creó la primera migración del proyecto con la tabla `reservations`:

```sql
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text not null,
  fecha date not null,
  horario text not null,
  paquete text not null,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now(),
  constraint chk_horario check (horario in ('10-11', '14-15', '15-16')),
  constraint chk_paquete check (paquete in ('testing_1', 'testing_2')),
  constraint chk_estado check (estado in ('pendiente', 'confirmada', 'cancelada'))
);
```

**RLS Policies:**
- `insert` permitido para todos (con `(estado = 'pendiente')` check)
- `select` permitido para todos (solo lectura)
- Update/delete solo para service_role (admin)

### 2.2 Tipos TypeScript

**Archivo:** `types/index.ts`

Se agregaron los siguientes tipos:

| Tipo | Descripción |
|------|-------------|
| `ReservationPackageId` | `'testing_1' \| 'testing_2'` |
| `ReservationPackage` | Nombre, precio, descripción |
| `TimeSlot` | `'10-11' \| '14-15' \| '15-16'` |
| `ReservationStatus` | `'pendiente' \| 'confirmada' \| 'cancelada'` |
| `ReservationFormData` | Datos del formulario (nombre, email, teléfono, fecha, horario, paquete) |
| `Reservation` | Modelo completo (hereda de FormData + id, estado, created_at) |
| `AvailabilityInfo` | Disponibilidad por horario (ocupados, disponibles, máximo) |

### 2.3 CoffeeCard — Sin navegación a detalle

**Archivo:** `components/CoffeeCard.tsx`

- Eliminado `useRouter` y `router.push` del `onClick`
- La tarjeta ya no navega a `/lote/[id]`
- El componente mantiene su apariencia visual

### 2.4 Navegación principal

**Archivo:** `app/page.tsx`

- `NAV_ITEMS`: reemplazado `{ id: 'catalog', label: 'Catálogo' }` por `{ id: 'reservations', label: 'Reservas' }`
- Import de `CatalogView` reemplazado por `ReservasView`
- Renderizado condicional actualizado

### 2.5 CatalogView — Eliminado

**Archivo:** `components/views/CatalogView.tsx`

- Componente eliminado completamente del proyecto
- No tiene dependencias externas, por lo que su eliminación es segura

### 2.6 HomeView — Nueva sección de Historia y limpieza de UI

**Archivo:** `components/views/HomeView.tsx`

- **Reemplazada sección "Nuestra Historia"** con contenido real extraído de `portafoliocafés/index.html`:
  - Título: "Un legado de cuatro generaciones"
  - Foto de **Sigifredo González** (fundador) importada desde `public/sigifredo.png`
  - Texto histórico: "Todo comenzó en 1942 en Viterbo, Caldas..."
  - Mención a Félix González, Javier González y Santiago González
  - Cita destacada: "Cada taza honra nuestra historia..."
  - Layout responsive: imagen arriba en mobile, lado a lado en desktop
- **Agregada sección "Expertos en café especial"** con texto del portafolio
- **Eliminados botones de autenticación** (Iniciar Sesión / Registro / Mi perfil) que estaban debajo del logo en el Hero
- Reemplazada tarjeta de Catálogo por tarjeta de **Reservas (Coffee Testing)**
- Layout ahora es scrolleable (overflow-y-auto)
- Eliminada prop `onCatalogClick`
- Agregada prop `onReservationsClick`
- Limpiados imports no utilizados: `supabase`, `useUserStore`, `LogIn`, `UserPlus`, `useState`

### 2.7 ReservasView — Wizard de agendamiento (NUEVO)

**Archivo:** `components/views/ReservasView.tsx`

Componente completamente nuevo con wizard de 3 pasos:

**Paso 1 — Selección de paquete:**
- Dos tarjetas con información detallada:
  - **Coffee Tasting El Depósito** ($45.000): 30 min, 3 cafés, temática general
  - **Coffee Tasting El Depósito Completo** ($120.000): 60 min, 5 cafés, temática avanzada
- Muestra: duración, número de cafés, idiomas (ES/EN/PT), ubicación
- Resalta el paquete seleccionado

**Paso 2 — Formulario y disponibilidad:**
- Campos: nombre, email, teléfono, fecha (date picker), horario (select)
- **Selector de cupos**: botones − / + para elegir número de personas (1-4)
- Al seleccionar fecha, consulta disponibilidad sumando cupos (no contando reservas)
- Muestra ocupados/disponibles por cada horario
- Valida: nombre (≥2 caracteres), email (formato), teléfono (≥7 dígitos), fecha, horario, cupos (1-4)

**Paso 3 — Confirmación:**
- Resumen completo: paquete con detalles, datos personales, cupos
- **Total estimado**: precio × cupos
- Botón "Confirmar reserva" que inserta en Supabase con `cupos`
- Muestra toast de éxito/error vía `useToastStore`
- Resetea el wizard al completar

**Estados cubiertos:**
- Loading: `checkingAvailability` y `submitting` evitan doble envío
- Empty: botón "Siguiente" deshabilitado si no hay paquete seleccionado o datos incompletos
- Error: toast con mensaje de error del servidor
- Success: toast verde + reset del wizard al paso 1

---

## 3. Decisiones Clave

| Decisión | Motivo |
|----------|--------|
| Notificación in-app (toast) | Simplicidad, sin dependencias externas |
| Tooltip desktop se conserva | Mejor experiencia de exploración del mapa |
| Bottom card mobile se conserva | El usuario la considera útil |
| Catálogo se elimina por completo | Sin dependencias externas, reemplazado por Reservas |
| Sin personalización opcional | Eliminado del alcance por ahora |
| `AnimatePresence` en wizard | Transiciones suaves entre pasos |
| Cupo máximo 4 personas | Definido por el usuario |
| Horarios fijos 10-11, 14-15, 15-16 | Definido por el usuario |

---

## 4. Problemas Conocidos

### 4.1 `next build` fallaba con exit code 135 ✅ SOLUCIONADO

- **Síntoma original:** `next build` no producía ningún output y terminaba con código 135 (SIGBUS).
- **Diagnóstico:** `tsc --noEmit` compilaba sin errores. Se aisló el problema al cargar el binding nativo de SWC (`@next/swc-linux-x64-gnu`).
- **Causa raíz:** El archivo `next-swc.linux-x64-gnu.node` estaba corrupto (41 MB truncado, debía ser ~125 MB). Ocurrió porque el `npm install` inicial se interrumpió por timeout.
- **Solución:**
  1. Eliminar `node_modules/@next/swc-linux-x64-gnu`
  2. Reinstalar con `npm install @next/swc-linux-x64-gnu`
  3. El binario correcto pesa 125 MB y los encabezados ELF son válidos.
- **Error secundario (también solucionado):** La página `/admin/login` fallaba al prerenderizar porque `lib/supabase.ts` validaba las variables de entorno al cargar el módulo. Se refactorizó a inicialización perezosa (lazy) con `Proxy` para diferir la validación al primer uso real.

### 4.2 Migración no aplicada

- La migración SQL está creada pero aún no se ha aplicado al proyecto de Supabase.
- Pendiente de hacer después de verificar la compilación.

---

## 5. Próximos Pasos

1. ~~Resolver el problema de `next build` (código 135)~~ ✅ Solucionado
   - Causa: binario SWC corrupto (41 MB truncado)
   - Solución: `npm install @next/swc-linux-x64-gnu`
2. ~~Aplicar migración SQL en Supabase~~ ✅ Aplicada
   - Tabla `reservations` creada con RLS
3. ~~Crear `.env.local` con credenciales~~ ✅ Creado
4. Probar el flujo completo de Reservas en local ⬅️ **Siguiente paso**
5. Probar el mapa en Safari y corregir issues de compatibilidad
6. Pasar el código por el agente revisor para QA final

---

## 6. Resumen de Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| `next build` exit code 135 (SIGBUS) | Binario SWC corrupto (41 MB truncado) tras `npm install` interrumpido | `rm -rf node_modules/@next/swc-linux-x64-gnu && npm install @next/swc-linux-x64-gnu` |
| `/admin/login` falla al prerenderizar | `lib/supabase.ts` validaba env vars al cargar el módulo | Inicialización perezosa con `Proxy` y `bind` |

### 2.8 AdminReservasView — Vista de administración de reservas (NUEVO)

**Archivo:** `components/views/AdminReservasView.tsx`

- Tabla completa de reservas con columnas: fecha de reserva, nombre, contacto (email/tel), paquete, fecha, horario, cupos, total, estado, acciones
- **Filtros rápidos**: Todas / Pendiente / Confirmada / Cancelada
- **Buscador**: por nombre, email o teléfono
- **Cambio de estado**: botones para confirmar (pendiente → confirmada), cancelar (→ cancelada), reabrir (cancelada → pendiente)
- **Estadísticas**: total reservas, total personas, ingresos estimados
- Cada acción muestra toast de confirmación

### 2.9 app/admin/page.tsx — Tabs de navegación

- Agregados tabs **Catálogo** y **Reservas** en el panel admin
- El tab activo cambia el contenido mostrado
- El subtítulo del header se actualiza según el tab

### 2.10 Migración — Columna cupos

**Archivo SQL aplicado:** `alter table reservations add column cupos integer not null default 1 check (cupos >= 1 and cupos <= 4)`

### 2.11 Lógica de disponibilidad actualizada

- Cambio de `count(*)` (número de reservas) a `sum(cupos)` (suma de personas)
- Cada reserva ahora especifica cuántas personas incluye
- El cupo máximo por horario (4) se calcula contra la suma de cupos

### 2.12 Tipos actualizados

- `ReservationFormData`: agregado `cupos: number`
- `Reservation`: hereda `cupos` de FormData
- `ReservationPackage`: agregados `duracion`, `tematica`, `cafes`, `idiomas`, `ubicacion`

### 2.13 Imagen del fundador

**Archivo:** `public/sigifredo.png`

- Copiada desde `portafoliocafés/Imagenes/sigifredo.png` (732 KB)
- Foto de Sigifredo González, fundador de El Depósito
- Usada en la sección "Nuestra Historia" del HomeView

---

## 7. Archivos Relevantes

| Archivo | Propósito |
|---------|-----------|
| `supabase/migrations/20250626_create_reservations.sql` | Migración DDL + RLS |
| `types/index.ts` | Tipos TypeScript del proyecto |
| `components/CoffeeCard.tsx` | Tarjeta de café sin navegación |
| `components/views/HomeView.tsx` | Home con sección Historia y card Reservas |
| `components/views/ReservasView.tsx` | Wizard de agendamiento |
| `components/views/CatalogView.tsx` | Eliminado |
| `app/page.tsx` | Página principal con navegación actualizada |
| `public/sigifredo.png` | Foto de Sigifredo González (fundador) |
| `portafoliocafés/index.html` | Portafolio original del colega (referencia) |
| `components/views/AdminReservasView.tsx` | Vista admin de reservas con tabla, filtros y acciones |
| `app/admin/page.tsx` | Panel admin con tabs Catálogo / Reservas |
| `next.config.ts` | Configuración de Next.js |
| `tsconfig.json` | Configuración de TypeScript |
