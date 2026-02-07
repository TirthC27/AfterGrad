-- =============================================
-- AfterGrad - Hackathon Database Schema
-- Supabase (PostgreSQL) — Minimal friction
-- =============================================

create extension if not exists "pgcrypto";

-- =============================================
-- 1. PROFILES (Students + Alumni)
--    ID = Clerk user_id (string) or mock ID
-- =============================================
create table if not exists profiles (
  id text primary key,
  role text check (role in ('student','alumni')) not null,
  email text unique,
  password text,
  name text,
  avatar_url text,
  phone text,

  -- Student fields
  college text,
  graduation_year int,
  student_verified boolean default false,
  sheerid_verified_at timestamp,

  -- Alumni fields
  company text,
  job_title text,
  passout_year int,

  -- Resume extraction (shared)
  skills text[] default '{}',
  experience_summary text,
  resume_url text,
  resume_parsed_at timestamp,

  -- Onboarding
  onboarding_completed boolean default false,
  bio text,
  interests text[] default '{}',
  linkedin_url text,
  github_url text,
  location text,

  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- =============================================
-- 2. EVENTS
-- =============================================
create table if not exists events (
  id text primary key default 'evt_' || substr(gen_random_uuid()::text, 1, 8),
  title text not null,
  description text,
  event_type text check (event_type in ('online','offline')) not null,
  venue_name text,
  start_time timestamp not null,
  end_time timestamp,
  geo_lat float,
  geo_lng float,
  allow_requests boolean default true,
  created_by text references profiles(id) on delete cascade,
  created_at timestamp default now()
);

-- =============================================
-- 3. EVENT PARTICIPANTS
-- =============================================
create table if not exists event_participants (
  id text primary key default 'ep_' || substr(gen_random_uuid()::text, 1, 8),
  event_id text references events(id) on delete cascade,
  user_id text references profiles(id) on delete cascade,
  role text check (role in ('host','judge','mentor','speaker')) not null,
  joined_at timestamp default now(),
  unique(event_id, user_id)
);

-- =============================================
-- 4. EVENT REQUESTS
-- =============================================
create table if not exists event_requests (
  id text primary key default 'ereq_' || substr(gen_random_uuid()::text, 1, 8),
  event_id text references events(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  message text,
  status text check (status in ('pending','accepted','rejected','revoked')) default 'pending',
  created_at timestamp default now(),
  responded_at timestamp,
  unique(event_id, student_id, alumni_id)
);

-- =============================================
-- 5. EVENT LOCATION ACCESS
-- =============================================
create table if not exists event_location_access (
  id text primary key default 'eloc_' || substr(gen_random_uuid()::text, 1, 8),
  event_id text references events(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  access_granted boolean default false,
  granted_at timestamp,
  revoked_at timestamp,
  unique(event_id, student_id, alumni_id)
);

-- =============================================
-- 6. MENTORSHIP OFFERINGS
-- =============================================
create table if not exists mentorship_offerings (
  id text primary key default 'offer_' || substr(gen_random_uuid()::text, 1, 8),
  alumni_id text references profiles(id) on delete cascade,
  topic text not null,
  description text,
  duration int check (duration in (15, 30, 60)) not null,
  price float default 0,
  active boolean default true,
  tags text[] default '{}',
  created_at timestamp default now()
);

-- =============================================
-- 7. MENTORSHIP REQUESTS
-- =============================================
create table if not exists mentorship_requests (
  id text primary key default 'mreq_' || substr(gen_random_uuid()::text, 1, 8),
  offering_id text references mentorship_offerings(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  topic text,
  duration int,
  note text,
  status text check (status in ('pending','accepted','rejected','cancelled')) default 'pending',
  created_at timestamp default now(),
  responded_at timestamp
);

-- =============================================
-- 8. MENTORSHIP SESSIONS
-- =============================================
create table if not exists mentorship_sessions (
  id text primary key default 'msess_' || substr(gen_random_uuid()::text, 1, 8),
  request_id text references mentorship_requests(id) on delete cascade,
  offering_id text references mentorship_offerings(id),
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  topic text,
  duration int,
  status text check (status in ('scheduled','awaiting_completion','completed')) default 'scheduled',
  scheduled_at timestamp,
  alumni_completed boolean default false,
  student_completed boolean default false,
  completed_at timestamp,
  created_at timestamp default now()
);

-- =============================================
-- 9. DONATION CAMPAIGNS
-- =============================================
create table if not exists donation_campaigns (
  id text primary key default 'camp_' || substr(gen_random_uuid()::text, 1, 8),
  title text not null,
  description text,
  category text check (category in ('Scholarship','Infrastructure','Wellness','Events','Education')) not null,
  goal_amount float not null,
  raised_amount float default 0,
  created_by text references profiles(id),
  image_url text,
  created_at timestamp default now()
);

create table if not exists donations (
  id text primary key default 'don_' || substr(gen_random_uuid()::text, 1, 8),
  campaign_id text references donation_campaigns(id) on delete cascade,
  donor_id text references profiles(id),
  amount float not null,
  created_at timestamp default now()
);

-- =============================================
-- 10. GIGS / INTERNSHIPS
-- =============================================
create table if not exists gigs (
  id text primary key default 'gig_' || substr(gen_random_uuid()::text, 1, 8),
  title text not null,
  company text,
  description text,
  gig_type text check (gig_type in ('internship','micro_gig')) not null,
  stipend text,
  duration text,
  skills_required text[] default '{}',
  posted_by text references profiles(id),
  created_at timestamp default now()
);

create table if not exists gig_applications (
  id text primary key default 'gapp_' || substr(gen_random_uuid()::text, 1, 8),
  gig_id text references gigs(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  status text check (status in ('applied','shortlisted','rejected')) default 'applied',
  created_at timestamp default now(),
  unique(gig_id, student_id)
);

-- =============================================
-- 11. LINEAGE (student-alumni connections)
-- =============================================
create table if not exists lineage (
  id text primary key default 'lin_' || substr(gen_random_uuid()::text, 1, 8),
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  connection_type text check (connection_type in ('mentorship','referral','guidance')) default 'guidance',
  description text,
  created_at timestamp default now()
);

-- =============================================
-- 12. ALUMNI INVITATIONS (students invite alumni as mentor/judge)
-- =============================================
create table if not exists alumni_invitations (
  id text primary key default 'inv_' || substr(gen_random_uuid()::text, 1, 8),
  event_id text references events(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  alumni_id text references profiles(id) on delete cascade,
  role text check (role in ('mentor','judge','speaker','guest')) not null,
  message text,
  status text check (status in ('pending','accepted','declined')) default 'pending',
  created_at timestamp default now(),
  responded_at timestamp,
  unique(event_id, student_id, alumni_id)
);

-- =============================================
-- 13. ONBOARDING ANSWERS (MCQ answers during onboarding)
-- =============================================
create table if not exists onboarding_answers (
  id text primary key default 'oa_' || substr(gen_random_uuid()::text, 1, 8),
  user_id text references profiles(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  selected_option text not null,
  created_at timestamp default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_events_created_by on events(created_by);
create index if not exists idx_event_requests_student on event_requests(student_id);
create index if not exists idx_event_requests_alumni on event_requests(alumni_id);
create index if not exists idx_mentorship_offerings_alumni on mentorship_offerings(alumni_id);
create index if not exists idx_mentorship_requests_student on mentorship_requests(student_id);
create index if not exists idx_mentorship_requests_alumni on mentorship_requests(alumni_id);
create index if not exists idx_mentorship_sessions_student on mentorship_sessions(student_id);
create index if not exists idx_mentorship_sessions_alumni on mentorship_sessions(alumni_id);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_alumni_invitations_alumni on alumni_invitations(alumni_id);
create index if not exists idx_alumni_invitations_student on alumni_invitations(student_id);
create index if not exists idx_onboarding_answers_user on onboarding_answers(user_id);
