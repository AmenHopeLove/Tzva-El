'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  HeartHandshake,
  Calendar,
  Music,
  Clock,
  Send,
  FileText,
  PieChart,
  Settings
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'members'
  | 'attendance'
  | 'followup'
  | 'events'
  | 'songs'
  | 'rehearsals'
  | 'leave_requests'
  | 'announcements'
  | 'reports'
  | 'admin';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasPermission: (perm: any) => boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function Navigation({ activeTab, onSelectTab, hasPermission, isMobileMenuOpen = false, setIsMobileMenuOpen }: NavigationProps) {
  const navItems: { id: NavTab; label: string; icon: any; permission?: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users, permission: 'members.view' },
    { id: 'attendance', label: 'Attendance Portal', icon: CheckCircle2, permission: 'attendance.view', badge: '1-Tap' },
    { id: 'followup', label: 'Pastoral Care', icon: HeartHandshake, permission: 'followup.view', badge: 'Care' },
    { id: 'events', label: 'Events & Calendar', icon: Calendar, permission: 'events.view' },
    { id: 'songs', label: 'Song Library & Setlists', icon: Music, permission: 'songs.view' },
    { id: 'rehearsals', label: 'Rehearsal Manager', icon: Clock, permission: 'attendance.create' },
    { id: 'leave_requests', label: 'Leave Requests', icon: FileText, permission: 'members.view' },
    { id: 'announcements', label: 'Announcements', icon: Send, permission: 'members.view' },
    { id: 'reports', label: 'Reports & Analytics', icon: PieChart, permission: 'reports.view' },
    { id: 'admin', label: 'User Accounts & Admin', icon: Settings, permission: 'settings.manage' }
  ];

  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Navigation Sidebar / Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-auto
        flex flex-col w-64 bg-[#080c14]/95 backdrop-blur-md md:bg-[#080c14]/90 
        border-r border-orange-500/10 p-4 min-h-screen md:min-h-[calc(100vh-65px)]
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-3 px-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
            Worship Modules
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar pb-20 md:pb-0">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/25 font-bold'
                    : 'text-slate-300 hover:bg-[#0e1526] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
