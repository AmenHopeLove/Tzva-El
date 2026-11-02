'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import {
  FollowUp,
  FollowUpStatus,
  FollowUpPriority,
  FollowUpCategory,
  PrayerRequest,
  Member
} from '../../lib/types';
import {
  HeartHandshake,
  Plus,
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  X,
  Search,
  Filter,
  Calendar,
  Trash2,
  Mail,
  MessageCircle,
  FileText,
  AlertCircle,
  Heart,
  RefreshCw,
  Printer,
  UserCheck,
  Users,
  Sparkles,
  ChevronRight,
  Shield,
  Stethoscope,
  Home,
  Check
} from 'lucide-react';

export function FollowUpModule() {
  const { activeChoirId, activeChoir, currentUser, hasPermission } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'tickets' | 'at_risk' | 'prayers'>('tickets');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Interaction Note Form State
  const [noteText, setNoteText] = useState('');
  const [contactMethod, setContactMethod] = useState<'Phone Call' | 'WhatsApp' | 'In-Person' | 'Email' | 'SMS' | 'Home/Hospital Visit'>('Phone Call');
  const [nextScheduleDate, setNextScheduleDate] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  // New Ticket Form State
  const [newMemberId, setNewMemberId] = useState('');
  const [customMemberName, setCustomMemberName] = useState('');
  const [newChoirId, setNewChoirId] = useState(activeChoirId !== 'ALL' ? activeChoirId : 'choir-1');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCategory, setNewCategory] = useState<FollowUpCategory>('ABSENTEEISM');
  const [newReason, setNewReason] = useState('');
  const [newPriority, setNewPriority] = useState<FollowUpPriority>('MEDIUM');
  const [newAssignedLeaderName, setNewAssignedLeaderName] = useState(currentUser?.fullName || 'Choir Leadership');
  const [newNextDate, setNewNextDate] = useState('');
  const [initialNote, setInitialNote] = useState('');

  // New Prayer Request Form State
  const [prayerMemberId, setPrayerMemberId] = useState('');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [prayerPrivacy, setPrayerPrivacy] = useState<'PRIVATE_TO_LEADER' | 'CHOIR_LEADERSHIP' | 'WORSHIP_LEADERSHIP'>('CHOIR_LEADERSHIP');

  // Data Refresh Callback
  const refreshData = useCallback(() => {
    const list = DataStore.getFollowUps(activeChoirId);
    setFollowUps(list);
    setPrayerRequests(DataStore.getPrayerRequests(activeChoirId));
    setMembers(DataStore.getMembers(activeChoirId));

    setSelectedFollowUp((current) => {
      if (current) {
        return list.find((f) => f.id === current.id) || null;
      } else if (list.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        // Default to first item on desktop
        return list[0];
      }
      return null;
    });
  }, [activeChoirId]);

  useEffect(() => {
    refreshData();
  }, [activeChoirId]);

  useEffect(() => {
    const handleUpdate = () => {
      refreshData();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('worship_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('worship_data_updated', handleUpdate);
    };
  }, [refreshData]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = followUps.length;
    const urgentHigh = followUps.filter((f) => f.priority === 'URGENT' || f.priority === 'HIGH').length;
    const inProgress = followUps.filter((f) => f.status === 'IN_PROGRESS' || f.status === 'CONTACTED').length;
    const completed = followUps.filter((f) => f.status === 'COMPLETED').length;
    const atRiskCount = members.filter((m) => m.consecutiveAbsences >= 2).length;
    const answeredPrayers = prayerRequests.filter((p) => p.isAnswered).length;
    return { total, urgentHigh, inProgress, completed, atRiskCount, answeredPrayers };
  }, [followUps, members, prayerRequests]);

  // Filtered tickets
  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      // Search
      const search = searchQuery.toLowerCase().trim();
      const matchSearch =
        !search ||
        item.memberName.toLowerCase().includes(search) ||
        item.reason.toLowerCase().includes(search) ||
        (item.phone && item.phone.includes(search)) ||
        item.notesHistory.some((n) => n.note.toLowerCase().includes(search));

      // Status
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      // Priority
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      // Category
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [followUps, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // At-Risk Members
  const atRiskMembers = useMemo(() => {
    return members.filter((m) => m.consecutiveAbsences >= 2);
  }, [members]);

  // Handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp || !noteText.trim()) return;

    DataStore.addFollowUpNote(
      selectedFollowUp.id,
      noteText.trim(),
      currentUser?.fullName || 'Worship Leader',
      contactMethod,
      nextScheduleDate || undefined
    );
    setNoteText('');
    setNextScheduleDate('');
    refreshData();
  };

  const handleStatusChange = (newStatus: FollowUpStatus) => {
    if (!selectedFollowUp) return;
    const updated: FollowUp = { ...selectedFollowUp, status: newStatus };
    DataStore.updateFollowUp(updated, currentUser?.fullName);
    setSelectedFollowUp(updated);
    refreshData();
  };

  const handlePriorityChange = (newPriority: FollowUpPriority) => {
    if (!selectedFollowUp) return;
    const updated: FollowUp = { ...selectedFollowUp, priority: newPriority };
    DataStore.updateFollowUp(updated, currentUser?.fullName);
    setSelectedFollowUp(updated);
    refreshData();
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this pastoral care ticket?')) {
      DataStore.deleteFollowUp(id, currentUser?.fullName);
      if (selectedFollowUp?.id === id) {
        setSelectedFollowUp(null);
      }
      refreshData();
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members.find((m) => m.id === newMemberId);
    const memberName = selectedMember ? selectedMember.fullName : customMemberName.trim();

    if (!memberName) {
      alert('Please select or specify a member name');
      return;
    }

    const created = DataStore.createFollowUp(
      {
        choirId: selectedMember?.primaryChoirId || newChoirId,
        memberId: selectedMember?.id || `mem-${Date.now()}`,
        memberName,
        reason: newReason || 'General Pastoral Check-in and Spiritual Support',
        category: newCategory,
        phone: newPhone || selectedMember?.phone || '',
        email: newEmail || selectedMember?.email || '',
        priority: newPriority,
        status: 'NEW',
        assignedLeaderName: newAssignedLeaderName,
        nextFollowUpDate: newNextDate || undefined,
        notesHistory: initialNote
          ? [
              {
                id: `fn-${Date.now()}`,
                authorName: currentUser?.fullName || 'Leader',
                note: initialNote,
                contactMethod: 'Phone Call',
                createdAt: new Date().toLocaleDateString()
              }
            ]
          : []
      },
      currentUser?.fullName
    );

    setShowAddModal(false);
    resetNewForm();
    refreshData();
    setSelectedFollowUp(created);
  };

  const resetNewForm = () => {
    setNewMemberId('');
    setCustomMemberName('');
    setNewPhone('');
    setNewEmail('');
    setNewCategory('ABSENTEEISM');
    setNewReason('');
    setNewPriority('MEDIUM');
    setNewNextDate('');
    setInitialNote('');
  };

  const handleStartFollowUpForMember = (member: Member) => {
    setNewMemberId(member.id);
    setNewPhone(member.phone || '');
    setNewEmail(member.email || '');
    setNewCategory('ABSENTEEISM');
    setNewReason(`${member.consecutiveAbsences} Consecutive Absences; requires pastoral check-in & spiritual support`);
    setNewPriority('HIGH');
    setNewChoirId(member.primaryChoirId);
    setShowAddModal(true);
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle.trim()) return;

    const selectedMember = members.find((m) => m.id === prayerMemberId);
    DataStore.savePrayerRequest(
      {
        choirId: selectedMember?.primaryChoirId || (activeChoirId !== 'ALL' ? activeChoirId : 'choir-1'),
        memberId: selectedMember?.id || 'general',
        memberName: selectedMember ? selectedMember.fullName : 'Choir Member',
        title: prayerTitle.trim(),
        description: prayerDescription.trim(),
        privacyLevel: prayerPrivacy
      },
      currentUser?.fullName
    );

    setShowPrayerModal(false);
    setPrayerTitle('');
    setPrayerDescription('');
    setPrayerMemberId('');
    refreshData();
  };

  const handleTogglePrayer = (prayer: PrayerRequest) => {
    DataStore.togglePrayerAnswered(prayer.id, !prayer.isAnswered, currentUser?.fullName);
    refreshData();
  };

  const handleDeletePrayer = (id: string) => {
    if (confirm('Delete this prayer request?')) {
      DataStore.deletePrayerRequest(id, currentUser?.fullName);
      refreshData();
    }
  };

  const handleResetSampleData = () => {
    if (confirm('Load demo pastoral care cases and prayer requests? This will populate sample records.')) {
      DataStore.resetSampleFollowUps();
      refreshData();
    }
  };

  // Badges & UI helpers
  const priorityBadges: Record<FollowUpPriority, { label: string; badge: string; border: string }> = {
    URGENT: { label: 'URGENT', badge: 'bg-rose-500/20 text-rose-300', border: 'border-rose-500/40' },
    HIGH: { label: 'HIGH', badge: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
    MEDIUM: { label: 'MEDIUM', badge: 'bg-indigo-500/20 text-indigo-300', border: 'border-indigo-500/40' },
    LOW: { label: 'LOW', badge: 'bg-slate-500/20 text-slate-300', border: 'border-slate-700' }
  };

  const statusBadges: Record<FollowUpStatus, { label: string; dot: string; badge: string }> = {
    NEW: { label: 'New Alert', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
    CONTACTED: { label: 'Contacted', dot: 'bg-yellow-400', badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-indigo-400', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    WAITING: { label: 'Waiting on Member', dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    COMPLETED: { label: 'Resolved / Well', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    ESCALATED: { label: 'Escalated to Pastor', dot: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' }
  };

  const categoryIcons: Record<FollowUpCategory, React.ReactNode> = {
    ABSENTEEISM: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    ILLNESS: <Stethoscope className="w-3.5 h-3.5 text-rose-400" />,
    BEREAVEMENT: <Heart className="w-3.5 h-3.5 text-purple-400" />,
    SPIRITUAL_SUPPORT: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
    FAMILY_VISIT: <Home className="w-3.5 h-3.5 text-teal-400" />,
    MENTORSHIP: <Shield className="w-3.5 h-3.5 text-blue-400" />,
    WELLNESS_CHECK: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
    OTHER: <FileText className="w-3.5 h-3.5 text-slate-400" />
  };

  const getCleanPhone = (phone?: string) => {
    return phone ? phone.replace(/[^0-9]/g, '') : '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <HeartHandshake className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Pastoral Care & Member Shepherding
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeChoir?.name || 'All Choirs'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Member wellness, absent member check-ins, bereavement support, hospital visitation & prayer intercession.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              resetNewForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Care Ticket
          </button>

          <button
            onClick={() => setShowPrayerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Submit Prayer
          </button>

          <button
            onClick={handleResetSampleData}
            title="Load or reload demo pastoral records"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            Load Demo Data
          </button>

          <button
            onClick={() => window.print()}
            title="Print Pastoral Summary"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cases</span>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Active Ministry
          </div>
        </div>

        <div className="bg-slate-900/90 border border-rose-500/20 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Urgent & High</span>
          <div className="text-2xl font-black text-rose-400">{stats.urgentHigh}</div>
          <div className="text-[10px] text-rose-300/80 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Needs Immediate Care
          </div>
        </div>

        <div className="bg-slate-900/90 border border-indigo-500/20 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">In Progress</span>
          <div className="text-2xl font-black text-indigo-400">{stats.inProgress}</div>
          <div className="text-[10px] text-indigo-300/80 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> Calls & Visits Active
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/20 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Resolved / Well</span>
          <div className="text-2xl font-black text-emerald-400">{stats.completed}</div>
          <div className="text-[10px] text-emerald-300/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Restored to Health
          </div>
        </div>

        <div
          onClick={() => setActiveTab('at_risk')}
          className="bg-slate-900/90 border border-amber-500/20 p-4 rounded-xl space-y-1 cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Absence Alerts</span>
          <div className="text-2xl font-black text-amber-400">{stats.atRiskCount}</div>
          <div className="text-[10px] text-amber-300/80 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> 2+ Missed Sessions
          </div>
        </div>

        <div
          onClick={() => setActiveTab('prayers')}
          className="bg-slate-900/90 border border-purple-500/20 p-4 rounded-xl space-y-1 cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Answered Prayers</span>
          <div className="text-2xl font-black text-purple-400">{stats.answeredPrayers}</div>
          <div className="text-[10px] text-purple-300/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Testimonies Logged
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'tickets'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Care Tickets & Follow-Ups ({followUps.length})
        </button>

        <button
          onClick={() => setActiveTab('at_risk')}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'at_risk'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Attendance At-Risk Alerts ({stats.atRiskCount})
        </button>

        <button
          onClick={() => setActiveTab('prayers')}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'prayers'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Prayer Requests & Needs ({prayerRequests.length})
        </button>
      </div>

      {/* TAB 1: TICKETS & WORKSPACE */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by member name, phone, reason, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New Alert</option>
                <option value="CONTACTED">Contacted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting on Member</option>
                <option value="COMPLETED">Resolved / Well</option>
                <option value="ESCALATED">Escalated</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="ABSENTEEISM">Absenteeism</option>
                <option value="ILLNESS">Illness & Health</option>
                <option value="BEREAVEMENT">Bereavement</option>
                <option value="SPIRITUAL_SUPPORT">Spiritual Support</option>
                <option value="FAMILY_VISIT">Family & Home Visit</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="WELLNESS_CHECK">Wellness Check</option>
                <option value="OTHER">Other</option>
              </select>

              {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Split: Ticket List (Left) & Ticket Workspace (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Tickets (5 cols on lg) */}
            <div className={`space-y-3 lg:col-span-5 ${selectedFollowUp ? 'hidden lg:block' : 'block'}`}>
              {filteredFollowUps.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Pastoral Tickets Found</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {searchQuery || statusFilter !== 'ALL'
                      ? 'No care records match your search or filter criteria.'
                      : 'There are currently no active pastoral care follow-ups in this choir.'}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      + Create First Ticket
                    </button>
                    <button
                      onClick={handleResetSampleData}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
                    >
                      Load Demo Records
                    </button>
                  </div>
                </div>
              ) : (
                filteredFollowUps.map((item) => {
                  const isSelected = selectedFollowUp?.id === item.id;
                  const pri = priorityBadges[item.priority] || priorityBadges.MEDIUM;
                  const stat = statusBadges[item.status] || statusBadges.NEW;
                  const cat = item.category || 'WELLNESS_CHECK';
                  const cleanPhone = getCleanPhone(item.phone);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFollowUp(item)}
                      className={`bg-slate-900 border rounded-2xl p-4 transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-slate-900/95 ring-1 ring-indigo-500/50 shadow-xl'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Card Top: Badges & Category */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pri.badge} ${pri.border}`}>
                            {pri.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${stat.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                            {stat.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.createdAt}
                        </span>
                      </div>

                      {/* Member Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-sm">
                          {item.memberName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                            {item.memberName}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.choirName || 'Worship Team'}
                          </p>
                        </div>

                        {/* Quick Contact Icons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {cleanPhone && (
                            <>
                              <a
                                href={`tel:${cleanPhone}`}
                                title={`Call ${item.memberName}`}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-all"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(item.memberName)},%20checking%20in%20on%20you%20from%20the%20worship%20team.`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp chat"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 transition-all"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reason Box */}
                      <div className="text-xs text-rose-300/90 bg-rose-950/30 border border-rose-500/20 px-3 py-2 rounded-xl flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">{categoryIcons[cat]}</span>
                        <span className="line-clamp-2">{item.reason}</span>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="truncate max-w-[180px]">
                          Leader: <span className="text-slate-300">{item.assignedLeaderName || 'Leadership'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-indigo-400 font-medium">
                          <MessageSquare className="w-3 h-3" />
                          {item.notesHistory.length} note(s)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Active Ticket Workspace (7 cols on lg) */}
            <div className={`lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 ${!selectedFollowUp ? 'hidden lg:block' : 'block'}`}>
              {selectedFollowUp ? (
                <>
                  {/* Mobile Back Button */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setSelectedFollowUp(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold border border-slate-700 transition-all mb-1"
                    >
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      Back to Ticket List
                    </button>
                  </div>

                  {/* Workspace Header */}
                  <div className="border-b border-slate-800 pb-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            Active Pastoral Case
                          </span>
                          <span className="text-xs text-slate-400">ID: {selectedFollowUp.id}</span>
                        </div>
                        <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                          {selectedFollowUp.memberName}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {selectedFollowUp.choirName || 'Worship Ministry Member'}
                        </p>
                      </div>

                      {/* Quick Communication Actions & Status Shortcuts */}
                      <div className="flex items-center flex-wrap gap-2">
                        {selectedFollowUp.status === 'COMPLETED' ? (
                          <button
                            onClick={() => handleStatusChange('IN_PROGRESS')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                            title="Reopen Pastoral Case"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            Reopen
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40 transition-all"
                            title="Mark Case as Resolved"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Mark Resolved
                          </button>
                        )}
                        {selectedFollowUp.phone && (
                          <>
                            <a
                              href={`tel:${getCleanPhone(selectedFollowUp.phone)}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${getCleanPhone(selectedFollowUp.phone)}?text=Hi%20${encodeURIComponent(selectedFollowUp.memberName)},%20checking%20in%20on%20you%20from%20the%20worship%20team.`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              WhatsApp
                            </a>
                          </>
                        )}
                        {selectedFollowUp.email && (
                          <a
                            href={`mailto:${selectedFollowUp.email}?subject=Pastoral%20Care%20Check-in`}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteTicket(selectedFollowUp.id)}
                          className="p-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 rounded-lg border border-rose-500/30 transition-all"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Status & Priority Switchers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Workflow Status
                        </label>
                        <select
                          value={selectedFollowUp.status}
                          onChange={(e) => handleStatusChange(e.target.value as FollowUpStatus)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="NEW">New Alert</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="WAITING">Waiting on Member</option>
                          <option value="COMPLETED">Resolved / Well</option>
                          <option value="ESCALATED">Escalated to Pastor</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Priority Level
                        </label>
                        <select
                          value={selectedFollowUp.priority}
                          onChange={(e) => handlePriorityChange(e.target.value as FollowUpPriority)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="URGENT">URGENT</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Next Follow-Up Due
                        </label>
                        <div className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{selectedFollowUp.nextFollowUpDate || 'Not scheduled'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Case Context & Primary Reason */}
                  <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        {categoryIcons[selectedFollowUp.category || 'WELLNESS_CHECK']}
                        Primary Care Need / Reason
                      </span>
                      <span>Assigned: {selectedFollowUp.assignedLeaderName || 'Leadership'}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {selectedFollowUp.reason}
                    </p>
                  </div>

                  {/* Log Interaction Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-3 bg-slate-800/70 border border-slate-700/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-rose-400" />
                        Log Interaction & Pastoral Note
                      </span>
                      <span className="text-[10px] text-slate-400">Author: {currentUser?.fullName || 'Leader'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Contact Method</label>
                        <select
                          value={contactMethod}
                          onChange={(e) => setContactMethod(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                        >
                          <option value="Phone Call">📞 Phone Call</option>
                          <option value="WhatsApp">💬 WhatsApp</option>
                          <option value="In-Person">🤝 In-Person Fellowship</option>
                          <option value="Home/Hospital Visit">🏥 Home/Hospital Visit</option>
                          <option value="Email">✉️ Email</option>
                          <option value="SMS">📱 SMS Text</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Schedule Next Follow-Up (Optional)</label>
                        <input
                          type="date"
                          value={nextScheduleDate}
                          onChange={(e) => setNextScheduleDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      required
                      placeholder="Record pastoral observations, member response, prayer points, home visit notes, or agreed recovery steps..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Submitting will auto-advance status to Contacted.
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        Add Pastoral Note
                      </button>
                    </div>
                  </form>

                  {/* Chronological Interaction Timeline */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Interaction & Shepherding Timeline ({selectedFollowUp.notesHistory.length})
                      </h3>
                    </div>

                    {selectedFollowUp.notesHistory.length === 0 ? (
                      <div className="bg-slate-800/30 border border-slate-800/80 rounded-xl p-5 text-center text-xs text-slate-400">
                        No interaction notes logged yet. Use the form above to record your first phone call, visit, or message.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedFollowUp.notesHistory.map((n) => (
                          <div
                            key={n.id}
                            className="bg-slate-800/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs relative pl-4 border-l-2 border-l-indigo-500"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                                {n.authorName}
                                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                  {n.contactMethod}
                                </span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{n.createdAt}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center space-y-3 text-slate-400">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Ticket Selected</h3>
                  <p className="text-xs max-w-xs mx-auto">
                    Select a pastoral ticket from the left list to review shepherding history, update workflow status, or log a new call/visit.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE AT-RISK ALERTS */}
      {activeTab === 'at_risk' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Attendance-Based Care Alerts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Members with 2 or more consecutive absences across rehearsals and Sunday services. Proactively reach out before they disconnect.
              </p>
            </div>
            <button
              onClick={() => {
                resetNewForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              + Create Custom Care Ticket
            </button>
          </div>

          {atRiskMembers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Healthy Attendance! No At-Risk Absences</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All choir members are in good attendance standing (fewer than 2 consecutive absences).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atRiskMembers.map((m) => {
                const hasOpenTicket = followUps.some(
                  (f) => f.memberId === m.id && f.status !== 'COMPLETED'
                );

                return (
                  <div
                    key={m.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-white">{m.fullName}</h4>
                        <span className="text-[11px] text-slate-400">{m.choirName} • {m.vocalPart}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                        {m.consecutiveAbsences} Absences
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono">{m.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Status:</span>
                        <span>{m.status}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-2">
                      {hasOpenTicket ? (
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Care Ticket Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartFollowUpForMember(m)}
                          className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <HeartHandshake className="w-4 h-4" />
                          Start Pastoral Care
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRAYER REQUESTS & INTERCESSION */}
      {activeTab === 'prayers' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Intercessory Prayer Requests & Testimonies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Confidential prayer requests submitted for choir members and leaders. Celebrate answered prayers!
              </p>
            </div>
            <button
              onClick={() => setShowPrayerModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Prayer Request
            </button>
          </div>

          {prayerRequests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Prayer Requests Logged</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Keep the worship ministry covered in prayer. Submit a prayer request for healing, family, or spiritual growth.
              </p>
              <button
                onClick={() => setShowPrayerModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                + Submit Prayer Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prayerRequests.map((p) => (
                <div
                  key={p.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-3 transition-all ${
                    p.isAnswered
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {p.privacyLevel.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{p.createdAt}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      For: <span className="text-indigo-300 font-medium">{p.memberName}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-800/40 border border-slate-800 p-3 rounded-xl leading-relaxed">
                    {p.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <button
                      onClick={() => handleTogglePrayer(p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                        p.isAnswered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700'
                      }`}
                    >
                      {p.isAnswered ? '🙏 Answered Prayer!' : 'Mark Answered 🙏'}
                    </button>

                    <button
                      onClick={() => handleDeletePrayer(p.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete Prayer Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: NEW PASTORAL CARE TICKET */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
                Create Pastoral Care Ticket
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              {/* Member Selection */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Select Choir Member</label>
                <select
                  value={newMemberId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setNewMemberId(id);
                    const found = members.find((m) => m.id === id);
                    if (found) {
                      setNewPhone(found.phone || '');
                      setNewEmail(found.email || '');
                      setNewChoirId(found.primaryChoirId);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose from Choir Member Directory --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.choirName} • {m.vocalPart})
                    </option>
                  ))}
                </select>
              </div>

              {!newMemberId && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Or Enter Name (Guest / Visitor / Unregistered)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Grace Johnson"
                    value={customMemberName}
                    onChange={(e) => setCustomMemberName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Phone Number (for WhatsApp/Call)</label>
                  <input
                    type="text"
                    placeholder="+1 555 123 4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Email Address</label>
                  <input
                    type="email"
                    placeholder="member@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Care Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FollowUpCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ABSENTEEISM">Absenteeism & Attendance</option>
                    <option value="ILLNESS">Illness & Medical Need</option>
                    <option value="BEREAVEMENT">Bereavement & Grief</option>
                    <option value="SPIRITUAL_SUPPORT">Spiritual Support / Guidance</option>
                    <option value="FAMILY_VISIT">Home / Family Visit</option>
                    <option value="MENTORSHIP">Mentorship & Leadership</option>
                    <option value="WELLNESS_CHECK">General Wellness Check</option>
                    <option value="OTHER">Other / Special Request</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as FollowUpPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Important)</option>
                    <option value="URGENT">Urgent (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Leader & Scheduled Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Assigned Leader</label>
                  <input
                    type="text"
                    value={newAssignedLeaderName}
                    onChange={(e) => setNewAssignedLeaderName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Follow-Up Target Date</label>
                  <input
                    type="date"
                    value={newNextDate}
                    onChange={(e) => setNewNextDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Reason / Circumstance */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Reason / Pastoral Need Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Hospitalized for appendectomy; requested prayer from choir leadership and home visitation..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Initial Note */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Initial Interaction Note (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Record any phone call or initial check-in already performed..."
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT PRAYER REQUEST */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Submit Prayer Request
              </h3>
              <button
                onClick={() => setShowPrayerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">For Member (Optional)</label>
                <select
                  value={prayerMemberId}
                  onChange={(e) => setPrayerMemberId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">General / Entire Choir</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.choirName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Prayer Title / Core Request *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete recovery from vocal infection"
                  value={prayerTitle}
                  onChange={(e) => setPrayerTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Prayer Details & Scripture Focus</label>
                <textarea
                  rows={3}
                  placeholder="Describe the circumstance, timeline, and prayer points..."
                  value={prayerDescription}
                  onChange={(e) => setPrayerDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Confidentiality Level</label>
                <select
                  value={prayerPrivacy}
                  onChange={(e) => setPrayerPrivacy(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="CHOIR_LEADERSHIP">Choir Leadership Team</option>
                  <option value="WORSHIP_LEADERSHIP">Worship Ministry Executive</option>
                  <option value="PRIVATE_TO_LEADER">Confidential - Private to Lead Pastor</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrayerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Submit Prayer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
