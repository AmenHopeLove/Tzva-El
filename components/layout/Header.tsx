'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { SystemRole } from '../../lib/types';
import {
  Shield,
  Filter,
  Search,
  Sparkles,
  LogOut,
  UserCheck,
  Menu,
  User
} from 'lucide-react';
import { AccountModal } from '../auth/AccountModal';

interface HeaderProps {
  onOpenAI: () => void;
  onSearch: (term: string) => void;
  onToggleMobileMenu: () => void;
}

export function Header({ onOpenAI, onSearch, onToggleMobileMenu }: HeaderProps) {
  const { currentUser, currentRole, setRole, activeChoirId, setActiveChoirId, availableChoirs, allChoirs, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  const roles: { key: SystemRole; label: string }[] = [
    { key: 'SUPER_ADMIN', label: 'Super Admin' },
    { key: 'CHOIR_LEADER', label: 'Choir Leader' },
    { key: 'MEMBER', label: 'Member' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const isSuperAdmin = currentRole === 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-md border-b border-orange-500/20 text-white px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Top Row (Mobile) / Left (Desktop): Menu Toggle, Logo & Mobile AI Button */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img
              src="/church-logo.png"
              alt="Church Official Logo"
              className="w-11 h-11 rounded-full object-cover border-2 border-orange-500/80 shadow-md shadow-orange-500/40 bg-white"
            />
            <div>
              <h1 className="font-extrabold text-base leading-tight tracking-tight text-white flex items-center gap-2">
                Worship Ministry <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Worship OS</span>
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">Church Worship Ministry</p>
            </div>
          </div>

          {/* Mobile-only AI Assistant Launcher */}
          <button
            onClick={onOpenAI}
            className="md:hidden flex items-center justify-center bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white w-8 h-8 rounded-full shadow-md shadow-orange-500/25"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
          </button>
        </div>

        {/* Second Row (Mobile) / Center (Desktop): Global Search */}
        <div className="w-full md:w-80 relative order-3 md:order-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search members, songs, setlists, events..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#0d1322] border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>

        {/* Third Row (Mobile) / Right (Desktop): Filters & Actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 order-2 md:order-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          
          {/* Multi-Choir Filter Dropdown */}
          <div className="flex items-center shrink-0 gap-2 bg-[#0d1322] border border-orange-500/30 rounded-full px-3 py-1.5 text-xs shadow-inner">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={activeChoirId}
              onChange={(e) => setActiveChoirId(e.target.value)}
              className="bg-transparent text-slate-200 font-bold border-none outline-none cursor-pointer pr-1 text-xs"
            >
              {isSuperAdmin && (
                <option value="ALL" className="bg-[#0b1120] text-amber-300 font-bold">
                  All Choirs Combined (Super Admin)
                </option>
              )}
              {availableChoirs.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0b1120] text-white">
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop AI Assistant Launcher */}
          <button
            onClick={onOpenAI}
            className="hidden md:flex items-center shrink-0 gap-1.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>Worship AI</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center shrink-0 gap-1.5 bg-[#0d1322] border border-slate-800 rounded-full px-3 py-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as SystemRole)}
              className="bg-transparent text-orange-400 font-bold border-none outline-none cursor-pointer text-xs"
            >
              {roles.map((r) => (
                <option key={r.key} value={r.key} className="bg-[#0b1120] text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Account & Security Settings */}
          <button
            onClick={() => setShowAccountModal(true)}
            title="My Account & Security"
            className="flex items-center shrink-0 gap-2 bg-[#0d1322] hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 rounded-full pl-1.5 pr-3 py-1 text-xs transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm shadow-orange-500/30">
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="font-semibold text-slate-200 group-hover:text-white hidden lg:inline max-w-[120px] truncate text-[11px]">
              {currentUser?.fullName || 'My Account'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign out of account"
            className="flex items-center shrink-0 gap-1.5 bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </div>

      {/* Account Profile & Password Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </header>
  );
}
