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
  User,
  PrayerRequest
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

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fol-001',
    choirId: 'choir-1',
    choirName: 'Sanctuary Worship Choir',
    memberId: 'mem-sample-1',
    memberName: 'Rachel Adams',
    phone: '+1 (555) 234-5678',
    email: 'rachel.adams@example.org',
    category: 'ILLNESS',
    reason: 'Vocal strain and acute bronchitis; missed last 2 Sunday morning services',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedLeaderId: 'user-super-admin',
    assignedLeaderName: 'Pastor David',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    notesHistory: [
      {
        id: 'fn-001',
        authorName: 'Pastor David',
        contactMethod: 'Phone Call',
        note: 'Spoke with Sister Rachel. She is resting her voice and taking prescribed medication. Appreciated the choir reaching out with prayers.',
        createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
      },
      {
        id: 'fn-002',
        authorName: 'Sarah Jenkins',
        contactMethod: 'WhatsApp',
        note: 'Sent an encouraging scripture (Isaiah 40:29) and confirmed food basket delivery from the hospitality team.',
        createdAt: new Date(Date.now() - 86400000).toLocaleDateString()
      }
    ]
  },
  {
    id: 'fol-002',
    choirId: 'choir-2',
    choirName: 'Youth & Young Adult Choir',
    memberId: 'mem-sample-2',
    memberName: 'Marcus Vance',
    phone: '+1 (555) 345-6789',
    email: 'marcus.vance@example.org',
    category: 'ABSENTEEISM',
    reason: '3 Consecutive Absences (Auto-Flagged from Attendance Portal)',
    priority: 'HIGH',
    status: 'NEW',
    assignedLeaderId: 'user-super-admin',
    assignedLeaderName: 'Sarah Jenkins',
    nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    notesHistory: []
  },
  {
    id: 'fol-003',
    choirId: 'choir-1',
    choirName: 'Sanctuary Worship Choir',
    memberId: 'mem-sample-3',
    memberName: 'Hannah Montgomery',
    phone: '+1 (555) 456-7890',
    email: 'hannah.m@example.org',
    category: 'BEREAVEMENT',
    reason: 'Loss of paternal grandmother; requested family prayer and home visit',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedLeaderId: 'user-super-admin',
    assignedLeaderName: 'Pastor David',
    nextFollowUpDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    notesHistory: [
      {
        id: 'fn-003',
        authorName: 'Pastor David',
        contactMethod: 'Home/Hospital Visit',
        note: 'Conducted home visitation with the elders. Offered intercessory prayer and ministered peace to the bereaved family. Memorial service scheduled for Saturday.',
        createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
      }
    ]
  },
  {
    id: 'fol-004',
    choirId: 'choir-3',
    choirName: 'Gospel Praise Ensemble',
    memberId: 'mem-sample-4',
    memberName: 'Elijah Brooks',
    phone: '+1 (555) 567-8901',
    email: 'elijah.b@example.org',
    category: 'SPIRITUAL_SUPPORT',
    reason: 'Work shift burnout and scheduling conflicts; needs pastoral guidance and mentorship',
    priority: 'MEDIUM',
    status: 'WAITING',
    assignedLeaderId: 'user-super-admin',
    assignedLeaderName: 'Marcus Cole',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    notesHistory: [
      {
        id: 'fn-004',
        authorName: 'Marcus Cole',
        contactMethod: 'In-Person',
        note: 'Had fellowship after Thursday rehearsal. Discussed balancing evening shifts with ministry commitments. Recommended rotation schedule.',
        createdAt: new Date(Date.now() - 86400000 * 5).toLocaleDateString()
      }
    ]
  },
  {
    id: 'fol-005',
    choirId: 'choir-1',
    choirName: 'Sanctuary Worship Choir',
    memberId: 'mem-sample-5',
    memberName: 'Deborah Lawson',
    phone: '+1 (555) 678-9012',
    email: 'deborah.l@example.org',
    category: 'WELLNESS_CHECK',
    reason: 'Post-delivery maternity recovery check-in and congratulations',
    priority: 'LOW',
    status: 'COMPLETED',
    assignedLeaderId: 'user-super-admin',
    assignedLeaderName: 'Choir Leadership',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    notesHistory: [
      {
        id: 'fn-005',
        authorName: 'Sarah Jenkins',
        contactMethod: 'Phone Call',
        note: 'Mother and baby doing wonderfully! Church sent flowers and congratulations. Deborah plans to return after maternity leave.',
        createdAt: new Date(Date.now() - 86400000 * 7).toLocaleDateString()
      }
    ]
  }
];

export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 'pray-001',
    memberId: 'mem-sample-1',
    memberName: 'Rachel Adams',
    choirId: 'choir-1',
    title: 'Complete voice healing & respiratory strength',
    description: 'Praying for rapid recovery from vocal strain and lung strength for the upcoming worship night.',
    privacyLevel: 'CHOIR_LEADERSHIP',
    isAnswered: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]
  },
  {
    id: 'pray-002',
    memberId: 'mem-sample-3',
    memberName: 'Hannah Montgomery',
    choirId: 'choir-1',
    title: 'Comfort & peace during family bereavement',
    description: 'Strength and divine comfort for the entire family during memorial service arrangements.',
    privacyLevel: 'WORSHIP_LEADERSHIP',
    isAnswered: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0]
  },
  {
    id: 'pray-003',
    memberId: 'mem-sample-4',
    memberName: 'Elijah Brooks',
    choirId: 'choir-3',
    title: 'Career transition and schedule clarity',
    description: 'Praying for work promotion and favorable hours that do not clash with choir ministry.',
    privacyLevel: 'CHOIR_LEADERSHIP',
    isAnswered: true,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0]
  }
];

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
