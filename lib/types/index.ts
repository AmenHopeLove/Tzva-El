// ============================================================================
// TYPESCRIPT MODELS FOR WORSHIP MINISTRY MANAGEMENT SYSTEM
// ============================================================================

export type SystemRole =
  | 'SUPER_ADMIN'
  | 'WORSHIP_MINISTRY_LEADER'
  | 'CHOIR_ADMIN'
  | 'CHOIR_LEADER'
  | 'TEAM_LEADER'
  | 'MEMBER'
  | 'VIEWER';

export type PermissionKey =
  | 'members.view'
  | 'members.create'
  | 'members.edit'
  | 'members.delete'
  | 'attendance.view'
  | 'attendance.create'
  | 'attendance.edit'
  | 'attendance.delete'
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'followup.view'
  | 'followup.create'
  | 'followup.edit'
  | 'songs.view'
  | 'songs.manage'
  | 'reports.view'
  | 'settings.manage'
  | 'users.manage'
  | 'audit_logs.view';

export interface User {
  id: string;
  email: string;
  username?: string;
  password?: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role: SystemRole;
  assignedChoirIds: string[]; // Choirs user has access to
  primaryChoirId?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  timeZone: string;
  language: string;
}

export interface Choir {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
  logoUrl?: string;
  meetingDay: string;
  meetingTime: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  memberCount?: number;
  adminName?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  choirId?: string;
  name: string; // Vocal, Instrumental, Sound, Media, Prayer, Technical, Admin
  description?: string;
}

export type VocalPart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Baritone' | 'Mezzo-Soprano' | 'Lead' | 'None';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

export interface CustomFieldValue {
  fieldId: string;
  fieldName: string;
  value: string | number | boolean;
}

export interface CustomFieldDefinition {
  id: string;
  fieldName: string;
  fieldKey: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN';
  options?: string[];
  isRequired: boolean;
}

export interface Member {
  id: string;
  organizationId: string;
  userId?: string;
  fullName: string;
  profilePhoto?: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dateJoined: string;
  primaryChoirId: string;
  choirName?: string;
  departments: string[]; // Vocal, Instrumental, etc.
  vocalPart: VocalPart;
  instrument?: string;
  skillLevel: SkillLevel;
  birthday?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  availabilityNotes?: string;
  status: MemberStatus;
  notes?: string;
  consecutiveAbsences: number; // Trigger for pastoral care
  customFields?: CustomFieldValue[];
  createdAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'SICK' | 'ON_LEAVE' | 'NOT_SCHEDULED';
export type SessionType =
  | 'Sunday Worship'
  | 'Rehearsal'
  | 'Worship Night'
  | 'Training'
  | 'Meeting'
  | 'Conference'
  | 'Special Event'
  | 'Prayer Meeting';

export interface AttendanceSession {
  id: string;
  choirId: string;
  choirName?: string;
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string;
  totalPresent: number;
  totalAbsent: number;
  totalMembers: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  memberId: string;
  memberName: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  notes?: string;
}

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FollowUpStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'ESCALATED';

export interface FollowUpNote {
  id: string;
  authorName: string;
  note: string;
  contactMethod: 'Phone Call' | 'WhatsApp' | 'In-Person' | 'Email' | 'SMS';
  createdAt: string;
}

export interface FollowUp {
  id: string;
  choirId: string;
  choirName?: string;
  memberId: string;
  memberName: string;
  reason: string;
  assignedLeaderId?: string;
  assignedLeaderName?: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  nextFollowUpDate?: string;
  notesHistory: FollowUpNote[];
  createdAt: string;
}

export type EventType =
  | 'Worship Night'
  | 'Rehearsal'
  | 'Conference'
  | 'Retreat'
  | 'Training'
  | 'Choir Meeting'
  | 'Outreach'
  | 'Prayer Meeting'
  | 'Special Service';

export interface OrderOfServiceItem {
  id: string;
  timeSlot: string;
  durationMinutes: number;
  title: string;
  leaderName: string;
  category: 'Prayer' | 'Worship' | 'Word' | 'Offering' | 'Announcement' | 'Special Performance' | 'Benediction';
  notes?: string;
}

export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  eventType: EventType;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  theme?: string;
  bibleVerse?: string;
  participatingChoirIds: string[];
  participatingChoirNames?: string[];
  status: 'DRAFT' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  orderOfService?: OrderOfServiceItem[];
}

export type AssignmentStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'REPLACEMENT_REQUESTED' | 'COMPLETED';

export interface Assignment {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  memberId: string;
  memberName: string;
  choirId: string;
  roleTitle: string; // Worship Leader, Vocalist, Guitarist, Keyboardist, Bassist, Drummer, Sound, Media, etc.
  status: AssignmentStatus;
  notes?: string;
  replacementRequestedMemberId?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  bpm: number;
  language: string;
  lyrics: string;
  chordsUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface SetlistItem {
  id: string;
  songId: string;
  songTitle: string;
  artist: string;
  selectedKey: string;
  tempoBpm: number;
  leadSingerName?: string;
  notes?: string;
}

export interface Setlist {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  items: SetlistItem[];
}

export interface Rehearsal {
  id: string;
  choirId: string;
  choirName?: string;
  eventId?: string;
  rehearsalDate: string;
  startTime: string;
  endTime: string;
  location: string;
  objectives: string;
  whatWentWell?: string;
  whatNeedsImprovement?: string;
  songsToPractice: string[];
  nextObjectives?: string;
}

export interface LeaveRequest {
  id: string;
  memberId: string;
  memberName: string;
  choirId: string;
  choirName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_NEEDED';
  reviewNotes?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  targetType: 'ENTIRE_CHURCH' | 'WORSHIP_MINISTRY' | 'SPECIFIC_CHOIR' | 'SPECIFIC_DEPARTMENT' | 'SELECTED_MEMBERS';
  targetChoirId?: string;
  title: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  authorName: string;
  scheduledAt: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  category: 'ASSIGNMENT' | 'EVENT' | 'REHEARSAL' | 'LEAVE' | 'ANNOUNCEMENT' | 'FOLLOWUP';
  isRead: boolean;
  createdAt: string;
}

export interface DocumentFile {
  id: string;
  choirId?: string;
  title: string;
  category: 'TRAINING' | 'SONG_PDF' | 'GUIDELINES' | 'SCHEDULE' | 'MINUTES' | 'POLICY';
  fileUrl: string;
  fileSizeBytes: number;
  uploadedBy: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  memberId: string;
  memberName: string;
  choirId: string;
  title: string;
  description: string;
  privacyLevel: 'PRIVATE_TO_LEADER' | 'CHOIR_LEADERSHIP' | 'WORSHIP_LEADERSHIP';
  isAnswered: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  createdAt: string;
}
