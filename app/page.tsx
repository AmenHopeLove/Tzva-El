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

export default function MainPage() {
  const { isAuthenticated, hasPermission } = useAuth();
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
        return <FollowUpModule />;
      case 'events':
        return <EventModule />;
      case 'songs':
        return <SongModule />;
      case 'admin':
        return (
          <div className="space-y-8">
            <UserManagement />
            <AdminCustomization />
          </div>
        );
      case 'reports':
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
