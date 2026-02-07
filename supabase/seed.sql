-- =============================================
-- AfterGrad - Seed Data (Hackathon Demo)
-- =============================================

-- PROFILES: Students
INSERT INTO profiles (id, role, email, password, name, college, graduation_year, student_verified, skills, bio, location, onboarding_completed) VALUES
('student_001', 'student', 'tirth@college.edu', 'student123', 'Tirth Chudasama', 'IIT Delhi', 2026, true, ARRAY['React','Python','SQL','JavaScript','Node.js'], 'Final-year CS student passionate about product development.', 'Delhi, India', true),
('student_002', 'student', 'aisha@college.edu', 'student123', 'Aisha Khan', 'IIT Bombay', 2026, true, ARRAY['Java','Spring Boot','AWS','Docker'], 'Backend-focused engineer exploring distributed systems.', 'Mumbai, India', true);

-- PROFILES: Alumni
INSERT INTO profiles (id, role, email, password, name, company, job_title, passout_year, skills, bio, location, onboarding_completed) VALUES
('alumni_001', 'alumni', 'priya@google.com', 'alumni123', 'Priya Sharma', 'Google', 'Senior PM', 2020, ARRAY['Product Strategy','SQL','Leadership','Agile'], 'Senior PM at Google. Happy to mentor aspiring PMs.', 'Bangalore, India', true),
('alumni_002', 'alumni', 'rahul@amazon.com', 'alumni123', 'Rahul Verma', 'Amazon', 'Senior SDE', 2019, ARRAY['Java','Distributed Systems','AWS','System Design'], 'Building large-scale systems at Amazon.', 'Seattle, USA', true),
('alumni_003', 'alumni', 'sneha@microsoft.com', 'alumni123', 'Sneha Patel', 'Microsoft', 'Staff Engineer', 2018, ARRAY['C#','Azure','Open Source','Python'], 'Staff engineer working on Azure DevOps.', 'Hyderabad, India', true),
('alumni_004', 'alumni', 'arjun@flipkart.com', 'alumni123', 'Arjun Mehta', 'Flipkart', 'Engineering Lead', 2019, ARRAY['Python','Microservices','Kafka','Leadership'], 'Engineering lead; bootstrapped a startup before joining Flipkart.', 'Bangalore, India', true);

-- EVENTS
INSERT INTO events (id, title, description, event_type, venue_name, start_time, end_time, geo_lat, geo_lng, allow_requests, created_by) VALUES
('evt_001', 'Tech Career Paths in 2026', 'Interactive session with Google & Amazon alumni discussing emerging career paths in AI, Cloud, and Product Management.', 'offline', 'IIT Bombay, Powai', '2026-02-15 14:00:00', '2026-02-15 17:00:00', 19.0760, 72.8777, true, 'alumni_001'),
('evt_002', 'Resume & Portfolio Review Night', 'Get your resume reviewed by hiring managers from Microsoft and Flipkart.', 'online', 'Zoom Meeting', '2026-02-20 19:00:00', '2026-02-20 21:00:00', null, null, true, 'alumni_003'),
('evt_003', 'Startup Founders Meetup', 'Casual offline meetup for students interested in entrepreneurship.', 'offline', 'WeWork Galaxy, Bangalore', '2026-03-01 10:00:00', '2026-03-01 13:00:00', 12.9716, 77.5946, true, 'alumni_004'),
('evt_004', 'System Design Deep Dive', 'Hands-on workshop covering distributed systems and real-world system design interviews.', 'online', 'Google Meet', '2026-03-10 18:00:00', '2026-03-10 20:30:00', null, null, true, 'alumni_002'),
('evt_005', 'Women in Tech Networking Brunch', 'Exclusive offline brunch for women in tech featuring alumni mentors.', 'offline', 'India Habitat Centre, Delhi', '2026-03-08 11:00:00', '2026-03-08 14:00:00', 28.6139, 77.2090, true, 'alumni_001');

-- EVENT PARTICIPANTS
INSERT INTO event_participants (event_id, user_id, role) VALUES
('evt_001', 'alumni_001', 'judge'),
('evt_001', 'alumni_002', 'mentor'),
('evt_002', 'alumni_003', 'mentor'),
('evt_002', 'alumni_004', 'judge'),
('evt_003', 'alumni_004', 'speaker'),
('evt_003', 'alumni_001', 'mentor'),
('evt_004', 'alumni_002', 'speaker'),
('evt_004', 'alumni_003', 'judge'),
('evt_005', 'alumni_001', 'mentor'),
('evt_005', 'alumni_003', 'speaker');

-- MENTORSHIP OFFERINGS
INSERT INTO mentorship_offerings (id, alumni_id, topic, description, duration, price, active, tags) VALUES
('offer_001', 'alumni_001', 'Breaking into Product Management', '1-on-1 guidance on transitioning from engineering to PM roles at top tech companies.', 30, 0, true, ARRAY['Product Management','Career Switch','Interview Prep']),
('offer_002', 'alumni_002', 'System Design Interview Mastery', 'Deep-dive into distributed systems concepts and real-world architecture patterns.', 60, 0, true, ARRAY['System Design','Backend','FAANG']),
('offer_003', 'alumni_003', 'Open Source Contributions for Career Growth', 'How to leverage open-source work to build credibility and get noticed by recruiters.', 30, 0, true, ARRAY['Open Source','Portfolio','Career Growth']),
('offer_004', 'alumni_004', 'Startup Fundamentals — From Idea to MVP', 'Practical walkthrough of validating ideas, building MVPs, and pitching to investors.', 60, 0, true, ARRAY['Startup','Entrepreneurship','MVP']),
('offer_005', 'alumni_001', 'Resume & LinkedIn Optimization', 'Actionable feedback on your resume and LinkedIn profile.', 15, 0, true, ARRAY['Resume','LinkedIn','Job Search']);

-- MENTORSHIP REQUESTS
INSERT INTO mentorship_requests (id, offering_id, student_id, alumni_id, topic, duration, note, status, created_at, responded_at) VALUES
('mreq_001', 'offer_001', 'student_001', 'alumni_001', 'Breaking into Product Management', 30, 'Exploring PM roles. Would love guidance on positioning my engineering background.', 'accepted', '2026-01-25 16:00:00', '2026-01-26 10:00:00'),
('mreq_002', 'offer_002', 'student_001', 'alumni_002', 'System Design Interview Mastery', 60, 'Preparing for Amazon interview. Need help with distributed systems.', 'pending', '2026-02-03 11:00:00', null),
('mreq_003', 'offer_003', 'student_002', 'alumni_003', 'Open Source Contributions for Career Growth', 30, 'Want to start contributing to open-source.', 'rejected', '2026-02-01 09:30:00', '2026-02-02 14:00:00');

-- MENTORSHIP SESSIONS
INSERT INTO mentorship_sessions (id, request_id, offering_id, student_id, alumni_id, topic, duration, status, scheduled_at, alumni_completed, student_completed) VALUES
('msess_001', 'mreq_001', 'offer_001', 'student_001', 'alumni_001', 'Breaking into Product Management', 30, 'scheduled', '2026-02-10 15:00:00', false, false);

-- DONATION CAMPAIGNS
INSERT INTO donation_campaigns (id, title, description, category, goal_amount, raised_amount, image_url) VALUES
('camp_001', 'Merit Scholarship Fund', 'Support bright students who need financial assistance to pursue higher education.', 'Scholarship', 500000, 325000, null),
('camp_002', 'New Computer Lab', 'Help build a modern computer lab for the CS department.', 'Infrastructure', 1000000, 450000, null),
('camp_003', 'Mental Health Initiative', 'Fund counseling services and wellness programs for students.', 'Wellness', 200000, 180000, null),
('camp_004', 'Annual Tech Fest', 'Sponsor the biggest tech festival bringing together students and industry leaders.', 'Events', 300000, 120000, null),
('camp_005', 'Online Course Subscriptions', 'Provide premium learning platform access for all students.', 'Education', 150000, 95000, null),
('camp_006', 'Sports Complex Upgrade', 'Modernize sports facilities for student well-being.', 'Infrastructure', 800000, 200000, null);

-- GIGS
INSERT INTO gigs (id, title, company, description, gig_type, stipend, duration, skills_required, posted_by) VALUES
('gig_001', 'Frontend Intern', 'Google', 'Work on Google''s internal tools using React and TypeScript.', 'internship', '₹80,000/month', '6 months', ARRAY['React','TypeScript','CSS'], 'alumni_001'),
('gig_002', 'Backend Micro Gig', 'Amazon', 'Build a REST API for internal dashboard. 2-week engagement.', 'micro_gig', '₹25,000', '2 weeks', ARRAY['Python','FastAPI','PostgreSQL'], 'alumni_002'),
('gig_003', 'ML Research Intern', 'Microsoft', 'Research on NLP models for code completion.', 'internship', '₹70,000/month', '3 months', ARRAY['Python','PyTorch','NLP'], 'alumni_003'),
('gig_004', 'Mobile App Gig', 'Flipkart', 'Build a React Native prototype for a new feature.', 'micro_gig', '₹30,000', '3 weeks', ARRAY['React Native','JavaScript'], 'alumni_004'),
('gig_005', 'Data Analyst Intern', 'Google', 'Analyze user engagement data and build dashboards.', 'internship', '₹60,000/month', '4 months', ARRAY['SQL','Python','Tableau'], 'alumni_001'),
('gig_006', 'DevOps Gig', 'Amazon', 'Set up CI/CD pipelines and container orchestration.', 'micro_gig', '₹35,000', '2 weeks', ARRAY['Docker','Kubernetes','AWS'], 'alumni_002');

-- LINEAGE
INSERT INTO lineage (student_id, alumni_id, connection_type, description) VALUES
('student_001', 'alumni_001', 'mentorship', 'Both from IIT Delhi, Product track'),
('student_001', 'alumni_002', 'guidance', 'System design mentoring'),
('student_002', 'alumni_003', 'guidance', 'Open source collaboration');

-- ALUMNI INVITATIONS (Student-to-Alumni)
INSERT INTO alumni_invitations (id, event_id, student_id, alumni_id, role, message, status) VALUES
('inv_001', 'evt_001', 'student_001', 'alumni_003', 'judge', 'Would love to have you as a judge for our tech careers panel!', 'pending'),
('inv_002', 'evt_003', 'student_002', 'alumni_001', 'mentor', 'Your startup experience would be amazing for our founders meetup.', 'accepted'),
('inv_003', 'evt_005', 'student_001', 'alumni_002', 'speaker', 'We would be honored to have you speak at our Women in Tech event.', 'declined');

-- ONBOARDING ANSWERS
INSERT INTO onboarding_answers (id, user_id, question_id, question_text, selected_option) VALUES
('oa_001', 'alumni_001', 'alum_q1', 'What''s your primary motivation for joining AfterGrad?', 'Mentoring the next generation'),
('oa_002', 'alumni_001', 'alum_q2', 'How much time can you dedicate per week?', '2-4 hours'),
('oa_003', 'alumni_001', 'alum_q3', 'What type of guidance are you best at providing?', 'Career strategy & planning'),
('oa_004', 'student_001', 'stu_q1', 'What''s your primary goal on AfterGrad?', 'Finding a mentor in my field'),
('oa_005', 'student_001', 'stu_q2', 'Where are you in your academic journey?', 'Final year — placement season'),
('oa_006', 'student_001', 'stu_q3', 'Which area are you most interested in?', 'Software Engineering');
