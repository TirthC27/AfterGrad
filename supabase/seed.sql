-- =============================================
-- AfterGrad - Demo Seed Data
-- Pre-populated for hackathon demo 🔥
-- =============================================

-- 1️⃣ USERS (5 Students + 5 Alumni)
-- =============================================

-- Students
INSERT INTO users (id, role, name, email, college, graduation_year, skills, career_goal, location) VALUES
('11111111-1111-1111-1111-111111111111', 'student', 'Priya Sharma', 'priya@college.edu', 'IIT Delhi', 2026, '["React", "Python", "SQL"]', 'Product Manager at Google', 'Delhi, India'),
('22222222-2222-2222-2222-222222222222', 'student', 'Rahul Verma', 'rahul@college.edu', 'IIT Bombay', 2026, '["Java", "Spring Boot", "AWS"]', 'Software Engineer at Amazon', 'Mumbai, India'),
('33333333-3333-3333-3333-333333333333', 'student', 'Ananya Singh', 'ananya@college.edu', 'BITS Pilani', 2025, '["Python", "Machine Learning", "TensorFlow"]', 'ML Engineer', 'Bangalore, India'),
('44444444-4444-4444-4444-444444444444', 'student', 'Karan Patel', 'karan@college.edu', 'NIT Trichy', 2026, '["JavaScript", "Node.js", "MongoDB"]', 'Full Stack Developer', 'Chennai, India'),
('55555555-5555-5555-5555-555555555555', 'student', 'Sneha Reddy', 'sneha@college.edu', 'IIT Madras', 2025, '["UI/UX", "Figma", "React"]', 'Product Designer at Airbnb', 'Hyderabad, India');

-- Alumni
INSERT INTO users (id, role, name, email, college, graduation_year, company, current_role, skills, location) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alumni', 'Arjun Mehta', 'arjun@google.com', 'IIT Delhi', 2020, 'Google', 'Senior Product Manager', '["Product Strategy", "SQL", "Leadership"]', 'Bangalore, India'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'alumni', 'Neha Gupta', 'neha@microsoft.com', 'IIT Bombay', 2019, 'Microsoft', 'Software Engineer III', '["C#", "Azure", "System Design"]', 'Hyderabad, India'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'alumni', 'Vikram Joshi', 'vikram@amazon.com', 'BITS Pilani', 2018, 'Amazon', 'Senior SDE', '["Java", "Distributed Systems", "AWS"]', 'Seattle, USA'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'alumni', 'Pooja Iyer', 'pooja@netflix.com', 'IIT Madras', 2017, 'Netflix', 'Staff Engineer', '["Python", "Microservices", "Kafka"]', 'Los Angeles, USA'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'alumni', 'Siddharth Kumar', 'sid@meta.com', 'NIT Trichy', 2019, 'Meta', 'Product Designer', '["UI/UX", "Prototyping", "User Research"]', 'San Francisco, USA');

-- 2️⃣ ALUMNI LINEAGE
-- =============================================
INSERT INTO lineage (student_id, alumni_id, description) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Both from IIT Delhi, Product track'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Both from IIT Bombay, Backend engineering'),
('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ML to Engineering transition path'),
('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Design track, similar college background');

-- 3️⃣ CAREER PATHS (Time Machine)
-- =============================================
INSERT INTO career_paths (student_id, target_role, timeline) VALUES
('11111111-1111-1111-1111-111111111111', 'Product Manager at Google', 
 '[
   {"year":1,"skill":"SQL & Data Analysis"},
   {"year":2,"skill":"Product Thinking & Stakeholder Management"},
   {"year":3,"role":"Associate Product Manager"},
   {"year":5,"role":"Senior Product Manager"}
 ]'::jsonb),
('22222222-2222-2222-2222-222222222222', 'Software Engineer at Amazon',
 '[
   {"year":1,"skill":"Data Structures & Algorithms"},
   {"year":2,"skill":"System Design & AWS"},
   {"year":3,"role":"SDE-1"},
   {"year":5,"role":"SDE-2"}
 ]'::jsonb);

-- 4️⃣ REFERRALS
-- =============================================
INSERT INTO referrals (alumni_id, company, role, slots, applied_students) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Google', 'APM Intern', 2, 
 '[
   {"student_id":"11111111-1111-1111-1111-111111111111","status":"pending"}
 ]'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Microsoft', 'SDE Intern', 3, '[]'::jsonb),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Amazon', 'SDE Full-time', 1, 
 '[
   {"student_id":"22222222-2222-2222-2222-222222222222","status":"approved"}
 ]'::jsonb);

-- 5️⃣ MENTORSHIPS
-- =============================================
INSERT INTO mentorships (mentor_id, student_id, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'active');

-- 6️⃣ EVENTS
-- =============================================
INSERT INTO events (id, title, description, location, date, created_by) VALUES
('e1111111-e111-e111-e111-e11111111111', 'Tech Career Fair 2026', 'Meet top tech companies hiring for SDE roles', 'Bangalore', '2026-03-15 10:00:00', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('e2222222-e222-e222-e222-e22222222222', 'Product Management Workshop', 'Learn PM fundamentals from Google PM', 'Online', '2026-02-20 18:00:00', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('e3333333-e333-e333-e333-e33333333333', 'Alumni Networking Night', 'Connect with alumni from top tech companies', 'Mumbai', '2026-04-10 19:00:00', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('e4444444-e444-e444-e444-e44444444444', 'Startup Pitch Day', 'Present your startup ideas to potential co-founders', 'Hyderabad', '2026-05-05 14:00:00', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- 7️⃣ EVENT REGISTRATIONS
-- =============================================
INSERT INTO event_registrations (event_id, user_id) VALUES
('e1111111-e111-e111-e111-e11111111111', '11111111-1111-1111-1111-111111111111'),
('e1111111-e111-e111-e111-e11111111111', '22222222-2222-2222-2222-222222222222'),
('e2222222-e222-e222-e222-e22222222222', '11111111-1111-1111-1111-111111111111'),
('e3333333-e333-e333-e333-e33333333333', '33333333-3333-3333-3333-333333333333'),
('e4444444-e444-e444-e444-e44444444444', '44444444-4444-4444-4444-444444444444');

-- 8️⃣ STARTUPS
-- =============================================
INSERT INTO startups (name, description, founder_id, interested_alumni) VALUES
('EduTech AI', 'AI-powered personalized learning platform for students', '44444444-4444-4444-4444-444444444444',
 '[
   {"alumni_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"},
   {"alumni_id":"dddddddd-dddd-dddd-dddd-dddddddddddd"}
 ]'::jsonb),
('HealthBridge', 'Connecting rural patients with doctors via telemedicine', '33333333-3333-3333-3333-333333333333',
 '[
   {"alumni_id":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}
 ]'::jsonb);

-- 9️⃣ AI REMINDERS
-- =============================================
INSERT INTO reminders (user_id, message, scheduled_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Follow up on your Google APM referral application', '2026-02-10 09:00:00'),
('11111111-1111-1111-1111-111111111111', 'Product Management Workshop starts in 2 days!', '2026-02-18 10:00:00'),
('22222222-2222-2222-2222-222222222222', 'Schedule a mock interview with your mentor', '2026-02-12 15:00:00'),
('55555555-5555-5555-5555-555555555555', 'Update your portfolio before the design meetup', '2026-02-08 11:00:00');
