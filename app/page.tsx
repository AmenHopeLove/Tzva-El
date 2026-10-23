'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { Header } from '../components/layout/Header';
import { Navigation, NavTab } from '../components/layout/Navigation';
import { Dashboard } from '../components/dashboard/Dashboard';
import { MemberManagement } from '../components/members/MemberManagement';
import { AttendanceModule } from '../components/attendance/AttendanceModule';
import { FollowUpModule } from '../components/followup/FollowUpModule';
import { EventModule } from '../components/events/EventModule';
import { SongModule } from '../components/songs/SongModule';
import { AdminCustomization } from '../components/admin/AdminCustomization';
import { UserManagement } from '../components/admin/UserManagement';
import { LoginPage } from '../components/auth/LoginPage';
import { AIAssistant } from '../components/ai/AIAssistant';
import { ShieldAlert, Lock } from 'lucide-react';

export default function MainPage() {
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showAI, setShowAI] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication Gate
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'members':
      case 'leave_requests':
        return <MemberManagement />;
      case 'attendance':
      case 'rehearsals':
        return <AttendanceModule />;
      case 'followup':
        if (!hasPermission('followup.view')) {
          return (
            <div className="bg-[#0b1120] border border-rose-500/30 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Pastoral Care Access Restricted</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Pastoral Care and Member Follow-ups are reserved for Choir Leaders and Pastoral Ministry Staff.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <FollowUpModule />;
      case 'events':
        return <EventModule />;
      case 'songs':
        return <SongModule />;
      case 'admin':
        if (!hasPermission('settings.manage') && currentUser?.role !== 'SUPER_ADMIN') {
          return (
            <div className="bg-[#0b1120] border border-rose-500/30 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Super Admin Access Only</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You do not have administrative privileges to access Super Admin User Accounts & System Settings.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-extrabold text-xs rounded-full shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <UserManagement />
            <AdminCustomization />
          </div>
        );
      case 'reports':
        if (!hasPermission('reports.view')) {
          return (
            <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Reports & Analytics Restricted</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Analytics and reports are accessible to Ministry Leaders and Administrators.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <AdminCustomization />;
      case 'announcements':
        return <AdminCustomization />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex flex-col font-sans">
      {/* Global Header */}
      <Header
        onOpenAI={() => setShowAI(true)}
        onSearch={(term) => setGlobalSearch(term)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-6">
        {/* Responsive Desktop Sidebar / Mobile Navigation */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false); // Close menu on select
          }}
          hasPermission={hasPermission}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden space-y-6">
          {renderActiveModule()}
        </main>
      </div>

      {/* Worship AI Assistant Drawer */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
}
