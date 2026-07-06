# Professional Portfolio Website — AI Build Plan (Full MERN Stack)

## How to use this file (Instructions for the AI Agent)

1. Work on **ONE section at a time**, in order (Section 0 → Section 19).
2. When a section is finished, **stop** and report what was built, then wait for human review/approval before starting the next section.
3. Do **not** skip ahead or merge multiple sections into one pass, even if it seems faster.
4. Every new user-facing string on the frontend must be added to **both** `en.json` and `ar.json` — never hardcode text in components.
5. Every frontend section must work correctly in Light/Dark mode and LTR/RTL before it's considered done.
6. Backend endpoints must be tested with real requests (Postman/Thunder Client/curl) before moving to the frontend section that consumes them.
7. Keep code clean, componentized/modular, and consistent with the conventions set in early sections.

---

## Project Overview

A professional, corporate-style, full MERN-stack portfolio website — bilingual (English/Arabic, RTL-aware), with Dark/Light mode. Content (projects, skills, experience, certificates, blog posts) is stored in MongoDB and served via an Express API, not hardcoded — managed through a real, authenticated **Admin Panel**. Projects are grouped by category (Backend, Frontend, Full Stack, Simple Projects), each with conditional links to GitHub, live frontend, live backend/API, and admin panel (of that showcased project).

## Tech Stack

**Frontend**
- React (Vite) + Tailwind CSS
- react-i18next (English + Arabic, RTL support)
- Dark/Light theme via Tailwind `class` strategy + Context + localStorage
- lucide-react (icons), Framer Motion (subtle motion)
- React Router (public pages + protected `/admin` routes)
- Axios (with interceptor for auth token handling)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT auth for the single admin user — **access token (short-lived) + refresh token rotation via httpOnly cookie**, same pattern as your usual auth flow
- bcrypt for password hashing
- Cloudinary for image uploads (project thumbnails, blog cover images)
- Nodemailer (optional) to notify you by email when a new contact message arrives, alongside storing it in the DB
- CORS configured for the frontend origin(s)

**Repo layout:** monorepo with two apps.

```
portfolio/
  frontend/     # React app (public site + admin panel UI)
  backend/      # Express API + MongoDB models
```

---

## Data Models (MongoDB / Mongoose)

**AdminUser**
```
{ email, passwordHash }
```
(Single admin account, created via a one-time seed script — no public registration.)

**Project**
```
{
  title: { en, ar },
  description: { en, ar },
  category: "backend" | "frontend" | "fullstack" | "simple",
  stack: [String],
  links: { github, frontend, backend, admin, live },
  image: String,          // Cloudinary URL
  featured: Boolean,
  order: Number,
  createdAt, updatedAt
}
```

**Skill**
```
{ name, category, icon, order }
```

**Experience**
```
{ title: {en, ar}, organization: {en, ar}, startDate, endDate, description: {en, ar}, order }
```

**Certificate**
```
{ title: {en, ar}, issuer, date, credentialUrl, image, order }
```

**BlogPost**
```
{ title: {en, ar}, excerpt: {en, ar}, content: {en, ar}, tags: [String], coverImage, externalUrl, publishedAt }
```

**ContactMessage**
```
{ name, email, message, read: Boolean, createdAt }
```

---

## Section 0 — Monorepo & Environment Setup

Tasks:
- [x] Create `frontend/` (Vite + React) and `backend/` (Express) as separate apps in one repo
- [x] Backend: set up `.env` (PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_*, CORS_ORIGIN)
- [x] Frontend: set up `.env` (VITE_API_BASE_URL)
- [x] Set up MongoDB Atlas cluster (or confirm existing one) and verify connection from backend
- [x] Basic Express server with a health-check route (`GET /api/health`)
- [x] Basic React app rendering "Hello" to confirm dev server works
- [x] `.gitignore` for both apps (node_modules, .env)

**Definition of Done:** `backend` connects to MongoDB and responds on `/api/health`; `frontend` dev server runs and can hit that endpoint successfully (CORS working).

---

## Section 1 — Backend: Database Models & Server Foundation

Tasks:
- [x] Implement all Mongoose schemas/models listed above
- [x] Set up global Express middleware: JSON body parsing, CORS, centralized error handler, request logger (morgan or similar)
- [x] Set up a consistent API response shape (e.g., `{ success, data, message }`)
- [x] Write a one-time seed script to create the admin user (hashed password) from `.env` values

**Definition of Done:** All models compile and can be created/queried via a quick manual test (e.g., a temporary seed script); admin user seeding works once and is idempotent (doesn't duplicate on rerun).

---

## Section 2 — Backend: Admin Authentication

Tasks:
- [x] `POST /api/auth/login` — validate email/password against AdminUser, return access token in JSON + refresh token as httpOnly cookie
- [x] `POST /api/auth/refresh` — rotate refresh token, issue new access token
- [x] `POST /api/auth/logout` — clear refresh cookie
- [x] Auth middleware to protect all `/api/admin/*` routes (verifies access token)
- [x] Rate-limit the login endpoint (basic protection against brute force)

**Definition of Done:** Login returns a valid token pair; protected routes reject requests without a valid access token; refresh flow correctly issues a new token without requiring re-login.

---

## Section 3 — Backend: Content CRUD API

Tasks:
- [x] Public (read-only, no auth) endpoints:
  - `GET /api/projects` (supports `?category=` filter), `GET /api/projects/:id`
  - `GET /api/skills`
  - `GET /api/experience`
  - `GET /api/certificates`
  - `GET /api/blog`, `GET /api/blog/:id`
- [x] Protected admin endpoints (auth required) for full CRUD (`POST`, `PUT`, `DELETE`) on Projects, Skills, Experience, Certificates, Blog
- [x] Image upload endpoint using Cloudinary (used by Project/Blog/Certificate forms in the admin panel)
- [x] Input validation on all write endpoints (e.g., with `express-validator` or `zod`)

**Definition of Done:** Every endpoint tested manually (Postman/Thunder Client) — public routes return data with no auth, admin routes reject unauthenticated requests and correctly create/update/delete documents.

---

## Section 4 — Backend: Contact Messages API

Tasks:
- [x] `POST /api/contact` (public) — validates input, saves a `ContactMessage`, optionally sends a notification email via Nodemailer
- [x] `GET /api/admin/messages` (protected) — list messages, newest first
- [x] `PATCH /api/admin/messages/:id/read` (protected) — mark as read
- [x] `DELETE /api/admin/messages/:id` (protected)

**Definition of Done:** Submitting a test message saves it to the DB and (if configured) triggers an email; admin endpoints correctly list/update/delete.

---

## Section 5 — Frontend: Design System & Theming

Tasks:
- [x] Define color palette (primary, secondary, background, surface, text, border) for Light and Dark mode
- [x] Typography scale + font pairing; Arabic-friendly font (e.g., Cairo, Tajawal, or IBM Plex Sans Arabic) applied when `lang=ar`
- [x] `ThemeContext` toggling a `dark` class on `<html>`, persisted to `localStorage`
- [x] Reusable components: `<ThemeToggle />`, `<Section />`, `<Badge />`, `<Button />`, `<Spinner />`/`<Skeleton />` (for API loading states)

**Definition of Done:** Demo page shows the palette/typography and toggling dark/light mode updates everything instantly, no flicker.

---

## Section 6 — Frontend: i18n & RTL

Tasks:
- [x] Configure react-i18next with `en.json`/`ar.json`
- [x] `<LangSwitch />` component
- [x] On language change: set `dir`/`lang` on `<html>`, verify RTL mirroring of layout/icons/spacing
- [x] Persist language in `localStorage`

**Definition of Done:** Switching language flips direction correctly everywhere, survives refresh.

---

## Section 7 — Frontend: Navbar & Footer

Tasks:
- [x] Responsive `<Navbar />`: logo, nav links (smooth-scroll), `<LangSwitch />`, `<ThemeToggle />`, mobile menu
- [x] `<Footer />`: bio line, social links, copyright
- [x] Sticky navbar with subtle scroll shadow/blur
- [x] Fully translated + RTL-correct

**Definition of Done:** Works on all breakpoints, both languages/themes.

---

## Section 8 — Frontend: Hero Section

Tasks:
- [x] Name, title ("MERN Stack Developer"), short tagline, primary/secondary CTAs
- [x] Entrance animation (Framer Motion)
- [x] Fully translated + RTL-correct

**Definition of Done:** Polished on mobile and desktop, both themes/languages.

---

## Section 9 — Frontend: About Me Section

Tasks:
- [x] Bio paragraph (background, MERN focus, e-learning platform work, interest in algorithms/system design)
- [x] Optional stat counters
- [x] Fully translated + RTL-correct

**Definition of Done:** Reads naturally in both languages, matches design system.

---

## Section 10 — Frontend: Skills Section (API-driven)

Tasks:
- [x] Fetch from `GET /api/skills`, handle loading/error states
- [x] Render grouped by category using `<Badge />`/icon cards
- [x] Fully translated + RTL-correct

**Definition of Done:** Skills load from the live API and render correctly; empty/error states handled gracefully.

---

## Section 11 — Frontend: Projects Section (API-driven, the core feature)

Tasks:
- [x] Fetch from `GET /api/projects`, filter tabs: **All / Backend / Frontend / Full Stack / Simple Projects** (client-side filter or via `?category=` API calls)
- [x] `<ProjectCard />`: image, title/description (translated), stack badges, conditional link buttons (GitHub, Live/Frontend, Backend/API, Admin), hover interaction
- [x] Animated filter transitions
- [x] Responsive grid (1 → 2 → 3 columns)
- [x] Loading skeletons while fetching
- [x] Fully translated + RTL-correct

**Definition of Done:** Filtering works instantly; every rendered link opens the correct URL; missing link types don't render broken buttons; data reflects what's actually in MongoDB.

---

## Section 12 — Frontend: Experience / Timeline Section (API-driven)

Tasks:
- [x] Fetch from `GET /api/experience`, render as vertical timeline
- [x] Fully translated + RTL-correct (timeline flips correctly)

**Definition of Done:** Chronologically clear, correct in both directions.

---

## Section 13 — Frontend: Certificates & Education Section (API-driven)

Tasks:
- [x] Fetch from `GET /api/certificates`, render as grid/list of cards
- [x] Include academic background (Faculty of Science, Menoufia University — Math & Computer Science) as a seeded entry
- [x] Fully translated + RTL-correct

**Definition of Done:** Visually consistent with Experience section, links (if any) work.

---

## Section 14 — Frontend: Blog Section (API-driven)

Tasks:
- [x] Fetch from `GET /api/blog`, render as card grid (title, excerpt, date, tags, read-more)
- [x] Read-more opens `externalUrl` in a new tab, or an internal detail route/page if `content` is used instead
- [x] Fully translated + RTL-correct

**Definition of Done:** List renders correctly with real/seeded data; read-more behaves as intended.

---

## Section 15 — Frontend: Contact Section

Tasks:
- [x] Contact form (Name, Email, Message) submitting to `POST /api/contact`
- [x] Client + server validation, success/error states (translated)
- [x] Direct contact info block (email, LinkedIn, GitHub)
- [x] Fully translated + RTL-correct

**Definition of Done:** Submitting a real message creates a `ContactMessage` in the DB and shows a success state; invalid input handled gracefully on both ends.

---

## Section 16 — Admin Panel: Login & Protected Routing

Tasks:
- [x] `/admin/login` page — calls `POST /api/auth/login`, stores access token (in memory/context, not localStorage), relies on httpOnly refresh cookie
- [x] Axios interceptor: attach access token to admin requests, auto-refresh on 401 using `/api/auth/refresh`, redirect to login if refresh fails
- [x] `ProtectedRoute` wrapper for all `/admin/*` pages
- [x] Basic admin layout (sidebar/topbar nav distinct from the public site's look)

**Definition of Done:** Unauthenticated users are redirected from any `/admin/*` route; a valid login grants access and survives a refresh via token rotation, same as expiring-session flows you've built before.

---

## Section 17 — Admin Panel: Dashboard & Content Management UI

Tasks:
- [x] Dashboard landing page: quick counts (projects, unread messages, blog posts, etc.)
- [x] CRUD UI for **Projects** (form matching the data model, including the 4 conditional links + image upload)
- [x] CRUD UI for **Skills**
- [x] CRUD UI for **Experience**
- [x] CRUD UI for **Certificates**
- [x] CRUD UI for **Blog Posts**
- [x] **Messages inbox** view (list, mark as read, delete)
- [x] Confirmation dialogs on delete actions

**Definition of Done:** Every content type can be created/edited/deleted from the admin panel and the change is immediately reflected on the public site after refresh — no direct DB/code edits needed.

---

## Section 18 — Responsiveness, Accessibility, Performance & SEO Polish

Tasks:
- [x] Full responsive audit (mobile, tablet, laptop, large desktop) — public site and admin panel
- [x] Accessibility pass: semantic HTML, alt text, contrast in both themes, keyboard nav, focus states
- [x] Meta tags (title, description, Open Graph image), favicon
- [x] Lighthouse pass on the public site (Performance, Accessibility, Best Practices, SEO)
- [x] Lazy-load images, optimize sizes; admin panel excluded from SEO (`noindex`)

**Definition of Done:** Manual device/browser check passes; reasonable Lighthouse scores on the public site.

---

## Section 19 — Deployment

Tasks:
- [x] Deploy `backend` (Render, Railway, or similar) with production env vars set
- [x] Confirm MongoDB Atlas network access allows the backend host
- [x] Deploy `frontend` (Vercel/Netlify) with `VITE_API_BASE_URL` pointing to the live backend
- [x] Set backend `CORS_ORIGIN` to the live frontend URL
- [x] Verify refresh-token cookie works cross-origin in production (`SameSite`/`Secure` settings)
- [x] Final smoke test on live URLs: both languages, both themes, all project links, contact form, admin login + full CRUD flow

**Definition of Done:** Live public site and live admin panel both work end-to-end exactly as they did locally.

---

## Section Completion Checklist

- [x] Section 0 — Monorepo & Environment Setup
- [x] Section 1 — Backend: Database Models & Server Foundation
- [x] Section 2 — Backend: Admin Authentication
- [x] Section 3 — Backend: Content CRUD API
- [x] Section 4 — Backend: Contact Messages API
- [x] Section 5 — Frontend: Design System & Theming
- [x] Section 6 — Frontend: i18n & RTL
- [x] Section 7 — Frontend: Navbar & Footer
- [x] Section 8 — Frontend: Hero Section
- [x] Section 9 — Frontend: About Me Section
- [x] Section 10 — Frontend: Skills Section
- [x] Section 11 — Frontend: Projects Section
- [x] Section 12 — Frontend: Experience / Timeline Section
- [x] Section 13 — Frontend: Certificates & Education Section
- [x] Section 14 — Frontend: Blog Section
- [x] Section 15 — Frontend: Contact Section
- [x] Section 16 — Admin Panel: Login & Protected Routing
- [x] Section 17 — Admin Panel: Dashboard & Content Management UI
- [x] Section 18 — Responsiveness, Accessibility, Performance & SEO
- [x] Section 19 — Deployment
