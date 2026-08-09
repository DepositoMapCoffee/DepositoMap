-- ═══════════════════════════════════════════════════════════════════
-- Migration: rls_cafes_visibles
-- Fecha: 2026-08-09
-- Descripción: Endurece la lectura de `cafes` con RLS:
--   - El público (anon/authenticated) solo ve cafés con `visible = true`.
--   - Los admins ven todos los cafés (incluidos los ocultos en borrador).
--   Reemplaza la antigua política "Permitir lectura pública" que exponía
--   todos los registros (USING (true)).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Política pública: solo cafés visibles
DROP POLICY IF EXISTS "Permitir lectura pública" ON public.cafes;

CREATE POLICY "Lectura publica de cafes visibles"
  ON public.cafes
  FOR SELECT
  USING (visible = true);

-- 2. Política para admins: acceso total (ver también borradores)
DROP POLICY IF EXISTS "Admins pueden ver todos los cafes" ON public.cafes;

CREATE POLICY "Admins pueden ver todos los cafes"
  ON public.cafes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = auth.jwt() ->> 'email'
    )
  );
