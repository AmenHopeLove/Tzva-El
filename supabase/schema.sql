-- ============================================================================
-- WORSHIP MINISTRY MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS
-- ============================================================================
-- Multi-Tenant Choir Architecture with Dynamic RLS & RBAC Security

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ORGANIZATIONS (CHURCH LEVEL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4F46E5',
    secondary_color TEXT DEFAULT '#06B6D4',
    time_zone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CHOIRS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.choirs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    meeting_day TEXT,
    meeting_time TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. DEPARTMENTS / TEAMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Vocal, Instrumental, Sound, Media, Prayer, Technical, Admin
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ROLES & PERMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- SUPER_ADMIN, WORSHIP_MINISTRY_LEADER, CHOIR_ADMIN, CHOIR_LEADER, TEAM_LEADER, MEMBER, VIEWER
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL, -- e.g. members.view, members.edit, attendance.create
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- 5. USERS / USERS PROFILE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE, -- NULL for system-wide roles
    PRIMARY KEY (user_id, role_id, choir_id)
);

-- ----------------------------------------------------------------------------
-- 6. MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    profile_photo TEXT,
    phone TEXT,
    email TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    date_joined DATE DEFAULT CURRENT_DATE,
    primary_choir_id UUID REFERENCES public.choirs(id) ON DELETE SET NULL,
    vocal_part TEXT CHECK (vocal_part IN ('Soprano', 'Alto', 'Tenor', 'Bass', 'Baritone', 'Mezzo-Soprano', 'Lead', 'None')),
    instrument TEXT, -- Guitar, Piano, Bass, Drums, Saxophone, etc.
    skill_level TEXT DEFAULT 'Intermediate' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    birthday DATE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    availability_notes TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED')),
    notes TEXT,
    consecutive_absences INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.member_choirs (
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    joined_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (member_id, choir_id)
);

CREATE TABLE IF NOT EXISTS public.member_departments (
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, department_id)
);

-- ----------------------------------------------------------------------------
-- 7. CUSTOM FIELDS & VALUES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN')),
    options JSONB, -- For SELECT types
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    custom_field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (member_id, custom_field_id)
);

-- ----------------------------------------------------------------------------
-- 8. ATTENDANCE SYSTEM
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    choir_id UUID NOT NULL REFERENCES public.choirs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('Sunday Worship', 'Rehearsal', 'Worship Night', 'Training', 'Meeting', 'Conference', 'Special Event', 'Prayer Meeting')),
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED', 'SICK', 'ON_LEAVE', 'NOT_SCHEDULED')),
    arrival_time TIME,
    notes TEXT,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, member_id)
);

-- ----------------------------------------------------------------------------
-- 9. FOLLOW-UPS / PASTORAL CARE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    choir_id UUID NOT NULL REFERENCES public.choirs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- e.g., 3 Consecutive Absences, Bereavement, Sick Care, General Check-in
    assigned_leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'ESCALATED')),
    next_followup_date DATE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follow_up_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follow_up_id UUID NOT NULL REFERENCES public.follow_ups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    contact_method TEXT CHECK (contact_method IN ('Phone Call', 'WhatsApp', 'In-Person', 'Email', 'SMS')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. EVENTS & WORSHIP NIGHTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('Worship Night', 'Rehearsal', 'Conference', 'Retreat', 'Training', 'Choir Meeting', 'Outreach', 'Prayer Meeting', 'Special Service')),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    theme TEXT,
    bible_verse TEXT,
    organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('DRAFT', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_participating_choirs (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, choir_id)
);

CREATE TABLE IF NOT EXISTS public.order_of_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    time_slot TIME,
    duration_minutes INT DEFAULT 10,
    title TEXT NOT NULL,
    leader_name TEXT,
    category TEXT CHECK (category IN ('Prayer', 'Worship', 'Word', 'Offering', 'Announcement', 'Special Performance', 'Benediction')),
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. SCHEDULING & ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL, -- Worship Leader, Vocalist, Guitarist, Keyboardist, Bassist, Drummer, Sound, Media, Prayer, MC
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'REPLACEMENT_REQUESTED', 'COMPLETED')),
    notes TEXT,
    replacement_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. SONG LIBRARY & SETLISTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    original_key TEXT NOT NULL,
    bpm INT,
    language TEXT DEFAULT 'English',
    lyrics TEXT,
    chords_url TEXT,
    audio_url TEXT,
    pdf_url TEXT,
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.setlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.setlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setlist_id UUID NOT NULL REFERENCES public.setlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    selected_key TEXT NOT NULL,
    tempo_bpm INT,
    lead_singer_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. REHEARSALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rehearsals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    choir_id UUID NOT NULL REFERENCES public.choirs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    rehearsal_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    objectives TEXT,
    what_went_well TEXT,
    what_needs_improvement TEXT,
    songs_to_practice TEXT[],
    next_objectives TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. LEAVE REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    choir_id UUID NOT NULL REFERENCES public.choirs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_NEEDED')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. ANNOUNCEMENTS & NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('ENTIRE_CHURCH', 'WORSHIP_MINISTRY', 'SPECIFIC_CHOIR', 'SPECIFIC_DEPARTMENT', 'SELECTED_MEMBERS')),
    target_choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    target_department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    category TEXT DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. DOCUMENTS & PRAYER REQUESTS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'GENERAL',
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    choir_id UUID REFERENCES public.choirs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    privacy_level TEXT DEFAULT 'CHOIR_LEADERSHIP' CHECK (privacy_level IN ('PRIVATE_TO_LEADER', 'CHOIR_LEADERSHIP', 'WORSHIP_LEADERSHIP')),
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g. MEMBER_ATTENDANCE_UPDATED, CHOIR_CREATED, PERMISSION_CHANGED
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANT ISOLATION
-- ----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Helper function: get user choir ids
CREATE OR REPLACE FUNCTION public.get_user_choir_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT choir_id FROM public.user_roles WHERE user_id = p_user_id AND choir_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Choirs View
CREATE POLICY "Users can view choirs they belong to or all if SUPER_ADMIN"
ON public.choirs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('SUPER_ADMIN', 'WORSHIP_MINISTRY_LEADER')
    )
    OR id IN (SELECT public.get_user_choir_ids(auth.uid()))
);

-- RLS Policy: Members View & Modify
CREATE POLICY "Choir admins can access only members of their assigned choir"
ON public.members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('SUPER_ADMIN', 'WORSHIP_MINISTRY_LEADER')
    )
    OR primary_choir_id IN (SELECT public.get_user_choir_ids(auth.uid()))
);
