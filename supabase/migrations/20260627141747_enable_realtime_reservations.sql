-- ═══════════════════════════════════════════════════════════════════
-- Migration: enable_realtime_reservations
-- Descripción: Habilita Realtime para la tabla reservations
-- ═══════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table reservations;
