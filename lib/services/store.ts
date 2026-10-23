// ============================================================================
// HYBRID DATA STORE ENGINE FOR WORSHIP MINISTRY PLATFORM
// LOCAL CACHE + ASYNCHRONOUS SUPABASE CLOUD PERSISTENCE
// ============================================================================

import {
  Choir,
  Member,
  AttendanceSession,
  AttendanceRecord,
  FollowUp,
  Event,
  Assignment,
  Song,
  Setlist,
  Rehearsal,
  LeaveRequest,
  Announcement,
  CustomFieldDefinition,
  AuditLog,
  Organization,
  User,
  SystemRole,
  AppNotification,
  VocalPart
} from '../types';

import { INITIAL_ORGANIZATION, INITIAL_CHOIRS, INITIAL_CUSTOM_FIELDS, generateSeedMembers, INITIAL_SONGS, INITIAL_EVENTS, INITIAL_FOLLOW_UPS, INITIAL_AUDIT_LOGS, INITIAL_ANNOUNCEMENTS, INITIAL_USERS } from './seedData';
import { SupabaseDbService } from '../supabase/dbService';

const STORAGE_KEYS = {
  ORGANIZATION: 'worship_org_v2',
  USERS: 'worship_users_v2',
  CHOIRS: 'worship_choirs_v2',
  MEMBERS: 'worship_members_v2',
  CUSTOM_FIELDS: 'worship_custom_fields_v2',
  ATTENDANCE_SESSIONS: 'worship_att_sessions_v2',
  ATTENDANCE_RECORDS: 'worship_att_records_v2',
  FOLLOW_UPS: 'worship_follow_ups_v2',
  EVENTS: 'worship_events_v2',
  ASSIGNMENTS: 'worship_assignments_v2',
  SONGS: 'worship_songs_v2',
  SETLISTS: 'worship_setlists_v2',
  REHEARSALS: 'worship_rehearsals_v2',
  LEAVE_REQUESTS: 'worship_leave_requests_v2',
  ANNOUNCEMENTS: 'worship_announcements_v2',
  AUDIT_LOGS: 'worship_audit_logs_v2',
  NOTIFICATIONS: 'worship_notifications_v2'
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from LocalStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('worship_data_updated', { detail: { key } }));
  } catch (err) {
    console.error(`Error writing ${key} to LocalStorage:`, err);
  }
}

export const DataStore = {
  // --- INITIALIZATION ---
  initStore() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.CHOIRS)) {
      setItem(STORAGE_KEYS.ORGANIZATION, INITIAL_ORGANIZATION);
      setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
      setItem(STORAGE_KEYS.CHOIRS, INITIAL_CHOIRS);
      setItem(STORAGE_KEYS.CUSTOM_FIELDS, INITIAL_CUSTOM_FIELDS);
      setItem(STORAGE_KEYS.MEMBERS, generateSeedMembers());
      setItem(STORAGE_KEYS.SONGS, INITIAL_SONGS);
      setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      setItem(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
      setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
      setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
      setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
      setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
      setItem(STORAGE_KEYS.ASSIGNMENTS, []);
      setItem(STORAGE_KEYS.SETLISTS, []);
      setItem(STORAGE_KEYS.REHEARSALS, []);
      setItem(STORAGE_KEYS.LEAVE_REQUESTS, []);
      setItem(STORAGE_KEYS.NOTIFICATIONS, []);
    }
    this.syncUsersAndMembers();
    // Trigger background pull from Supabase to refresh local cache with cloud data
    this.syncFromSupabase();

    // Subscribe to realtime changes so all windows/accounts immediately stay in sync
    if (typeof window !== 'undefined' && !(window as any).__worship_realtime_initialized) {
      (window as any).__worship_realtime_initialized = true;
      SupabaseDbService.subscribeToChanges(() => {
        this.syncFromSupabase();
      });
    }
  },

  // --- SUPABASE CLOUD SYNCHRONIZATION ---
  async syncFromSupabase() {
    if (typeof window === 'undefined') return;
    try {
      const health = await SupabaseDbService.checkHealth();
      if (!health.configured || !health.tablesExist) {
        return;
      }

      const [
        sbChoirs,
        sbMembers,
        sbUsers,
        sbSessions,
        sbRecords,
        sbFollowUps,
        sbEvents,
        sbAssignments,
        sbSongs,
        sbAnnouncements,
        sbAuditLogs,
        sbOrg
      ] = await Promise.all([
        SupabaseDbService.fetchChoirs(),
        SupabaseDbService.fetchMembers(),
        SupabaseDbService.fetchUsers(),
        SupabaseDbService.fetchAttendanceSessions(),
        SupabaseDbService.fetchAttendanceRecords(),
        SupabaseDbService.fetchFollowUps(),
        SupabaseDbService.fetchEvents(),
        SupabaseDbService.fetchAssignments(),
        SupabaseDbService.fetchSongs(),
        SupabaseDbService.fetchAnnouncements(),
        SupabaseDbService.fetchAuditLogs(),
        SupabaseDbService.fetchOrganization()
      ]);

      let updated = false;

      // 1. RECONCILE MEMBERS (Two-Way Merge & Cloud Backfill)
      const localMembers = getItem<Member[]>(STORAGE_KEYS.MEMBERS, []);
      const memberMap = new Map<string, Member>();
      const memberEmails = new Set<string>();

      if (sbMembers && sbMembers.length > 0) {
        sbMembers.forEach((m) => {
          memberMap.set(m.id, m);
          if (m.email) memberEmails.add(m.email.toLowerCase());
        });
      }
      localMembers.forEach((lm) => {
        const emailKey = lm.email ? lm.email.toLowerCase() : null;
        if (!memberMap.has(lm.id) && (!emailKey || !memberEmails.has(emailKey))) {
          memberMap.set(lm.id, lm);
          if (emailKey) memberEmails.add(emailKey);
          // Upload local member to Supabase cloud so all other accounts see it
          SupabaseDbService.upsertMember(lm);
        }
      });
      const reconciledMembers = Array.from(memberMap.values());
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(reconciledMembers));
      updated = true;

      // 2. RECONCILE USERS (Two-Way Merge & Cloud Backfill)
      const localUsers = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      const userMap = new Map<string, User>();
      const userEmails = new Set<string>();

      if (sbUsers && sbUsers.length > 0) {
        sbUsers.forEach((u) => {
          userMap.set(u.id, u);
          if (u.email) userEmails.add(u.email.toLowerCase());
        });
      }
      localUsers.forEach((lu) => {
        const emailKey = lu.email ? lu.email.toLowerCase() : null;
        if (!userMap.has(lu.id) && (!emailKey || !userEmails.has(emailKey))) {
          userMap.set(lu.id, lu);
          if (emailKey) userEmails.add(emailKey);
          SupabaseDbService.upsertUser(lu);
        }
      });
      const reconciledUsers = Array.from(userMap.values());
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(reconciledUsers));

      // 3. RECONCILE CHOIRS
      if (sbChoirs && sbChoirs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CHOIRS, JSON.stringify(sbChoirs));
      }

      // 4. RECONCILE ATTENDANCE SESSIONS & RECORDS
      if (sbSessions && sbSessions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, JSON.stringify(sbSessions));
      }
      if (sbRecords && sbRecords.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(sbRecords));
      }

      // 5. RECONCILE FOLLOW UPS
      if (sbFollowUps && sbFollowUps.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(sbFollowUps));
      }

      // 6. RECONCILE EVENTS
      if (sbEvents && sbEvents.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(sbEvents));
      }

      // 7. RECONCILE ASSIGNMENTS
      if (sbAssignments && sbAssignments.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(sbAssignments));
      }

      // 8. RECONCILE SONGS
      if (sbSongs && sbSongs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(sbSongs));
      }

      // 9. RECONCILE ANNOUNCEMENTS
      if (sbAnnouncements && sbAnnouncements.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(sbAnnouncements));
      }

      // 10. RECONCILE AUDIT LOGS
      if (sbAuditLogs && sbAuditLogs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(sbAuditLogs));
      }

      // 11. RECONCILE ORGANIZATION
      if (sbOrg) {
        localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(sbOrg));
      }

      if (updated) {
        window.dispatchEvent(new CustomEvent('worship_data_updated', { detail: { source: 'supabase' } }));
      }
    } catch (e) {
      console.warn('Sync from Supabase warning:', e);
    }
  },

  async pushAllToSupabase() {
    return SupabaseDbService.syncAllToSupabase({
      organization: this.getOrganization(),
      users: this.getUsers(),
      choirs: this.getChoirs(),
      members: this.getMembers(),
      attendanceSessions: this.getAttendanceSessions(),
      attendanceRecords: getItem(STORAGE_KEYS.ATTENDANCE_RECORDS, []),
      followUps: this.getFollowUps(),
      events: this.getEvents(),
      assignments: this.getAssignments(),
      songs: this.getSongs(),
      announcements: this.getAnnouncements(),
      auditLogs: this.getAuditLogs(),
      customFields: this.getCustomFields()
    });
  },

  // --- AUTOMATIC USER & MEMBER SYNCHRONIZATION ---
  syncUsersAndMembers() {
    if (typeof window === 'undefined') return;
    try {
      const users = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      const members = getItem<Member[]>(STORAGE_KEYS.MEMBERS, []);
      const choirs = this.getChoirs();
      let changed = false;

      users.forEach((usr) => {
        // Skip super admin from choir member directory
        if (usr.role === 'SUPER_ADMIN' || usr.email.toLowerCase() === 'admin@church.org') {
          return;
        }
        const exists = members.some(
          (m) => (m.email && m.email.toLowerCase() === usr.email.toLowerCase()) || m.fullName.toLowerCase() === usr.fullName.toLowerCase()
        );
        if (!exists) {
          const assignedChoirId = usr.primaryChoirId || usr.assignedChoirIds?.[0] || 'choir-1';
          const choir = choirs.find((c) => c.id === assignedChoirId);
          const newMember: Member = {
            id: `mem-${usr.id.replace('usr-', '')}`,
            organizationId: 'org-001',
            userId: usr.id,
            fullName: usr.fullName,
            email: usr.email,
            phone: usr.phone || '',
            gender: 'Male',
            dateJoined: new Date().toISOString().split('T')[0],
            departments: ['Vocal'],
            vocalPart: 'Soprano',
            skillLevel: 'Intermediate',
            status: 'ACTIVE',
            consecutiveAbsences: 0,
            createdAt: new Date().toISOString().split('T')[0],
            primaryChoirId: assignedChoirId,
            choirName: choir?.name || 'Sanctuary Worship Choir'
          };
          members.push(newMember);
          changed = true;
          // Persist to Supabase
          SupabaseDbService.upsertMember(newMember);
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      }
    } catch (e) {
      console.warn('Sync users and members note:', e);
    }
  },

  // --- USER ACCOUNTS MANAGEMENT (SUPER ADMIN) ---
  getUsers(): User[] {
    return getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  createUser(user: Omit<User, 'id'>, userContext = 'Super Admin'): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      ...user
    };
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);

    // Persist to Supabase
    SupabaseDbService.upsertUser(newUser);

    // Auto-provision choir member record for non-super-admin users
    if (newUser.role !== 'SUPER_ADMIN') {
      try {
        const members = this.getMembers();
        if (!members.some((m) => m.email.toLowerCase() === newUser.email.toLowerCase())) {
          this.saveMember({
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone || '',
            primaryChoirId: newUser.primaryChoirId || 'choir-1',
            vocalPart: 'Tenor',
            status: 'ACTIVE'
          }, userContext);
        }
      } catch (e) {
        console.warn('Auto member provisioning note:', e);
      }
    }

    this.addAuditLog(userContext, 'SUPER_ADMIN', 'CREATE_USER_ACCOUNT', 'User', newUser.id, `Created account for '${newUser.fullName}' (${newUser.role}) assigned to choir '${newUser.primaryChoirId}'`);
    return newUser;
  },
  authenticateUser(usernameOrEmail: string, pass: string): User | null {
    const users = this.getUsers();
    const found = users.find(
      (u) => (u.email.toLowerCase() === usernameOrEmail.toLowerCase() || u.username?.toLowerCase() === usernameOrEmail.toLowerCase()) && u.password === pass
    );
    return found || null;
  },

  signUpUser(data: {
    fullName: string;
    email: string;
    username?: string;
    password: string;
    phone?: string;
    primaryChoirId?: string;
    role?: SystemRole;
    vocalPart?: VocalPart;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedUsername = (data.username || trimmedEmail.split('@')[0]).trim().toLowerCase();

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    // Check if username already exists
    if (users.some((u) => u.username?.toLowerCase() === trimmedUsername)) {
      return { success: false, error: 'This username is already taken. Please choose another username.' };
    }

    const assignedChoir = data.primaryChoirId || 'choir-1';
    const assignedRole: SystemRole = data.role || 'MEMBER';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName.trim(),
      email: trimmedEmail,
      username: trimmedUsername,
      password: data.password,
      phone: data.phone?.trim() || '',
      role: assignedRole,
      assignedChoirIds: [assignedChoir],
      primaryChoirId: assignedChoir
    };

    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);

    // Persist to Supabase
    SupabaseDbService.upsertUser(newUser);

    // Auto-provision choir member record
    try {
      const members = this.getMembers();
      if (!members.some((m) => m.email.toLowerCase() === trimmedEmail)) {
        this.saveMember({
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          primaryChoirId: assignedChoir,
          role: 'Member' as any,
          vocalPart: data.vocalPart || 'Soprano',
          status: 'ACTIVE'
        }, 'Registration');
      }
    } catch (e) {
      console.warn('Auto member provisioning note:', e);
    }

    this.addAuditLog(newUser.fullName, assignedRole, 'SIGN_UP', 'User', newUser.id, `User signed up account with choir '${assignedChoir}'`);
    return { success: true, user: newUser };
  },

  verifyResetAccount(usernameOrEmail: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const query = usernameOrEmail.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === query || u.username?.toLowerCase() === query
    );
    if (!found) {
      return { success: false, error: 'No account found matching that email or username.' };
    }
    return { success: true, user: found };
  },

  resetPassword(usernameOrEmail: string, newPassword: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const query = usernameOrEmail.trim().toLowerCase();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === query || u.username?.toLowerCase() === query
    );
    if (idx === -1) {
      return { success: false, error: 'User account not found.' };
    }
    users[idx].password = newPassword;
    setItem(STORAGE_KEYS.USERS, users);
    // Persist to Supabase
    SupabaseDbService.upsertUser(users[idx]);
    this.addAuditLog(users[idx].fullName, users[idx].role, 'PASSWORD_RESET', 'User', users[idx].id, 'Password was reset via password recovery');
    return { success: true };
  },

  changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return { success: false, error: 'User account not found.' };
    }
    if (users[idx].password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    users[idx].password = newPassword;
    setItem(STORAGE_KEYS.USERS, users);
    // Persist to Supabase
    SupabaseDbService.upsertUser(users[idx]);
    this.addAuditLog(users[idx].fullName, users[idx].role, 'PASSWORD_CHANGE', 'User', users[idx].id, 'User changed password from account settings');
    return { success: true };
  },

  updateUserProfile(userId: string, data: Partial<User>): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return { success: false, error: 'User not found.' };
    }
    const updatedUser = { ...users[idx], ...data };
    users[idx] = updatedUser;
    setItem(STORAGE_KEYS.USERS, users);
    // Persist to Supabase
    SupabaseDbService.upsertUser(updatedUser);
    this.addAuditLog(updatedUser.fullName, updatedUser.role, 'UPDATE_PROFILE', 'User', updatedUser.id, 'User updated their profile information');
    return { success: true, user: updatedUser };
  },

  // --- ORGANIZATION / SETTINGS ---
  getOrganization(): Organization {
    return getItem(STORAGE_KEYS.ORGANIZATION, INITIAL_ORGANIZATION);
  },
  updateOrganization(data: Partial<Organization>, userContext = 'Super Admin') {
    const current = this.getOrganization();
    const updated = { ...current, ...data };
    setItem(STORAGE_KEYS.ORGANIZATION, updated);
    // Persist to Supabase
    SupabaseDbService.upsertOrganization(updated);
    this.addAuditLog(userContext, 'SUPER_ADMIN', 'UPDATE_SETTINGS', 'Organization', current.id, 'Updated church settings');
    return updated;
  },

  // --- CHOIRS ---
  getChoirs(): Choir[] {
    const list = getItem(STORAGE_KEYS.CHOIRS, INITIAL_CHOIRS);
    if (!list || list.length === 0) {
      setItem(STORAGE_KEYS.CHOIRS, INITIAL_CHOIRS);
      return INITIAL_CHOIRS;
    }
    return list;
  },
  getChoirById(id: string): Choir | undefined {
    return this.getChoirs().find((c) => c.id === id);
  },
  saveChoir(choir: Partial<Choir> & { name: string }, userContext = 'Super Admin'): Choir {
    const choirs = this.getChoirs();
    let updated: Choir;
    if (choir.id) {
      const idx = choirs.findIndex((c) => c.id === choir.id);
      updated = { ...choirs[idx], ...choir };
      choirs[idx] = updated;
      this.addAuditLog(userContext, 'SUPER_ADMIN', 'UPDATE_CHOIR', 'Choir', updated.id, `Updated choir '${updated.name}'`);
    } else {
      updated = {
        id: `choir-${Date.now()}`,
        organizationId: 'org-001',
        code: `CH-${Math.floor(10 + Math.random() * 90)}`,
        description: choir.description || '',
        meetingDay: choir.meetingDay || 'Thursday',
        meetingTime: choir.meetingTime || '19:00',
        status: 'ACTIVE',
        memberCount: 0,
        adminName: choir.adminName || 'Unassigned',
        createdAt: new Date().toISOString().split('T')[0],
        ...choir
      };
      choirs.push(updated);
      this.addAuditLog(userContext, 'SUPER_ADMIN', 'CREATE_CHOIR', 'Choir', updated.id, `Created new choir '${updated.name}'`);
    }
    setItem(STORAGE_KEYS.CHOIRS, choirs);
    // Persist to Supabase
    SupabaseDbService.upsertChoir(updated);
    return updated;
  },
  deleteChoir(id: string, userContext = 'Super Admin') {
    const choirs = this.getChoirs().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CHOIRS, choirs);
    // Persist to Supabase
    SupabaseDbService.deleteChoir(id);
    this.addAuditLog(userContext, 'SUPER_ADMIN', 'DELETE_CHOIR', 'Choir', id, `Deleted choir ${id}`);
  },

  // --- MEMBERS ---
  getMembers(choirIdFilter?: string): Member[] {
    this.syncUsersAndMembers();
    const rawMembers = getItem<Member[]>(STORAGE_KEYS.MEMBERS, generateSeedMembers());
    const choirs = this.getChoirs();
    const members = rawMembers.map((m) => {
      if (!m.choirName || m.choirName === 'Unassigned') {
        const found = choirs.find((c) => c.id === m.primaryChoirId);
        if (found) {
          return { ...m, choirName: found.name };
        }
      }
      return m;
    });
    if (choirIdFilter && choirIdFilter !== 'ALL') {
      return members.filter((m) => m.primaryChoirId === choirIdFilter);
    }
    return members;
  },
  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id);
  },
  saveMember(member: Partial<Member> & { fullName: string; primaryChoirId: string }, userContext = 'Admin'): Member {
    const members = this.getMembers();
    let updated: Member;
    const choir = this.getChoirById(member.primaryChoirId);

    if (member.id) {
      const idx = members.findIndex((m) => m.id === member.id);
      updated = { ...members[idx], ...member, choirName: choir?.name || members[idx].choirName };
      members[idx] = updated;
      this.addAuditLog(userContext, 'ADMIN', 'UPDATE_MEMBER', 'Member', updated.id, `Updated member '${updated.fullName}'`);
    } else {
      updated = {
        id: `mem-${Date.now()}`,
        organizationId: 'org-001',
        phone: member.phone || '',
        email: member.email || '',
        gender: member.gender || 'Male',
        dateJoined: new Date().toISOString().split('T')[0],
        departments: member.departments || ['Vocal'],
        vocalPart: member.vocalPart || 'Tenor',
        skillLevel: member.skillLevel || 'Intermediate',
        status: 'ACTIVE',
        consecutiveAbsences: 0,
        createdAt: new Date().toISOString().split('T')[0],
        choirName: choir?.name || 'Unassigned',
        ...member
      };
      members.push(updated);
      this.addAuditLog(userContext, 'ADMIN', 'CREATE_MEMBER', 'Member', updated.id, `Created new member '${updated.fullName}' in ${choir?.name}`);
    }
    setItem(STORAGE_KEYS.MEMBERS, members);
    // Persist to Supabase
    SupabaseDbService.upsertMember(updated);
    return updated;
  },
  deleteMember(id: string, userContext = 'Admin') {
    const members = this.getMembers().filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.MEMBERS, members);
    // Persist to Supabase
    SupabaseDbService.deleteMember(id);
    this.addAuditLog(userContext, 'ADMIN', 'DELETE_MEMBER', 'Member', id, `Deleted member ID ${id}`);
  },

  // --- CUSTOM FIELDS ---
  getCustomFields(): CustomFieldDefinition[] {
    return getItem(STORAGE_KEYS.CUSTOM_FIELDS, INITIAL_CUSTOM_FIELDS);
  },
  saveCustomField(field: Partial<CustomFieldDefinition> & { fieldName: string; fieldType: any }): CustomFieldDefinition {
    const fields = this.getCustomFields();
    const newField: CustomFieldDefinition = {
      id: `cf-${Date.now()}`,
      fieldKey: field.fieldName.toLowerCase().replace(/\s+/g, '_'),
      isRequired: false,
      ...field
    };
    fields.push(newField);
    setItem(STORAGE_KEYS.CUSTOM_FIELDS, fields);
    // Persist to Supabase
    SupabaseDbService.upsertCustomField(newField);
    return newField;
  },

  // --- ATTENDANCE SYSTEM ---
  getAttendanceSessions(choirIdFilter?: string): AttendanceSession[] {
    const sessions = getItem<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    if (choirIdFilter && choirIdFilter !== 'ALL') {
      return sessions.filter((s) => s.choirId === choirIdFilter);
    }
    return sessions;
  },
  createAttendanceSession(data: Omit<AttendanceSession, 'id' | 'totalPresent' | 'totalAbsent' | 'totalMembers' | 'createdAt'>): AttendanceSession {
    const sessions = this.getAttendanceSessions();
    const choir = this.getChoirById(data.choirId);
    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      choirName: choir?.name,
      totalPresent: 0,
      totalAbsent: 0,
      totalMembers: 0,
      createdAt: new Date().toISOString(),
      ...data
    };
    sessions.unshift(newSession);
    setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, sessions);
    // Persist to Supabase
    SupabaseDbService.upsertAttendanceSession(newSession);
    return newSession;
  },
  saveAttendanceRecords(
    sessionId: string,
    records: { memberId: string; memberName: string; status: any; notes?: string }[],
    userContext = 'Leader'
  ) {
    const allRecords = getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const sessions = this.getAttendanceSessions();
    const sessionIdx = sessions.findIndex((s) => s.id === sessionId);

    let present = 0;
    let absent = 0;
    const recordsToPersist: AttendanceRecord[] = [];

    records.forEach((r) => {
      const recId = `rec-${sessionId}-${r.memberId}`;
      const existingIdx = allRecords.findIndex((rec) => rec.id === recId);
      const newRec: AttendanceRecord = {
        id: recId,
        sessionId,
        memberId: r.memberId,
        memberName: r.memberName,
        status: r.status,
        notes: r.notes
      };

      if (existingIdx >= 0) {
        allRecords[existingIdx] = newRec;
      } else {
        allRecords.push(newRec);
      }
      recordsToPersist.push(newRec);

      if (r.status === 'PRESENT' || r.status === 'LATE') present++;
      if (r.status === 'ABSENT') absent++;

      // Check for consecutive absences update
      const member = this.getMemberById(r.memberId);
      if (member) {
        if (r.status === 'ABSENT') {
          const newConsec = member.consecutiveAbsences + 1;
          this.saveMember({ ...member, consecutiveAbsences: newConsec });
          // AUTO-FLAG FOR PASTORAL CARE ON 3 CONSECUTIVE ABSENCES
          if (newConsec >= 3) {
            this.createFollowUp({
              choirId: member.primaryChoirId,
              memberId: member.id,
              memberName: member.fullName,
              reason: `${newConsec} Consecutive Absences (Auto-Flagged)`,
              priority: 'HIGH',
              status: 'NEW'
            });
          }
        } else if (r.status === 'PRESENT' || r.status === 'LATE') {
          if (member.consecutiveAbsences > 0) {
            this.saveMember({ ...member, consecutiveAbsences: 0 });
          }
        }
      }
    });

    setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, allRecords);

    if (sessionIdx >= 0) {
      sessions[sessionIdx].totalPresent = present;
      sessions[sessionIdx].totalAbsent = absent;
      sessions[sessionIdx].totalMembers = records.length;
      setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, sessions);
      // Persist session counts to Supabase
      SupabaseDbService.upsertAttendanceSession(sessions[sessionIdx]);
    }

    // Persist records to Supabase
    SupabaseDbService.upsertAttendanceRecords(recordsToPersist);

    this.addAuditLog(userContext, 'LEADER', 'RECORD_ATTENDANCE', 'AttendanceSession', sessionId, `Recorded attendance for ${records.length} members`);
  },
  getAttendanceRecordsForSession(sessionId: string): AttendanceRecord[] {
    const allRecords = getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    return allRecords.filter((r) => r.sessionId === sessionId);
  },

  // --- PASTORAL CARE & FOLLOW-UPS ---
  getFollowUps(choirIdFilter?: string): FollowUp[] {
    const followUps = getItem(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    if (choirIdFilter && choirIdFilter !== 'ALL') {
      return followUps.filter((f) => f.choirId === choirIdFilter);
    }
    return followUps;
  },
  createFollowUp(data: Partial<FollowUp> & { choirId: string; memberId: string; memberName: string; reason: string }): FollowUp {
    const followUps = this.getFollowUps();
    const choir = this.getChoirById(data.choirId);
    const newFollowUp: FollowUp = {
      id: `fol-${Date.now()}`,
      priority: 'MEDIUM',
      status: 'NEW',
      notesHistory: [],
      createdAt: new Date().toISOString().split('T')[0],
      choirName: choir?.name,
      ...data
    };
    followUps.unshift(newFollowUp);
    setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
    // Persist to Supabase
    SupabaseDbService.upsertFollowUp(newFollowUp);
    return newFollowUp;
  },
  addFollowUpNote(followUpId: string, note: string, authorName: string, contactMethod: any) {
    const followUps = this.getFollowUps();
    const idx = followUps.findIndex((f) => f.id === followUpId);
    if (idx >= 0) {
      followUps[idx].notesHistory.push({
        id: `fn-${Date.now()}`,
        authorName,
        note,
        contactMethod,
        createdAt: new Date().toLocaleString()
      });
      followUps[idx].status = 'CONTACTED';
      setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
      // Persist to Supabase
      SupabaseDbService.upsertFollowUp(followUps[idx]);
    }
  },

  // --- EVENTS & WORSHIP NIGHTS ---
  getEvents(): Event[] {
    return getItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },
  getEventById(id: string): Event | undefined {
    return this.getEvents().find((e) => e.id === id);
  },
  saveEvent(event: Partial<Event> & { title: string; eventType: any; eventDate: string }, userContext = 'Leader'): Event {
    const events = this.getEvents();
    let updated: Event;
    if (event.id) {
      const idx = events.findIndex((e) => e.id === event.id);
      updated = { ...events[idx], ...event };
      events[idx] = updated;
    } else {
      updated = {
        id: `event-${Date.now()}`,
        organizationId: 'org-001',
        description: '',
        startTime: '19:00',
        endTime: '21:00',
        location: 'Main Sanctuary',
        participatingChoirIds: ['choir-1'],
        status: 'UPCOMING',
        orderOfService: [],
        ...event
      };
      events.push(updated);
    }
    setItem(STORAGE_KEYS.EVENTS, events);
    // Persist to Supabase
    SupabaseDbService.upsertEvent(updated);
    this.addAuditLog(userContext, 'LEADER', 'SAVE_EVENT', 'Event', updated.id, `Saved event '${updated.title}'`);
    return updated;
  },

  // --- SCHEDULING & ASSIGNMENTS ---
  getAssignments(): Assignment[] {
    return getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  },
  saveAssignment(assignment: Partial<Assignment> & { eventId: string; memberId: string; roleTitle: string }): Assignment {
    const assignments = this.getAssignments();
    const member = this.getMemberById(assignment.memberId);
    const event = this.getEventById(assignment.eventId);

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      eventTitle: event?.title || 'Worship Service',
      eventDate: event?.eventDate || '',
      memberName: member?.fullName || 'Member',
      choirId: member?.primaryChoirId || '',
      status: 'PENDING',
      ...assignment
    };
    assignments.push(newAssignment);
    setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
    // Persist to Supabase
    SupabaseDbService.upsertAssignment(newAssignment);
    return newAssignment;
  },
  updateAssignmentStatus(id: string, status: any, notes?: string) {
    const assignments = this.getAssignments();
    const idx = assignments.findIndex((a) => a.id === id);
    if (idx >= 0) {
      assignments[idx].status = status;
      if (notes) assignments[idx].notes = notes;
      setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
      // Persist to Supabase
      SupabaseDbService.upsertAssignment(assignments[idx]);
    }
  },

  // --- SONGS & SETLISTS ---
  getSongs(): Song[] {
    return getItem(STORAGE_KEYS.SONGS, INITIAL_SONGS);
  },
  saveSong(song: Partial<Song> & { title: string; artist: string; originalKey: string }): Song {
    const songs = this.getSongs();
    const newSong: Song = {
      id: `song-${Date.now()}`,
      bpm: 72,
      language: 'English',
      lyrics: song.lyrics || '',
      difficulty: 'Easy',
      tags: song.tags || ['Worship'],
      ...song
    };
    songs.push(newSong);
    setItem(STORAGE_KEYS.SONGS, songs);
    // Persist to Supabase
    SupabaseDbService.upsertSong(newSong);
    return newSong;
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(userName: string, userRole: string, action: string, resourceType: string, resourceId: string, details: string) {
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      userName,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      createdAt: new Date().toLocaleString()
    };
    logs.unshift(log);
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
    // Persist to Supabase
    SupabaseDbService.upsertAuditLog(log);
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements(): Announcement[] {
    return getItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  createAnnouncement(ann: Partial<Announcement> & { title: string; message: string; targetType: any }): Announcement {
    const anns = this.getAnnouncements();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      priority: 'NORMAL',
      authorName: 'Admin',
      scheduledAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      ...ann
    };
    anns.unshift(newAnn);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, anns);
    // Persist to Supabase
    SupabaseDbService.upsertAnnouncement(newAnn);
    return newAnn;
  }
};
