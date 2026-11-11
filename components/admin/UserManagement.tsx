'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  RotateCw,
  Trash2,
  XCircle,
  Clock,
  Phone,
  Calendar,
  Edit3
} from 'lucide-react';

export function UserManagement() {
  const { allChoirs, currentRole, currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => DataStore.getUsers());
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemRole>('CHOIR_ADMIN');
  const [assignedChoirId, setAssignedChoirId] = useState('choir-1');
  const [showModal, setShowModal] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editRole, setEditRole] = useState<SystemRole>('CHOIR_LEADER');
  const [editChoirId, setEditChoirId] = useState('choir-1');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'PENDING_APPROVAL' | 'DENIED' | 'INACTIVE'>('ACTIVE');

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditUsername(u.username || '');
    setEditPhone(u.phone || '');
    setEditBirthday(u.birthday || '');
    setEditRole(u.role);
    setEditChoirId(u.primaryChoirId || u.assignedChoirIds?.[0] || allChoirs[0]?.id || 'choir-1');
    setEditStatus(u.status || 'ACTIVE');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    DataStore.adminUpdateUser(
      editingUser.id,
      {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        username: editUsername.trim() || editEmail.split('@')[0],
        phone: editPhone.trim(),
        birthday: editBirthday.trim(),
        role: editRole,
        primaryChoirId: editChoirId,
        assignedChoirIds: [editChoirId],
        status: editStatus
      },
      currentUser?.fullName || 'Super Admin'
    );
    setEditingUser(null);
    refreshUserList();
    alert(`Updated account for '${editFullName}'! Role: ${editRole}.`);
  };

  const refreshUserList = () => {
    setUsers(DataStore.getUsers());
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await DataStore.syncFromSupabase();
      refreshUserList();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    DataStore.syncFromSupabase().then(() => {
      refreshUserList();
    });

    const handleUpdate = () => {
      refreshUserList();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('worship_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('worship_data_updated', handleUpdate);
    };
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    DataStore.createUser({
      fullName,
      email,
      username: username || email.split('@')[0],
      phone,
      birthday,
      password,
      role,
      status: 'ACTIVE',
      assignedChoirIds: [assignedChoirId],
      primaryChoirId: assignedChoirId
    });

    setShowModal(false);
    setFullName('');
    setEmail('');
    setUsername('');
    setPhone('');
    setBirthday('');
    setPassword('');
    refreshUserList();
    alert(`Account created successfully for ${fullName}!`);
  };

  const handleApproveUser = (usr: User) => {
    DataStore.approveMemberRequest(usr.id, currentUser?.fullName || 'Super Admin');
    refreshUserList();
  };

  const handleDenyUser = (usr: User) => {
    if (confirm(`Deny registration for account '${usr.fullName}'?`)) {
      DataStore.denyMemberRequest(usr.id, 'Denied by Super Admin', currentUser?.fullName || 'Super Admin');
      refreshUserList();
    }
  };

  const handleDeleteUser = (usr: User) => {
    if (confirm(`Are you sure you want to delete user account '${usr.fullName}' (${usr.email})?`)) {
      DataStore.deleteUser(usr.id, currentUser?.fullName || 'Super Admin');
      refreshUserList();
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-[#0b1120] border border-rose-500/30 rounded-2xl p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Super Admin Access Required</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          User account generation and credential administration is strictly restricted to Super Administrators.
        </p>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/50 font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Accounts'}</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User Account</span>
            </button>
          </div>
        )}
      </div>

      {/* User Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((usr) => {
          const assignedChoir = allChoirs.find((c) => c.id === usr.primaryChoirId);
          const isPending = usr.status === 'PENDING_APPROVAL';
          return (
            <div
              key={usr.id}
              className={`bg-[#0b1120] border rounded-xl p-4 space-y-3 shadow-sm transition-all ${
                isPending
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-[#0b1120]'
                  : 'border-slate-800 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-extrabold text-sm flex items-center justify-center border ${
                      isPending
                        ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                        : 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {usr.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{usr.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {usr.role}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          usr.status === 'ACTIVE' || !usr.status
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : usr.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {usr.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                {usr.role !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleDeleteUser(usr)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-200">{usr.phone || 'n/a'}</span>
                </div>
                {usr.birthday && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Birthday:</span>
                    <span className="text-amber-300">{usr.birthday}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-emerald-400 font-bold">{usr.password || '••••••••'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span>Access Limit:</span>
                <span className="font-bold text-orange-300">
                  {usr.role === 'SUPER_ADMIN' ? 'All Choirs Combined' : assignedChoir?.name || 'Assigned Choir'}
                </span>
              </div>

              {/* Edit Role & Assigned Choir Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(usr)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg font-bold text-xs border border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Assign Choir & Role</span>
                </button>
              </div>

              {/* Super Admin Approval Actions for Pending Users */}
              {isPending && (
                <div className="pt-2 border-t border-amber-500/30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveUser(usr)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white py-1.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDenyUser(usr)}
                    className="px-3 flex items-center justify-center gap-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 py-1.5 rounded-xl font-bold text-xs transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Deny</span>
                  </button>
                </div>
              )}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Birthday (Optional)</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
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

      {/* Edit Role & Choir Assignment Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-orange-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Assign Choir & Role Access
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure choir leadership, assigned choir, and authorization for {editingUser.fullName}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Username / Sign-In Handle</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign System Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as SystemRole)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="CHOIR_LEADER">Choir Leader (Strict access to assigned choir only)</option>
                    <option value="CHOIR_ADMIN">Choir Admin</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="WORSHIP_MINISTRY_LEADER">Worship Ministry Leader</option>
                    <option value="SUPER_ADMIN">Super Admin (All Choirs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign Choir</label>
                  <select
                    value={editChoirId}
                    onChange={(e) => setEditChoirId(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    {allChoirs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Birthday</label>
                  <input
                    type="date"
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Approval Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="ACTIVE">Active (Approved)</option>
                    <option value="PENDING_APPROVAL">Pending Choir Leader Approval</option>
                    <option value="DENIED">Denied</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white rounded-full font-extrabold shadow-md transition-all"
                >
                  Save Access Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
