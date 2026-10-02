'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { Event, EventType } from '../../lib/types';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';

export function EventModule() {
  const { allChoirs, hasPermission } = useAuth();
  const [events, setEvents] = useState<Event[]>(() => DataStore.getEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('Special Service');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('Main Cathedral');
  const [targetChoirId, setTargetChoirId] = useState(allChoirs[0]?.id || 'choir-1');

  const refreshEvents = () => {
    setEvents(DataStore.getEvents());
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    DataStore.saveEvent({
      title,
      description,
      eventType,
      eventDate,
      startTime,
      endTime,
      location,
      participatingChoirIds: [targetChoirId],
      status: 'UPCOMING'
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
    refreshEvents();
  };

  const filteredEvents = events.filter(
    (evt) =>
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1120] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Events & Calendar Management ({filteredEvents.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Schedule services, rehearsals, meetings, conferences, and choir events.
          </p>
        </div>

        {hasPermission('events.create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search events by title, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0b1120] border border-slate-800 rounded-full pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-[#0b1120] border border-slate-800 hover:border-orange-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {evt.eventType}
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold">{evt.eventDate}</span>
            </div>

            <h3 className="font-extrabold text-base text-white">{evt.title}</h3>
            <p className="text-xs text-slate-300">{evt.description}</p>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Time: {evt.startTime} - {evt.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Location: {evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create New Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Morning Resurrection Praise"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Event description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Special Service">Special Service</option>
                    <option value="Rehearsal">Rehearsal</option>
                    <option value="Conference">Conference</option>
                    <option value="Retreat">Retreat</option>
                    <option value="Training">Training</option>
                    <option value="Choir Meeting">Choir Meeting</option>
                    <option value="Outreach">Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white rounded-full font-extrabold shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
