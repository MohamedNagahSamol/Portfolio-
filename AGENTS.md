# Project Rules & Conventions

## Development Workflow
- **Process Constraint:** Follow `portfolio-ai-build-plan_1.md` strictly. Work on **one section at a time**; stop and await user confirmation after each section.
- **Verification:** Backend endpoints must be tested (Postman/cURL) before starting the corresponding frontend implementation.

## Repository Structure
- **Monorepo:**
  - `frontend/`: Vite + React + Tailwind + i18n
  - `backend/`: Node.js + Express + Mongoose
- **Environment Variables:**
  - `backend/.env`: `PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `CORS_ORIGIN`
  - `frontend/.env`: `VITE_API_BASE_URL`

## MCP
- `opencode.json` at repo root: Chrome DevTools MCP enabled for browser debugging.

## Standards & Conventions
- **Authentication:**
  - Use `httpOnly` cookies for refresh token rotation.
  - Keep access tokens in-memory (Context).
  - Use Axios interceptors for 401 handling and auto-refresh.
- **i18n & RTL:**
  - **Zero hardcoding:** All UI text must be in `en.json` / `ar.json`.
  - Toggle `dir` and `lang` on `<html>` when changing language.
- **Theming:**
  - Use Tailwind `class` strategy for Light/Dark mode.
  - Persist theme via `localStorage`.
- **API Response:**
  - Always use standard shape: `{ success: boolean, data: any, message?: string }`.
