// ============================================================================
// SEED DATA FOR WORSHIP MINISTRY MANAGEMENT SYSTEM
// ============================================================================

import {
  Choir,
  Member,
  FollowUp,
  Event,
  Song,
  CustomFieldDefinition,
  AuditLog,
  Announcement,
  User
} from '../types';

export const INITIAL_ORGANIZATION = {
  id: 'org-001',
  name: 'Worship Ministry',
  logoUrl: '/church-logo.png',
  primaryColor: '#4F46E5', // Indigo
  secondaryColor: '#0F172A', // Slate
  timeZone: 'UTC',
  language: 'en'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-super-admin',
    email: 'admin@church.org',
    username: 'admin',
    password: 'admin123',
    fullName: 'System Admin',
    role: 'SUPER_ADMIN',
    assignedChoirIds: ['ALL'],
    primaryChoirId: 'ALL'
  }
];

export const INITIAL_CHOIRS: Choir[] = [
  {
    id: 'choir-1',
    organizationId: 'org-001',
    name: 'Sanctuary Worship Choir',
    code: 'SWC',
    description: 'Main Sunday morning sanctuary worship team & choir',
    meetingDay: 'Thursday',
    meetingTime: '19:00',
    status: 'ACTIVE',
    memberCount: 24,
    adminName: 'Pastor David',
    createdAt: '2026-01-01'
  },
  {
    id: 'choir-2',
    organizationId: 'org-001',
    name: 'Youth & Young Adult Choir',
    code: 'YYA',
    description: 'Youth and collegiate contemporary praise choir',
    meetingDay: 'Friday',
    meetingTime: '18:30',
    status: 'ACTIVE',
    memberCount: 18,
    adminName: 'Sarah Jenkins',
    createdAt: '2026-01-15'
  },
  {
    id: 'choir-3',
    organizationId: 'org-001',
    name: 'Gospel Praise Ensemble',
    code: 'GPE',
    description: 'Energetic gospel & contemporary celebration ensemble',
    meetingDay: 'Tuesday',
    meetingTime: '19:30',
    status: 'ACTIVE',
    memberCount: 16,
    adminName: 'Marcus Cole',
    createdAt: '2026-02-01'
  }
];

export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [];

export function generateSeedMembers(): Member[] {
  return [];
}

export const INITIAL_SONGS: Song[] = [];

export const INITIAL_EVENTS: Event[] = [];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    userName: 'System',
    userRole: 'SYSTEM',
    action: 'SYSTEM_INIT',
    resourceType: 'Organization',
    details: 'System initialized',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
