import { describe, expect, it } from 'vitest';
import { calendarioMes, franjasDelDia, verificarFranja, type ContextoDisponibilidad } from './disponibilidad';
import { domingoDePascua, esFestivo, festivosColombia } from './festivos';
import { generarCodigo, puedeCancelarCliente, puedeTransicionar } from './reglas';
import { ahoraEnZona, diaSemana, esFechaValida, minutosHasta, rangoMes, semanaDe, sumarDias } from './tiempo';
import { claveFranja, type Ajustes, type Horario } from './tipos';
import { solicitudReservaSchema } from './validacion';

const AJUSTES: Ajustes = {
  anticipacionMinMinutos: 120,
  diasMaxFuturo: 60,
  cuposMaxPorReserva: 4,
  horasMinCancelacion: 24,
  cerrarFestivos: false,
};

// Como el seed: 10:00, 14:00 y 15:00 todos los días, 4 cupos.
const HORARIOS: Horario[] = [0, 1, 2, 3, 4, 5, 6].flatMap((d) =>
  ['10:00', '14:00', '15:00'].map((h) => ({ diaSemana: d, horaInicio: h, capacidad: 4 })),
);

function ctx(parcial: Partial<ContextoDisponibilidad> = {}): ContextoDisponibilidad {
  return {
    ahora: { fecha: '2026-11-10', minutos: 9 * 60 }, // martes 09:00
    ajustes: AJUSTES,
    horarios: HORARIOS,
    bloqueos: [],
    ocupacion: new Map(),
    ...parcial,
  };
}

describe('tiempo', () => {
  it('valida fechas reales', () => {
    expect(esFechaValida('2026-02-28')).toBe(true);
    expect(esFechaValida('2026-02-30')).toBe(false);
    expect(esFechaValida('2026-13-01')).toBe(false);
  });

  it('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('calcula día de la semana', () => {
    expect(diaSemana('2026-11-09')).toBe(1); // lunes
  });

  it('rango de mes incluye febrero bisiesto', () => {
    expect(rangoMes('2028-02')).toEqual({ desde: '2028-02-01', hasta: '2028-02-29' });
  });

  it('convierte un instante UTC a la hora de Bogotá (UTC-5)', () => {
    const ahora = ahoraEnZona('America/Bogota', new Date('2026-11-10T03:30:00Z'));
    expect(ahora).toEqual({ fecha: '2026-11-09', minutos: 22 * 60 + 30 });
  });

  it('semana de lunes a domingo, incluso cruzando meses', () => {
    expect(semanaDe('2026-11-12')).toEqual([
      '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15',
    ]);
    expect(semanaDe('2026-11-01')[0]).toBe('2026-10-26'); // domingo → lunes anterior
  });

  it('minutosHasta cruza días', () => {
    expect(minutosHasta({ fecha: '2026-11-09', minutos: 23 * 60 }, '2026-11-10', '10:00')).toBe(11 * 60);
  });
});

describe('festivos de Colombia', () => {
  it('calcula el Domingo de Pascua', () => {
    expect(domingoDePascua(2026)).toBe('2026-04-05');
    expect(domingoDePascua(2027)).toBe('2027-03-28');
  });

  it('lista completa de 2026 (18 festivos)', () => {
    expect([...festivosColombia(2026)].sort()).toEqual([
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
      '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
      '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
      '2026-11-16', '2026-12-08', '2026-12-25',
    ]);
  });

  it('no traslada un festivo que ya cae lunes', () => {
    expect(esFestivo('2026-06-29')).toBe(true);
    expect(esFestivo('2026-07-06')).toBe(false);
  });
});

describe('franjas del día', () => {
  it('todas disponibles en un día futuro sin reservas', () => {
    const f = franjasDelDia('2026-11-12', ctx());
    expect(f.map((x) => [x.hora, x.estado, x.disponibles])).toEqual([
      ['10:00', 'disponible', 4],
      ['14:00', 'disponible', 4],
      ['15:00', 'disponible', 4],
    ]);
  });

  it('respeta la anticipación mínima el mismo día', () => {
    // 09:00 → 10:00 está a 60 min (< 120): pasada. 14:00 sí se puede.
    const f = franjasDelDia('2026-11-10', ctx());
    expect(f.map((x) => x.estado)).toEqual(['pasada', 'disponible', 'disponible']);
  });

  it('resta los cupos ocupados y marca agotada', () => {
    const ocupacion = new Map([
      [claveFranja('2026-11-12', '10:00'), 4],
      [claveFranja('2026-11-12', '14:00'), 3],
    ]);
    const f = franjasDelDia('2026-11-12', ctx({ ocupacion }));
    expect(f[0]).toMatchObject({ estado: 'agotada', disponibles: 0 });
    expect(f[1]).toMatchObject({ estado: 'disponible', disponibles: 1 });
  });

  it('bloqueo de día completo y de una franja', () => {
    const bloqueos = [
      { fecha: '2026-11-12', horaInicio: null, motivo: 'Inventario' },
      { fecha: '2026-11-13', horaInicio: '15:00', motivo: 'Evento privado' },
    ];
    expect(franjasDelDia('2026-11-12', ctx({ bloqueos })).every((x) => x.estado === 'bloqueada')).toBe(true);
    const viernes = franjasDelDia('2026-11-13', ctx({ bloqueos }));
    expect(viernes.map((x) => x.estado)).toEqual(['disponible', 'disponible', 'bloqueada']);
    expect(viernes[2].motivo).toBe('Evento privado');
  });

  it('festivos cerrados solo si el ajuste lo indica', () => {
    expect(franjasDelDia('2026-11-16', ctx())[0].estado).toBe('disponible');
    const cerrado = ctx({ ajustes: { ...AJUSTES, cerrarFestivos: true } });
    expect(franjasDelDia('2026-11-16', cerrado)[0]).toMatchObject({ estado: 'bloqueada', motivo: 'Festivo' });
  });

  it('fuera del rango de días futuros', () => {
    expect(franjasDelDia(sumarDias('2026-11-10', 61), ctx())[0].estado).toBe('pasada');
  });
});

describe('calendario del mes', () => {
  it('marca días pasados, disponibles, cerrados y agotados', () => {
    const horarios = HORARIOS.filter((h) => h.diaSemana !== 0); // domingos sin atención
    const ocupacion = new Map(['10:00', '14:00', '15:00'].map((h) => [claveFranja('2026-11-20', h), 4] as const));
    const dias = calendarioMes('2026-11', ctx({ horarios, ocupacion }));
    const estado = (f: string) => dias.find((d) => d.fecha === f)?.estado;

    expect(dias).toHaveLength(30);
    expect(estado('2026-11-09')).toBe('fuera_de_rango'); // ayer
    expect(estado('2026-11-10')).toBe('disponible'); // hoy, quedan las 14:00 y 15:00
    expect(estado('2026-11-15')).toBe('cerrado'); // domingo
    expect(estado('2026-11-20')).toBe('agotado');
    expect(dias.find((d) => d.fecha === '2026-11-16')?.festivo).toBe(true);
  });

  it('hoy por la tarde, sin franjas restantes, cuenta como fuera de rango', () => {
    const dias = calendarioMes('2026-11', ctx({ ahora: { fecha: '2026-11-10', minutos: 14 * 60 } }));
    expect(dias.find((d) => d.fecha === '2026-11-10')?.estado).toBe('fuera_de_rango');
  });
});

describe('verificarFranja', () => {
  it('rechaza más personas que el máximo por reserva', () => {
    expect(verificarFranja('2026-11-12', '10:00', 5, ctx())).toMatchObject({ ok: false });
  });

  it('rechaza si no alcanzan los cupos y lo explica', () => {
    const ocupacion = new Map([[claveFranja('2026-11-12', '10:00'), 3]]);
    expect(verificarFranja('2026-11-12', '10:00', 2, ctx({ ocupacion }))).toEqual({
      ok: false,
      motivo: 'Solo queda 1 cupo en este horario.',
    });
  });

  it('rechaza un horario inexistente', () => {
    expect(verificarFranja('2026-11-12', '11:00', 1, ctx())).toMatchObject({ ok: false });
  });

  it('acepta una solicitud válida', () => {
    expect(verificarFranja('2026-11-12', '14:00', 4, ctx())).toMatchObject({ ok: true });
  });
});

describe('reglas de estado y cancelación', () => {
  it('transiciones', () => {
    expect(puedeTransicionar('pendiente', 'confirmada')).toBe(true);
    expect(puedeTransicionar('confirmada', 'no_show')).toBe(true);
    expect(puedeTransicionar('cancelada', 'confirmada')).toBe(false);
    expect(puedeTransicionar('pendiente', 'completada')).toBe(false);
  });

  it('el cliente cancela solo con suficiente antelación', () => {
    const ahora = { fecha: '2026-11-10', minutos: 9 * 60 };
    const r = { estado: 'confirmada' as const, fecha: '2026-11-11', horaInicio: '10:00' };
    expect(puedeCancelarCliente(r, ahora, 24)).toEqual({ ok: true }); // 25 h antes
    expect(puedeCancelarCliente({ ...r, horaInicio: '08:00' }, ahora, 24).ok).toBe(false); // 23 h
    expect(puedeCancelarCliente({ ...r, estado: 'cancelada' }, ahora, 24).ok).toBe(false);
  });

  it('genera códigos legibles sin caracteres ambiguos', () => {
    const codigo = generarCodigo();
    expect(codigo).toMatch(/^DEP-[A-HJKMNP-Z2-9]{5}$/);
  });
});

describe('validación de la solicitud', () => {
  const valida = {
    experienciaId: 'tasting',
    fecha: '2026-11-12',
    hora: '14:00',
    cupos: '2',
    idioma: 'Español',
    nombre: '  Ana Gómez ',
    email: 'Ana@Correo.com',
    telefono: '+57 300 123 4567',
    notas: '',
    aceptaDatos: true,
    idempotencyKey: '7f1c1c2e-3a3b-4f0a-9d1e-2b2f8e6a9c11',
    sitioWeb: '',
  };

  it('normaliza y acepta datos válidos', () => {
    const r = solicitudReservaSchema.parse(valida);
    expect(r).toMatchObject({ nombre: 'Ana Gómez', email: 'ana@correo.com', cupos: 2, notas: undefined });
  });

  it('rechaza teléfono, correo y falta de autorización', () => {
    const r = solicitudReservaSchema.safeParse({ ...valida, telefono: '12', email: 'x', aceptaDatos: false });
    expect(r.success).toBe(false);
    const campos = r.error!.issues.map((i) => i.path[0]);
    expect(campos).toEqual(expect.arrayContaining(['telefono', 'email', 'aceptaDatos']));
  });

  it('rechaza bots que llenan el campo trampa', () => {
    expect(solicitudReservaSchema.safeParse({ ...valida, sitioWeb: 'http://spam' }).success).toBe(false);
  });
});
