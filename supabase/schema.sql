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
