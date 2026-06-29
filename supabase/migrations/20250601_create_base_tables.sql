-- ═══════════════════════════════════════════════════════════════════
-- Migration: create_base_tables
-- Descripción: Crea las tablas base cafes, admins y user_favorites
--              con sus RLS policies.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Extensión uuid-ossp (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de administradores
CREATE TABLE IF NOT EXISTS public.admins (
  email TEXT NOT NULL PRIMARY KEY
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own admin status" ON public.admins;
CREATE POLICY "Users can only read their own admin status"
  ON public.admins
  FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- 3. Tabla de cafés / productos
CREATE TABLE IF NOT EXISTS public.cafes (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre          TEXT        NOT NULL,
  departamento_id TEXT        NOT NULL,
  finca           TEXT,
  altura          TEXT,
  proceso         TEXT,
  notas           TEXT,
  categoria       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  visible         BOOLEAN     DEFAULT true,
  preparacion     TEXT,
  sugerencias     TEXT,
  descripcion_larga TEXT,
  metodo_sugerido TEXT,
  tipo_producto   TEXT        NOT NULL DEFAULT 'cafe' CHECK (tipo_producto IN ('cafe', 'chocolate'))
);

ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública" ON public.cafes;
CREATE POLICY "Permitir lectura pública"
  ON public.cafes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for admins only" ON public.cafes;
CREATE POLICY "Enable insert for admins only"
  ON public.cafes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "Enable update for admins only" ON public.cafes;
CREATE POLICY "Enable update for admins only"
  ON public.cafes
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "Enable delete for admins only" ON public.cafes;
CREATE POLICY "Enable delete for admins only"
  ON public.cafes
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt() ->> 'email')
  );

-- 4. Tabla de favoritos de usuarios
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id    UUID        NOT NULL REFERENCES auth.users(id),
  coffee_id  UUID        NOT NULL REFERENCES public.cafes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, coffee_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites
  FOR DELETE
  USING (user_id = auth.uid());
