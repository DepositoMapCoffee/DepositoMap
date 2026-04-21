'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LogOut, Bookmark, Edit3, Settings, Loader2, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function UserView() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Revisar sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        setIsAdmin(data && data.length > 0);
      }
      setLoadingSession(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        setIsAdmin(data && data.length > 0);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthLoading(true);
    setAuthMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthMessage({ type: 'error', text: 'Correo o contraseña incorrectos.' });
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthMessage({ type: 'error', text: error.message });
      } else {
        setAuthMessage({ 
          type: 'success', 
          text: 'Cuenta creada. Revisa tu correo electrónico para confirmar el registro (si está requerido).' 
        });
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loadingSession) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6">
      
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: session 
            ? 'radial-gradient(ellipse 50% 50% at 50% 10%, rgba(149,90,35,0.08) 0%, transparent 80%)'
            : 'radial-gradient(ellipse 50% 50% at 50% 10%, rgba(47,163,107,0.08) 0%, transparent 80%)',
        }}
      />

      <AnimatePresence mode="wait">
        {!session ? (
          /* ══════════════════════════════════════════
             VISTA DE REGISTRO / LOGIN (TRADICIONAL)
             ══════════════════════════════════════════ */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm z-10 flex flex-col items-center"
          >
            <div className="w-12 h-12 mb-6 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
              {isLogin ? <LogIn className="w-5 h-5 text-brand-accent" /> : <UserPlus className="w-5 h-5 text-brand-accent" />}
            </div>
            
            <h1 className="font-serif text-3xl text-on-surface font-medium mb-3 text-center">
              {isLogin ? 'Acceso Exclusivo' : 'Crea tu Pasaporte'}
            </h1>
            <p className="text-sm text-on-surface-soft/60 font-sans text-center mb-8 px-4">
              {isLogin 
                ? 'Ingresa tu correo y contraseña para acceder a tu perfil.' 
                : 'Únete a la comunidad de curadores de especialidad.'}
            </p>

            <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-low/80 pl-11 pr-4 py-3.5 rounded-xl text-sm text-on-surface
                    ghost-border focus:outline-none focus:border-brand-accent/50
                    transition-colors placeholder:text-outline/40 shadow-inner"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-low/80 pl-11 pr-4 py-3.5 rounded-xl text-sm text-on-surface
                    ghost-border focus:outline-none focus:border-brand-accent/50
                    transition-colors placeholder:text-outline/40 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 rounded-xl
                  bg-brand-accent text-brand-black font-sans font-semibold text-sm tracking-wide
                  hover:bg-verde transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_4px_20px_rgba(47,163,107,0.2)] hover:shadow-[0_6px_28px_rgba(47,163,107,0.3)]"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>
            </form>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthMessage(null);
                  setPassword('');
                }}
                className="text-sm text-on-surface-soft/60 hover:text-brand-accent transition-colors cursor-pointer"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>

            {authMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mt-6 w-full p-4 rounded-xl text-xs text-center border font-sans leading-relaxed
                  ${authMessage.type === 'success' 
                    ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
              >
                {authMessage.text}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ══════════════════════════════════════════
             VISTA DEL PASAPORTE (PERFIL)
             ══════════════════════════════════════════ */
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md z-10 flex flex-col"
          >
            {/* Header del perfil */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-gold to-brand-gold/30 
                flex items-center justify-center text-3xl font-serif text-brand-black mb-5 shadow-[0_0_30px_rgba(149,90,35,0.2)]">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold/80 font-sans mb-1.5 font-bold">
                Curador de Café
              </p>
              <h2 className="font-serif text-xl text-on-surface truncate w-full px-4">
                {session.user.email}
              </h2>
            </div>

            {/* Dashboard grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-surface-low/50 border border-outline-soft/10 ghost-border hover:bg-surface-low transition-colors">
                <Bookmark className="w-6 h-6 text-on-surface-soft/40 mb-3" />
                <span className="text-2xl font-serif text-on-surface mb-1">0</span>
                <span className="text-[9px] uppercase tracking-widest text-on-surface-soft/40 font-sans text-center">Favoritos</span>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl bg-surface-low/50 border border-outline-soft/10 ghost-border hover:bg-surface-low transition-colors">
                <Edit3 className="w-6 h-6 text-on-surface-soft/40 mb-3" />
                <span className="text-2xl font-serif text-on-surface mb-1">0</span>
                <span className="text-[9px] uppercase tracking-widest text-on-surface-soft/40 font-sans text-center">Notas de cata</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              {/* Botón de admin/gestión (solo visible para admins verificados en BD) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-highest/40 
                    border border-outline-soft/15 hover:border-brand-gold/40 hover:bg-surface-highest
                    transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-brand-gold" />
                    </div>
                    <span className="font-sans text-sm text-on-surface group-hover:text-brand-gold transition-colors">
                      Gestión de Catálogo
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-soft/30 flex items-center gap-1">
                    Admin <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                </Link>
              )}

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 mt-4 py-3.5 rounded-xl
                  text-on-surface-soft/50 font-sans text-sm hover:text-red-400 hover:bg-red-500/10 
                  transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
