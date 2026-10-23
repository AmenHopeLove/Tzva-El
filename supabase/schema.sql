-- ============================================================================
-- WORSHIP MINISTRY MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS
-- Project Reference: spxtvsluxxsnscwbofaa
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ORGANIZATIONS (CHURCH LEVEL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    meeting_day TEXT,
    meeting_time TEXT,
    status TEXT DEFAULT 'ACTIVE',
    member_count INT DEFAULT 0,
    admin_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. USERS / USER ACCOUNTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'MEMBER',
    assigned_choir_ids TEXT[] DEFAULT '{}',
    primary_choir_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. MEMBERS (CHOIR MEMBERS DIRECTORY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    user_id TEXT,
    full_name TEXT NOT NULL,
    profile_photo TEXT,
    phone TEXT,
    email TEXT,
    gender TEXT DEFAULT 'Male',
    date_joined TEXT,
    primary_choir_id TEXT,
    choir_name TEXT,
    departments TEXT[] DEFAULT ARRAY['Vocal'],
    vocal_part TEXT DEFAULT 'Soprano',
    instrument TEXT DEFAULT 'None',
    skill_level TEXT DEFAULT 'Intermediate',
    birthday TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    availability_notes TEXT,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    consecutive_absences INT DEFAULT 0,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ATTENDANCE SESSIONS & ATTENDANCE RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    choir_id TEXT,
    choir_name TEXT,
    title TEXT NOT NULL,
    session_type TEXT NOT NULL,
    session_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    total_present INT DEFAULT 0,
    total_absent INT DEFAULT 0,
    total_members INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    member_id TEXT,
    member_name TEXT,
    status TEXT NOT NULL,
    arrival_time TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. FOLLOW-UPS / PASTORAL CARE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    choir_id TEXT,
    choir_name TEXT,
    member_id TEXT,
    member_name TEXT,
    reason TEXT NOT NULL,
    assigned_leader_id TEXT,
    assigned_leader_name TEXT,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'NEW',
    next_follow_up_date TEXT,
    notes_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. EVENTS & WORSHIP NIGHTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    theme TEXT,
    bible_verse TEXT,
    participating_choir_ids TEXT[] DEFAULT '{}',
    participating_choir_names TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'UPCOMING',
    order_of_service JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. SCHEDULING & ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT,
    event_title TEXT,
    event_date TEXT,
    member_id TEXT,
    member_name TEXT,
    choir_id TEXT,
    role_title TEXT,
    status TEXT DEFAULT 'PENDING',
    notes TEXT,
    replacement_requested_member_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. SONG LIBRARY & SETLISTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.songs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    original_key TEXT NOT NULL,
    bpm INT DEFAULT 72,
    language TEXT DEFAULT 'English',
    lyrics TEXT,
    chords_url TEXT,
    audio_url TEXT,
    pdf_url TEXT,
    difficulty TEXT DEFAULT 'Easy',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. REHEARSALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rehearsals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    choir_id TEXT,
    event_id TEXT,
    rehearsal_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    objectives TEXT,
    what_went_well TEXT,
    what_needs_improvement TEXT,
    songs_to_practice TEXT[] DEFAULT '{}',
    next_objectives TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. LEAVE REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id TEXT,
    choir_id TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING',
    reviewed_by TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. ANNOUNCEMENTS & AUDIT LOGS & CUSTOM FIELDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    target_type TEXT NOT NULL,
    target_choir_id TEXT,
    target_department_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL',
    scheduled_at TEXT,
    author_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_fields (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    field_name TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_type TEXT NOT NULL,
    options TEXT[] DEFAULT '{}',
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security and allow full application access for anon & authenticated
-- ----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehearsals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access organizations" ON public.organizations;
CREATE POLICY "Public full access organizations" ON public.organizations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access choirs" ON public.choirs;
CREATE POLICY "Public full access choirs" ON public.choirs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access users" ON public.users;
CREATE POLICY "Public full access users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access members" ON public.members;
CREATE POLICY "Public full access members" ON public.members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "Public full access attendance_sessions" ON public.attendance_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access attendance_records" ON public.attendance_records;
CREATE POLICY "Public full access attendance_records" ON public.attendance_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access follow_ups" ON public.follow_ups;
CREATE POLICY "Public full access follow_ups" ON public.follow_ups FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access events" ON public.events;
CREATE POLICY "Public full access events" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access assignments" ON public.assignments;
CREATE POLICY "Public full access assignments" ON public.assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access songs" ON public.songs;
CREATE POLICY "Public full access songs" ON public.songs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access rehearsals" ON public.rehearsals;
CREATE POLICY "Public full access rehearsals" ON public.rehearsals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access leave_requests" ON public.leave_requests;
CREATE POLICY "Public full access leave_requests" ON public.leave_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access announcements" ON public.announcements;
CREATE POLICY "Public full access announcements" ON public.announcements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access custom_fields" ON public.custom_fields;
CREATE POLICY "Public full access custom_fields" ON public.custom_fields FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access audit_logs" ON public.audit_logs;
CREATE POLICY "Public full access audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO public.organizations (id, name, logo_url, primary_color, secondary_color, time_zone, language)
VALUES ('org-001', 'Worship Ministry', '/church-logo.png', '#4F46E5', '#0F172A', 'UTC', 'en')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url;

INSERT INTO public.users (id, organization_id, email, username, password, full_name, role, assigned_choir_ids, primary_choir_id)
VALUES ('user-super-admin', 'org-001', 'admin@church.org', 'admin', 'admin123', 'System Admin', 'SUPER_ADMIN', ARRAY['ALL'], 'ALL')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.choirs (id, organization_id, name, code, description, meeting_day, meeting_time, status, member_count, admin_name, created_at)
VALUES 
  ('choir-1', 'org-001', 'Sanctuary Worship Choir', 'SWC', 'Main Sunday morning sanctuary worship team & choir', 'Thursday', '19:00', 'ACTIVE', 24, 'Pastor David', '2026-01-01'),
  ('choir-2', 'org-001', 'Youth & Young Adult Choir', 'YYA', 'Youth and collegiate contemporary praise choir', 'Friday', '18:30', 'ACTIVE', 18, 'Sarah Jenkins', '2026-01-15'),
  ('choir-3', 'org-001', 'Gospel Praise Ensemble', 'GPE', 'Energetic gospel & contemporary celebration ensemble', 'Tuesday', '19:30', 'ACTIVE', 16, 'Marcus Cole', '2026-02-01')
ON CONFLICT (id) DO NOTHING;
