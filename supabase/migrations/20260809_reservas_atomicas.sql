-- ═══════════════════════════════════════════════════════════════════
-- Migration: reservas_atomicas
-- Fecha: 2026-08-09
-- Descripción: Funciones SECURITY DEFINER para reservas atómicas.
--   - `consultar_disponibilidad`: expone solo conteos agregados por
--     horario (visible para el rol anónimo, sin datos personales).
--   - `reservar_cupo`: serializa la transacción por fecha+horario con
--     un advisory lock y valida cupos de forma atómica (evita
--     sobreventa por condición de carrera SELECT+INSERT del front).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Consultar disponibilidad (conteos agregados, accesible a anónimos)
CREATE OR REPLACE FUNCTION public.consultar_disponibilidad(p_fecha DATE)
RETURNS TABLE (horario TEXT, ocupados INT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.horario, COALESCE(SUM(r.cupos), 0)::INT AS ocupados
  FROM public.reservations r
  WHERE r.fecha = p_fecha
    AND r.estado IN ('pendiente', 'confirmada')
  GROUP BY r.horario;
$$;

-- 2. Reservar cupo de forma atómica
CREATE OR REPLACE FUNCTION public.reservar_cupo(
  p_nombre    TEXT,
  p_email     TEXT,
  p_telefono  TEXT,
  p_fecha     DATE,
  p_horario   TEXT,
  p_paquete   TEXT,
  p_cupos     INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ocupados INT;
  v_id       UUID;
  v_limite   INT := 4;
BEGIN
  -- a. Validaciones de entrada
  IF p_cupos NOT BETWEEN 1 AND 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El número de cupos debe estar entre 1 y 4');
  END IF;

  IF p_horario NOT IN ('10-11', '14-15', '15-16') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Horario inválido');
  END IF;

  IF p_paquete NOT IN ('testing_1', 'testing_2') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Paquete inválido');
  END IF;

  IF p_email IS NULL OR (strpos(p_email, '@') = 0 OR strpos(p_email, '.') = 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Email inválido');
  END IF;

  IF p_nombre IS NULL OR length(p_nombre) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Nombre muy corto');
  END IF;

  IF p_telefono IS NULL OR length(p_telefono) < 7 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Teléfono muy corto');
  END IF;

  -- b. Serializar la transacción por fecha+horario
  PERFORM pg_advisory_xact_lock(hashtext('reserva:' || p_fecha::TEXT || ':' || p_horario));

  -- c. Contar cupos ocupados
  SELECT COALESCE(SUM(cupos), 0)
    INTO v_ocupados
  FROM public.reservations
  WHERE fecha = p_fecha
    AND horario = p_horario
    AND estado IN ('pendiente', 'confirmada');

  -- d. Verificar disponibilidad
  IF v_ocupados + p_cupos > v_limite THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No hay suficientes cupos disponibles',
      'ocupados', v_ocupados,
      'disponibles', v_limite - v_ocupados
    );
  END IF;

  -- e. Insertar la reserva
  INSERT INTO public.reservations (nombre, email, telefono, fecha, horario, paquete, cupos)
  VALUES (p_nombre, p_email, p_telefono, p_fecha, p_horario, p_paquete, p_cupos)
  RETURNING id INTO v_id;

  -- f. Éxito
  RETURN jsonb_build_object('ok', true, 'id', v_id::TEXT);

EXCEPTION WHEN OTHERS THEN
  -- g. Error inesperado
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- 3. Permitir ejecución a anónimos y autenticados
GRANT EXECUTE ON FUNCTION public.consultar_disponibilidad(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reservar_cupo(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, INT) TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- Nota: SECURITY DEFINER permite a estas funciones leer/insertar en
-- public.reservations ignorando RLS (que bloquearía el SELECT a
-- anónimos), mientras que `pg_advisory_xact_lock` sobre la clave
-- 'reserva:<fecha>:<horario>' serializa las inserciones concurrentes
-- de un mismo horario. Así el conteo y la reserva son atómicos y no
-- hay sobreventa, y los anónimos solo ven conteos agregados.
-- ═══════════════════════════════════════════════════════════════════
