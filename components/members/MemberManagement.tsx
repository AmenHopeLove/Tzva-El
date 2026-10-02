'use client';

import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';

export function MemberManagement() {
  const { activeChoirId, activeChoir, allChoirs, hasPermission } = useAuth();
  const [members, setMembers] = useState<Member[]>(() => DataStore.getMembers(activeChoirId));
  const [searchTerm, setSearchTerm] = useState('');
  const [vocalFilter, setVocalFilter] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryChoirId, setPrimaryChoirId] = useState(allChoirs[0]?.id || 'choir-1');
  const [vocalPart, setVocalPart] = useState<VocalPart>('Soprano');
  const [instrument, setInstrument] = useState('None');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');

  const refreshList = () => {
    setMembers(DataStore.getMembers(activeChoirId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    DataStore.saveMember({
      fullName,
      email,
      phone,
      primaryChoirId,
      vocalPart,
      instrument,
      skillLevel
    });
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setPhone('');
    refreshList();
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    const matchVocal = vocalFilter === 'ALL' || m.vocalPart === vocalFilter;
    const matchChoir = activeChoirId === 'ALL' || m.primaryChoirId === activeChoirId;
    return matchSearch && matchVocal && matchChoir;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1120] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Choir Member Directory ({filteredMembers.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeChoir ? activeChoir.name : 'Showing members across all 7 worship choirs'}
          </p>
        </div>

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

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1120]/80 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search member name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-400">Vocal Part:</span>
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

      {/* Member Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-[#0b1120] border border-slate-800 hover:border-orange-500/50 rounded-xl p-4 transition-all cursor-pointer shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600/20 text-orange-400 font-extrabold text-sm flex items-center justify-center border border-orange-500/30">
                  {member.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{member.fullName}</h3>
                  <p className="text-[11px] text-slate-400">{member.choirName}</p>
                </div>
              </div>

              {member.consecutiveAbsences >= 3 && (
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

            <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">Member Profile Information</div>
                <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span>{selectedMember.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span>{selectedMember.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vocal Part:</span> <span className="font-bold text-orange-400">{selectedMember.vocalPart}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Instrument:</span> <span>{selectedMember.instrument}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Skill Level:</span> <span>{selectedMember.skillLevel}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date Joined:</span> <span>{selectedMember.dateJoined}</span></div>
              </div>

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
