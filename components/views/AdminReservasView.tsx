'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Check, X, Clock, User, Mail, Phone, CalendarDays, Users, MapPin, Coffee, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/toastStore';
import type { Reservation, ReservationStatus, ReservationPackageId } from '@/types';

/* ─────────────────────────────────────────
   Constantes
────────────────────────────────────────── */
const PAQUETE_LABELS: Record<ReservationPackageId, string> = {
  testing_1: 'Coffee Tasting',
  testing_2: 'Coffee Tasting Completo',
};

const PAQUETE_PRECIOS: Record<ReservationPackageId, number> = {
  testing_1: 45000,
  testing_2: 120000,
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

function formatCurrency(n: number): string {
  return '$ ' + n.toLocaleString('es-CO');
}

function formatFecha(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─────────────────────────────────────────
   Componente
────────────────────────────────────────── */
export default function AdminReservasView() {
  const addToast = useToastStore(s => s.addToast);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true); // true solo en carga inicial
  const [refreshing, setRefreshing] = useState(false); // true en refrescos post-acción
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'todas'>('todas');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Cargar reservas ── */
  const fetchReservations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    let query = supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterStatus !== 'todas') {
      query = query.eq('estado', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reservations:', error);
      addToast('Error al cargar reservas', 'error');
    } else {
      setReservations(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [filterStatus, addToast]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  /* ── Cambiar estado ── */
  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('reservations')
      .update({ estado: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating reservation:', error);
      addToast('Error al actualizar la reserva', 'error');
    } else {
      addToast(`Reserva ${STATUS_LABELS[newStatus].toLowerCase()} exitosamente`, 'success');
      fetchReservations(true); // refresh sin spinner full table
    }
    setUpdatingId(null);
  };

  /* ── Filtrado local ── */
  const filtered = reservations.filter(r =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.telefono.includes(searchTerm)
  );

  /* ── Totals ── */
  const totalPersonas = reservations.reduce((sum, r) => sum + (r.cupos || 1), 0);
  const totalIngresos = reservations
    .filter(r => r.estado !== 'cancelada')
    .reduce((sum, r) => sum + ((PAQUETE_PRECIOS[r.paquete as ReservationPackageId] || 0) * (r.cupos || 1)), 0);

  return (
    <div>
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-brand-gray border border-brand-gray-light rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1">Total reservas</p>
          <p className="font-serif text-2xl text-brand-cream">{reservations.length}</p>
        </div>
        <div className="bg-brand-gray border border-brand-gray-light rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1">Personas</p>
          <p className="font-serif text-2xl text-brand-cream">{totalPersonas}</p>
        </div>
        <div className="bg-brand-gray border border-brand-gray-light rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1">Ingresos estimados</p>
          <p className="font-serif text-2xl text-brand-accent">{formatCurrency(totalIngresos)}</p>
        </div>
      </div>

      {/* ── Buscador y Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-gray border border-brand-gray-light rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          {/* Filtro rápido por estado */}
          {(['todas', 'pendiente', 'confirmada', 'cancelada'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-[11px] font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer
                ${filterStatus === s
                  ? s === 'todas' ? 'bg-brand-accent text-brand-black'
                    : s === 'confirmada' ? 'bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700'
                    : s === 'cancelada' ? 'bg-red-900/50 text-red-300 ring-1 ring-red-700'
                    : 'bg-amber-900/50 text-amber-300 ring-1 ring-amber-700'
                  : 'bg-brand-gray text-gray-500 hover:text-gray-300 ring-1 ring-brand-gray-light'
                }`}
            >
              {s === 'todas' ? 'Todas' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-brand-gray border border-brand-gray-light rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-brand-accent">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-gray-500 font-sans">Cargando reservas...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Indicador sutil de refresco */}
            {refreshing && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2 text-[11px] text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Actualizando...
              </div>
            )}
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider text-xs bg-brand-black/50 text-gray-400 border-b border-brand-gray-light">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha reserva</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Paquete</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Horario</th>
                  <th className="px-4 py-3 font-medium text-right">Cupos</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-center">Estado</th>
                  <th className="px-4 py-3 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-light/30">
                {filtered.map((res) => {
                  const pkgId = res.paquete as ReservationPackageId;
                  const pkgName = PAQUETE_LABELS[pkgId] || res.paquete;
                  const pkgPrecio = PAQUETE_PRECIOS[pkgId] || 0;
                  const total = pkgPrecio * (res.cupos || 1);

                  return (
                    <tr key={res.id} className="hover:bg-brand-gray-light/20 transition-colors">
                      <td className="px-4 py-3 text-[11px] text-gray-500">
                        {formatFechaHora(res.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-cream">{res.nombre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <a href={`mailto:${res.email}`} className="text-[12px] text-gray-400 hover:text-brand-accent transition-colors">
                            {res.email}
                          </a>
                          <a href={`tel:${res.telefono}`} className="text-[12px] text-gray-500 hover:text-brand-accent transition-colors">
                            {res.telefono}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-300">{pkgName}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatFecha(res.fecha)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {res.horario}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface">
                          <Users className="w-3.5 h-3.5 text-brand-accent/70" />
                          {res.cupos || 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-sans font-semibold text-brand-accent">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${res.estado === 'confirmada' ? 'bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-700/50' : ''}
                          ${res.estado === 'pendiente' ? 'bg-amber-900/40 text-amber-300 ring-1 ring-amber-700/50' : ''}
                          ${res.estado === 'cancelada' ? 'bg-red-900/40 text-red-300 ring-1 ring-red-700/50' : ''}
                        `}>
                          {res.estado === 'confirmada' && <Check className="w-3 h-3" />}
                          {res.estado === 'pendiente' && <Clock className="w-3 h-3" />}
                          {res.estado === 'cancelada' && <X className="w-3 h-3" />}
                          {STATUS_LABELS[res.estado as ReservationStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {updatingId === res.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-brand-accent mx-auto" />
                        ) : (
                          <div className="flex justify-center gap-1.5">
                            {res.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(res.id, 'confirmada')}
                                  className="p-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                                  title="Confirmar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(res.id, 'cancelada')}
                                  className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {res.estado === 'confirmada' && (
                              <button
                                onClick={() => handleStatusChange(res.id, 'cancelada')}
                                className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {res.estado === 'cancelada' && (
                              <button
                                onClick={() => handleStatusChange(res.id, 'pendiente')}
                                className="p-1.5 rounded-lg bg-amber-900/30 text-amber-400 hover:bg-amber-900/60 transition-colors cursor-pointer"
                                title="Reabrir"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            <p className="font-serif text-xl mb-1 text-gray-400">
              {searchTerm ? 'No se encontraron reservas' : 'No hay reservas aún'}
            </p>
            <p className="text-sm">
              {searchTerm ? 'Intenta ajustar tu búsqueda.' : 'Las reservas aparecerán aquí cuando los clientes agenden.'}
            </p>
          </div>
        )}
        </div>
      )}
      </div>
    </div>
  );
}
