'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { User, SystemRole } from '../../lib/types';
import {
  UserPlus,
  Shield,
  Key,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  Plus
} from 'lucide-react';

export function UserManagement() {
  const { allChoirs, currentRole, refreshData } = useAuth();
  const [users, setUsers] = useState<User[]>(() => DataStore.getUsers());

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemRole>('CHOIR_ADMIN');
  const [assignedChoirId, setAssignedChoirId] = useState('choir-1');
  const [showModal, setShowModal] = useState(false);

  const refreshUserList = () => {
    setUsers(DataStore.getUsers());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    DataStore.createUser({
      fullName,
      email,
      username: username || email.split('@')[0],
      password,
      role,
      assignedChoirIds: [assignedChoirId],
      primaryChoirId: assignedChoirId
    });

    setShowModal(false);
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('');
    refreshUserList();
    alert(`Account created successfully for ${fullName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1120] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Super Admin User Account Creator & Access Control ({users.length} Accounts)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Super Admins can generate login credentials (Username/Email & Password) for Choir Leaders, Admins, and Members.
          </p>
        </div>

        {currentRole === 'SUPER_ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User Account</span>
          </button>
        )}
      </div>

      {/* User Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((usr) => {
          const assignedChoir = allChoirs.find((c) => c.id === usr.primaryChoirId);
          return (
            <div
              key={usr.id}
              className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600/20 text-orange-400 font-extrabold text-sm flex items-center justify-center border border-orange-500/30">
                    {usr.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{usr.fullName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {usr.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a] p-3 rounded-lg text-xs space-y-1 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-200">{usr.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="text-amber-300 font-bold">{usr.username || 'n/a'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-emerald-400 font-bold">{usr.password || '••••••••'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span>Access Limit:</span>
                <span className="font-bold text-orange-300">
                  {usr.role === 'SUPER_ADMIN' ? 'All 7 Choirs Combined' : assignedChoir?.name || 'Assigned Choir'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                Generate Credentials for Leader or Member
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@church.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    placeholder="sarahadmin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Password</label>
                <input
                  type="text"
                  required
                  placeholder="Create secure password (e.g. sarah123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as SystemRole)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="CHOIR_ADMIN">Choir Admin</option>
                    <option value="CHOIR_LEADER">Choir Leader</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Choir</label>
                  <select
                    value={assignedChoirId}
                    onChange={(e) => setAssignedChoirId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    {allChoirs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white rounded-full font-extrabold shadow-md"
                >
                  Create Account Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
