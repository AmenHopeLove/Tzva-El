// ============================================================================
// SUPABASE DATABASE SERVICE (HYBRID PERSISTENCE & REALTIME CLOUD SYNC)
// ============================================================================

import { supabase, isSupabaseConfigured } from './client';
import {
  Member,
  Choir,
  User,
  AttendanceSession,
  AttendanceRecord,
  FollowUp,
  Event,
  Assignment,
  Song,
  Announcement,
  AuditLog,
  Organization,
  CustomFieldDefinition
} from '../types';

// Helper: Convert camelCase object keys to snake_case for PostgreSQL
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Helper: Convert snake_case object keys to camelCase for TypeScript
export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export const SupabaseDbService = {
  // Check whether Supabase connection and tables are ready
  async checkHealth(): Promise<{ configured: boolean; tablesExist: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { configured: false, tablesExist: false, error: 'Supabase credentials are not configured in .env.local' };
    }
    try {
      const { data, error } = await supabase.from('choirs').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          return { configured: true, tablesExist: false, error: 'Database tables have not been created yet in Supabase.' };
        }
        return { configured: true, tablesExist: false, error: error.message };
      }
      return { configured: true, tablesExist: true };
    } catch (e: any) {
      return { configured: true, tablesExist: false, error: e?.message || 'Failed to connect to Supabase' };
    }
  },

  // --- FETCH ALL ENTITIES ---
  async fetchChoirs(): Promise<Choir[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('choirs').select('*').order('created_at', { ascending: true });
      if (error || !data) return null;
      return toCamelCase(data) as Choir[];
    } catch {
      return null;
    }
  },

  async fetchMembers(): Promise<Member[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return toCamelCase(data) as Member[];
    } catch {
      return null;
    }
  },

  async fetchUsers(): Promise<User[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error || !data) return null;
      return toCamelCase(data) as User[];
    } catch {
      return null;
    }
  },

  async fetchAttendanceSessions(): Promise<AttendanceSession[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('attendance_sessions').select('*').order('session_date', { ascending: false });
      if (error || !data) return null;
      return toCamelCase(data) as AttendanceSession[];
    } catch {
      return null;
    }
  },

  async fetchAttendanceRecords(): Promise<AttendanceRecord[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('attendance_records').select('*');
      if (error || !data) return null;
      return toCamelCase(data) as AttendanceRecord[];
    } catch {
      return null;
    }
  },

  async fetchFollowUps(): Promise<FollowUp[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('follow_ups').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return toCamelCase(data) as FollowUp[];
    } catch {
      return null;
    }
  },

  async fetchEvents(): Promise<Event[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (error || !data) return null;
      return toCamelCase(data) as Event[];
    } catch {
      return null;
    }
  },

  async fetchAssignments(): Promise<Assignment[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('assignments').select('*');
      if (error || !data) return null;
      return toCamelCase(data) as Assignment[];
    } catch {
      return null;
    }
  },

  async fetchSongs(): Promise<Song[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('songs').select('*').order('title', { ascending: true });
      if (error || !data) return null;
      return toCamelCase(data) as Song[];
    } catch {
      return null;
    }
  },

  async fetchAnnouncements(): Promise<Announcement[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return toCamelCase(data) as Announcement[];
    } catch {
      return null;
    }
  },

  async fetchAuditLogs(): Promise<AuditLog[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (error || !data) return null;
      return toCamelCase(data) as AuditLog[];
    } catch {
      return null;
    }
  },

  async fetchOrganization(): Promise<Organization | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('organizations').select('*').limit(1).single();
      if (error || !data) return null;
      return toCamelCase(data) as Organization;
    } catch {
      return null;
    }
  },

  async fetchCustomFields(): Promise<CustomFieldDefinition[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('custom_fields').select('*');
      if (error || !data) return null;
      return toCamelCase(data) as CustomFieldDefinition[];
    } catch {
      return null;
    }
  },

  // --- UPSERT & DELETE METHODS ---
  async upsertChoir(choir: Choir) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(choir);
      await supabase.from('choirs').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert choir error:', e);
    }
  },

  async deleteChoir(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('choirs').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete choir error:', e);
    }
  },

  async upsertMember(member: Member) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(member);
      await supabase.from('members').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert member error:', e);
    }
  },

  async deleteMember(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('members').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete member error:', e);
    }
  },

  async upsertUser(user: User) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(user);
      await supabase.from('users').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert user error:', e);
    }
  },

  async upsertAttendanceSession(session: AttendanceSession) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(session);
      await supabase.from('attendance_sessions').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert session error:', e);
    }
  },

  async upsertAttendanceRecords(records: AttendanceRecord[]) {
    if (!isSupabaseConfigured() || !records.length) return;
    try {
      const payload = toSnakeCase(records);
      await supabase.from('attendance_records').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert attendance records error:', e);
    }
  },

  async upsertFollowUp(followUp: FollowUp) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(followUp);
      await supabase.from('follow_ups').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert follow up error:', e);
    }
  },

  async upsertEvent(event: Event) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(event);
      await supabase.from('events').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert event error:', e);
    }
  },

  async upsertAssignment(assignment: Assignment) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(assignment);
      await supabase.from('assignments').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert assignment error:', e);
    }
  },

  async upsertSong(song: Song) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(song);
      await supabase.from('songs').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert song error:', e);
    }
  },

  async upsertAnnouncement(ann: Announcement) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(ann);
      await supabase.from('announcements').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert announcement error:', e);
    }
  },

  async upsertAuditLog(log: AuditLog) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(log);
      await supabase.from('audit_logs').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert audit log error:', e);
    }
  },

  async upsertOrganization(org: Organization) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(org);
      await supabase.from('organizations').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert organization error:', e);
    }
  },

  async upsertCustomField(field: CustomFieldDefinition) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = toSnakeCase(field);
      await supabase.from('custom_fields').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert custom field error:', e);
    }
  },

  // Bulk push all local data to Supabase
  async syncAllToSupabase(localData: {
    organization?: Organization;
    users?: User[];
    choirs?: Choir[];
    members?: Member[];
    attendanceSessions?: AttendanceSession[];
    attendanceRecords?: AttendanceRecord[];
    followUps?: FollowUp[];
    events?: Event[];
    assignments?: Assignment[];
    songs?: Song[];
    announcements?: Announcement[];
    auditLogs?: AuditLog[];
    customFields?: CustomFieldDefinition[];
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase credentials are missing' };
    }

    try {
      if (localData.organization) {
        await supabase.from('organizations').upsert(toSnakeCase(localData.organization), { onConflict: 'id' });
      }
      if (localData.choirs && localData.choirs.length > 0) {
        await supabase.from('choirs').upsert(toSnakeCase(localData.choirs), { onConflict: 'id' });
      }
      if (localData.users && localData.users.length > 0) {
        await supabase.from('users').upsert(toSnakeCase(localData.users), { onConflict: 'id' });
      }
      if (localData.members && localData.members.length > 0) {
        await supabase.from('members').upsert(toSnakeCase(localData.members), { onConflict: 'id' });
      }
      if (localData.attendanceSessions && localData.attendanceSessions.length > 0) {
        await supabase.from('attendance_sessions').upsert(toSnakeCase(localData.attendanceSessions), { onConflict: 'id' });
      }
      if (localData.attendanceRecords && localData.attendanceRecords.length > 0) {
        await supabase.from('attendance_records').upsert(toSnakeCase(localData.attendanceRecords), { onConflict: 'id' });
      }
      if (localData.followUps && localData.followUps.length > 0) {
        await supabase.from('follow_ups').upsert(toSnakeCase(localData.followUps), { onConflict: 'id' });
      }
      if (localData.events && localData.events.length > 0) {
        await supabase.from('events').upsert(toSnakeCase(localData.events), { onConflict: 'id' });
      }
      if (localData.assignments && localData.assignments.length > 0) {
        await supabase.from('assignments').upsert(toSnakeCase(localData.assignments), { onConflict: 'id' });
      }
      if (localData.songs && localData.songs.length > 0) {
        await supabase.from('songs').upsert(toSnakeCase(localData.songs), { onConflict: 'id' });
      }
      if (localData.announcements && localData.announcements.length > 0) {
        await supabase.from('announcements').upsert(toSnakeCase(localData.announcements), { onConflict: 'id' });
      }
      if (localData.auditLogs && localData.auditLogs.length > 0) {
        await supabase.from('audit_logs').upsert(toSnakeCase(localData.auditLogs), { onConflict: 'id' });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Sync to Supabase failed' };
    }
  },

  // Realtime subscription for multi-user / multi-window instant synchronization
  subscribeToChanges(callback: () => void) {
    if (!isSupabaseConfigured()) return () => {};
    try {
      const channel = supabase
        .channel('worship-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            callback();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    } catch {
      return () => {};
    }
  }
};
