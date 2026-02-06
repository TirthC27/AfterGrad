# 🎓 AfterGrad

> Alumni networking platform connecting students with mentors and career opportunities

---

## 📁 Project Structure

```
AfterGrad/
│
├── frontend/
│   ├── student_frontend/
│   └── alumni_frontend/
│
├── backend/
│   ├── student_backend/
│   └── alumni_backend/
│
├── supabase/
│   ├── schema.sql       # Database schema
│   └── seed.sql         # Demo seed data
│
└── README.md
```

---

## 🛠️ Setup

### 1. Clone Repository
```bash
git clone https://github.com/TirthC27/AfterGrad.git
cd AfterGrad
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Run `supabase/seed.sql` to load demo data

### 3. Run Frontend
```bash
cd frontend/student_frontend
npm install
npm run dev
```

---

## 🎨 Tech Stack

- React + Vite
- Supabase (PostgreSQL)
- Tailwind CSS

---

## 📄 License

MIT
