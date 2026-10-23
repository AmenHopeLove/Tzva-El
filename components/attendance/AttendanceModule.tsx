'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { AttendanceSession, AttendanceStatus, SessionType, Member } from '../../lib/types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Save,
  Check,
  X,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export function AttendanceModule() {
  const { activeChoirId, activeChoir, allChoirs, hasPermission, currentUser } = useAuth();
  const canRecord = hasPermission('attendance.create') || hasPermission('attendance.edit');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);

  // New Session Form
  const [sessionTitle, setSessionTitle] = useState('Weekly Choir Rehearsal');
  const [sessionType, setSessionType] = useState<SessionType>('Rehearsal');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetChoirId, setTargetChoirId] = useState(activeChoirId === 'ALL' ? allChoirs[0]?.id || 'choir-1' : activeChoirId);

  useEffect(() => {
    loadSessions();
  }, [activeChoirId]);

  useEffect(() => {
    const handleUpdate = () => {
      loadSessions();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('worship_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('worship_data_updated', handleUpdate);
    };
  }, [activeChoirId]);

  const loadSessions = () => {
    const list = DataStore.getAttendanceSessions(activeChoirId);
    setSessions(list);
    if (list.length > 0 && !activeSession) {
      selectSession(list[0]);
    }
  };

  const selectSession = (session: AttendanceSession) => {
    setActiveSession(session);
    const sessionMembers = DataStore.getMembers(session.choirId);
    setMembers(sessionMembers);

    const existingRecords = DataStore.getAttendanceRecordsForSession(session.id);
    const initialMap: Record<string, AttendanceStatus> = {};
    sessionMembers.forEach((m) => {
      const rec = existingRecords.find((r) => r.memberId === m.id);
      initialMap[m.id] = rec ? rec.status : 'PRESENT'; // Default 1-tap PRESENT
    });
    setAttendanceMap(initialMap);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSess = DataStore.createAttendanceSession({
      choirId: targetChoirId,
      title: sessionTitle,
      sessionType,
      sessionDate,
      startTime: '19:00',
      endTime: '21:00',
      location: 'Main Sanctuary'
    });
    setShowCreateSessionModal(false);
    loadSessions();
    selectSession(newSess);
  };

  const handleMarkStatus = (memberId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [memberId]: status }));
  };

  const handleSaveAttendance = () => {
    if (!activeSession) return;
    const records = members.map((m) => ({
      memberId: m.id,
      memberName: m.fullName,
      status: attendanceMap[m.id] || 'PRESENT'
    }));

    DataStore.saveAttendanceRecords(activeSession.id, records);
    loadSessions();
    alert('Attendance saved successfully! Metrics updated.');
  };

  const statuses: { key: AttendanceStatus; label: string; color: string }[] = [
    { key: 'PRESENT', label: 'Present', color: 'bg-emerald-600 text-white' },
    { key: 'LATE', label: 'Late', color: 'bg-amber-600 text-white' },
    { key: 'ABSENT', label: 'Absent', color: 'bg-rose-600 text-white' },
    { key: 'EXCUSED', label: 'Excused', color: 'bg-indigo-600 text-white' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            Fast Mobile Attendance Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record rehearsal or service attendance with 1 tap per member. Instant statistics calculation.
          </p>
        </div>

        {canRecord && (
          <button
            onClick={() => setShowCreateSessionModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Attendance Session</span>
          </button>
        )}
      </div>

      {/* Main Grid: Session Selector + Mobile 1-Tap Attendance Marker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Sessions List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Attendance Sessions</h3>
          <div className="space-y-2">
            {sessions.map((s) => {
              const isSelected = activeSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      {s.sessionType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{s.sessionDate}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-100">{s.title}</h4>
                  <p className="text-[11px] text-slate-400">{s.choirName || 'Grace Sanctuary Choir'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Mobile Fast Attendance Marking Board */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {activeSession ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeSession.sessionType}
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-1">{activeSession.title}</h3>
                  <p className="text-xs text-slate-400">Date: {activeSession.sessionDate} | {members.length} Members Eligible</p>
                </div>

                {canRecord && (
                  <button
                    onClick={handleSaveAttendance}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Attendance</span>
                  </button>
                )}
              </div>

              {/* Members 1-Tap Status Grid */}
              <div className="space-y-2">
                {members.map((member) => {
                  const currentStatus = attendanceMap[member.id] || 'PRESENT';
                  return (
                    <div
                      key={member.id}
                      className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-200 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-100">{member.fullName}</h4>
                          <span className="text-[10px] text-indigo-400">Voice: {member.vocalPart}</span>
                        </div>
                      </div>

                      {/* 1-Tap Mobile Status Selector Buttons for Leaders / Read-only Pill for Members */}
                      {canRecord ? (
                        <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
                          {statuses.map((st) => {
                            const isSelected = currentStatus === st.key;
                            return (
                              <button
                                key={st.key}
                                onClick={() => handleMarkStatus(member.id, st.key)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                  isSelected
                                    ? `${st.color} shadow-md`
                                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                                }`}
                              >
                                {st.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          currentStatus === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          currentStatus === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          currentStatus === 'EXCUSED' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {currentStatus}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select or create an attendance session to start marking attendance.
            </div>
          )}
        </div>

      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">New Attendance Session</h3>
              <button onClick={() => setShowCreateSessionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as SessionType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Sunday Worship">Sunday Worship</option>
                    <option value="Rehearsal">Rehearsal</option>
                    <option value="Worship Night">Worship Night</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Choir</label>
                <select
                  value={targetChoirId}
                  onChange={(e) => setTargetChoirId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  {allChoirs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Create & Start Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
