'use client';

import React, { useState, useEffect } from 'react';
import { Home, Map, BookOpen, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { useCoffeeStore } from '@/store/coffeeStore';
import MapaColombia from '@/components/MapaColombia';
import SidePanel from '@/components/SidePanel';
import HomeView from '@/components/views/HomeView';
import CatalogView from '@/components/views/CatalogView';
import UserView from '@/components/views/UserView';

const NAV_ITEMS = [
  { id: 'home',    icon: Home,     label: 'Inicio',   href: undefined },
  { id: 'map',     icon: Map,      label: 'Mapa',     href: undefined },
  { id: 'catalog', icon: BookOpen, label: 'Catálogo', href: undefined },
  { id: 'user',    icon: User,     label: 'Usuario',  href: undefined },
] as const;

export default function HomePage() {
  const { loadActiveDepts, selectedDept, clearSelection } = useCoffeeStore();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deposito_active_tab') ?? 'home';
    }
    return 'home';
  });

  useEffect(() => {
    loadActiveDepts();
  }, [loadActiveDepts]);

  const handleNav = (id: string) => {
    setActiveTab(id);
    localStorage.setItem('deposito_active_tab', id);
    if (id === 'home' || id === 'catalog' || id === 'user') clearSelection();
  };

  return (
    <main className="bg-brand-black text-brand-white overflow-hidden relative flex flex-col lg:flex-row h-screen selection:bg-brand-accent/20">

      {/* ══════════════════════════════════════════
          LEFT SIDEBAR — desktop only (lg+)
      ══════════════════════════════════════════ */}
      <nav className="hidden lg:flex flex-col items-center py-8 px-3 gap-6 z-30
        fixed left-0 top-0 bottom-0 w-[68px]
        bg-surface-low/80 backdrop-blur-xl border-r border-outline-soft/20">

        {/* Isotipo */}
        <div className="mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Isotipo.svg" alt="El Depósito" className="w-9 h-9 drop-shadow-lg" />
        </div>

        {/* Nav icons */}
        {NAV_ITEMS.map(({ id, icon: Icon, label, href }) => {
          const isActive = activeTab === id;
          const cls = `group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300
            ${isActive
              ? 'bg-brand-accent/15 text-brand-accent shadow-[0_0_12px_rgba(47,163,107,0.15)]'
              : 'text-on-surface-soft/40 hover:text-on-surface-soft hover:bg-surface-high/50'
            }`;
          return href ? (
            <Link key={id} href={href} title={label} className={cls} onClick={() => setActiveTab(id)}>
              <Icon className="w-5 h-5" />
            </Link>
          ) : (
            <button key={id} title={label} onClick={() => handleNav(id)} className={`${cls} cursor-pointer`}>
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════
          TOP HEADER — mobile / tablet (< lg)
      ══════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 flex justify-center items-center
        px-5 py-4 bg-brand-black/85 backdrop-blur-md border-b border-outline-soft/10">
        <span className="font-serif text-xl font-medium text-brand-accent tracking-wide">
          El Depósito
        </span>
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════ */}
      <div className={`
        flex-1 h-screen relative
        pt-[57px] pb-[68px] lg:pt-0 lg:pb-0
        transition-all duration-500 ease-in-out
        lg:ml-[68px]
        ${selectedDept && activeTab === 'map' ? 'lg:mr-[480px]' : ''}
      `}>
        {activeTab === 'home' && <HomeView onMapClick={() => setActiveTab('map')} onUserClick={() => setActiveTab('user')} />}
        {activeTab === 'map' && <MapaColombia />}
        {activeTab === 'catalog' && <CatalogView />}
        {activeTab === 'user' && <UserView />}
      </div>

      {/* ── Blur overlay when side panel is open (mobile only) ── */}
      {selectedDept && activeTab === 'map' && (
        <div
          className="fixed inset-0 bg-brand-black/55 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={clearSelection}
          aria-hidden="true"
        />
      )}

      {/* ── Side panel (only visible in map view) ── */}
      {activeTab === 'map' && <SidePanel />}

      {/* ══════════════════════════════════════════
          BOTTOM NAV — mobile / tablet (< lg)
      ══════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40
        flex items-center justify-around
        px-2 py-2 bg-surface-low/95 backdrop-blur-xl border-t border-outline-soft/20">

        {NAV_ITEMS.map(({ id, icon: Icon, label, href }) => {
          const isActive = activeTab === id;
          const inner = (
            <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300
              ${isActive
                ? 'bg-brand-accent/15 text-brand-accent'
                : 'text-on-surface-soft/35 hover:text-on-surface-soft/70'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">{label}</span>
            </div>
          );
          return href ? (
            <Link key={id} href={href} onClick={() => setActiveTab(id)}>{inner}</Link>
          ) : (
            <button key={id} onClick={() => handleNav(id)} className="cursor-pointer">{inner}</button>
          );
        })}
      </nav>
    </main>
  );
}
