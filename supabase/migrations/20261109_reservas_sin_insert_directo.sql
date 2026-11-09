-- ═══════════════════════════════════════════════════════════════════
-- Migration: reservas_sin_insert_directo
-- Fecha: 2026-11-09
-- Descripción: Cierra el INSERT directo sobre `public.reservations`.
--   La política "Cualquier persona puede reservar" (WITH CHECK (true)),
--   creada en 20250626_create_reservations.sql, seguía activa después de
--   introducir la RPC atómica `reservar_cupo` (20260809_reservas_atomicas.sql).
--   Con la anon key pública cualquiera podía hacer
--     POST /rest/v1/reservations
--   y saltarse el advisory lock, el límite de cupos y las validaciones,
--   provocando sobreventa o spam de reservas.
--
--   Ahora la ÚNICA vía para crear reservas es `reservar_cupo`, que es
--   SECURITY DEFINER (se ejecuta como el dueño de la tabla y no depende
--   de esta política ni de los GRANT de anon/authenticated).
--
--   No afecta al panel admin: solo usa SELECT y UPDATE (políticas propias).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Eliminar la política de inserción abierta
DROP POLICY IF EXISTS "Cualquier persona puede reservar" ON public.reservations;

-- 2. Defensa en profundidad: quitar el privilegio de INSERT a los roles
--    expuestos por la API. Sin política de INSERT, RLS ya lo bloquea; esto
--    evita que una política futura lo reabra por accidente.
REVOKE INSERT ON public.reservations FROM anon, authenticated;
