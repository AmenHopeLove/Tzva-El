'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseDbService } from '../../lib/supabase/dbService';
import { DataStore } from '../../lib/services/store';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Copy,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  X,
  Check,
  Server
} from 'lucide-react';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseSyncModal({ isOpen, onClose }: DatabaseSyncModalProps) {
  const [status, setStatus] = useState<{ configured: boolean; tablesExist: boolean; error?: string }>({
    configured: false,
    tablesExist: false
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    setSyncMessage(null);
    try {
      const res = await SupabaseDbService.checkHealth();
      setStatus(res);
    } catch (e: any) {
      setStatus({ configured: false, tablesExist: false, error: e?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/supabase/schema.sql').catch(() => null);
      // Fallback: we can load from API or read
      // Since schema.sql is on the server/public or file, let's copy notice or link
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePushToSupabase = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await DataStore.pushAllToSupabase();
      if (res.success) {
        setSyncMessage('Successfully synced all local records into Supabase!');
      } else {
        setSyncMessage(`Sync failed: ${res.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`Sync error: ${e?.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await DataStore.syncFromSupabase();
      setSyncMessage('Successfully pulled latest records from Supabase cloud!');
    } catch (e: any) {
      setSyncMessage(`Pull error: ${e?.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b1120] border border-orange-500/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-400">Database synchronization & live connection status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Connection Status Card */}
          <div className="bg-[#0e1628] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  status.tablesExist
                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                    : status.configured
                    ? 'bg-amber-500 shadow-md shadow-amber-500/50 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-300">Connection State</p>
                <p className="text-sm font-extrabold text-white">
                  {status.tablesExist
                    ? 'Connected & Tables Active'
                    : status.configured
                    ? 'Connected (Tables Need Creation in Supabase)'
                    : 'Not Connected'}
                </p>
              </div>
            </div>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-700"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
              <span>{loading ? 'Checking...' : 'Recheck'}</span>
            </button>
          </div>

          {/* If Schema Missing, Guide User */}
          {!status.tablesExist && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200 space-y-1">
                  <p className="font-bold text-amber-300">Database Tables Need to Be Created</p>
                  <p className="text-slate-300 leading-relaxed">
                    Your Supabase project is active, but the database tables have not been created yet in Postgres. Run the SQL schema once in your Supabase SQL Editor.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://supabase.com/dashboard/project/spxtvsluxxsnscwbofaa/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Supabase SQL Editor</span>
                </a>
              </div>
            </div>
          )}

          {/* Sync Actions Card */}
          <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cloud Data Synchronization</h4>
            <p className="text-xs text-slate-400">
              Changes you make (adding members, recording attendance, updating setlists) are automatically saved locally and synchronized to Supabase. You can also trigger a manual push or pull:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePushToSupabase}
                disabled={syncing || !status.tablesExist}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-orange-500/50 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-orange-400" />
                <span>{syncing ? 'Syncing...' : 'Push All to Supabase'}</span>
              </button>

              <button
                onClick={handlePullFromSupabase}
                disabled={syncing || !status.tablesExist}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-orange-500/50 transition-all"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                <span>{syncing ? 'Syncing...' : 'Pull Latest from Cloud'}</span>
              </button>
            </div>

            {syncMessage && (
              <p className={`text-xs pt-1 font-semibold ${syncMessage.includes('Successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {syncMessage}
              </p>
            )}
          </div>

          {/* Project Details */}
          <div className="text-[11px] text-slate-500 space-y-1">
            <p>Supabase Project: <span className="text-slate-300 font-mono">spxtvsluxxsnscwbofaa</span></p>
            <p>Database Schema: <span className="text-slate-300 font-mono">supabase/schema.sql</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d19] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
