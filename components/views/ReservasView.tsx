'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Check, ChevronRight, ChevronLeft, Loader2, Clock, User, Mail, Phone, CalendarDays, Coffee, Users, MapPin, Globe, Clock3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/toastStore';
import type { ReservationPackageId, TimeSlot, ReservationFormData, AvailabilityInfo } from '@/types';

/* ─────────────────────────────────────────
   Constantes
────────────────────────────────────────── */
const CUPO_MAXIMO_POR_HORARIO = 4;

const PAQUETES = [
  {
    id: 'testing_1' as ReservationPackageId,
    nombre: 'Coffee Tasting El Depósito',
    precio: 45000,
    duracion: 30,
    tematica: 'Generalidades del café, Características de la caficultura colombiana, Explicación de preparación cafés filtrados.',
    cafes: '3 cafés (Tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    idiomas: 'Español - Inglés - Portugués',
    ubicacion: 'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    descripcion: 'Experiencia esencial de café de especialidad.',
  },
  {
    id: 'testing_2' as ReservationPackageId,
    nombre: 'Coffee Tasting El Depósito Completo',
    precio: 120000,
    duracion: 60,
    tematica: 'Generalidades del café, Caficultura colombiana, Explicación preparaciones café filtrado, Origen del café, Panorama de mercado, Profundización en procesos de producción.',
    cafes: '5 cafés (tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    idiomas: 'Español - Inglés - Portugués',
    ubicacion: 'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    descripcion: 'Experiencia completa y profunda de café de especialidad.',
  },
] as const;

const TIME_SLOTS: { id: TimeSlot; label: string }[] = [
  { id: '10-11', label: '10:00 — 11:00 h' },
  { id: '14-15', label: '14:00 — 15:00 h' },
  { id: '15-16', label: '15:00 — 16:00 h' },
];

const STEPS = [
  { num: 1, label: 'Paquete' },
  { num: 2, label: 'Datos' },
  { num: 3, label: 'Confirmar' },
];

/* ─────────────────────────────────────────
   Helpers
────────────────────────────────────────── */
/** Retorna la fecha minima permitida segun la hora actual */
function getMinDate(): string {
  const now = new Date();
  // Si son las 12:00 o mas, el minimo es manana
  if (now.getHours() >= 12) {
    now.setDate(now.getDate() + 1);
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Retorna true si la fecha dada es hoy */
function esHoy(fecha: string): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return fecha === `${y}-${m}-${d}`;
}

/** Retorna true si son antes de las 12:00 */
function esAntesDeMedioDia(): boolean {
  return new Date().getHours() < 12;
}

function formatCurrency(n: number): string {
  return '$ ' + n.toLocaleString('es-CO');
}

async function checkAvailability(fecha: string): Promise<AvailabilityInfo[]> {
  const isToday = esHoy(fecha);
  const beforeNoon = esAntesDeMedioDia();

  // ── Single query en vez de 3 ──
  const { data, error } = await supabase
    .from('reservations')
    .select('horario, cupos')
    .eq('fecha', fecha)
    .in('horario', TIME_SLOTS.map(s => s.id))
    .in('estado', ['pendiente', 'confirmada']);

  // Agrupar cupos ocupados por horario
  const ocupadosPorHorario: Record<string, number> = {};
  if (!error && data) {
    data.forEach(row => {
      ocupadosPorHorario[row.horario] = (ocupadosPorHorario[row.horario] ?? 0) + (row.cupos ?? 1);
    });
  }

  return TIME_SLOTS.map(({ id: horario, label }) => {
    // ── Logica same-day ──
    if (isToday && !beforeNoon) {
      return { horario, label, ocupados: CUPO_MAXIMO_POR_HORARIO, disponibles: 0, maximo: CUPO_MAXIMO_POR_HORARIO, motivo: 'Ya no hay horarios disponibles para hoy' };
    }
    if (isToday && beforeNoon && horario === '10-11') {
      return { horario, label, ocupados: CUPO_MAXIMO_POR_HORARIO, disponibles: 0, maximo: CUPO_MAXIMO_POR_HORARIO, motivo: 'Horario de la mañana ya pasado' };
    }

    if (error) {
      console.error('Error checking availability:', error);
      return { horario, label, ocupados: 0, disponibles: 0, maximo: CUPO_MAXIMO_POR_HORARIO };
    }

    const ocupados = ocupadosPorHorario[horario] ?? 0;
    return { horario, label, ocupados, disponibles: Math.max(0, CUPO_MAXIMO_POR_HORARIO - ocupados), maximo: CUPO_MAXIMO_POR_HORARIO };
  });
}

/* ─────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function ReservasView() {
  const addToast = useToastStore(s => s.addToast);

  /* ── Wizard state ── */
  const [step, setStep] = useState(1);
  const [paquete, setPaquete] = useState<ReservationPackageId | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    horario: '' as TimeSlot,
    paquete: '' as ReservationPackageId,
    cupos: 1,
  });
  const [availability, setAvailability] = useState<AvailabilityInfo[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── Manejo de pasos ── */
  const canGoNext = useCallback(() => {
    if (step === 1) return paquete !== null;
    if (step === 2) {
      return (
        formData.nombre.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        formData.telefono.trim().length >= 7 &&
        formData.fecha !== '' &&
        !!formData.horario &&
        formData.cupos >= 1 &&
        formData.cupos <= 4
      );
    }
    return false;
  }, [step, paquete, formData]);

  /* ── Selección de paquete ── */
  const handleSelectPackage = (id: ReservationPackageId) => {
    setPaquete(id);
    setFormData(prev => ({ ...prev, paquete: id }));
  };

  /* ── Ir al paso siguiente ── */
  const goNext = async () => {
    if (!canGoNext()) return;
    if (step === 2) {
      // Verificar disponibilidad antes de ir a confirmación
      setCheckingAvailability(true);
      const result = await checkAvailability(formData.fecha);
      setAvailability(result);
      setCheckingAvailability(false);

      // Validar que haya cupos disponibles para el horario seleccionado
      const slotInfo = result.find(a => a.horario === formData.horario);
      if (!slotInfo || slotInfo.disponibles <= 0) {
        addToast('El horario seleccionado ya no tiene cupos disponibles.', 'error');
        return;
      }
      if (formData.cupos > slotInfo.disponibles) {
        addToast(`Solo hay ${slotInfo.disponibles} cupo${slotInfo.disponibles !== 1 ? 's' : ''} disponible${slotInfo.disponibles !== 1 ? 's' : ''} en este horario.`, 'error');
        setFormData(p => ({ ...p, cupos: slotInfo.disponibles }));
        return;
      }
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  /* ── Consultar disponibilidad ── */
  const checkAndSetAvailability = useCallback(async (fecha: string) => {
    if (!fecha) return;
    setCheckingAvailability(true);
    const result = await checkAvailability(fecha);
    setAvailability(result);
    setCheckingAvailability(false);
  }, []);

  useEffect(() => {
    if (formData.fecha) {
      checkAndSetAvailability(formData.fecha);
    }
  }, [formData.fecha, checkAndSetAvailability]);

  /* ── Ajustar cupos si cambia la disponibilidad o el horario ── */
  useEffect(() => {
    if (!formData.horario) return;
    const slotInfo = availability.find(a => a.horario === formData.horario);
    if (slotInfo && formData.cupos > slotInfo.disponibles) {
      setFormData(p => ({ ...p, cupos: Math.max(1, slotInfo.disponibles) }));
    }
  }, [availability, formData.horario]);

  /* ── Enviar reserva ── */
  const handleSubmit = async () => {
    if (!paquete || !formData.fecha || !formData.horario) return;

    setSubmitting(true);

    try {
      // Re-verificar disponibilidad (race condition)
      const currentAvailability = await checkAvailability(formData.fecha);
      const slot = currentAvailability.find(a => a.horario === formData.horario);
      if (!slot || slot.disponibles <= 0) {
        addToast('El horario seleccionado ya no tiene cupos disponibles. Elige otro.', 'error');
        setSubmitting(false);
        setStep(2);
        return;
      }

      // Verificar que los cupos seleccionados aún están disponibles
      if (formData.cupos > (slot?.disponibles ?? 0)) {
        addToast(`Solo hay ${slot?.disponibles ?? 0} cupos disponibles para este horario.`, 'error');
        setSubmitting(false);
        setStep(2);
        return;
      }

      // Insertar en Supabase
      const { error } = await supabase.from('reservations').insert({
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        fecha: formData.fecha,
        horario: formData.horario,
        paquete: paquete,
        cupos: formData.cupos,
        estado: 'pendiente',
      });

      if (error) {
        console.error('Error al crear reserva:', error);
        addToast('Error al crear la reserva. Intenta de nuevo.', 'error');
        return;
      }

      addToast('Reserva confirmada con éxito. ¡Te esperamos!', 'success');
      setSubmitted(true);

      // Reset después de 3 segundos
      setTimeout(() => {
        setStep(1);
        setPaquete(null);
        setFormData({ nombre: '', email: '', telefono: '', fecha: '', horario: '' as TimeSlot, paquete: '' as ReservationPackageId, cupos: 1 });
        setAvailability([]);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Error inesperado al crear reserva:', err);
      addToast('Ocurrió un error inesperado. Intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI helpers ── */
  const paqueteSeleccionado = PAQUETES.find(p => p.id === paquete);
  const slotLabel = TIME_SLOTS.find(s => s.id === formData.horario)?.label ?? '';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <div
        className="shrink-0 px-5 md:px-8 pt-6 pb-4 border-b border-outline-soft/15"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-brand-accent/70 font-sans mb-1">
              El Depósito
            </p>
            <h1 className="font-serif text-2xl md:text-3xl text-on-surface font-medium tracking-tight">
              Coffee Testing
            </h1>
          </div>
          <CalendarClock className="w-5 h-5 text-brand-accent/50" />
        </div>

        {/* ── Step indicator ── */}
        {!submitted && (
          <div className="flex items-center gap-0.5">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-sans font-semibold transition-all duration-300
                      ${step === s.num
                        ? 'bg-brand-accent text-brand-black'
                        : step > s.num
                          ? 'bg-brand-accent/30 text-brand-accent'
                          : 'bg-surface-highest/50 text-on-surface-soft/40'
                      }`}
                  >
                    {step > s.num ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-sans hidden sm:block
                    ${step === s.num ? 'text-brand-accent' : step > s.num ? 'text-brand-accent/60' : 'text-on-surface-soft/40'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-colors duration-300
                    ${step > s.num ? 'bg-brand-accent/40' : 'bg-outline-soft/20'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          CONTENIDO
      ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto scroll-touch">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-8 relative">

          {/* ── Mensaje de éxito ── */}
          <AnimatePresence mode="wait">
            {submitted && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-brand-accent" />
                </div>
                <h2 className="font-serif text-2xl text-on-surface mb-2">
                  Reserva Confirmada
                </h2>
                <p className="text-on-surface-soft/60 font-sans text-sm max-w-xs">
                  Recibimos tu solicitud. Te esperamos para vivir esta experiencia.
                </p>
              </motion.div>
            )}

            {/* ── Step 1: Seleccionar paquete ── */}
            {step === 1 && !submitted && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-6 text-center">
                  Elige tu experiencia
                </p>

                <div className="grid gap-5">
                  {PAQUETES.map((pkg) => {
                    const isSelected = paquete === pkg.id;
                    return (
                      <motion.button
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative w-full text-left p-6 rounded-2xl cursor-pointer transition-all duration-300
                          border ${isSelected
                            ? 'border-brand-accent/50 bg-brand-accent/8 shadow-[0_0_30px_rgba(47,163,107,0.15)]'
                            : 'border-outline-soft/20 bg-surface-low/50 hover:border-outline-soft/40'
                          }`}
                      >
                        {/* Selected check */}
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                          ${isSelected ? 'bg-brand-accent scale-100' : 'bg-surface-highest/50 scale-75 opacity-0'}`}
                        >
                          <Check className="w-3.5 h-3.5 text-brand-black" />
                        </div>

                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                            ${isSelected ? 'bg-brand-accent/20' : 'bg-surface-highest/60'}`}
                          >
                            <Coffee className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-on-surface-soft/50'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-serif text-xl mb-1 ${isSelected ? 'text-brand-accent' : 'text-on-surface'}`}>
                              {pkg.nombre}
                            </h3>
                            <p className="text-on-surface-soft/50 text-sm font-sans mb-3">
                              {pkg.descripcion}
                            </p>

                            {/* Detalles del paquete */}
                            <div className="space-y-1.5 mb-3">
                              <div className="flex items-center gap-2 text-[11px] text-on-surface-soft/60 font-sans">
                                <Clock3 className="w-3.5 h-3.5 shrink-0" />
                                <span>{pkg.duracion} minutos</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-on-surface-soft/60 font-sans">
                                <Coffee className="w-3.5 h-3.5 shrink-0" />
                                <span>{pkg.cafes}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-on-surface-soft/60 font-sans">
                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                <span>{pkg.idiomas}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-on-surface-soft/60 font-sans">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{pkg.ubicacion}</span>
                              </div>
                            </div>

                            <p className="font-sans font-bold text-lg text-brand-accent">
                              {formatCurrency(pkg.precio)}
                              <span className="text-xs font-normal text-on-surface-soft/40 ml-1">/ persona</span>
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-sans font-semibold
                      bg-brand-accent text-brand-black disabled:opacity-30 disabled:cursor-not-allowed
                      hover:bg-verde transition-all duration-300 cursor-pointer active:scale-[0.97]"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Formulario ── */}
            {step === 2 && !submitted && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-6 text-center">
                  Tus datos
                </p>

                <div className="space-y-5">
                  {/* Nombre */}
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/60 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      placeholder="Nombre completo *"
                      value={formData.nombre}
                      onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                      className="w-full bg-surface-low/80 pl-10 pr-4 py-3 rounded-lg text-sm text-on-surface
                        ghost-border focus:outline-none focus:border-brand-accent/40
                        transition-colors placeholder:text-outline/40"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/60 pointer-events-none" />
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Correo electrónico *"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-surface-low/80 pl-10 pr-4 py-3 rounded-lg text-sm text-on-surface
                        ghost-border focus:outline-none focus:border-brand-accent/40
                        transition-colors placeholder:text-outline/40"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/60 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Teléfono *"
                      value={formData.telefono}
                      onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))}
                      className="w-full bg-surface-low/80 pl-10 pr-4 py-3 rounded-lg text-sm text-on-surface
                        ghost-border focus:outline-none focus:border-brand-accent/40
                        transition-colors placeholder:text-outline/40"
                    />
                  </div>

                  {/* Fecha */}
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/60 pointer-events-none" />
                    <input
                      type="date"
                      min={getMinDate()}
                      value={formData.fecha}
                      onChange={e => {
                        setFormData(p => ({ ...p, fecha: e.target.value, horario: '' as TimeSlot }));
                        setAvailability([]);
                      }}
                      className="w-full bg-surface-low/80 pl-10 pr-4 py-3 rounded-lg text-sm text-on-surface
                        ghost-border focus:outline-none focus:border-brand-accent/40
                        transition-colors [color-scheme:dark]"
                    />
                  </div>

                  {/* Horarios con disponibilidad */}
                  {formData.fecha && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-3">
                        Horario disponible
                        {checkingAvailability && (
                          <span className="inline-flex items-center gap-1 ml-2 text-brand-accent/60 normal-case tracking-normal">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Verificando...
                          </span>
                        )}
                      </p>

                      {/* ── Banner informativo same-day ── */}
                      {!checkingAvailability && availability.length > 0 && esHoy(formData.fecha) && (() => {
                        const todosConMotivo = availability.every(a => a.motivo);
                        if (todosConMotivo) {
                          return (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-900/20 ring-1 ring-amber-700/30 text-amber-300/90 text-sm font-sans flex items-start gap-2.5">
                              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-400/70" />
                              <span>Ya no hay horarios disponibles para hoy. Elige una fecha a partir de mañana.</span>
                            </div>
                          );
                        }
                        const soloMananaBloqueado = availability.find(a => a.horario === '10-11')?.motivo;
                        if (soloMananaBloqueado) {
                          return (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-brand-accent/10 ring-1 ring-brand-accent/20 text-brand-accent/90 text-sm font-sans flex items-start gap-2.5">
                              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent/70" />
                              <span>Hoy solo hay disponibles horarios de tarde (2:00 PM - 4:00 PM).</span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="grid gap-2.5">
                        {TIME_SLOTS.map(slot => {
                          const info = availability.find(a => a.horario === slot.id);
                          const isSelected = formData.horario === slot.id;
                          const isFull = info && info.disponibles <= 0;
                          const isLoading = checkingAvailability;

                          return (
                            <button
                              key={slot.id}
                              onClick={() => !isFull && !isLoading && setFormData(p => ({ ...p, horario: slot.id }))}
                              disabled={isFull || isLoading}
                              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans
                                transition-all duration-200 cursor-pointer
                                ${isSelected
                                  ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/40'
                                  : isFull
                                    ? 'bg-surface-low/30 text-on-surface-soft/30 ring-1 ring-outline-soft/10 cursor-not-allowed'
                                    : 'bg-surface-low/80 text-on-surface-soft/70 ring-1 ring-outline-soft/20 hover:ring-brand-accent/30 hover:text-on-surface'
                                }`}
                            >
                              <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-accent' : ''}`} />
                              <span className="flex-1 text-left">{slot.label}</span>
                              {isFull ? (
                                <span className={`text-[10px] uppercase tracking-wider font-semibold
                                  ${info?.motivo ? 'text-amber-400/60' : 'text-red-400/60'}`}
                                >
                                  {info?.motivo || 'Completo'}
                                </span>
                              ) : info ? (
                                <span className={`text-[10px] font-sans tabular-nums
                                  ${info.disponibles <= 1 ? 'text-amber-400/60' : 'text-brand-accent/60'}`}
                                >
                                  {info.disponibles}/{info.maximo} cupos
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Cupos ── */}
                  {formData.horario && (() => {
                    const slotInfo = availability.find(a => a.horario === formData.horario);
                    const disponibles = slotInfo?.disponibles ?? 0;
                    const cuposMax = Math.min(4, disponibles);

                    return (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-3">
                          Número de personas
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, cupos: Math.max(1, p.cupos - 1) }))}
                            disabled={formData.cupos <= 1}
                            className="w-11 h-11 rounded-xl flex items-center justify-center
                              bg-surface-low/80 ring-1 ring-outline-soft/20 text-on-surface
                              hover:ring-brand-accent/30 transition-all
                              disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Reducir personas"
                          >
                            <span className="text-lg font-sans font-semibold -mt-0.5">−</span>
                          </button>
                          <div className="flex-1 flex items-center justify-center gap-2">
                            <Users className="w-4 h-4 text-brand-accent/70" />
                            <span className="font-sans text-2xl font-bold text-on-surface tabular-nums">
                              {formData.cupos}
                            </span>
                            <span className="text-xs text-on-surface-soft/40 font-sans">
                              {formData.cupos === 1 ? 'persona' : 'personas'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, cupos: Math.min(cuposMax, p.cupos + 1) }))}
                            disabled={formData.cupos >= cuposMax || cuposMax <= 0}
                            className="w-11 h-11 rounded-xl flex items-center justify-center
                              bg-surface-low/80 ring-1 ring-outline-soft/20 text-on-surface
                              hover:ring-brand-accent/30 transition-all
                              disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Aumentar personas"
                          >
                            <span className="text-lg font-sans font-semibold">+</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-on-surface-soft/30 font-sans text-center mt-2">
                          {cuposMax <= 0
                            ? 'No hay cupos disponibles en este horario'
                            : `Máximo ${cuposMax} cupo${cuposMax !== 1 ? 's' : ''} disponible${cuposMax !== 1 ? 's' : ''} en este horario`
                          }
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-sans
                      text-on-surface-soft/60 hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-sans font-semibold
                      bg-brand-accent text-brand-black disabled:opacity-30 disabled:cursor-not-allowed
                      hover:bg-verde transition-all duration-300 cursor-pointer active:scale-[0.97]"
                  >
                    Revisar reserva
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Confirmación ── */}
            {step === 3 && !submitted && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-6 text-center">
                  Confirma tu reserva
                </p>

                <div className="space-y-4 mb-8">
                  {/* Resumen del paquete */}
                  {paqueteSeleccionado && (
                    <div className="p-5 rounded-2xl border border-outline-soft/20 bg-surface-low/50">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans mb-2">
                        Paquete seleccionado
                      </p>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl text-on-surface">{paqueteSeleccionado.nombre}</h3>
                        <span className="font-sans font-bold text-brand-accent">{formatCurrency(paqueteSeleccionado.precio)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-on-surface-soft/60 font-sans">
                        <Clock3 className="w-3.5 h-3.5 shrink-0" />
                        <span>{paqueteSeleccionado.duracion} minutos</span>
                        <span className="text-outline-soft/20 mx-1">|</span>
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{paqueteSeleccionado.ubicacion}</span>
                      </div>
                    </div>
                  )}

                  {/* Resumen de datos */}
                  <div className="p-5 rounded-2xl border border-outline-soft/20 bg-surface-low/50 space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans mb-2">
                      Tus datos
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">{formData.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">{formData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">{formData.telefono}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">
                        {new Date(formData.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">{slotLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-outline/60" />
                      <span className="text-on-surface">
                        {formData.cupos} {formData.cupos === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  {paqueteSeleccionado && (
                    <div className="p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans">
                          Total estimado
                        </span>
                        <span className="font-sans font-bold text-xl text-brand-accent">
                          {formatCurrency(paqueteSeleccionado.precio * formData.cupos)}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-soft/40 font-sans mt-1 text-right">
                        {formatCurrency(paqueteSeleccionado.precio)} × {formData.cupos} {formData.cupos === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>
                  )}

                  {/* Nota */}
                  <p className="text-center text-[11px] text-on-surface-soft/40 font-sans">
                    Al confirmar, recibirás una notificación con los detalles de tu reserva.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-sans
                      text-on-surface-soft/60 hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-sans font-semibold
                      bg-brand-accent text-brand-black disabled:opacity-50
                      hover:bg-verde transition-all duration-300 cursor-pointer active:scale-[0.97]
                      shadow-[0_4px_20px_rgba(47,163,107,0.28)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirmar Reserva
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
