'use client';

import React, { useState, useEffect } from 'react';
import { Home, Map, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoffeeStore } from '@/store/coffeeStore';
import { useUserStore } from '@/store/userStore';
import MapaColombia from '@/components/MapaColombia';
import SidePanel from '@/components/SidePanel';
import HomeView from '@/components/views/HomeView';
import CatalogView from '@/components/views/CatalogView';
import UserView from '@/components/views/UserView';

/* ─────────────────────────────────────────
   Nav items
───────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',    icon: Home,     label: 'Inicio',   description: 'Pantalla principal' },
  { id: 'map',     icon: Map,      label: 'Mapa',     description: 'Mapa cafetero' },
  { id: 'catalog', icon: BookOpen, label: 'Catálogo', description: 'Todos los lotes' },
  { id: 'user',    icon: User,     label: 'Usuario',  description: 'Perfil y favoritos' },
] as const;

/* ─────────────────────────────────────────
   Sidebar widths
───────────────────────────────────────── */
const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED  = 210;

export default function HomePage() {
  const { loadActiveDepts, selectedDept, clearSelection } = useCoffeeStore();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { initAuth } = useUserStore();

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    const saved = localStorage.getItem('deposito_active_tab');
    if (saved) setActiveTab(saved);
  }, []);

  useEffect(() => { loadActiveDepts(); }, [loadActiveDepts]);

  const handleNav = (id: string) => {
    setActiveTab(id);
    localStorage.setItem('deposito_active_tab', id);
    if (id !== 'map') clearSelection();
  };

  return (
    <main className="bg-brand-black text-brand-white overflow-hidden relative flex flex-col lg:flex-row h-screen selection:bg-brand-accent/20">

      {/* ══════════════════════════════════════════
          SIDEBAR — desktop only (lg+)
          Overlay expand on hover, no content shift
      ══════════════════════════════════════════ */}
      <motion.nav
        className="hidden lg:flex flex-col items-start py-8 gap-1.5 z-40
          fixed left-0 top-0 bottom-0 overflow-hidden
          bg-surface-low/90 backdrop-blur-xl border-r border-outline-soft/20"
        animate={{ width: sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* ── Logo area ── */}
        <div className="flex items-center gap-3 px-[14px] mb-6 h-9 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Isotipo.svg"
            alt="El Depósito"
            className="w-9 h-9 shrink-0 drop-shadow-lg"
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="font-serif text-base font-medium text-brand-accent whitespace-nowrap overflow-hidden"
              >
                El Depósito
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div className="w-full h-px bg-outline-soft/20 mb-3" />

        {/* ── Nav items ── */}
        {NAV_ITEMS.map(({ id, icon: Icon, label, description }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              title={label}
              className={`
                group relative flex items-center gap-3.5 cursor-pointer
                mx-2 px-3 py-3 rounded-xl w-[calc(100%-16px)] shrink-0
                transition-colors duration-200
                ${isActive
                  ? 'bg-brand-accent/12 text-brand-accent'
                  : 'text-on-surface-soft/45 hover:text-on-surface hover:bg-surface-high/60'
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-accent"
                />
              )}

              {/* Icon */}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />

              {/* Labels — only visible when expanded */}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    key={`label-${id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18, delay: 0.06 }}
                    className="flex flex-col leading-tight min-w-0 overflow-hidden"
                  >
                    <span className="text-[13px] font-medium font-sans whitespace-nowrap">
                      {label}
                    </span>
                    <span className="text-[10px] text-on-surface-soft/40 whitespace-nowrap font-sans">
                      {description}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}

        {/* ── Glow hint at bottom when collapsed ── */}
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none"
            >
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-transparent via-brand-accent/20 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════════════════════════════════
          TOP HEADER — mobile / tablet (< lg)
          Shows current section name + isotipo
      ══════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30
        flex justify-between items-center
        px-5 py-3.5 bg-brand-black/90 backdrop-blur-md border-b border-outline-soft/10">

        {/* Isotipo pequeño */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Isotipo.svg" alt="" aria-hidden="true" className="w-7 h-7 opacity-80" />

        {/* Nombre de la sección activa */}
        <AnimatePresence mode="wait">
          <motion.span
            key={activeTab}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="font-serif text-[15px] font-medium text-brand-accent tracking-wide absolute left-1/2 -translate-x-1/2"
          >
            {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? 'El Depósito'}
          </motion.span>
        </AnimatePresence>

        {/* Spacer para centrar el título */}
        <div className="w-7" aria-hidden="true" />
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT AREA
          Margin left fixed at collapsed width — sidebar overlays
      ══════════════════════════════════════════ */}
      <div className={`
        flex-1 h-screen relative
        pt-[57px] pb-[68px] lg:pt-0 lg:pb-0
        transition-[margin] duration-500 ease-in-out
        lg:ml-[68px]
        ${selectedDept && activeTab === 'map' ? 'lg:mr-[480px]' : ''}
      `}>
        {activeTab === 'home'    && <HomeView onMapClick={() => handleNav('map')} onUserClick={() => handleNav('user')} onCatalogClick={() => handleNav('catalog')} />}
        {activeTab === 'map'     && <MapaColombia />}
        {activeTab === 'catalog' && <CatalogView />}
        {activeTab === 'user'    && <UserView />}
      </div>

      {/* ── Blur overlay when side panel open (mobile) ── */}
      {selectedDept && activeTab === 'map' && (
        <div
          className="fixed inset-0 bg-brand-black/55 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={clearSelection}
          aria-hidden="true"
        />
      )}

      {/* ── Map side panel ── */}
      {activeTab === 'map' && <SidePanel />}

      {/* ══════════════════════════════════════════
          BOTTOM NAV — mobile / tablet (< lg)
          Pill indicator deslizante + haptic feel
      ══════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40
        flex items-center justify-around
        px-1 pt-1 pb-[env(safe-area-inset-bottom,8px)]
        bg-surface-low/95 backdrop-blur-xl border-t border-outline-soft/20
        min-h-[60px]">

        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const inner = (
            <div className="relative flex flex-col items-center gap-[3px] px-4 py-2">
              {/* Pill background deslizante */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-xl bg-brand-accent/12"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              {/* Dot indicator arriba del ícono */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute -top-[1px] w-1 h-1 rounded-full bg-brand-accent"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-all duration-250 relative z-10
                  ${isActive ? 'text-brand-accent' : 'text-on-surface-soft/40'}`}
              />
              <span
                className={`text-[9px] uppercase tracking-wider font-sans relative z-10
                  transition-colors duration-200
                  ${isActive ? 'text-brand-accent font-semibold' : 'text-on-surface-soft/35'}`}
              >
                {label}
              </span>
            </div>
          );

          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="cursor-pointer flex-1 flex justify-center"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {inner}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
