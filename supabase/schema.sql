-- =============================================
-- AfterGrad - Alumni Platform (Hackathon Edition)
-- Supabase Database Schema
-- =============================================

-- 1️⃣ Users Table (Students + Alumni)
-- =============================================
create table users (
  id uuid primary key default gen_random_uuid(),
  role text check (role in ('student','alumni')),
  name text,
  email text,
  college text,
  graduation_year int,
  company text,
  job_title text,
  skills jsonb,
  career_goal text,
  location text,
  created_at timestamp default now()
);


-- 2️⃣ Alumni Lineage (Simple & Visual)
-- =============================================
create table lineage (
  id uuid primary key default gen_random_uuid(),
  student_id uuid,
  alumni_id uuid,
  description text
);

-- 3️⃣ Career Time Machine
-- =============================================
create table career_paths (
  id uuid primary key default gen_random_uuid(),
  student_id uuid,
  target_role text,
  timeline jsonb
);

-- 4️⃣ Referral Slots (Lightweight)
-- =============================================
create table referrals (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid,
  company text,
  role text,
  slots int,
  applied_students jsonb
);

-- 5️⃣ Mentorship
-- =============================================
create table mentorships (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid,
  student_id uuid,
  status text
);

-- 6️⃣ Events
-- =============================================
create table events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  location text,
  date timestamp,
  created_by uuid
);

-- 7️⃣ Event Registrations
-- =============================================
create table event_registrations (
  event_id uuid,
  user_id uuid
);

-- 8️⃣ Startup Space (Demo-Friendly)
-- =============================================
create table startups (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  founder_id uuid,
  interested_alumni jsonb
);

-- 9️⃣ AI Reminders (Fake it till you make it 🤖)
-- =============================================
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text,
  scheduled_at timestamp
);

-- =============================================
-- LINKEDIN IMPORT FEATURE TABLES
-- =============================================

-- 🔗 User Skills (normalized, source-tracked)
-- =============================================
create table user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  skill_name text not null,
  source text check (source in ('linkedin_api','linkedin_scrape','manual')) default 'manual',
  visible boolean default true,
  created_at timestamp default now()
);

-- 📜 Career History (per-user work experience)
-- =============================================
create table career_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text,
  company text,
  start_year int,
  end_year int,
  created_at timestamp default now()
);

-- 📋 LinkedIn Import Logs (audit trail)
-- =============================================
create table linkedin_import_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  source text check (source in ('linkedin_api','linkedin_scrape')),
  raw_payload jsonb,
  parsed_payload jsonb,
  imported_at timestamp default now()
);

-- Extend users table with LinkedIn-specific columns
-- =============================================
alter table users add column if not exists linkedin_url text;
alter table users add column if not exists industry text;
alter table users add column if not exists experience_summary text;
alter table users add column if not exists linkedin_imported_at timestamp;

-- =============================================
-- EVENT LISTING & CREATION FEATURE TABLES
-- =============================================

-- Replace old events table with proper schema
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS event_registrations CASCADE;

-- 🎫 Events (v2 — location-protected)
-- =============================================
create table if not exists events_v2 (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text check (event_type in ('online','offline')) not null,
  start_time timestamp not null,
  end_time timestamp,
  geo_lat float,
  geo_lng float,
  allow_requests boolean default true,
  created_by uuid references users(id) on delete cascade,
  created_at timestamp default now()
);

-- 👥 Event Participants (host / alumni / student)
-- =============================================
create table if not exists event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events_v2(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('host','alumni','student')) not null,
  joined_at timestamp default now()
);

-- 📩 Event Requests (student → alumni, event-scoped)
-- =============================================
create table if not exists event_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events_v2(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  alumni_id uuid references users(id) on delete cascade,
  message text,
  status text check (status in ('pending','accepted','rejected')) default 'pending',
  created_at timestamp default now()
);

-- 🔒 Event Location Access (per student+alumni+event)
-- =============================================
create table if not exists event_location_access (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events_v2(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  alumni_id uuid references users(id) on delete cascade,
  access_granted boolean default false,
  granted_at timestamp
);
