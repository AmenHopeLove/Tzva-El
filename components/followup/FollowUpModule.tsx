'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { FollowUp, FollowUpStatus, FollowUpPriority } from '../../lib/types';
import {
  HeartHandshake,
  Plus,
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  PhoneCall,
  CheckCircle,
  X
} from 'lucide-react';

export function FollowUpModule() {
  const { activeChoirId, activeChoir, currentUser } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => DataStore.getFollowUps(activeChoirId));
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [noteText, setNoteText] = useState('');
  const [contactMethod, setContactMethod] = useState<'Phone Call' | 'WhatsApp' | 'In-Person' | 'Email'>('Phone Call');

  const refreshList = useCallback(() => {
    setFollowUps(DataStore.getFollowUps(activeChoirId));
  }, [activeChoirId]);

  useEffect(() => {
    refreshList();
  }, [refreshList, activeChoirId]);

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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp || !noteText) return;
    DataStore.addFollowUpNote(selectedFollowUp.id, noteText, currentUser.fullName, contactMethod);
    setNoteText('');
    refreshList();
    setSelectedFollowUp(DataStore.getFollowUps(activeChoirId).find((f) => f.id === selectedFollowUp.id) || null);
  };

  const priorityBadges: Record<FollowUpPriority, string> = {
    URGENT: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    MEDIUM: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    LOW: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-400" />
            Pastoral Care & Member Follow-Up
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Care management for absent members, spiritual support, family visits, and team wellness.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Follow-up Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {followUps.map((item) => {
            const isSelected = selectedFollowUp?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedFollowUp(item)}
                className={`bg-slate-900 border rounded-xl p-4 transition-all cursor-pointer space-y-2 ${
                  isSelected ? 'border-indigo-500 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadges[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Created: {item.createdAt}</span>
                </div>

                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  {item.memberName}
                </h3>
                <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                  Reason: {item.reason}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Assigned: {item.assignedLeaderName || 'Choir Leadership'}</span>
                  <span>{item.notesHistory.length} Interaction Note(s)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interaction Details & Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {selectedFollowUp ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Pastoral Ticket</span>
                <h3 className="font-bold text-base text-white">{selectedFollowUp.memberName}</h3>
                <p className="text-xs text-slate-400">{selectedFollowUp.choirName}</p>
              </div>

              {/* Log New Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3 text-xs">
                <div className="font-bold text-slate-200">Log Interaction Note</div>
                <div className="flex gap-2">
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Record interaction summary..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-all"
                >
                  Add Note & Update Ticket
                </button>
              </form>

              {/* Timeline Notes */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="font-bold text-xs text-slate-300">Interaction History ({selectedFollowUp.notesHistory.length})</div>
                {selectedFollowUp.notesHistory.map((n) => (
                  <div key={n.id} className="bg-slate-800/60 p-3 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-indigo-300">
                      <span>{n.authorName} ({n.contactMethod})</span>
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-slate-200">{n.note}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a pastoral ticket from the list to view history and log notes.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
