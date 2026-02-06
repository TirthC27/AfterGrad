# 🎓 AfterGrad - Alumni Platform (Hackathon Edition)

> Connecting students with alumni for career guidance, mentorship, and opportunities

**Built for**: Hackathon Demo ⚡  
**Tech Stack**: React + Supabase  
**Timeline**: 1-2 Days  
**Focus**: Demo-ready features over complex infrastructure

---

## 🚀 Project Overview

AfterGrad is an **alumni networking platform** that helps students:
- 🔍 Discover alumni career paths
- 🤝 Get mentorship from senior professionals
- 💼 Access referral opportunities
- 🎯 Plan their career trajectory
- 🚀 Connect with co-founders for startups

---

## 📁 Project Structure

```
alumni-platform-hackathon/
│
├── frontend/
│   ├── student_frontend/      # Student dashboard (React)
│   └── alumni_frontend/        # Alumni dashboard (React)
│
├── backend/
│   ├── student_backend/        # Student API logic (if needed)
│   └── alumni_backend/         # Alumni API logic (if needed)
│
├── supabase/
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Demo data for hackathon
│
└── README.md
```

---

## 🧱 Database Architecture

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | Students + Alumni | Single table for both roles |
| **lineage** | Alumni-Student connections | Visual career path mapping |
| **career_paths** | Time Machine feature | JSON timeline of career progression |
| **referrals** | Job referral slots | Track applications & status |
| **mentorships** | Mentor-mentee pairs | Active mentorship tracking |
| **events** | Networking events | Career fairs, workshops, meetups |
| **startups** | Startup showcases | Connect founders with alumni |
| **reminders** | AI-powered nudges | Keep users engaged |

---

## 🎯 Dashboard Features Mapping

| Dashboard Feature | Database Table | Demo Value |
|------------------|----------------|------------|
| Career Snapshot | `users` | Shows current role & company |
| Alumni Lineage | `lineage` | Visual connection graph |
| Career Time Machine | `career_paths` | Year-by-year skill/role progression |
| Referral Slots | `referrals` | Live application tracking |
| Mentorship | `mentorships` | Active mentor-mentee pairs |
| Events | `events` | Upcoming networking opportunities |
| Startup Space | `startups` | Startup ideas + interested alumni |
| AI Reminders | `reminders` | Personalized action items |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/TirthC27/AfterGrad.git
cd AfterGrad
```

### 2. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy/paste contents of `supabase/schema.sql`
   - Execute
3. Load demo data:
   - Copy/paste contents of `supabase/seed.sql`
   - Execute

### 3. Configure Frontend
```bash
cd frontend/student_frontend
npm install
# Add your Supabase URL and ANON_KEY to .env
npm run dev
```

---

## 🧪 Demo Strategy (For Judges)

### Pre-Demo Checklist
- ✅ Database seeded with 5 students + 5 alumni
- ✅ 3 active referrals with applications
- ✅ 2 startup ideas with interested alumni
- ✅ 4 upcoming events with registrations
- ✅ Career paths visualized for 2 students

### 2-Minute Pitch Flow
1. **Problem** (15s): Students struggle to navigate career paths alone
2. **Solution** (30s): Connect with alumni who've been there
3. **Demo** (60s):
   - Show student dashboard → Career Time Machine
   - Apply for referral → Track status
   - Browse alumni lineage
   - Check AI reminder
4. **Tech Highlights** (15s): Supabase + React, scalable architecture

---

## 🔥 Why Judges Will Love This

✅ **Clear Problem-Solution Fit**  
✅ **Functional Demo** (not just slides)  
✅ **Smart Use of Supabase** (JSON fields for flexibility)  
✅ **System Thinking** (well-structured DB schema)  
✅ **Hackathon-Realistic** (achievable in 1-2 days)  
✅ **Scalable Design** (easy to extend post-hackathon)

---

## 🎨 Tech Stack

- **Frontend**: React (with Vite)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS (recommended)
- **Deployment**: Vercel (frontend) + Supabase (backend)

---

## 📊 Sample Data Included

The `seed.sql` file includes:
- 5 Students (various colleges & career goals)
- 5 Alumni (working at Google, Microsoft, Amazon, Netflix, Meta)
- 4 Events (career fair, workshop, networking, pitch day)
- 3 Referral opportunities
- 2 Startup ideas
- Multiple AI reminders

**Dashboard looks alive from day 1!** 🎉

---

## 🚧 Future Enhancements (Post-Hackathon)

- [ ] Real AI integration (OpenAI API for career suggestions)
- [ ] Video call scheduling
- [ ] Resume review system
- [ ] Alumni verification system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

## 👥 Team

Built with ❤️ for the hackathon

---

## 📄 License

MIT License - feel free to fork and extend!

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!  
Feel free to open issues or submit PRs.

---

**Happy Hacking! 🚀**
