-- ═══════════════════════════════════════════════════════════════════
-- Migration: fk_user_favorites_cascade
-- Fecha: 2026-08-09
-- Descripción: `user_favorites.coffee_id` ahora tiene ON DELETE CASCADE.
--   Antes, borrar un café desde el panel admin fallaba con violación de
--   FK si el café tenía favoritos guardados por usuarios.
-- ═══════════════════════════════════════════════════════════════════

-- Recrear la FK con eliminación en cascada
ALTER TABLE public.user_favorites
  DROP CONSTRAINT IF EXISTS user_favorites_coffee_id_fkey;

ALTER TABLE public.user_favorites
  ADD CONSTRAINT user_favorites_coffee_id_fkey
  FOREIGN KEY (coffee_id)
  REFERENCES public.cafes(id)
  ON DELETE CASCADE;
