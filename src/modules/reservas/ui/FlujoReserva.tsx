'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Clock3, Coffee, MessageCircle } from 'lucide-react';
import { Button, TextAreaField, TextField, cn } from '@/shared/ui';
import { enlaceWhatsApp } from '@/shared/config/negocio';
import { obtenerCalendario, obtenerFranjas, reservar, type EstadoReservar } from '../actions/publicas';
import { sumarDias, type Fecha, type Hora } from '../domain/tiempo';
import type { DiaCalendario, Experiencia, Franja } from '../domain/tipos';
import { Calendario } from './Calendario';
import { Confirmacion } from './Confirmacion';
import { Contador } from './Contador';
import { formatoDuracion, formatoFechaCorta, formatoHora, formatoPrecio } from './formato';
import { ResumenReserva } from './ResumenReserva';

type Props = {
  experiencias: Experiencia[];
  experienciaInicial?: string;
  hoy: Fecha;
  diasMaxFuturo: number;
  cuposMaxPorReserva: number;
  calendarioInicial: DiaCalendario[];
  zona: string;
};

type Paso = 1 | 2 | 3;

const PASOS: { n: Paso; titulo: string }[] = [
  { n: 1, titulo: 'Experiencia' },
  { n: 2, titulo: 'Fecha y hora' },
  { n: 3, titulo: 'Tus datos' },
];

function moverMes(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

const ESTADO_INICIAL: EstadoReservar = { estado: 'inicial' };

export function FlujoReserva({
  experiencias,
  experienciaInicial,
  hoy,
  diasMaxFuturo,
  cuposMaxPorReserva,
  calendarioInicial,
  zona,
}: Props) {
  const inicial = experiencias.find((e) => e.id === experienciaInicial) ?? null;

  // ── Selección ───────────────────────────────────────────────────
  const [paso, setPaso] = useState<Paso>(inicial ? 2 : 1);
  const [experienciaId, setExperienciaId] = useState<string | null>(inicial?.id ?? null);
  const [personas, setPersonas] = useState(Math.min(2, cuposMaxPorReserva));
  const [fecha, setFecha] = useState<Fecha | null>(null);
  const [hora, setHora] = useState<Hora | null>(null);
  const experiencia = experiencias.find((e) => e.id === experienciaId) ?? null;
  const [idioma, setIdioma] = useState<string | null>(null);
  const idiomaElegido = idioma ?? experiencia?.idiomas[0] ?? null;

  // ── Calendario y franjas (datos del servidor) ───────────────────
  const mesMin = hoy.slice(0, 7);
  const mesMax = sumarDias(hoy, diasMaxFuturo).slice(0, 7);
  const [mes, setMes] = useState(mesMin);
  const [dias, setDias] = useState(calendarioInicial);
  const [franjas, setFranjas] = useState<Franja[]>([]);
  const [cargandoMes, iniciarCargaMes] = useTransition();
  const [cargandoFranjas, iniciarCargaFranjas] = useTransition();
  const ultimaFranja = useRef(0);

  const cargarMes = (nuevo: string) => {
    setMes(nuevo);
    iniciarCargaMes(async () => setDias(await obtenerCalendario(nuevo)));
  };

  const cargarFranjas = (f: Fecha) => {
    const id = ++ultimaFranja.current;
    iniciarCargaFranjas(async () => {
      const resultado = await obtenerFranjas(f);
      if (id === ultimaFranja.current) setFranjas(resultado);
    });
  };

  const elegirFecha = (f: Fecha) => {
    setFecha(f);
    setHora(null);
    setFranjas([]);
    cargarFranjas(f);
  };

  const cambiarPersonas = (n: number) => {
    setPersonas(n);
    const franja = franjas.find((x) => x.hora === hora);
    if (franja && franja.disponibles < n) setHora(null);
  };

  // ── Datos de contacto (controlados: React reinicia los no controlados al enviar) ──
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', notas: '', aceptaDatos: false });
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [estadoEnvio, enviar, enviando] = useActionState(reservar, ESTADO_INICIAL);
  const errores = estadoEnvio.estado === 'error' ? estadoEnvio.errores : {};

  // ── Navegación entre pasos ──────────────────────────────────────
  const contenedor = useRef<HTMLDivElement>(null);
  const tituloPaso = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contenedor.current?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    tituloPaso.current?.focus({ preventScroll: true });
  }, [paso, estadoEnvio.estado]);

  const puedeAvanzar = paso === 1 ? Boolean(experiencia) : paso === 2 ? Boolean(fecha && hora) : false;
  const avanzar = () => puedeAvanzar && setPaso((p) => Math.min(3, p + 1) as Paso);
  const retroceder = () => setPaso((p) => Math.max(1, p - 1) as Paso);

  const volverAHorarios = () => {
    setPaso(2);
    if (fecha) cargarFranjas(fecha);
    cargarMes(mes);
  };

  // ── Éxito ───────────────────────────────────────────────────────
  if (estadoEnvio.estado === 'exito' && experiencia && fecha && hora) {
    return (
      <div ref={contenedor} className="scroll-mt-24">
        <Confirmacion
          codigo={estadoEnvio.codigo}
          token={estadoEnvio.token}
          experiencia={experiencia}
          fecha={fecha}
          hora={hora}
          personas={personas}
          zona={zona}
        />
      </div>
    );
  }

  return (
    <div ref={contenedor} className="scroll-mt-24 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 xl:gap-14 pb-28 lg:pb-0">
      <div className="min-w-0">
        <IndicadorPasos actual={paso} onIr={(n) => n < paso && setPaso(n)} />

        {/* ── Paso 1: experiencia ── */}
        {paso === 1 && (
          <section key="p1" className="animate-entrar" aria-labelledby="titulo-paso">
            <TituloPaso ref={tituloPaso} subtitulo="Dos formas de recorrer el café colombiano, de la finca a la taza.">
              Elige tu experiencia
            </TituloPaso>
            <div className="grid sm:grid-cols-2 gap-5">
              {experiencias.map((e) => (
                <TarjetaExperiencia
                  key={e.id}
                  experiencia={e}
                  seleccionada={e.id === experienciaId}
                  onElegir={() => {
                    setExperienciaId(e.id);
                    setIdioma(null);
                    setPaso(2);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Paso 2: personas, fecha y hora ── */}
        {paso === 2 && (
          <section key="p2" className="animate-entrar" aria-labelledby="titulo-paso">
            <TituloPaso ref={tituloPaso} subtitulo="Los días marcados tienen cupos libres.">
              ¿Cuándo nos visitas?
            </TituloPaso>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container/60 px-5 py-4 mb-6">
              <div>
                <p className="font-medium text-on-surface">¿Cuántas personas?</p>
                <p className="text-xs text-on-surface-muted mt-0.5">
                  Hasta {cuposMaxPorReserva} por reserva.{' '}
                  <a
                    href={enlaceWhatsApp('Hola, quisiera reservar un Coffee Tasting para un grupo grande.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline-offset-2 hover:underline"
                  >
                    ¿Grupo más grande?
                  </a>
                </p>
              </div>
              <Contador valor={personas} min={1} max={cuposMaxPorReserva} onCambiar={cambiarPersonas} etiqueta="Número de personas" />
            </div>

            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-6">
              <div className="rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-5 sm:p-6">
                <Calendario
                  mes={mes}
                  dias={dias}
                  seleccionada={fecha}
                  cargando={cargandoMes}
                  puedeRetroceder={mes > mesMin}
                  puedeAvanzar={mes < mesMax}
                  onCambiarMes={(d) => cargarMes(moverMes(mes, d))}
                  onSeleccionar={elegirFecha}
                />
              </div>

              <ListaFranjas
                fecha={fecha}
                franjas={franjas}
                cargando={cargandoFranjas}
                personas={personas}
                seleccionada={hora}
                onElegir={setHora}
              />
            </div>
          </section>
        )}

        {/* ── Paso 3: datos y confirmación ── */}
        {paso === 3 && experiencia && fecha && hora && (
          <section key="p3" className="animate-entrar" aria-labelledby="titulo-paso">
            <TituloPaso ref={tituloPaso} subtitulo="Solo lo necesario para confirmar tu lugar.">
              Tus datos
            </TituloPaso>

            {errores.general && (
              <div role="alert" className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft px-5 py-4">
                <p className="text-sm text-on-surface">{errores.general}</p>
                <button
                  type="button"
                  onClick={volverAHorarios}
                  className="mt-2 text-sm font-medium text-danger hover:underline underline-offset-2 cursor-pointer"
                >
                  Elegir otro horario
                </button>
              </div>
            )}

            <form action={enviar} className="space-y-6" noValidate>
              <input type="hidden" name="experienciaId" value={experiencia.id} />
              <input type="hidden" name="fecha" value={fecha} />
              <input type="hidden" name="hora" value={hora} />
              <input type="hidden" name="cupos" value={personas} />
              <input type="hidden" name="idioma" value={idiomaElegido ?? ''} />
              <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
              {/* Trampa anti-bots: invisible para personas y lectores de pantalla. */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label>
                  Sitio web
                  <input type="text" name="sitioWeb" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-on-surface-soft mb-2">Idioma de la experiencia</legend>
                <div className="flex flex-wrap gap-2">
                  {experiencia.idiomas.map((i) => (
                    <label key={i} className="cursor-pointer">
                      <input
                        type="radio"
                        name="idiomaVisual"
                        value={i}
                        checked={idiomaElegido === i}
                        onChange={() => setIdioma(i)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-10 items-center rounded-full border border-outline-soft px-4 text-sm text-on-surface-soft transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-on-surface peer-focus-visible:outline-2 peer-focus-visible:outline-focus hover:border-outline">
                        {i}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid sm:grid-cols-2 gap-5">
                <TextField
                  label="Nombre completo"
                  name="nombre"
                  autoComplete="name"
                  required
                  value={datos.nombre}
                  onChange={(e) => setDatos((d) => ({ ...d, nombre: e.target.value }))}
                  error={errores.nombre}
                />
                <TextField
                  label="Teléfono / WhatsApp"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+57 300 000 0000"
                  required
                  value={datos.telefono}
                  onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value }))}
                  error={errores.telefono}
                />
              </div>
              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={datos.email}
                onChange={(e) => setDatos((d) => ({ ...d, email: e.target.value }))}
                error={errores.email}
                hint="Te enviaremos aquí los detalles de tu reserva."
              />
              <TextAreaField
                label="Notas (opcional)"
                name="notas"
                placeholder="Alergias, celebraciones, preguntas…"
                value={datos.notas}
                onChange={(e) => setDatos((d) => ({ ...d, notas: e.target.value }))}
                error={errores.notas}
              />

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="aceptaDatos"
                  checked={datos.aceptaDatos}
                  onChange={(e) => setDatos((d) => ({ ...d, aceptaDatos: e.target.checked }))}
                  className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-primary)] cursor-pointer"
                  aria-describedby={errores.aceptaDatos ? 'error-datos' : undefined}
                />
                <span className="text-sm text-on-surface-soft leading-relaxed">
                  Autorizo a El Depósito a usar mis datos para gestionar esta reserva y contactarme sobre ella
                  (Ley 1581 de 2012).
                  {errores.aceptaDatos && (
                    <span id="error-datos" role="alert" className="block text-xs text-danger mt-1">
                      {errores.aceptaDatos}
                    </span>
                  )}
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <Button variant="ghost" onClick={retroceder} disabled={enviando}>
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </Button>
                <Button type="submit" size="lg" loading={enviando} className="sm:min-w-64">
                  {enviando ? 'Confirmando…' : `Confirmar reserva · ${formatoPrecio(experiencia.precio * personas)}`}
                </Button>
              </div>
            </form>
          </section>
        )}

        {/* Navegación (pasos 1–2, escritorio) */}
        {paso < 3 && (
          <div className="hidden lg:flex items-center justify-between mt-8">
            {paso > 1 ? (
              <Button variant="ghost" onClick={retroceder}>
                <ArrowLeft className="w-4 h-4" /> Atrás
              </Button>
            ) : (
              <span />
            )}
            <Button size="lg" onClick={avanzar} disabled={!puedeAvanzar}>
              Continuar <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Resumen fijo (escritorio) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ResumenReserva experiencia={experiencia} fecha={fecha} hora={hora} personas={personas} idioma={paso === 3 ? idiomaElegido : null} />
        </div>
      </aside>

      {/* Barra inferior (móvil) */}
      {paso < 3 && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-outline-soft bg-surface-low/95 backdrop-blur-md px-5 pt-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <div className="min-w-0">
              {experiencia ? (
                <>
                  <p className="font-serif text-lg text-accent-hover tabular-nums leading-tight">
                    {formatoPrecio(experiencia.precio * personas)}
                  </p>
                  <p className="text-xs text-on-surface-muted truncate">
                    {fecha ? `${formatoFechaCorta(fecha)}${hora ? ` · ${formatoHora(hora)}` : ''}` : experiencia.nombre}
                  </p>
                </>
              ) : (
                <p className="text-sm text-on-surface-muted truncate">Elige una experiencia</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {paso > 1 && (
                <Button variant="ghost" size="md" onClick={retroceder} aria-label="Atrás" className="px-3">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={avanzar} disabled={!puedeAvanzar}>
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────

function IndicadorPasos({ actual, onIr }: { actual: Paso; onIr: (n: Paso) => void }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3 mb-8" aria-label="Progreso de la reserva">
      {PASOS.map(({ n, titulo }, i) => {
        const hecho = n < actual;
        const activo = n === actual;
        return (
          <li key={n} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onIr(n)}
              disabled={!hecho}
              aria-current={activo ? 'step' : undefined}
              className={cn('flex items-center gap-2 min-w-0', hecho && 'cursor-pointer group')}
            >
              <span
                className={cn(
                  'w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold transition-colors duration-300',
                  activo && 'bg-primary text-on-primary',
                  hecho && 'bg-primary-soft text-primary group-hover:bg-primary group-hover:text-on-primary',
                  !activo && !hecho && 'border border-outline-soft text-on-surface-muted',
                )}
              >
                {hecho ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : n}
              </span>
              <span
                className={cn(
                  'text-sm truncate',
                  activo ? 'text-on-surface font-medium' : 'text-on-surface-muted hidden sm:inline',
                )}
              >
                {titulo}
              </span>
            </button>
            {i < PASOS.length - 1 && (
              <span aria-hidden="true" className={cn('h-px w-6 sm:w-10 transition-colors duration-500', hecho ? 'bg-primary/60' : 'bg-outline-soft')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TituloPaso({
  children,
  subtitulo,
  ref,
}: {
  children: React.ReactNode;
  subtitulo: string;
  ref: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <header className="mb-6">
      <h2 id="titulo-paso" ref={ref} tabIndex={-1} className="font-serif text-3xl sm:text-[2.5rem] leading-tight text-on-surface focus:outline-none">
        {children}
      </h2>
      <p className="text-on-surface-muted mt-2">{subtitulo}</p>
    </header>
  );
}

function TarjetaExperiencia({
  experiencia: e,
  seleccionada,
  onElegir,
}: {
  experiencia: Experiencia;
  seleccionada: boolean;
  onElegir: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={seleccionada}
      className={cn(
        'group relative text-left rounded-[var(--radius-xl)] overflow-hidden border bg-surface-container cursor-pointer',
        'transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1',
        seleccionada ? 'border-primary/70 shadow-[var(--shadow-glow)]' : 'border-outline-soft hover:border-outline shadow-[var(--shadow-card)]',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-high">
        {e.imagen && (
          <Image
            src={e.imagen}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface-lowest/75 backdrop-blur-sm px-3 py-1 text-xs text-on-surface">
          <Clock3 className="w-3.5 h-3.5" /> {formatoDuracion(e.duracionMin)}
        </span>
        {seleccionada && (
          <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary text-on-primary grid place-items-center animate-aparecer">
            <Check className="w-4 h-4" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="p-5 pt-2">
        <h3 className="font-serif text-xl leading-snug text-on-surface">{e.nombre}</h3>
        <p className="text-sm text-on-surface-soft mt-2 leading-relaxed line-clamp-3">{e.descripcion}</p>
        <p className="flex items-center gap-2 text-sm text-on-surface-muted mt-3">
          <Coffee className="w-4 h-4 text-accent-hover shrink-0" /> {e.cafes.split('(')[0].trim()}
        </p>
        <div className="mt-5 flex items-end justify-between">
          <p>
            <span className="font-serif text-2xl text-accent-hover tabular-nums">{formatoPrecio(e.precio)}</span>
            <span className="text-xs text-on-surface-muted"> / persona</span>
          </p>
          <span className="text-sm font-medium text-primary inline-flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1">
            Elegir <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

function ListaFranjas({
  fecha,
  franjas,
  cargando,
  personas,
  seleccionada,
  onElegir,
}: {
  fecha: Fecha | null;
  franjas: Franja[];
  cargando: boolean;
  personas: number;
  seleccionada: Hora | null;
  onElegir: (h: Hora) => void;
}) {
  if (!fecha) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-outline-soft grid place-items-center p-8 text-center min-h-48">
        <p className="text-on-surface-muted text-sm max-w-52">Elige un día en el calendario para ver los horarios.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-5 sm:p-6">
      <h3 className="font-serif text-xl text-on-surface">{formatoFechaCorta(fecha)}</h3>
      <p className="text-xs text-on-surface-muted mt-1 mb-4">Horarios disponibles</p>

      {cargando ? (
        <div className="space-y-2.5" aria-busy="true" aria-label="Cargando horarios">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-[var(--radius-md)] bg-surface-high animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      ) : franjas.length === 0 ? (
        <p className="text-sm text-on-surface-muted">No hay horarios este día.</p>
      ) : (
        <div className="space-y-2.5" role="radiogroup" aria-label="Horario">
          {franjas.map((f) => {
            const alcanza = f.estado === 'disponible' && f.disponibles >= personas;
            const activa = f.hora === seleccionada;
            const detalle =
              f.estado !== 'disponible'
                ? f.estado === 'agotada'
                  ? 'Agotado'
                  : 'No disponible'
                : f.disponibles < personas
                  ? `Solo ${f.disponibles === 1 ? 'queda 1 cupo' : `quedan ${f.disponibles} cupos`}`
                  : f.disponibles <= 2
                    ? `¡Últimos ${f.disponibles === 1 ? 'cupo' : `${f.disponibles} cupos`}!`
                    : `${f.disponibles} cupos libres`;
            return (
              <button
                key={f.hora}
                type="button"
                role="radio"
                aria-checked={activa}
                disabled={!alcanza}
                onClick={() => onElegir(f.hora)}
                className={cn(
                  'w-full flex items-center justify-between rounded-[var(--radius-md)] border px-4 h-16 cursor-pointer',
                  'transition-[border-color,background-color,box-shadow] duration-200',
                  activa && 'border-primary bg-primary-soft shadow-[var(--shadow-glow)]',
                  !activa && alcanza && 'border-outline-soft hover:border-primary/60 hover:bg-surface-high',
                  !alcanza && 'border-outline-soft/50 opacity-45 cursor-not-allowed',
                )}
              >
                <span className="font-serif text-lg text-on-surface tabular-nums">{formatoHora(f.hora)}</span>
                <span
                  className={cn(
                    'text-xs',
                    activa ? 'text-primary' : alcanza && f.disponibles <= 2 ? 'text-accent-hover' : 'text-on-surface-muted',
                  )}
                >
                  {detalle}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <a
        href={enlaceWhatsApp(`Hola, quisiera consultar disponibilidad para el ${fecha}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-xs text-on-surface-muted hover:text-on-surface transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" /> ¿Necesitas otro horario? Escríbenos
      </a>
    </div>
  );
}
