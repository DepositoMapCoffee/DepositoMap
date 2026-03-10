'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CoffeeBeanIcon from '@/components/CoffeeBeanIcon';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-gray-light/30 via-brand-black to-brand-black z-0" />

      <div className="relative z-10 w-full max-w-md bg-brand-gray/50 backdrop-blur-xl border border-brand-gray-light p-8 rounded-2xl shadow-2xl">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gray flex items-center justify-center border border-brand-gray-light mb-4 shadow-inner">
            <CoffeeBeanIcon className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="font-serif text-3xl text-brand-white mb-2">Acceso Admin</h1>
          <p className="text-gray-400 text-sm tracking-wide text-center">
            Ingresa tus credenciales para administrar el catálogo de El Depósito.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-brand-black border border-brand-gray-light rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all placeholder:text-gray-600"
              placeholder="admin@eldeposito.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-brand-black border border-brand-gray-light rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all placeholder:text-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-[#b09060] text-brand-black font-semibold rounded-xl px-4 py-3 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(200,169,126,0.3)]"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-brand-cream text-sm transition-colors"
          >
            ← Volver al Mapa
          </button>
        </div>

      </div>
    </div>
  );
}
