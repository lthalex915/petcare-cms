# PetCare CMS

PetCare CMS (Pet Care Clinical Management System) is a full-stack clinical-style pet care tracking platform for Banban, Gogo, and Pawpaw.

## Features

- JWT authentication with role-based admin user management
- Daily clinical records across feeding, health, activity, incidents, litter, supply, and diary entries
- Dashboard styled to match `/templates/dashboard.html`
- AI-generated daily/weekly/monthly clinical reports via OpenRouter or OpenAI-compatible APIs
- Report preview with DOMPurify sanitization and PDF export (html2canvas + jsPDF)
- Analytics dashboard using Recharts (black/white design)
- Scheduled report generation using node-cron
- Dockerized deployment with PostgreSQL, backend, and frontend services

## Tech Stack

- Frontend: React 18 + TypeScript + Vite + React Router v6 + Zustand
- Backend: Node.js 20 + Express 4 + TypeScript
- Database: PostgreSQL 16 + Prisma 5
- Auth: jsonwebtoken + bcryptjs
- AI: OpenAI-compatible chat completions endpoint support
- Infra: Docker + Docker Compose v3.8

## Project Structure

- `frontend/` — React app
- `backend/` — Express API + Prisma
- `templates/` — design reference HTML templates
- `docker-compose.yml` — production stack
- `docker-compose.dev.yml` — development stack

## Local Development

1. Copy env files:

```bash
cp .env.example .env
cp .env.example backend/.env
```

2. Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Production (Docker)

```bash
docker compose up -d --build
```

Then open http://localhost

## First-time Setup

1. Login with:
   - Username: `admin`
   - Password: `admin123`
2. Open **Settings** and configure your LLM provider/base URL/API key/model
3. Start recording daily logs and generate reports

## API Overview

- Auth: `/api/auth/*`
- Pets: `/api/pets/*`
- Daily Logs + sub-resources: `/api/daily-logs/*`
- Reports: `/api/reports/*`
- Analytics: `/api/analytics/*`
- Settings: `/api/settings/*`
- Users (admin): `/api/users/*`

## Notes

- API keys are masked in settings responses.
- Report HTML is sanitized with DOMPurify before rendering.
- Templates in `/templates` are used as visual reference for dashboard and report style.
- For local backend/Prisma commands, `backend/.env` must exist because Prisma resolves `env("DATABASE_URL")` relative to the backend project.
