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

export const INITIAL_CHOIRS: Choir[] = [];

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
