'use client';

// ============================================================================
// AUTH & MULTI-CHOIR CONTEXT PROVIDER (AUTHENTICATION & STRICT CHOIR ISOLATION)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemRole, PermissionKey, Choir, VocalPart } from '../types';
import { DataStore } from '../services/store';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentRole: SystemRole;
  activeChoirId: string; // 'ALL' for Super Admin or specific choirId for assigned users
  activeChoir?: Choir;
  availableChoirs: Choir[]; // Filtered list of choirs user is allowed to access
  allChoirs: Choir[];
  login: (usernameOrEmail: string, pass: string) => boolean;
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
    const choirsList = DataStore.getChoirs();
    setAllChoirs(choirsList);

    // Session persistence check
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
    // Default to logged out state if no active session
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshData = () => {
    setAllChoirs(DataStore.getChoirs());
  };

  const login = (usernameOrEmail: string, pass: string): boolean => {
    const user = DataStore.authenticateUser(usernameOrEmail, pass);
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
    setCurrentRole(role);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role
      });
      if (role !== 'SUPER_ADMIN' && activeChoirId === 'ALL') {
        setActiveChoirId(currentUser.primaryChoirId || 'choir-1');
      }
    }
  };

  // Enforce strict available choir list based on user role
  const availableChoirs = React.useMemo(() => {
    if (currentRole === 'SUPER_ADMIN' || currentRole === 'WORSHIP_MINISTRY_LEADER') {
      return allChoirs;
    }
    if (!currentUser) return [];
    // Restrict non-Super Admins to ONLY their assigned choirs
    const userChoirIds = currentUser.assignedChoirIds || [currentUser.primaryChoirId];
    return allChoirs.filter((c) => userChoirIds.includes(c.id) || c.id === currentUser.primaryChoirId);
  }, [allChoirs, currentRole, currentUser]);

  const hasPermission = (permission: PermissionKey): boolean => {
    const allowedList = ROLE_PERMISSIONS_MAP[currentRole] || [];
    return allowedList.includes(permission);
  };

  const canAccessChoir = (choirId: string): boolean => {
    if (currentRole === 'SUPER_ADMIN' || currentRole === 'WORSHIP_MINISTRY_LEADER') {
      return true;
    }
    if (activeChoirId === 'ALL') return false;
    return activeChoirId === choirId;
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
        setActiveChoirId,
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
