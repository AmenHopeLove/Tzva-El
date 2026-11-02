'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { Member, VocalPart, SkillLevel } from '../../lib/types';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  X,
  SlidersHorizontal,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageCircle
} from 'lucide-react';

export function MemberManagement() {
  const { activeChoirId, setActiveChoirId, activeChoir, availableChoirs, allChoirs, hasPermission, currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>(() => DataStore.getMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [vocalFilter, setVocalFilter] = useState<string>('ALL');
  const [choirFilter, setChoirFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'PENDING' | 'ALL'>('ACTIVE');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [primaryChoirId, setPrimaryChoirId] = useState(allChoirs[0]?.id || 'choir-1');
  const [vocalPart, setVocalPart] = useState<VocalPart>('Soprano');
  const [instrument, setInstrument] = useState('None');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');

  const refreshList = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await DataStore.syncFromSupabase();
    } catch (e) {
      console.warn('Supabase sync note:', e);
    } finally {
      setMembers(DataStore.getMembers());
      setIsRefreshing(false);
    }
  }, []);

  // Refresh members whenever activeChoirId changes
  useEffect(() => {
    refreshList();
  }, [refreshList, activeChoirId]);

  // Synchronize across tabs and listen for local data updates
  useEffect(() => {
    const handleUpdate = () => {
      refreshList();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('worship_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('worship_data_updated', handleUpdate);
    };
  }, [refreshList]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    DataStore.saveMember({
      fullName,
      email,
      phone,
      birthday,
      primaryChoirId,
      vocalPart,
      instrument,
      skillLevel,
      status: 'ACTIVE'
    });
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setBirthday('');
    refreshList();
  };

  const isLeader =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'CHOIR_LEADER' ||
    currentUser?.role === 'CHOIR_ADMIN' ||
    currentUser?.role === 'WORSHIP_MINISTRY_LEADER';

  const canViewAllChoirs = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'WORSHIP_MINISTRY_LEADER';
  const allowedChoirIds = currentUser?.assignedChoirIds || (currentUser?.primaryChoirId ? [currentUser.primaryChoirId] : []);

  const handleApprove = (member: Member) => {
    DataStore.approveMemberRequest(member.id, currentUser?.fullName || 'Choir Leader');
    refreshList();
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
    }
  };

  const handleDeny = (member: Member) => {
    if (confirm(`Are you sure you want to deny registration for '${member.fullName}'?`)) {
      DataStore.denyMemberRequest(member.id, 'Denied by Choir Leader', currentUser?.fullName || 'Choir Leader');
      refreshList();
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
      }
    }
  };

  // Scoped lists
  const pendingMembers = members.filter((m) => {
    if (!canViewAllChoirs && !allowedChoirIds.includes(m.primaryChoirId)) {
      return false;
    }
    return m.status === 'PENDING_APPROVAL';
  });

  const activeMembers = members.filter((m) => {
    if (!canViewAllChoirs && !allowedChoirIds.includes(m.primaryChoirId)) {
      return false;
    }
    return m.status !== 'PENDING_APPROVAL' && m.status !== 'DENIED';
  });

  const displayedMembers = members.filter((m) => {
    if (!canViewAllChoirs && !allowedChoirIds.includes(m.primaryChoirId)) {
      return false;
    }
    if (viewMode === 'PENDING' && m.status !== 'PENDING_APPROVAL') {
      return false;
    }
    if (viewMode === 'ACTIVE' && (m.status === 'PENDING_APPROVAL' || m.status === 'DENIED')) {
      return false;
    }

    const matchSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    const matchVocal = vocalFilter === 'ALL' || m.vocalPart === vocalFilter;
    const matchChoir = choirFilter === 'ALL' || m.primaryChoirId === choirFilter;
    return matchSearch && matchVocal && matchChoir;
  });

  return (
    <div className="space-y-6">
      {/* Pending Membership Requests Alert Banner (For Choir Leaders & Super Admin) */}
      {isLeader && pendingMembers.length > 0 && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                Action Required: {pendingMembers.length} Prospective Member Registration(s) Awaiting Review
              </h4>
              <p className="text-xs text-amber-300/90 mt-0.5">
                New applicants registered with phone number and birthday. Review their profile and approve or deny access.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode('PENDING');
              setSearchTerm('');
            }}
            className="w-full md:w-auto px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs rounded-full shadow-md transition-all whitespace-nowrap"
          >
            Review Pending Requests ({pendingMembers.length})
          </button>
        </div>
      )}

      {/* Top Header & Search Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1120] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Choir Member Directory ({displayedMembers.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {canViewAllChoirs && choirFilter === 'ALL'
              ? `Showing members across all ${allChoirs.length} worship choirs`
              : allChoirs.find((c) => c.id === choirFilter)?.name || availableChoirs[0]?.name || 'Choir Members'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshList}
            title="Refresh Member List from Supabase Cloud"
            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-full text-xs font-semibold transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 text-orange-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {hasPermission('members.create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory View Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1120] border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === 'ACTIVE'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Members ({activeMembers.length})
          </button>

          {isLeader && (
            <button
              onClick={() => setViewMode('PENDING')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                viewMode === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Pending Approvals</span>
              {pendingMembers.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setViewMode('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === 'ALL'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Members ({members.length})
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1120]/80 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search member name, email, phone, or birthday..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canViewAllChoirs || availableChoirs.length > 1 ? (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-slate-400 font-medium">Choir:</span>
              <select
                value={choirFilter}
                onChange={(e) => setChoirFilter(e.target.value)}
                className="bg-[#0f172a] border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-bold"
              >
                {canViewAllChoirs && <option value="ALL">All Choirs Combined</option>}
                {(canViewAllChoirs ? allChoirs : availableChoirs).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
              <span>Choir: <strong className="text-slate-200">{availableChoirs[0]?.name || 'My Choir'}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Vocal Part:</span>
            <select
              value={vocalFilter}
              onChange={(e) => setVocalFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Vocal Parts</option>
              <option value="Soprano">Soprano</option>
              <option value="Alto">Alto</option>
              <option value="Tenor">Tenor</option>
              <option value="Bass">Bass</option>
              <option value="Lead">Lead Vocalist</option>
            </select>
          </div>
        </div>
      </div>

      {/* Member Grid View */}
      {displayedMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`bg-[#0b1120] border rounded-xl p-4 transition-all cursor-pointer shadow-sm space-y-3 ${
                member.status === 'PENDING_APPROVAL'
                  ? 'border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-amber-950/20 to-[#0b1120]'
                  : 'border-slate-800 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-extrabold text-sm flex items-center justify-center border ${
                      member.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                        : 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{member.fullName}</span>
                      {member.status === 'PENDING_APPROVAL' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pending
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">{member.choirName}</p>
                  </div>
                </div>

                {member.consecutiveAbsences >= 3 && member.status === 'ACTIVE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Flagged ({member.consecutiveAbsences} Abs)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md font-semibold border border-orange-500/20">
                  Voice: {member.vocalPart}
                </span>
                {member.instrument && member.instrument !== 'None' && (
                  <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md font-semibold border border-amber-500/20">
                    Inst: {member.instrument}
                  </span>
                )}
                <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md font-semibold border border-emerald-500/20">
                  Skill: {member.skillLevel}
                </span>
              </div>

              {/* Contact & Birthday Details */}
              <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{member.phone || 'No phone'}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${member.phone}`}
                        className="text-[10px] text-orange-400 hover:underline font-semibold"
                      >
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline font-semibold"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {member.birthday && (
                  <div className="flex items-center gap-2 text-amber-300/90">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Birthday: {member.birthday}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              {/* Choir Leader Approval Actions for Pending Registrations */}
              {isLeader && member.status === 'PENDING_APPROVAL' && (
                <div
                  className="border-t border-amber-500/30 pt-3 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleApprove(member)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-1.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeny(member)}
                    className="px-3 flex items-center justify-center gap-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 py-1.5 rounded-xl font-bold text-xs transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Deny</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {viewMode === 'PENDING' ? 'No Pending Membership Requests' : 'No Choir Members Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {viewMode === 'PENDING'
                ? 'All member registration requests for this choir have been reviewed.'
                : members.length > 0
                ? `There are ${members.length} registered member(s) matching other filters.`
                : 'No choir members are currently registered in the database.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {viewMode === 'PENDING' && (
              <button
                type="button"
                onClick={() => setViewMode('ACTIVE')}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white rounded-full font-bold text-xs shadow-md transition-all"
              >
                View Active Members ({activeMembers.length})
              </button>
            )}
            {(searchTerm || vocalFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setVocalFilter('ALL');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-bold text-xs transition-all"
              >
                Reset Search Filters
              </button>
            )}
            {hasPermission('members.create') && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-full font-bold text-xs border border-amber-500/30 transition-all"
              >
                Add Member Manually
              </button>
            )}
          </div>
        </div>
      )}

      {/* Member Profile Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0b1120] h-full border-l border-slate-800 p-6 overflow-y-auto space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-lg flex items-center justify-center">
                  {selectedMember.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedMember.fullName}</h3>
                  <p className="text-xs text-orange-400 font-semibold">{selectedMember.choirName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-xl space-y-2 text-xs border border-slate-800">
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                  <span>Member Profile Information</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMember.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : selectedMember.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {selectedMember.status}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span className="font-mono text-white">{selectedMember.phone || 'None'}</span></div>
                {selectedMember.birthday && (
                  <div className="flex justify-between"><span className="text-slate-400">Birthday:</span> <span className="text-amber-300 font-semibold">{selectedMember.birthday}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span>{selectedMember.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vocal Part:</span> <span className="font-bold text-orange-400">{selectedMember.vocalPart}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Instrument:</span> <span>{selectedMember.instrument}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Skill Level:</span> <span>{selectedMember.skillLevel}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date Joined:</span> <span>{selectedMember.dateJoined}</span></div>
              </div>

              {/* Review Actions if Pending */}
              {isLeader && selectedMember.status === 'PENDING_APPROVAL' && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-amber-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Choir Leader Review Decision</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedMember)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Registration</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeny(selectedMember)}
                      className="px-4 py-2 bg-rose-950 border border-rose-500/50 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Deny</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedMember.customFields && selectedMember.customFields.length > 0 && (
                <div className="bg-[#0f172a] p-4 rounded-xl space-y-2 text-xs border border-slate-800">
                  <div className="font-bold text-orange-400 border-b border-slate-800 pb-1">Custom Fields</div>
                  {selectedMember.customFields.map((cf, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-400">{cf.fieldName}:</span>
                      <span className="font-semibold text-white">{String(cf.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create New Choir Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="david@church.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Birthday / Date of Birth</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Choir</label>
                  <select
                    value={primaryChoirId}
                    onChange={(e) => setPrimaryChoirId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    {allChoirs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vocal Part</label>
                  <select
                    value={vocalPart}
                    onChange={(e) => setVocalPart(e.target.value as VocalPart)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white rounded-full font-extrabold shadow-md"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
