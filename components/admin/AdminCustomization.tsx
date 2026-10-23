'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { CustomFieldDefinition, AuditLog, Organization, Choir } from '../../lib/types';
import {
  Settings,
  Sliders,
  History,
  Palette,
  CheckCircle2,
  Music,
  Trash2
} from 'lucide-react';

export function AdminCustomization() {
  const { currentRole, refreshData, currentUser } = useAuth();
  const [org, setOrg] = useState<Organization>(() => DataStore.getOrganization());
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => DataStore.getCustomFields());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => DataStore.getAuditLogs());
  
  // Choir Management State
  const [choirs, setChoirs] = useState<Choir[]>(() => DataStore.getChoirs());
  const [newChoirName, setNewChoirName] = useState('');
  const [newChoirCode, setNewChoirCode] = useState('');
  const [newChoirAdmin, setNewChoirAdmin] = useState('');

  // New Custom Field Form State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<any>('TEXT');
  const [churchName, setChurchName] = useState(org.name);

  const handleSaveChurchName = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateOrganization({ name: churchName });
    alert('Church branding settings updated!');
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;
    DataStore.saveCustomField({
      fieldName: newFieldName,
      fieldType: newFieldType,
      isRequired: false
    });
    setCustomFields(DataStore.getCustomFields());
    setNewFieldName('');
  };

  const handleAddChoir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoirName || !newChoirCode) return;
    DataStore.saveChoir({
      name: newChoirName,
      code: newChoirCode,
      adminName: newChoirAdmin || 'Unassigned'
    });
    setChoirs(DataStore.getChoirs());
    setAuditLogs(DataStore.getAuditLogs());
    refreshData();
    setNewChoirName('');
    setNewChoirCode('');
    setNewChoirAdmin('');
  };

  const handleDeleteChoir = (id: string) => {
    if (confirm('Are you sure you want to delete this choir? This action cannot be undone.')) {
      DataStore.deleteChoir(id);
      setChoirs(DataStore.getChoirs());
      setAuditLogs(DataStore.getAuditLogs());
      refreshData();
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-[#0b1120] border border-rose-500/30 rounded-2xl p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <Settings className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Super Admin Settings Only</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          System customization, branding parameters, and audit trails are exclusively accessible to Super Administrators.
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
            <Settings className="w-5 h-5 text-orange-400" />
            Admin Customization Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure church branding, dynamic custom fields, security roles, and inspect system audit logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Church Branding & Dynamic Custom Fields */}
        <div className="space-y-6">
          
          {/* Church Branding Settings */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Palette className="w-4 h-4 text-orange-400" />
              Church & Platform Branding
            </h3>

            <div className="flex items-center gap-4 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
              <img
                src="/church-logo.png"
                alt="Church Logo"
                className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-md bg-white"
              />
              <div>
                <h4 className="font-bold text-xs text-white">Official Church Logo Active</h4>
                <p className="text-[11px] text-slate-400">Displayed on Header, Dashboard, Reports, and PWA App Icon.</p>
              </div>
            </div>

            <form onSubmit={handleSaveChurchName} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Church / Ministry Name</label>
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={org.primaryColor}
                    onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                    className="w-full h-9 bg-[#0f172a] border border-slate-800 rounded-lg p-1 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Timezone</label>
                  <select
                    value={org.timeZone}
                    onChange={(e) => setOrg({ ...org, timeZone: e.target.value })}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="UTC">UTC Universal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-extrabold px-5 py-2 rounded-full transition-all shadow-md"
              >
                Save Branding Settings
              </button>
            </form>
          </div>

          {/* Dynamic Custom Fields Builder */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              Dynamic Member Custom Fields
            </h3>
            <p className="text-xs text-slate-400">
              Create custom profile fields without editing source code.
            </p>

            <form onSubmit={handleAddCustomField} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Field name (e.g. Years Serving)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1 bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              >
                <option value="TEXT">Text</option>
                <option value="NUMBER">Number</option>
                <option value="DATE">Date</option>
                <option value="SELECT">Select</option>
              </select>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3.5 py-2 rounded-full transition-all"
              >
                Add Field
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {customFields.map((cf) => (
                <div key={cf.id} className="bg-[#0f172a] border border-slate-800/80 p-2.5 rounded-lg flex justify-between text-xs text-slate-200">
                  <span className="font-bold text-slate-100">{cf.fieldName}</span>
                  <span className="font-mono text-orange-400">{cf.fieldType}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Choir & Worship Team Management */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Music className="w-4 h-4 text-orange-400" />
              Choir & Worship Team Management
            </h3>
            <p className="text-xs text-slate-400">
              Add new worship teams or delete existing ones.
            </p>

            <form onSubmit={handleAddChoir} className="flex flex-col sm:flex-row gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Team Name"
                value={newChoirName}
                onChange={(e) => setNewChoirName(e.target.value)}
                className="flex-1 bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Code (e.g. AWC-07)"
                value={newChoirCode}
                onChange={(e) => setNewChoirCode(e.target.value)}
                className="w-full sm:w-32 bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Admin Name"
                value={newChoirAdmin}
                onChange={(e) => setNewChoirAdmin(e.target.value)}
                className="w-full sm:w-32 bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3.5 py-2 rounded-lg transition-all"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 pt-2 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
              {choirs.map((choir) => (
                <div key={choir.id} className="bg-[#0f172a] border border-slate-800/80 p-2.5 rounded-lg flex justify-between items-center text-xs text-slate-200">
                  <div>
                    <span className="font-bold text-slate-100">{choir.name}</span>
                    <span className="ml-2 text-slate-500 text-[10px]">({choir.code})</span>
                    <div className="text-[10px] text-orange-400 mt-0.5">Admin: {choir.adminName}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteChoir(choir.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                    title="Delete Choir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: System Audit Log Viewer */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <History className="w-4 h-4 text-emerald-400" />
            Security & System Audit Trail ({auditLogs.length})
          </h3>
          <p className="text-xs text-slate-400">
            Records administrative actions, attendance updates, choir additions, and permissions changes.
          </p>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-orange-400">
                  <span>{log.userName} ({log.userRole})</span>
                  <span className="text-[10px] text-slate-400">{log.createdAt}</span>
                </div>
                <div className="text-slate-100 font-bold">{log.action}</div>
                <p className="text-slate-300 text-[11px]">{log.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
