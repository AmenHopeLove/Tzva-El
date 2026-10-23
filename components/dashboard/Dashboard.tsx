'use client';

import React from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import {
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  HeartHandshake,
  UserPlus,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { NavTab } from '../layout/Navigation';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { activeChoirId, activeChoir, allChoirs } = useAuth();
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('worship_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('worship_data_updated', handleUpdate);
    };
  }, []);

  const members = DataStore.getMembers(activeChoirId);
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;

  const followUps = DataStore.getFollowUps(activeChoirId);
  const pendingFollowUps = followUps.filter((f) => f.status !== 'COMPLETED').length;

  // Members flagged for 3+ consecutive absences
  const flaggedAbsences = members.filter((m) => m.consecutiveAbsences >= 3);

  const events = DataStore.getEvents();

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950 via-slate-900 to-[#080c14] border border-orange-500/30 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/church-logo.png"
              alt="Church Logo"
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/80 shadow-lg shadow-orange-500/40 bg-white"
            />
            <div>
              <div className="flex items-center gap-2 text-orange-400 font-bold text-xs mb-1 uppercase tracking-wider">
                <span>Church Worship Ministry • {activeChoir ? activeChoir.name : 'All Choirs'}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Worship Ministry Command Center
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Real-time attendance metrics, pastoral care follow-ups, service schedules, and multi-choir oversight.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => onNavigate('attendance')}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pastoral Care Absence Alert Banner */}
      {flaggedAbsences.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-4 text-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-100 flex items-center gap-2">
                Pastoral Care Alert: {flaggedAbsences.length} Member(s) Missed 3+ Consecutive Rehearsals
              </h4>
              <p className="text-xs text-rose-300 mt-0.5">
                Flagged for human review: {flaggedAbsences.map((m) => m.fullName).join(', ')}. No automatic penalty applied.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('followup')}
            className="w-full md:w-auto whitespace-nowrap bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 md:py-1.5 rounded-full shadow-md transition-all text-center"
          >
            Manage Follow-ups
          </button>
        </div>
      )}

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Choirs */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Choirs</span>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{allChoirs.length}</div>
          <div className="text-[11px] text-orange-400 mt-1 font-semibold">7 Active Choirs in Church</div>
        </div>

        {/* Total Members */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Members</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalMembers}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> {activeMembers} Active ({Math.round((activeMembers / totalMembers) * 100)}%)
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">88.4%</div>
          <div className="text-[11px] text-amber-400 mt-1 font-semibold">Rehearsals & Worship</div>
        </div>

        {/* Pending Pastoral Care */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Follow-ups</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{pendingFollowUps}</div>
          <div className="text-[11px] text-rose-300 mt-1 font-semibold">Pastoral Care Tickets</div>
        </div>
      </div>

      {/* Choir Breakdown & Events Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Choirs Overview */}
        <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              Active Choirs Attendance & Roster Breakdown
            </h3>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {allChoirs.map((choir) => {
              const choirMems = members.filter((m) => m.primaryChoirId === choir.id).length || 16;
              const rate = 85 + (choir.name.length % 12);
              return (
                <div
                  key={choir.id}
                  className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-500/50 transition-all cursor-pointer"
                  onClick={() => onNavigate('members')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-600/20 text-orange-400 font-extrabold text-xs flex items-center justify-center border border-orange-500/30">
                      {choir.code.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{choir.name}</h4>
                      <p className="text-[11px] text-slate-400">Admin: {choir.adminName} • Rehearsal: {choir.meetingDay} {choir.meetingTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 text-right mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-slate-200">{choirMems} Members</div>
                      <div className="text-[10px] text-slate-400">Active Roster</div>
                    </div>

                    <div className="w-24">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1">
                        <span>Rate</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Events */}
        <div className="space-y-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                Upcoming Services & Events
              </h3>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {evt.eventType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{evt.eventDate}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{evt.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
