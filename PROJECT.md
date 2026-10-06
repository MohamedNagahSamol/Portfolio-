# Project: Full-Stack MERN Bilingual Portfolio Overhaul

## Architecture
- **Monorepo Structure**:
  - `backend/`: Node.js, Express, Mongoose, JWT auth with httpOnly refresh token rotation, express-validator, centralized error handling.
  - `frontend/`: Vite, React 19, Tailwind CSS v4, react-i18next (English & Arabic with RTL), Lucide-react, Framer Motion, Axios with auth interceptors.
- **Data Flow**:
  - Public visitors: View read-only content from `/api/projects`, `/api/skills`, `/api/experience`, `/api/certificates`, `/api/blog`. Submit contact messages via `POST /api/contact`. Quiet initialization without 401 refresh errors.
  - Admin users: Login via `POST /api/auth/login`, receive short-lived JWT in response body and rotating refresh token in httpOnly cookie. Manage content and messages via protected `/api/admin/*` endpoints.
  - Internationalization: Bi-directional UI (`dir="ltr"` / `dir="rtl"`) powered by `react-i18next` with complete translation dictionary parity (`en.json` / `ar.json`).
  - Aesthetics: Cyber-Tech Glassmorphism design system using Tailwind tokens, ambient aurora radial glows, high contrast in both Light and Dark modes.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Admin Messages Route Normalization | Mount `/api/admin/messages` directly while preserving `/api/contact/admin/messages` alias | M1 | ORIGINAL_REQUEST R4, Explorer 1 |
| 2 | Backend Input Validation Middleware | Implement express-validator schemas for all content creation/updates and Auth | M1 | ORIGINAL_REQUEST R4, Explorer 1 |
| 3 | Idempotent Admin Seed Script | Update seed.js to preserve existing admin user without destructive drops | M1 | ORIGINAL_REQUEST R4, Explorer 1 |
| 4 | Automated API Test Suite Overhaul | Update tests/api-test.js with dynamic env credentials, cookie tracking, full CRUD & message lifecycle coverage | M1 | ORIGINAL_REQUEST R4, Explorer 1 |
| 5 | Dynamic CORS Origin Support | Allow process.env.CORS_ORIGIN in allowOrgin.js | M1 | Explorer 1 |
| 6 | AuthContext Silent Initial Mount | Use localStorage auth hint to avoid firing 401 refresh requests on anonymous mount | M2 | ORIGINAL_REQUEST R2, Explorer 2 |
| 7 | Unique Composite React Keys | Fix key warnings in ProjectCard, Blog, Skills, and Projects | M2 | ORIGINAL_REQUEST R2, Explorer 2 |
| 8 | Form Accessibility & Autocomplete | Add explicit id/htmlFor and autocomplete attributes across Contact, Login, and Admin forms | M2 | ORIGINAL_REQUEST R2, Explorer 2 |
| 9 | Generative Code/Gradient Image Fallbacks | Fallback mockups in ProjectCard and onError handlers across images | M2 | ORIGINAL_REQUEST R1/R2, Explorer 2/3 |
| 10 | Route Code-Splitting | Dynamic React.lazy() imports for admin routes to eliminate >500kB bundle warnings | M2 | ORIGINAL_REQUEST Acceptance, Explorer 2 |
| 11 | Zero Hardcoded English Strings | Extract all public and admin UI strings to en.json and ar.json | M3 | ORIGINAL_REQUEST R3, Explorer 2 |
| 12 | Tech Badge Normalization Keys | Add missing composite tech keys in en.json and ar.json | M3 | Explorer 2 |
| 13 | Locale-Aware Date Formatting | Format dates dynamically using ar-EG vs en-US across all components | M3 | ORIGINAL_REQUEST R3, Explorer 2 |
| 14 | RTL Layout Mirroring & Alignment | Fix Footer text-start, AdminLayout drawer docking, and directional icon flipping | M3 | ORIGINAL_REQUEST R3, Explorer 2/3 |
| 15 | Hero Cyber-Tech Terminal & Ambient Mesh | 12-column grid, aurora pulse glow, interactive code window with tabs and syntax highlighting | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 16 | About Profile Card & Animated Counters | Glass profile card, glowing availability status beacon, animated stats | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 17 | Skills Authentic SVG Brand Logos & Tabs | Authentic brand SVGs, category filter tabs (All, Frontend, Backend, Tools), hover glow | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 18 | Projects Visuals & Glowing Action CTAs | Prominent buttons (Live Demo, GitHub, API Docs, Admin Preview) and filter transitions | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 19 | Experience Balanced Alternating Timeline | Alternating 2-column desktop timeline with central glowing milestone nodes | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 20 | Contact 2-Column Hub & Glass Form | Direct contact hub with copy-to-clipboard, social cards, and glassmorphic contact form | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 21 | Admin Panel Token Polish & Read Status | Brand tokens in admin layout, unread message indicators, and message counters | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 22 | Dark/Light Mode Glassmorphic Harmony | High-contrast token refinement for dark and light themes | M4 | ORIGINAL_REQUEST R1, Explorer 3 |
| 23 | E2E Requirement-Driven Test Suite | Opaque-box test suite across Tiers 1-4 covering all features | M5 | Project Pattern Dual Track |
| 24 | Adversarial Hardening (Tier 5) | White-box stress testing and edge-case verification | M5 | Project Pattern Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Architecture, Validation & Test Normalization | Features 1, 2, 3, 4, 5: `/api/admin/messages` route normalization, express-validator schemas, idempotent seed, comprehensive `api-test.js` | none | DONE |
| M2 | Frontend Core Architecture, Console Cleanliness & Accessibility | Features 6, 7, 8, 9, 10: AuthContext silent mount, React keys, form accessibility, image fallback mockups & onError, admin code-splitting | M1 | DONE |
| M3 | Strict i18n, RTL Mirroring & Locale Formatting | Features 11, 12, 13, 14: Zero hardcoding in public & admin UI, normalization keys, dynamic locale dates, RTL layout mirroring | M2 | DONE |
| M4 | Modern Cyber-Tech & Glassmorphism UI/UX Overhaul | Features 15, 16, 17, 18, 19, 20, 21, 22: Hero terminal & aurora mesh, About card & counters, Skills brand SVGs & tabs, Projects mockups & CTAs, Experience alternating timeline, Contact 2-column layout, Admin tokens & read indicators | M3 | DONE |
| M5 | E2E Testing Suite & Adversarial Hardening | Features 23, 24: Pass 100% E2E tests (Tiers 1-4) + Adversarial hardening (Tier 5) | M1, M2, M3, M4 | DONE |

## Interface Contracts
### Client ↔ Backend Auth
- `POST /api/auth/login`: Body `{ email, password }` -> Returns `{ success: true, data: { accessToken, user } }` + `Set-Cookie: refreshToken=...; HttpOnly; SameSite=...`.
- `POST /api/auth/refresh`: Cookie `refreshToken` -> Returns `{ success: true, data: { accessToken } }` + rotated `Set-Cookie: refreshToken=...`.
- `POST /api/auth/logout`: Clears `refreshToken` cookie -> Returns `{ success: true, message: 'Logged out successfully.' }`.

### Client ↔ Backend Admin Messages
- `GET /api/admin/messages` (and alias `GET /api/contact/admin/messages`): Header `Authorization: Bearer <token>` -> Returns `{ success: true, data: [ContactMessage] }`.
- `PATCH /api/admin/messages/:id/read`: Header `Authorization: Bearer <token>` -> Returns `{ success: true, data: ContactMessage }`.
- `DELETE /api/admin/messages/:id`: Header `Authorization: Bearer <token>` -> Returns `{ success: true, message: 'Message deleted.' }`.

### Client ↔ Backend Content CRUD
- `POST /api/admin/:resource` & `PUT /api/admin/:resource/:id`: Validated body according to express-validator schemas. Invalid requests return HTTP 400 with `{ success: false, message: 'Validation failed', errors: [{ field, message }] }`.

### Frontend Component Layout Contracts
- `TechIcon`: props `{ name: string, className?: string }` -> Renders official brand SVG with brand color.
- `ProjectMockup`: props `{ category: string, title?: string }` -> Generates cyber-tech SVG diagram matching category.
- `HeroTerminal`: interactive tabbed code viewer with syntax highlighting and live status beacon.

## Code Layout
```
c:\obj\obj88/
├── backend/
│   ├── index.js
│   ├── src/
│   │   ├── Config/
│   │   │   ├── allowOrgin.js
│   │   │   └── corsoption.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── contactController.js
│   │   │   ├── contentController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js             <-- New validation middleware
│   │   ├── models/
│   │   │   ├── AdminUser.js
│   │   │   ├── BlogPost.js
│   │   │   ├── Certificate.js
│   │   │   ├── ContactMessage.js
│   │   │   ├── Experience.js
│   │   │   ├── Project.js
│   │   │   └── Skill.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── contact.js
│   │   │   ├── content.js
│   │   │   └── upload.js
│   │   ├── validators/                 <-- New express-validator schemas
│   │   │   └── index.js
│   │   ├── seed.js
│   │   └── seed-content.js
│   └── tests/
│       └── api-test.js
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── AdminLayout.jsx
│       │   ├── Badge.jsx
│       │   ├── Button.jsx
│       │   ├── CounterCard.jsx          <-- New animated counter
│       │   ├── Footer.jsx
│       │   ├── HeroTerminal.jsx         <-- New interactive terminal
│       │   ├── LangSwitch.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProfileCard.jsx          <-- New interactive profile card
│       │   ├── ProjectCard.jsx
│       │   ├── ProjectMockup.jsx        <-- New generative fallback mockup
│       │   ├── Section.jsx
│       │   ├── Spinner.jsx
│       │   ├── TechIcon.jsx             <-- New authentic brand SVGs
│       │   └── ThemeToggle.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── i18n/
│       │   ├── ar.json
│       │   ├── en.json
│       │   └── index.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── admin/
│       │       ├── ContentManager.jsx
│       │       ├── Dashboard.jsx
│       │       ├── Login.jsx
│       │       └── Messages.jsx
│       └── sections/
│           ├── About.jsx
│           ├── Blog.jsx
│           ├── Certificates.jsx
│           ├── Contact.jsx
│           ├── Experience.jsx
│           ├── Hero.jsx
│           ├── Projects.jsx
│           └── Skills.jsx
└── tests/
    └── e2e/                             <-- E2E Testing Track suite
```
