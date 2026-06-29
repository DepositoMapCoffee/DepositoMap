-- ═══════════════════════════════════════════════════════════════════
-- Migration: create_reservations
-- Fecha: 2025-06-26
-- Descripción: Crea la tabla `reservations` para el agendamiento
--              de Coffee Testing con RLS policies.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Extensión uuid-ossp (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de reservas
CREATE TABLE IF NOT EXISTS public.reservations (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre      TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  telefono    TEXT        NOT NULL,
  fecha       DATE        NOT NULL,
  horario     TEXT        NOT NULL CHECK (horario IN ('10-11', '14-15', '15-16')),
  paquete     TEXT        NOT NULL CHECK (paquete IN ('testing_1', 'testing_2')),
  cupos       INTEGER     NOT NULL DEFAULT 1 CHECK (cupos >= 1 AND cupos <= 4),
  estado      TEXT        NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índice para consultas de disponibilidad por fecha+horario
CREATE INDEX IF NOT EXISTS idx_reservations_fecha_horario
  ON public.reservations (fecha, horario);

-- 4. Habilitar RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS

-- 5a. Cualquier persona (anónimo o autenticado) puede INSERTAR una reserva
CREATE POLICY "Cualquier persona puede reservar"
  ON public.reservations
  FOR INSERT
  WITH CHECK (true);

-- 5b. Solo admins pueden SELECT (ver todas las reservas)
CREATE POLICY "Solo admins pueden ver reservas"
  ON public.reservations
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = auth.email()
    )
  );

-- 5c. Solo admins pueden UPDATE (cambiar estado)
CREATE POLICY "Solo admins pueden actualizar reservas"
  ON public.reservations
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = auth.email()
    )
  );

-- 5d. Solo admins pueden DELETE
CREATE POLICY "Solo admins pueden eliminar reservas"
  ON public.reservations
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = auth.email()
    )
  );
