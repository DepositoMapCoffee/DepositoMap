'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Search, Trash2, Edit2, Loader2, Map as MapIcon, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Coffee, CoffeeFormData, CoffeeCategory, CoffeeProcess } from '@/types';
import { departamentos } from '@/data/mapaData';
import { useCoffeeStore } from '@/store/coffeeStore';

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
};

export default function AdminPage() {
  const router = useRouter();
  const { loadActiveDepts } = useCoffeeStore();
  
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (!session) {
        router.push('/admin/login');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/admin/login');
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
    });
    setEditingId(coffee.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este café?')) return;
    
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl text-brand-cream">Panel Administrativo</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Gestión de Catálogo</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-gray hover:bg-brand-gray-light border border-brand-gray-light rounded-lg transition-colors text-gray-300"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Mapa</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-accent hover:bg-[#b09060] text-brand-black font-semibold rounded-xl px-6 py-2.5 transition-colors shadow-lg shadow-brand-accent/20"
          >
            <Plus className="w-5 h-5" />
            Añadir Café
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
                              className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(coffee.id)}
                              className="p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
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
      </main>

      {/* Modal Añadir/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-brand-black border border-brand-gray-light rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
            
            <div className="sticky top-0 bg-brand-black/95 backdrop-blur z-10 px-6 py-5 border-b border-brand-gray-light flex justify-between items-center">
              <h2 className="font-serif text-2xl text-brand-cream">
                {editingId ? 'Editar Café' : 'Nuevo Café'}
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
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Nombre del Lote / Café *</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder="Ej: Geisha Lavado Especial"
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
                  <label className="block text-xs uppercase text-gray-500 mb-2">Altura (msnm)</label>
                  <input
                    type="text"
                    value={formData.altura}
                    onChange={e => setFormData({...formData, altura: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder="Ej: 1950 msnm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Proceso</label>
                  <input
                    type="text"
                    value={formData.proceso}
                    onChange={e => setFormData({...formData, proceso: e.target.value})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none"
                    placeholder="Ej: Lavado, Honey, Natural..."
                    list="procesos"
                  />
                  <datalist id="procesos">
                    <option value="Lavado" />
                    <option value="Natural" />
                    <option value="Honey" />
                    <option value="Anaeróbico" />
                    <option value="Semi-Lavado" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-2">Categoría</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value as CoffeeCategory})}
                    className="w-full bg-brand-gray border border-brand-gray-light rounded-xl px-4 py-2.5 text-white focus:border-brand-accent focus:outline-none appearance-none"
                  >
                    <option value="Regional">Regional</option>
                    <option value="Culturing">Culturing</option>
                    <option value="Varietal">Varietal</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase text-gray-500 mb-2">Notas de cata</label>
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
                  {saving ? 'Guardando...' : 'Guardar Café'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
