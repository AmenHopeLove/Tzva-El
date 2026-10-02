'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { Event, OrderOfServiceItem } from '../../lib/types';
import {
  Flame,
  Plus,
  Clock,
  Music,
  Users,
  Calendar,
  Sparkles,
  MoveUp,
  MoveDown,
  Trash2,
  BookOpen
} from 'lucide-react';

export function WorshipNightBuilder() {
  const { allChoirs } = useAuth();
  const events = DataStore.getEvents();
  const worshipNightEvent = events.find((e) => e.eventType === 'Worship Night') || events[0];

  const [serviceItems, setServiceItems] = useState<OrderOfServiceItem[]>(
    worshipNightEvent?.orderOfService || [
      { id: 'os-1', timeSlot: '19:00', durationMinutes: 15, title: 'Opening Prayer & Shofar Call', leaderName: 'Pastor Hannah Wright', category: 'Prayer' },
      { id: 'os-2', timeSlot: '19:15', durationMinutes: 25, title: 'Goodness of God & Way Maker', leaderName: 'David Miller & Sarah Jenkins', category: 'Worship' },
      { id: 'os-3', timeSlot: '19:40', durationMinutes: 20, title: 'Build My Life & Spontaneous Worship', leaderName: 'Youth Worship Team', category: 'Worship' },
      { id: 'os-4', timeSlot: '20:00', durationMinutes: 30, title: 'Prophetic Word & Exhortation', leaderName: 'Bishop Marcus Vance', category: 'Word' },
      { id: 'os-5', timeSlot: '20:30', durationMinutes: 45, title: 'Healing Altar Ministry & Mass Choir Anthems', leaderName: 'All 7 Choir Leaders', category: 'Worship' }
    ]
  );

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState(15);
  const [newItemLeader, setNewItemLeader] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<any>('Worship');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;
    const newItem: OrderOfServiceItem = {
      id: `os-${Date.now()}`,
      timeSlot: '21:15',
      durationMinutes: newItemDuration,
      title: newItemTitle,
      leaderName: newItemLeader || 'Team Leader',
      category: newItemCategory
    };
    const updated = [...serviceItems, newItem];
    setServiceItems(updated);
    setNewItemTitle('');
    setNewItemLeader('');
  };

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === serviceItems.length - 1)) return;
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const copy = [...serviceItems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setServiceItems(copy);
  };

  const removeItem = (id: string) => {
    setServiceItems(serviceItems.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/30 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Dedicated Worship Night OS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {worshipNightEvent?.title || 'Grand Night of Prophetic Worship & Healing'}
            </h2>
            <p className="text-xs text-purple-200 mt-1 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              Theme: {worshipNightEvent?.theme || 'Overflow & Revival'} | Verse: {worshipNightEvent?.bibleVerse || 'Psalm 100:1-5'}
            </p>
          </div>

          <div className="bg-purple-950/60 border border-purple-500/30 p-3 rounded-xl text-right text-xs">
            <div className="font-bold text-amber-300">All 7 Choirs Participating</div>
            <div className="text-slate-300">Main Cathedral Sanctuary</div>
          </div>
        </div>
      </div>

      {/* Main Builder & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Order of Service Visual Builder */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Service Program Builder & Sequencing
            </h3>
            <span className="text-xs text-indigo-300 font-semibold">{serviceItems.length} Program Slots</span>
          </div>

          <div className="space-y-2.5">
            {serviceItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-purple-600/20 text-purple-300 font-mono font-bold text-xs flex flex-col items-center justify-center border border-purple-500/30">
                    <span>{item.timeSlot}</span>
                    <span className="text-[9px] text-purple-400">{item.durationMinutes}m</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white">{item.title}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Leader: {item.leaderName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(index, 'UP')}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'DOWN')}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-rose-950 rounded text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Add New Item & Participating Choirs */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Add Program Slot</h3>
            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Altar Call & Healing Ministry"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="Worship">Worship</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Word">Word</option>
                    <option value="Offering">Offering</option>
                    <option value="Benediction">Benediction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newItemDuration}
                    onChange={(e) => setNewItemDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Leader / Vocalist</label>
                <input
                  type="text"
                  placeholder="Leader name"
                  value={newItemLeader}
                  onChange={(e) => setNewItemLeader(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition-all"
              >
                Add Slot to Program
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="font-bold text-xs text-slate-200">Participating Choirs (7)</div>
            <div className="flex flex-wrap gap-1.5">
              {allChoirs.map((c) => (
                <span key={c.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-500/20">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
