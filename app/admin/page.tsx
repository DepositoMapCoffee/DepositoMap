'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Search, Trash2, Edit2, Loader2, Map as MapIcon, Eye, EyeOff, ArrowLeft, CalendarClock, Coffee as CoffeeIcon, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Coffee, CoffeeFormData, CoffeeCategory, CoffeeProcess } from '@/types';
import { departamentos } from '@/data/mapaData';
import { useCoffeeStore } from '@/store/coffeeStore';
import { useToastStore } from '@/store/toastStore';
import AdminReservasView from '@/components/views/AdminReservasView';

const PAQUETE_LABELS: Record<string, string> = {
  testing_1: 'Coffee Tasting',
  testing_2: 'Coffee Tasting Completo',
};

const INITIAL_FORM_STATE: CoffeeFormData = {
  nombre: '',
  departamento_id: '',
  finca: '',
  altura: '',
  proceso: 'Lavado',
  notas: '',
  categoria: 'Regional',
  visible: true,
  preparacion: '',
  sugerencias: '',
  descripcion_larga: '',
  metodo_sugerido: '',
  tipo_producto: 'cafe',
};

export default function AdminPage() {
  const router = useRouter();
  const loadActiveDepts = useCoffeeStore(s => s.loadActiveDepts);
  
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [adminTab, setAdminTab] = useState<'catalog' | 'reservations'>('catalog');
  const [unseenCount, setUnseenCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CoffeeFormData>(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Check Auth 
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (!session) {
        setLoadingAuth(false);
        router.push('/admin/login');
      } else if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        if (!data || data.length === 0) {
          router.push('/');
        } else {
          setLoadingAuth(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/admin/login');
      } else if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        if (!data || data.length === 0) {
          router.push('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 2. Load Coffees
  const fetchCoffees = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coffees:', error);
    } else {
      setCoffees(data || []);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (session) {
      fetchCoffees();
    }
  }, [session]);

  /* ── Realtime: notificación de nuevas reservas ── */
  useEffect(() => {
    if (!session) return;

    // Obtener conteo inicial de pendientes como referencia
    const channel = supabase
      .channel('admin-reservations')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations' },
        (payload) => {
          const r = payload.new as any;
          // Si ya estamos viendo reservas, auto-refrescar sin badge
          if (adminTab === 'reservations') {
            return;
          }
          setUnseenCount(prev => prev + 1);
          const pkgName = PAQUETE_LABELS[r.paquete] || r.paquete;
          useToastStore.getState().addToast(
            `Nueva reserva de ${r.nombre} — ${pkgName} — ${r.cupos || 1} cupo${r.cupos !== 1 ? 's' : ''}`,
            'info'
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, adminTab]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Form Actions
  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coffee: Coffee) => {
    setFormData({
      nombre: coffee.nombre,
      departamento_id: coffee.departamento_id,
      finca: coffee.finca,
      altura: coffee.altura,
      proceso: coffee.proceso,
      notas: coffee.notas,
      categoria: coffee.categoria,
      visible: coffee.visible ?? true,
      preparacion: coffee.preparacion || '',
      sugerencias: coffee.sugerencias || '',
      descripcion_larga: coffee.descripcion_larga || '',
      metodo_sugerido: coffee.metodo_sugerido || '',
      tipo_producto: coffee.tipo_producto || 'cafe',
    });
    setEditingId(coffee.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const isChocolate = formData.tipo_producto === 'chocolate';

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    
    try {
      const { error } = await supabase.from('cafes').delete().eq('id', id);
      if (error) throw error;
      await fetchCoffees();
      loadActiveDepts(); // Actualizamos el mapa
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    // Validación básica
    if (!formData.nombre || !formData.departamento_id || !formData.finca) {
      setFormError('Por favor completa todos los campos requeridos.');
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        // Edit
        const { error } = await supabase
          .from('cafes')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('cafes')
          .insert([formData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchCoffees();
      loadActiveDepts(); // Actualizar store para el mapa
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtrado
  const filteredCoffees = coffees.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.departamento_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.finca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!session) return null; // Previene flash mientras redirige

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-brand-white pb-20">
      
      {/* Header Admin */}
      <header className="bg-brand-black border-b border-brand-gray-light sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-cream">Panel Administrativo</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {adminTab === 'catalog' ? 'Gestión de Catálogo' : 'Gestión de Reservas'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-gray hover:bg-brand-gray-light border border-brand-gray-light rounded-lg transition-colors text-gray-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1">
            <button
              onClick={() => setAdminTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all cursor-pointer
                ${adminTab === 'catalog'
                  ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-brand-gray-light/30'
                }`}
            >
              <CoffeeIcon className="w-4 h-4" />
              Catálogo
            </button>
            <button
              onClick={() => {
                setAdminTab('reservations');
                setUnseenCount(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all cursor-pointer relative
                ${adminTab === 'reservations'
                  ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-brand-gray-light/30'
                }`}
            >
              <CalendarClock className="w-4 h-4" />
              Reservas
              {unseenCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center
                  bg-red-500 text-white text-[10px] font-bold rounded-full px-1
                  shadow-lg shadow-red-500/30">
                  {unseenCount > 9 ? '9+' : unseenCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {adminTab === 'catalog' ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              {/* Search */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por lote, finca o depto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-gray border border-brand-gray-light rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-accent hover:bg-[#b09060] text-brand-black font-semibold rounded-xl px-6 py-2.5 transition-colors shadow-lg shadow-brand-accent/20 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Añadir Producto
              </button>
            </div>

            {/* Tabla / Lista */}
            <div className="bg-brand-gray border border-brand-gray-light rounded-2xl overflow-hidden shadow-2xl">
              {loadingData ? (
                 <div className="flex flex-col items-center justify-center h-64 space-y-4 text-brand-accent">
                    <Loader2 className="w-8 h-8 animate-spin" />
                 </div>
              ) : filteredCoffees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider text-xs bg-brand-black/50 text-gray-400 border-b border-brand-gray-light">
                      <tr>
                        <th className="px-6 py-4 font-medium">Lote / Nombre</th>
                        <th className="px-6 py-4 font-medium">Tipo</th>
                        <th className="px-6 py-4 font-medium">Departamento</th>
                        <th className="px-6 py-4 font-medium">Finca</th>
                        <th className="px-6 py-4 font-medium">Estado</th>
                        <th className="px-6 py-4 font-medium">Perfil (Proceso / Cat)</th>
                        <th className="px-6 py-4 text-right font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-light/30">
                      {filteredCoffees.map((coffee) => {
                        const deptoName = departamentos.find(d => d.id === coffee.departamento_id)?.nombre || coffee.departamento_id;
                        return (
                          <tr key={coffee.id} className="hover:bg-brand-gray-light/20 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-serif text-lg text-brand-cream">{coffee.nombre}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${coffee.tipo_producto === 'chocolate' ? 'text-emerald-300 bg-emerald-900/30' : 'text-amber-300 bg-amber-900/30'}`}>
                                {coffee.tipo_producto === 'chocolate' ? 'Chocolate' : 'Café'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{deptoName}</td>
                            <td className="px-6 py-4 text-gray-300">
                              <p>{coffee.finca}</p>
                              <p className="text-xs text-gray-500">{coffee.altura}</p>
                            </td>
                            <td className="px-6 py-4">
                              {coffee.visible ? (
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="text-[10px] uppercase font-bold tracking-widest">Público</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span className="text-[10px] uppercase font-bold tracking-widest">Oculto</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className="text-xs text-gray-300 bg-brand-gray-light px-2 py-0.5 rounded-md">
                                  {coffee.proceso}
                                </span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  coffee.categoria === 'Varietal' ? 'text-purple-300 bg-purple-900/30' : 
                                  coffee.categoria === 'Culturing' ? 'text-amber-300 bg-amber-900/30' : 
                                  'text-emerald-300 bg-emerald-900/30'
                                }`}>
                                  {coffee.categoria}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditModal(coffee)}
                                  className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(coffee.id)}
                                  className="p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center text-gray-500">
                  <p className="font-serif text-xl mb-1 text-gray-400">No se encontraron resultados</p>
                  <p className="text-sm">Intenta ajustar tu búsqueda o añade un nuevo café.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <AdminReservasView />
        )}
      </main>

      {/* Modal Añadir/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-brand-black border border-brand-gray-light rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
            
            <div className="sticky top-0 bg-brand-black/95 backdrop-blur z-10 px-6 py-5 border-b border-brand-gray-light flex justify-between items-center">
              <h2 className="font-serif text-2xl text-brand-cream">
                {editingId ? (isChocolate ? 'Editar Chocolate' : 'Editar Café') : (isChocolate ? 'Nuevo Chocolate' : 'Nuevo Café')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <LogOut className="w-5 h-5 rotate-45" /> {/* Use as cross */}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-950 border border-red-900 text-red-200 text-sm rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Tipo de producto */}
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase text-gray-500 mb-2">Tipo de Producto *</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tipo_producto: 'cafe', categoria: 'Regional', proceso: 'Lavado', altura: ''})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        formData.tipo_producto !== 'chocolate'
                          ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                          : 'bg-brand-gray border-brand-gray-light text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      ☕ Café
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tipo_producto: 'chocolate', categoria: 'Chocolate', proceso: '72% Cacao', altura: '40 gr'})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        formData.tipo_producto === 'chocolate'
                          ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                          : 'bg-brand-gray border-brand-gray-light text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      🍫 Chocolate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">{isChocolate ? 'Nombre del Producto *' : 'Nombre del Lote / Café *'}</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder={isChocolate ? 'Ej: Barra 72% Cacao 40gr' : 'Ej: Geisha Lavado Especial'}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Departamento *</label>
                  <select
                    required
                    value={formData.departamento_id}
                    onChange={e => setFormData({...formData, departamento_id: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none appearance-none"
                  >
                    <option value="" disabled>Selecciona una región</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Finca / Productor *</label>
                  <input
                    required
                    type="text"
                    value={formData.finca}
                    onChange={e => setFormData({...formData, finca: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder="Ej: Finca El Paraíso"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">{isChocolate ? 'Presentación (peso)' : 'Altura (msnm)'}</label>
                  <input
                    type="text"
                    value={formData.altura}
                    onChange={e => setFormData({...formData, altura: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder={isChocolate ? 'Ej: 40 gr, 80 gr' : 'Ej: 1950 msnm'}
                    list={isChocolate ? 'presentaciones' : undefined}
                  />
                  {isChocolate && (
                    <datalist id="presentaciones">
                      <option value="40 gr" />
                      <option value="60 gr" />
                      <option value="80 gr" />
                    </datalist>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">{isChocolate ? 'Porcentaje de Cacao' : 'Proceso'}</label>
                  <input
                    type="text"
                    value={formData.proceso}
                    onChange={e => setFormData({...formData, proceso: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder={isChocolate ? 'Ej: 72% Cacao, 100% Cacao' : 'Ej: Lavado, Honey, Natural...'}
                    list={isChocolate ? 'cacaoPercents' : 'procesos'}
                  />
                  {isChocolate ? (
                    <datalist id="cacaoPercents">
                      <option value="62% Cacao" />
                      <option value="72% Cacao" />
                      <option value="86% Cacao" />
                      <option value="100% Cacao" />
                    </datalist>
                  ) : (
                    <datalist id="procesos">
                      <option value="Lavado" />
                      <option value="Natural" />
                      <option value="Honey" />
                      <option value="Anaeróbico" />
                      <option value="Semi-Lavado" />
                    </datalist>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Categoría</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value as CoffeeCategory})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none appearance-none"
                  >
                    {isChocolate ? (
                      <option value="Chocolate">Chocolate</option>
                    ) : (
                      <>
                        <option value="Regional">Regional</option>
                        <option value="Culturing">Culturing</option>
                        <option value="Varietal">Varietal</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase text-gray-500 mb-2">{isChocolate ? 'Notas de sabor' : 'Notas de cata'}</label>
                  <textarea
                    rows={3}
                    value={formData.notas}
                    onChange={e => setFormData({...formData, notas: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none resize-none"
                    placeholder="Ej: Notas florales, acidez brillante, cuerpo sedoso..."
                  />
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">Histotria / Descripción Ampliada</label>
                    <textarea 
                      rows={5}
                      value={formData.descripcion_larga}
                      onChange={e => setFormData({...formData, descripcion_larga: e.target.value})}
                      className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none resize-none"
                      placeholder="Detalles sobre el origen, el productor, historia de la finca..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">Método Sugerido</label>
                      <input 
                        type="text"
                        value={formData.metodo_sugerido}
                        onChange={e => setFormData({...formData, metodo_sugerido: e.target.value})}
                        className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                        placeholder="Ej: V60, Chemex, Prensa..."
                        list="metodos"
                      />
                      <datalist id="metodos">
                        <option value="V60" />
                        <option value="Chemex" />
                        <option value="AeroPress" />
                        <option value="Prensa Francesa" />
                        <option value="Moka Pot" />
                        <option value="Espresso" />
                        <option value="Cold Brew" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">Preparación Sugerida</label>
                      <textarea 
                        rows={3}
                        value={formData.preparacion}
                        onChange={e => setFormData({...formData, preparacion: e.target.value})}
                        className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none resize-none"
                        placeholder="Ej: Ratio 1:15, Temperatura 92°C, Molienda media..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-wider">Sugerencias del Tostador</label>
                      <textarea 
                        rows={3}
                        value={formData.sugerencias}
                        onChange={e => setFormData({...formData, sugerencias: e.target.value})}
                        className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none resize-none"
                        placeholder="Ej: Ideal para la mañana, marida bien con chocolate negro..."
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-brand-gray-light/20 rounded-xl border border-brand-gray-light/50">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={formData.visible}
                    onChange={e => setFormData({...formData, visible: e.target.checked})}
                    className="w-5 h-5 rounded border-brand-gray-light bg-brand-gray text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-black"
                  />
                  <label htmlFor="visible" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-medium text-brand-cream">Visible en la tienda pública</span>
                    <span className="text-xs text-gray-500">Si se desmarca, el café solo será visible en este panel administrativo.</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-brand-gray-light/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-brand-gray-light hover:bg-brand-gray transition-colors text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-[#b09060] text-brand-black transition-colors font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Guardando...' : (isChocolate ? 'Guardar Chocolate' : 'Guardar Café')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
