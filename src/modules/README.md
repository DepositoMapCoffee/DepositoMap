# Módulos (piezas Lego)

Cada carpeta de `src/modules/` es una pieza independiente del negocio.
Una pieza se puede **agregar, reemplazar o quitar** sin tocar las demás.

## Anatomía de un módulo

```
modules/<nombre>/
├─ index.ts        API PÚBLICA (servidor). Lo único que otros pueden importar.
├─ client.ts       (opcional) API pública para componentes cliente.
├─ events.ts       (opcional) eventos que publica el módulo.
├─ subscribers.ts  (opcional) eventos de OTROS módulos a los que reacciona.
├─ domain/         reglas de negocio puras: sin BD, sin React. Con tests.
├─ data/           tablas (schema.ts) y consultas. Única capa que toca la BD.
├─ actions/        server actions ('use server'): validan con Zod, verifican
│                  permisos y llaman a domain + data.
└─ ui/             componentes React del módulo.
```

## Reglas (las hace cumplir `npm run lint`)

1. **Fronteras**: un módulo solo importa de otro a través de su `index.ts`
   o `client.ts`. Nunca `@/modules/otro/data/...`.
2. **`shared/` no conoce módulos**: `@/shared/*` nunca importa de `@/modules/*`.
3. **`app/` solo compone**: las rutas arman páginas con piezas de los
   módulos; no contienen lógica de negocio.
4. **Comunicación por eventos**: si un módulo necesita que "pase algo" en
   otro (enviar correo al crear una reserva), publica un evento
   (`@/shared/events`) en vez de llamarlo directamente.

## Crear un módulo nuevo

1. Copiar `_plantilla/` con el nuevo nombre.
2. Definir sus tablas en `data/schema.ts` (Drizzle) y generar la migración.
3. Exponer en `index.ts` solo lo necesario.
4. Si reacciona a eventos, registrar `subscribers.ts` en `bootstrap/registry.ts`.
5. Montar su UI en una ruta de `src/app/`.

## Quitar un módulo

Desmontar sus rutas en `src/app/`, quitar su línea en `bootstrap/registry.ts`
y borrar la carpeta. Si `npm run typecheck` pasa, nada más dependía de él.

## Módulos actuales

| Módulo | Responsabilidad | Estado |
|---|---|---|
| `reservas` | Motor de reservas de Coffee Tasting y panel | Hecho (fases 2–3) |
| `notificaciones` | Correos de reservas (luego WhatsApp) reaccionando a eventos | Hecho (fase 3) |
| `catalogo` | Cafés, chocolates, mapa de orígenes y favoritos | Hecho (fase 4) |
| `sitio` | Páginas públicas: inicio y encabezado | Hecho (fase 4C) |
| `legal` | Política de tratamiento de datos | Hecho |
| `identidad` | Ingreso único, cuentas y administradores | Hecho (fase 4A) |
