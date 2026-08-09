'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, ChevronLeft, Loader2, Clock, User, Mail, Phone, CalendarDays, Coffee, Users, MapPin, Globe, Clock3, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/toastStore';
import { getPanelVariants } from '@/lib/animations';
import { PAQUETES } from '@/data/paquetes';
import type { ReservationPackageId, TimeSlot, ReservationFormData, AvailabilityInfo } from '@/types';

/* ─────────────────────────────────────────
   Props
────────────────────────────────────────── */
interface ReservaSidePanelProps {
  initialPackage?: ReservationPackageId;
  onClose: () => void;
  onNavigateToHome?: () => void;
}

/* ─────────────────────────────────────────
   Constantes
────────────────────────────────────────── */
const CUPO_MAXIMO_POR_HORARIO = 4;

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
function getMinDate(): string {
  const now = new Date();
  if (now.getHours() >= 12) {
    now.setDate(now.getDate() + 1);
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function esHoy(fecha: string): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return fecha === `${y}-${m}-${d}`;
}

function esAntesDeMedioDia(): boolean {
  return new Date().getHours() < 12;
}

function formatCurrency(n: number): string {
  return '$ ' + n.toLocaleString('es-CO');
}

async function checkAvailability(fecha: string): Promise<AvailabilityInfo[]> {
  const isToday = esHoy(fecha);
  const beforeNoon = esAntesDeMedioDia();

  // RPC SECURITY DEFINER: expone solo conteos agregados por horario,
  // accesible para usuarios anónimos (RLS bloquea el SELECT directo).
  const { data, error } = await supabase.rpc('consultar_disponibilidad', { p_fecha: fecha });

  const ocupadosPorHorario: Record<string, number> = {};
  if (!error && data) {
    (data as { horario: string; ocupados: number }[]).forEach(row => {
      ocupadosPorHorario[row.horario] = row.ocupados;
    });
  }

  return TIME_SLOTS.map(({ id: horario, label }) => {
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
export default function ReservaSidePanel({
  initialPackage,
  onClose,
  onNavigateToHome,
}: ReservaSidePanelProps) {
  const addToast = useToastStore(s => s.addToast);

  /* ── Mobile detection ── */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Wizard state ── */
  const [step, setStep] = useState(initialPackage ? 1 : 1);
  const [paquete, setPaquete] = useState<ReservationPackageId | null>(initialPackage ?? null);
  const [formData, setFormData] = useState<ReservationFormData>({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    horario: '' as TimeSlot,
    paquete: initialPackage ?? '' as ReservationPackageId,
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
      setCheckingAvailability(true);
      const result = await checkAvailability(formData.fecha);
      setAvailability(result);
      setCheckingAvailability(false);

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
      const currentAvailability = await checkAvailability(formData.fecha);
      const slot = currentAvailability.find(a => a.horario === formData.horario);
      if (!slot || slot.disponibles <= 0) {
        addToast('El horario seleccionado ya no tiene cupos disponibles. Elige otro.', 'error');
        setSubmitting(false);
        setStep(2);
        return;
      }

      if (formData.cupos > (slot?.disponibles ?? 0)) {
        addToast(`Solo hay ${slot?.disponibles ?? 0} cupos disponibles para este horario.`, 'error');
        setSubmitting(false);
        setStep(2);
        return;
      }

      // RPC atómica: valida cupos y reserva en una sola transacción
      // (pg_advisory_xact_lock por fecha+horario → sin sobreventa).
      const { data: rpcResult, error: rpcError } = await supabase.rpc('reservar_cupo', {
        p_nombre: formData.nombre.trim(),
        p_email: formData.email.trim().toLowerCase(),
        p_telefono: formData.telefono.trim(),
        p_fecha: formData.fecha,
        p_horario: formData.horario,
        p_paquete: paquete,
        p_cupos: formData.cupos,
      });

      if (rpcError || !rpcResult?.ok) {
        console.error('Error al crear reserva:', rpcError ?? rpcResult);
        addToast((rpcResult as { error?: string } | null)?.error ?? 'Error al crear la reserva. Intenta de nuevo.', 'error');
        if (rpcResult && !rpcResult.ok && /cupo/i.test(JSON.stringify(rpcResult.error))) {
          setStep(2);
        }
        return;
      }

      addToast('Reserva confirmada con éxito. ¡Te esperamos!', 'success');
      setSubmitted(true);

      setTimeout(() => {
        setStep(1);
        setPaquete(initialPackage ?? null);
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fecha: '',
          horario: '' as TimeSlot,
          paquete: initialPackage ?? '' as ReservationPackageId,
          cupos: 1,
        });
        setAvailability([]);
        setSubmitted(false);
        onClose();
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
  const showChangeLink = step === 1 && paquete !== null;

  return (
    <motion.div
      variants={getPanelVariants(isMobile)}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isMobile ? 'y' : false}
      dragSnapToOrigin
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) { onClose(); }
      }}
      className="fixed inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[480px]
        flex flex-col z-40 overflow-hidden
        shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(90,90,90,0.15)]
        lg:cursor-default touch-pan-y"
      style={{
        background: 'rgba(19, 19, 19, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        touchAction: 'pan-y',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── Mobile drag pill indicator ── */}
      <div className="flex justify-center pt-3 pb-1 lg:hidden pointer-events-none">
        <div className="w-10 h-1 rounded-full bg-outline-soft/50" />
      </div>

      {/* ── Header ── */}
      <div
        className="shrink-0 px-7 md:px-8 pt-5 pb-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(19,19,19,1) 70%, rgba(19,19,19,0))',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {/* Back arrow on step > 1 */}
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-soft/50
                  hover:text-on-surface transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                Atrás
              </button>
            )}
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="block w-6 h-px bg-brand-accent/60" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-brand-accent/70 font-sans font-semibold">
                El Depósito
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-on-surface tracking-tight leading-tight">
              Coffee Tasting
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="mt-1 p-2 rounded-full shrink-0
              bg-surface-highest/70 hover:bg-surface-bright
              border border-outline-soft/30 hover:border-gold-container/40
              text-on-surface-soft hover:text-gold-primary
              transition-all duration-300 cursor-pointer active:scale-90 pointer-events-auto"
            style={{ touchAction: 'manipulation' }}
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {/* Package info compact */}
        {paqueteSeleccionado && (
          <div className="mt-3 flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface-low/60 border border-outline-soft/15">
            <Coffee className="w-4 h-4 shrink-0 text-brand-accent/70" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-medium text-on-surface truncate">
                {paqueteSeleccionado.nombre}
              </p>
              <p className="text-[11px] font-sans text-on-surface-soft/50">
                {paqueteSeleccionado.duracion} min &middot; {formatCurrency(paqueteSeleccionado.precio)}/persona
              </p>
            </div>
            {showChangeLink && (
              <button
                type="button"
                onClick={() => setPaquete(null)}
                className="text-[10px] uppercase tracking-wider font-sans font-semibold text-brand-accent/80
                  hover:text-brand-accent transition-colors cursor-pointer shrink-0"
              >
                Cambiar
              </button>
            )}
          </div>
        )}

        {/* Step indicator */}
        {!submitted && (
          <div className="flex items-center gap-0.5 mt-4">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-sans font-semibold transition-all duration-300
                      ${step === s.num
                        ? 'bg-brand-accent text-brand-black'
                        : step > s.num
                          ? 'bg-brand-accent/30 text-brand-accent'
                          : 'bg-surface-highest/50 text-on-surface-soft/40'
                      }`}
                  >
                    {step > s.num ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-sans hidden sm:block
                    ${step === s.num ? 'text-brand-accent' : step > s.num ? 'text-brand-accent/60' : 'text-on-surface-soft/40'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1.5 transition-colors duration-300
                    ${step > s.num ? 'bg-brand-accent/40' : 'bg-outline-soft/20'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Contenido scrolleable ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-touch px-7 md:px-8 pb-12">
        <AnimatePresence mode="wait">
          {/* ── Mensaje de éxito ── */}
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-5 text-center">
                Elige tu experiencia
              </p>

              <div className="grid gap-4">
                {PAQUETES.map((pkg) => {
                  const isSelected = paquete === pkg.id;
                  const isInitial = initialPackage === pkg.id && paquete === pkg.id;
                  return (
                    <motion.button
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative w-full text-left p-5 rounded-2xl cursor-pointer transition-all duration-300
                        border ${isSelected
                          ? 'border-brand-accent/50 bg-brand-accent/8 shadow-[0_0_30px_rgba(47,163,107,0.15)]'
                          : 'border-outline-soft/20 bg-surface-low/50 hover:border-outline-soft/40'
                        }`}
                    >
                      {/* Selected check */}
                      <div className={`absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'bg-brand-accent scale-100' : 'bg-surface-highest/50 scale-75 opacity-0'}`}
                      >
                        <Check className="w-3.5 h-3.5 text-brand-black" />
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                          ${isSelected ? 'bg-brand-accent/20' : 'bg-surface-highest/60'}`}
                        >
                          <Coffee className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-on-surface-soft/50'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-serif text-lg mb-0.5 ${isSelected ? 'text-brand-accent' : 'text-on-surface'}`}>
                            {pkg.nombre}
                          </h3>
                          <p className="text-on-surface-soft/50 text-xs font-sans mb-2.5">
                            {pkg.descripcion}
                          </p>

                          {/* Compact details */}
                          <div className="space-y-1 mb-2.5">
                            <div className="flex items-center gap-2 text-[10px] text-on-surface-soft/60 font-sans">
                              <Clock3 className="w-3 h-3 shrink-0" />
                              <span>{pkg.duracion} minutos</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-on-surface-soft/60 font-sans">
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate">{pkg.idiomas}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-on-surface-soft/60 font-sans">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{pkg.ubicacion}</span>
                            </div>
                          </div>

                          <p className="font-sans font-bold text-base text-brand-accent">
                            {formatCurrency(pkg.precio)}
                            <span className="text-[10px] font-normal text-on-surface-soft/40 ml-1">/ persona</span>
                          </p>
                        </div>
                      </div>

                      {/* Initial badge */}
                      {isInitial && (
                        <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-brand-accent text-[8px] uppercase tracking-wider font-sans font-bold text-brand-black">
                          Recomendado
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-end mt-6">
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-5 text-center">
                Tus datos
              </p>

              <div className="space-y-4">
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

                      {/* ── Aviso grupos grandes ── */}
                      {formData.cupos >= 3 && (
                        <div className="mt-4 px-3.5 py-3 rounded-xl bg-brand-accent/5 ring-1 ring-brand-accent/15">
                          <p className="text-[11px] text-on-surface-soft/60 leading-relaxed font-sans text-center">
                            ¿Son más de 4 personas? Escríbenos a{' '}
                            <a
                              href="https://wa.me/573232915975"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-accent underline hover:text-brand-accent/80 transition-colors font-medium"
                            >
                              WhatsApp
                            </a>
                            {' '}para consultar disponibilidad en horarios especiales o grupos grandes.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Botones de navegación */}
              <div className="flex items-center justify-between mt-6">
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-soft/40 font-sans mb-5 text-center">
                Confirma tu reserva
              </p>

              <div className="space-y-3.5 mb-6">
                {/* Resumen del paquete */}
                {paqueteSeleccionado && (
                  <div className="p-4 rounded-2xl border border-outline-soft/20 bg-surface-low/50">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans mb-2">
                      Paquete seleccionado
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg text-on-surface min-w-0">{paqueteSeleccionado.nombre}</h3>
                      <span className="font-sans font-bold text-brand-accent whitespace-nowrap shrink-0">{formatCurrency(paqueteSeleccionado.precio)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-on-surface-soft/60 font-sans">
                      <Clock3 className="w-3.5 h-3.5 shrink-0" />
                      <span>{paqueteSeleccionado.duracion} minutos</span>
                      <span className="text-outline-soft/20 mx-1">|</span>
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{paqueteSeleccionado.ubicacion}</span>
                    </div>
                  </div>
                )}

                {/* Resumen de datos */}
                <div className="p-4 rounded-2xl border border-outline-soft/20 bg-surface-low/50 space-y-2.5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans mb-2">
                    Tus datos
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-outline/60 shrink-0" />
                    <span className="text-on-surface">{formData.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-outline/60 shrink-0" />
                    <span className="text-on-surface">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-outline/60 shrink-0" />
                    <span className="text-on-surface">{formData.telefono}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="w-4 h-4 text-outline/60 shrink-0" />
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
                    <Clock className="w-4 h-4 text-outline/60 shrink-0" />
                    <span className="text-on-surface">{slotLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-outline/60 shrink-0" />
                    <span className="text-on-surface">
                      {formData.cupos} {formData.cupos === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                {paqueteSeleccionado && (
                  <div className="p-4 rounded-2xl border border-brand-accent/20 bg-brand-accent/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/60 font-sans min-w-0">
                        Total estimado
                      </span>
                      <span className="font-sans font-bold text-lg text-brand-accent whitespace-nowrap shrink-0">
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
    </motion.div>
  );
}
