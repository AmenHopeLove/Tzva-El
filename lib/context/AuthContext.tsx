'use client';

// ============================================================================
// AUTH & MULTI-CHOIR CONTEXT PROVIDER (AUTHENTICATION & STRICT CHOIR ISOLATION)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemRole, PermissionKey, Choir, VocalPart } from '../types';
import { DataStore } from '../services/store';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { toCamelCase } from '../supabase/dbService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentRole: SystemRole;
  activeChoirId: string; // 'ALL' for Super Admin or specific choirId for assigned users
  activeChoir?: Choir;
  availableChoirs: Choir[]; // Filtered list of choirs user is allowed to access
  allChoirs: Choir[];
  login: (usernameOrEmail: string, pass: string) => boolean | Promise<boolean>;
  signUp: (data: {
    fullName: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    primaryChoirId?: string;
    role?: SystemRole;
    vocalPart?: VocalPart;
  }) => { success: boolean; user?: User; error?: string };
  verifyResetAccount: (usernameOrEmail: string) => { success: boolean; user?: User; error?: string };
  resetPassword: (usernameOrEmail: string, newPassword: string) => { success: boolean; error?: string };
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateProfile: (data: Partial<User>) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  setRole: (role: SystemRole) => void;
  setActiveChoirId: (id: string) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  canAccessChoir: (choirId: string) => boolean;
  refreshData: () => void;
}

const ROLE_PERMISSIONS_MAP: Record<SystemRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'members.view',
    'members.create',
    'members.edit',
    'members.delete',
    'attendance.view',
    'attendance.create',
    'attendance.edit',
    'attendance.delete',
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'followup.view',
    'followup.create',
    'followup.edit',
    'songs.view',
    'songs.manage',
    'reports.view',
    'settings.manage',
    'users.manage',
    'audit_logs.view'
  ],
  WORSHIP_MINISTRY_LEADER: [
    'members.view',
    'members.create',
    'members.edit',
    'attendance.view',
    'attendance.create',
    'attendance.edit',
    'events.view',
    'events.create',
    'events.edit',
    'followup.view',
    'followup.create',
    'followup.edit',
    'songs.view',
    'songs.manage',
    'reports.view',
    'audit_logs.view'
  ],
  CHOIR_ADMIN: [
    'members.view',
    'members.create',
    'members.edit',
    'attendance.view',
    'attendance.create',
    'attendance.edit',
    'events.view',
    'events.create',
    'events.edit',
    'followup.view',
    'followup.create',
    'followup.edit',
    'songs.view',
    'reports.view'
  ],
  CHOIR_LEADER: [
    'members.view',
    'attendance.view',
    'attendance.create',
    'events.view',
    'events.create',
    'followup.view',
    'followup.create',
    'songs.view'
  ],
  TEAM_LEADER: [
    'members.view',
    'attendance.view',
    'attendance.create',
    'events.view',
    'followup.view'
  ],
  MEMBER: [
    'members.view',
    'attendance.view',
    'events.view',
    'songs.view'
  ],
  VIEWER: [
    'members.view',
    'attendance.view',
    'events.view',
    'songs.view'
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<SystemRole>('MEMBER');
  const [activeChoirId, setActiveChoirId] = useState<string>('choir-1');
  const [allChoirs, setAllChoirs] = useState<Choir[]>([]);

  useEffect(() => {
    DataStore.initStore();
    setAllChoirs(DataStore.getChoirs());

    const checkSession = () => {
      if (typeof window !== 'undefined') {
        const savedUserId = localStorage.getItem('worship_session_user_id');
        if (savedUserId) {
          const users = DataStore.getUsers();
          const user = users.find((u) => u.id === savedUserId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setCurrentRole(user.role);
            setActiveChoirId(user.role === 'SUPER_ADMIN' ? 'ALL' : (user.primaryChoirId || user.assignedChoirIds[0] || 'choir-1'));
            return;
          }
        }
      }
    };

    checkSession();

    // Listen to real-time and Supabase cloud data updates
    const handleUpdate = () => {
      setAllChoirs(DataStore.getChoirs());
      checkSession();
    };

    window.addEventListener('worship_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('worship_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const refreshData = () => {
    setAllChoirs(DataStore.getChoirs());
  };

  const login = async (usernameOrEmail: string, pass: string): Promise<boolean> => {
    let user = DataStore.authenticateUser(usernameOrEmail, pass);

    // If user is not yet loaded into local cache, query Supabase cloud directly
    if (!user && isSupabaseConfigured()) {
      try {
        const query = usernameOrEmail.trim().toLowerCase();
        const { data } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${query},username.ilike.${query}`)
          .limit(1);

        if (data && data.length > 0) {
          const cloudUser = toCamelCase(data[0]) as User;
          if (cloudUser.password === pass) {
            user = cloudUser;
            // Cache locally so subsequent calls are instant
            const localUsers = DataStore.getUsers();
            if (!localUsers.some((u) => u.id === user!.id)) {
              localUsers.push(user!);
              localStorage.setItem('worship_users_v2', JSON.stringify(localUsers));
            }
          }
        }
      } catch (err) {
        console.warn('Direct cloud login check note:', err);
      }
    }

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentRole(user.role);

      if (user.role === 'SUPER_ADMIN') {
        setActiveChoirId('ALL');
      } else {
        const assigned = user.primaryChoirId || user.assignedChoirIds[0] || 'choir-1';
        setActiveChoirId(assigned);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('worship_session_user_id', user.id);
      }
      return true;
    }
    return false;
  };

  const signUp = (data: {
    fullName: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    primaryChoirId?: string;
    role?: SystemRole;
    vocalPart?: VocalPart;
  }) => {
    const res = DataStore.signUpUser(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setCurrentRole(res.user.role);
      setActiveChoirId(res.user.primaryChoirId || 'choir-1');
      if (typeof window !== 'undefined') {
        localStorage.setItem('worship_session_user_id', res.user.id);
      }
      refreshData();
    }
    return res;
  };

  const verifyResetAccount = (usernameOrEmail: string) => {
    return DataStore.verifyResetAccount(usernameOrEmail);
  };

  const resetPassword = (usernameOrEmail: string, newPassword: string) => {
    return DataStore.resetPassword(usernameOrEmail, newPassword);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, error: 'User is not authenticated.' };
    return DataStore.changePassword(currentUser.id, oldPassword, newPassword);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return { success: false, error: 'User is not authenticated.' };
    const res = DataStore.updateUserProfile(currentUser.id, data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('worship_session_user_id');
    }
  };

  const setRole = (role: SystemRole) => {
    // Strict RBAC: Only authentic SUPER_ADMIN accounts may switch preview roles
    if (currentUser?.role !== 'SUPER_ADMIN') {
      console.warn('Unauthorized role switch attempt blocked for non-super-admin user');
      return;
    }
    setCurrentRole(role);
    // Preserves authentic account role (currentUser.role) without mutation
    if (role !== 'SUPER_ADMIN' && activeChoirId === 'ALL') {
      setActiveChoirId(currentUser.primaryChoirId || 'choir-1');
    }
  };

  const handleSetActiveChoirId = (id: string) => {
    // Non-admins cannot access the combined multi-choir view
    if (id === 'ALL' && currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'WORSHIP_MINISTRY_LEADER') {
      console.warn('Access denied: Cannot view ALL choirs');
      return;
    }
    setActiveChoirId(id);
  };

  // Enforce strict available choir list based on authentic user role
  const availableChoirs = React.useMemo(() => {
    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'WORSHIP_MINISTRY_LEADER') {
      return allChoirs;
    }
    if (!currentUser) return [];
    // Restrict non-Super Admins to ONLY their assigned choirs
    const userChoirIds = currentUser.assignedChoirIds || (currentUser.primaryChoirId ? [currentUser.primaryChoirId] : []);
    return allChoirs.filter((c) => userChoirIds.includes(c.id) || c.id === currentUser.primaryChoirId);
  }, [allChoirs, currentUser]);

  const hasPermission = (permission: PermissionKey): boolean => {
    // If the account is a Super Admin, respect active preview role.
    // If account is NOT a Super Admin, ALWAYS strictly enforce authentic account role!
    const effectiveRole = currentUser?.role === 'SUPER_ADMIN' ? currentRole : (currentUser?.role || 'MEMBER');
    const allowedList = ROLE_PERMISSIONS_MAP[effectiveRole] || [];
    return allowedList.includes(permission);
  };

  const canAccessChoir = (choirId: string): boolean => {
    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'WORSHIP_MINISTRY_LEADER') {
      return true;
    }
    if (activeChoirId === 'ALL') return false;
    const userChoirIds = currentUser?.assignedChoirIds || (currentUser?.primaryChoirId ? [currentUser.primaryChoirId] : []);
    return userChoirIds.includes(choirId) || currentUser?.primaryChoirId === choirId;
  };

  const activeChoir = allChoirs.find((c) => c.id === activeChoirId);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        currentRole,
        activeChoirId,
        activeChoir,
        availableChoirs,
        allChoirs,
        login,
        signUp,
        verifyResetAccount,
        resetPassword,
        changePassword,
        updateProfile,
        logout,
        setRole,
        setActiveChoirId: handleSetActiveChoirId,
        hasPermission,
        canAccessChoir,
        refreshData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
