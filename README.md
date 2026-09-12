# 🎮 Neon Drift — Life RPG

> Turn your daily missions into an arcade RPG. Level up your real life.

A full-stack gamified productivity app built with **Next.js 15**, **Supabase**, and **Framer Motion**.

🔗 **Live App:** [life-rpg-rho-one.vercel.app](https://life-rpg-rho-one.vercel.app)
📹 **Walkthrough Video:** [add your video link here]

---

## 👥 Team

- [Dibyanshu Singh] — [Backend Developer]
- [Gourav Kumar Das] — [Testing & Documentation]
- [Barsha Rani Mahakud] — [AI Integration & Unique Features]
- [Soubhagya Kumar Rout] — [Frontend & UI/UX Developer]



---

## ✨ Features

- 🔐 **Auth** — Email/password signup & login via Supabase Auth
- 🧬 **Character System** — Name, level, XP bar, coins, streak counter
- ⚔️ **Task CRUD** — Add, complete, delete missions with zone categories
- 📈 **XP & Leveling** — Non-linear formula (`level × 100`), level-up celebration with confetti
- 🪙 **Economy** — Earn coins on task completion, spend in the Shop
- 🛒 **Shop** — Buy and equip cosmetic items (persisted in Supabase)
- 👾 **Boss Battle** — Weekly boss with HP bar, countdown timer, victory overlay
- 🔥 **Streaks** — Daily streak tracking with mood-based mascot animation
- 📊 **Attributes** — Task categories map to RPG stats (Intellect, Strength, Agility, Discipline)
- 🤖 **AI Coach** — Personalized weekly insight generated from your real progress data (Groq API)
- 💬 **Help Chatbot** — In-app assistant that answers "how do I use this?" questions (Groq API)
- 🌓 **Dark / Light Mode** — Full theme toggle
- 💾 **Full Persistence** — All data persists in Supabase on refresh

---

## 🚀 Setup

### 1. Clone & Install

```bash
cd life-rpg
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open the **SQL Editor** tab
3. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**
4. This creates all tables, enables RLS, and sets up the auto-character trigger

### 3. Add Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

Find your Supabase keys in: **Supabase Dashboard → Project Settings → API**
Get a free Groq API key at: **[console.groq.com/keys](https://console.groq.com/keys)**

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
life-rpg/
├── app/
│   ├── login/          # Auth page
│   ├── dashboard/      # Main command dashboard
│   ├── missions/       # Task CRUD + XP system
│   ├── shop/           # Item shop + inventory
│   ├── boss/           # Weekly boss battle
│   └── profile/        # Character settings + logout
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── XPBar.jsx
│   ├── LevelUpModal.jsx
│   └── LoadingSkeleton.jsx
├── contexts/
│   └── AuthContext.jsx  # Global user/character state
├── lib/
│   ├── supabaseClient.js
│   └── supabaseServer.js
├── supabase/
│   └── schema.sql       # Paste this into Supabase SQL Editor
└── middleware.js         # Session refresh + route protection
```

---

## 🗃 Database Schema

| Table | Description |
|-------|-------------|
| `characters` | One per user — level, XP, coins, streak |
| `tasks` | User missions with category + XP reward |
| `attributes` | RPG stats (Intellect, Strength, Agility, Discipline) |
| `inventory` | Purchased + equipped shop items |

Row Level Security is enabled on all tables.

---

## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 (Neon Drift design tokens) |
| Auth + DB | Supabase (PostgreSQL + Auth + RLS) |
| AI | Groq API (`openai/gpt-oss-20b`) — AI Coach & Help Chatbot |
| Animation | Framer Motion + canvas-confetti |
| Font | Rubik (Google Fonts) |
| Deploy | Vercel |

---

## 📢 Disclosures (AI Tools, APIs & Templates)

As required by the hackathon rules, all third-party tools and AI assistance used are disclosed here:

| Tool / Service | Used For |
|---|---|
| **Groq API** (`openai/gpt-oss-20b`) | Powers the AI Coach (personalized insights) and the in-app Help Chatbot |
| **Google Stitch** | Used to generate the initial UI design/layout, which was then customized, cleaned up, and wired to real functionality |
| **Claude / AI coding assistant** | Used to help write and debug application code (backend logic, database integration, feature implementation) |
| **Supabase** | Backend-as-a-Service for Auth, PostgreSQL database, and Row Level Security |

No plagiarized or undisclosed course/tutorial code was used. All core logic (task CRUD, XP/leveling, streaks, attributes, shop, boss battle) was implemented and tested specifically for this hackathon submission.

---

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy ✅

---

## 📋 Feature Checklist

- [x] Signup / Login / Logout (Supabase Auth)
- [x] Session persistence across refreshes
- [x] Row Level Security on all tables
- [x] Character creation on signup (DB trigger)
- [x] Character name (editable in Profile)
- [x] Level display + auto-update
- [x] Non-linear XP formula
- [x] Visual mood system (mascot animation on streak)
- [x] Add / Complete / Delete tasks
- [x] Active vs completed tasks shown separately
- [x] Zone filter pills
- [x] Category → Attribute mapping
- [x] XP awarded on task completion
- [x] Level-up detection + celebration modal
- [x] Coins earned alongside XP
- [x] Streak counter (daily tracking)
- [x] Shop with 6 purchasable items
- [x] Buy item (coin deduction + Supabase insert)
- [x] Equip item (category-scoped, reflected on dashboard)
- [x] Boss battle with HP bar
- [x] Countdown timer (weekly reset)
- [x] Victory state + loot rewards
- [x] Loading skeletons on all async screens
- [x] Inline form error messages (no crash)
- [x] Network error + retry UI
- [x] Framer Motion micro-animations throughout
- [x] Mobile responsive layout
- [x] Mobile hamburger nav
- [x] Keyboard accessible (Tab/Enter on all interactive elements)
- [x] Dark / Light mode toggle
- [x] AI Coach — personalized insight generated from real user data (Groq API)
- [x] In-app Help Chatbot for onboarding questions (Groq API)
- [x] All data persists in Supabase on refresh

---
