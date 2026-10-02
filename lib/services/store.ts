// ============================================================================
// LOCAL STORAGE & DATA STORE ENGINE FOR WORSHIP MINISTRY PLATFORM
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
  AppNotification
} from '../types';

import { INITIAL_ORGANIZATION, INITIAL_CHOIRS, INITIAL_CUSTOM_FIELDS, generateSeedMembers, INITIAL_SONGS, INITIAL_EVENTS, INITIAL_FOLLOW_UPS, INITIAL_AUDIT_LOGS, INITIAL_ANNOUNCEMENTS, INITIAL_USERS } from './seedData';

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

  // --- ORGANIZATION / SETTINGS ---
  getOrganization(): Organization {
    return getItem(STORAGE_KEYS.ORGANIZATION, INITIAL_ORGANIZATION);
  },
  updateOrganization(data: Partial<Organization>, userContext = 'Super Admin') {
    const current = this.getOrganization();
    const updated = { ...current, ...data };
    setItem(STORAGE_KEYS.ORGANIZATION, updated);
    this.addAuditLog(userContext, 'SUPER_ADMIN', 'UPDATE_SETTINGS', 'Organization', current.id, 'Updated church settings');
    return updated;
  },

  // --- CHOIRS ---
  getChoirs(): Choir[] {
    return getItem(STORAGE_KEYS.CHOIRS, INITIAL_CHOIRS);
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
    return updated;
  },
  deleteChoir(id: string, userContext = 'Super Admin') {
    const choirs = this.getChoirs().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CHOIRS, choirs);
    this.addAuditLog(userContext, 'SUPER_ADMIN', 'DELETE_CHOIR', 'Choir', id, `Deleted choir ${id}`);
  },

  // --- MEMBERS ---
  getMembers(choirIdFilter?: string): Member[] {
    const members = getItem(STORAGE_KEYS.MEMBERS, generateSeedMembers());
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
    return updated;
  },
  deleteMember(id: string, userContext = 'Admin') {
    const members = this.getMembers().filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.MEMBERS, members);
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
    }

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
    return newAssignment;
  },
  updateAssignmentStatus(id: string, status: any, notes?: string) {
    const assignments = this.getAssignments();
    const idx = assignments.findIndex((a) => a.id === id);
    if (idx >= 0) {
      assignments[idx].status = status;
      if (notes) assignments[idx].notes = notes;
      setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
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
    return newAnn;
  }
};
