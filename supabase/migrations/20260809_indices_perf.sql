-- ═══════════════════════════════════════════════════════════════════
-- Migration: indices_perf
-- Fecha: 2026-08-09
-- Descripción: índices de rendimiento para los patrones de consulta
--   más frecuentes del catálogo:
--     1. cafés visibles (filtro público por RLS `visible = true`)
--     2. cafés por departamento + visibles (filtro del mapa y SidePanel)
--     3. user_favorites por coffee_id (join inverso cafés → favoritos;
--        la PK (user_id, coffee_id) ya indexa user_id, pero no coffee_id)
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_cafes_visible
  ON public.cafes (visible);

CREATE INDEX IF NOT EXISTS idx_cafes_departamento_visible
  ON public.cafes (departamento_id, visible);

CREATE INDEX IF NOT EXISTS idx_user_favorites_coffee_id
  ON public.user_favorites (coffee_id);
