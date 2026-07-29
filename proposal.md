#  PetCare CMS — AI Agent Build Proposal

## System Prompt for AI Coding Agent

You are a full-stack software engineer tasked with building **PetCare CMS** (Pet Care Clinical Management System), a web-based platform for tracking daily pet care data with AI-powered medical-style report generation.

---

## 1. PROJECT OVERVIEW

**PetCare CMS** is a clinical management system for 3 cats (Banban, Gogo, Pawpaw) that:
- Records daily feeding, health, activity, incidents, litter box, and supply data
- Generates AI-powered daily/weekly/monthly reports in medical-report style via LLM API
- Exports reports as PDF
- Supports user authentication and multi-user access
- Uses user-configurable LLM API (OpenRouter / OpenAI Compatible)
- Deploys via Docker Compose

---

## 2. DESIGN SYSTEM — REFERENCE TEMPLATES

All design decisions MUST be consistent with the HTML templates stored in `/templates/` folder:

```
templates/
├── dashboard.html # CMS Dashboard main page
├── daily-report.html # Daily Clinical Report
├── weekly-report.html # Weekly Clinical Report
└── monthly-report.html # Monthly Clinical Report
```

### 2.1 Visual Design Rules (MANDATORY)

Extract and apply these rules from the templates:

```
COLOR PALETTE:
- Primary: #000000 (black)
- Secondary: #333333
- Tertiary: #666666
- Muted: #999999
- Border: #CCCCCC
- Background: #F5F5F5
- Card bg: #F9F9F9
- White: #FFFFFF

TYPOGRAPHY:
- font-family: Arial, Helvetica, sans-serif
- No other fonts anywhere
- Headings: font-weight: 700
- Body text: 12px
- Small text: 10-11px

ICONS:
- ONLY inline SVG icons
- NO emoji characters anywhere
- NO external icon libraries (FontAwesome, Material Icons, etc.)
- NO icon fonts
- SVG stroke: #333 or currentColor, stroke-width: 1.5
- SVG viewBox: "0 0 24 24"

REPORT STYLE (from daily-report.html, weekly-report.html, monthly-report.html):
- max-width: 210mm (A4 compatible)
- Box shadow: 0 2px 16px rgba(0,0,0,0.1)
- @media print: remove shadow, white background
- Tables: zebra stripe (tr:nth-child(even) td { background: #F9F9F9 })
- Table headers: background: #F5F5F5, border-bottom: 2px solid #333
- Executive summary: border-left: 3px solid #333
- Recommendations box: background: #F9F9F9, border: 1px solid #333
- Footer: border-top, font-size: 10px, color: #999
- Badges: inline-block, padding 2px 6px, font-size 10px, border 1px solid #333

DASHBOARD STYLE (from dashboard.html):
- Sidebar: width 240px, background #000, fixed position
- Nav items: border-left active indicator, hover effect
- Patient cards: grid layout, left border accent (4px)
- Section cards: border 1px solid #CCC, background #FFF, padding 16px
- Quick action buttons: full width, primary (black bg) or secondary (white bg with border)
- Activity feed: items with time stamp, pet name in grey
```

### 2.2 SVG Icon Library

Use these inline SVGs consistently. Define them as reusable components:

```typescript
// Icons to implement as React components:
const ICONS = {
hospital: '<path d="M12 2L12 22M2 12L22 12"/><circle cx="12" cy="12" r="10"/>',
paw: '<circle cx="7" cy="10" r="2"/><circle cx="17" cy="10" r="2"/><path d="M4 16C4 16 6 20 12 20C18 20 20 16 20 16"/>',
food: '<ellipse cx="12" cy="14" rx="8" ry="4"/><path d="M4 14C4 14 4 18 12 18C20 18 20 14 20 14"/>',
heart: '<path d="M3 12H6L9 7L12 17L15 10L18 14L21 12"/><circle cx="12" cy="12" r="10"/>',
activity: '<circle cx="15" cy="6" r="2"/><path d="M9 22L11 16L8 14L10 8L13 11L16 10L18 14"/>',
alert: '<path d="M12 2L2 22H22L12 2Z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="1"/>',
box: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 8V6C8 4 9 3 12 3C15 3 16 4 16 6V8"/>',
clipboard: '<rect x="6" y="3" width="12" height="18" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>',
star: '<path d="M12 2L15 9H22L16 14L18 22L12 17L6 22L8 14L2 9H9L12 2Z"/>',
calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
report: '<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"/><path d="M14 2V8H20"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
chart: '<line x1="4" y1="20" x2="20" y2="20"/><line x1="6" y1="16" x2="6" y2="20"/><line x1="12" y1="10" x2="12" y2="20"/><line x1="18" y1="6" x2="18" y2="20"/>',
settings: '<circle cx="12" cy="12" r="3"/><path d="M12 1V5M12 19V23M5 12H1M23 12H19M4.2 4.2L7 7M17 17L19.8 19.8M4.2 19.8L7 17M17 7L19.8 4.2"/>',
login: '<path d="M12 2L12 22M2 12L22 12"/><circle cx="12" cy="12" r="10"/>',
pdf: '<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"/><path d="M14 2V8H20"/><path d="M12 18V12" stroke-width="2.5"/><path d="M9 15L12 18L15 15"/>',
};
```

---

## 3. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | React 18, TS 5.x |
| State | Zustand | latest |
| Routing | React Router v6 | latest |
| Styling | Inline styles + CSS (NO Tailwind, NO CSS-in-JS libraries) | — |
| Charts | Recharts (SVG-based) | latest |
| PDF | html2canvas + jsPDF | latest |
| Backend | Node.js + Express + TypeScript | Node 20, Express 4 |
| Database | PostgreSQL + Prisma ORM | Postgres 16, Prisma 5 |
| Auth | JWT (jsonwebtoken + bcryptjs) | latest |
| AI | OpenAI SDK (compatible with OpenRouter) | latest |
| Scheduler | node-cron | latest |
| Container | Docker + Docker Compose | Docker Compose v3.8 |

---

## 4. PROJECT STRUCTURE

Create the following directory structure:

```
petcare-cms/
├── templates/ # HTML design templates (USER PROVIDED)
│ ├── dashboard.html
│ ├── daily-report.html
│ ├── weekly-report.html
│ └── monthly-report.html
│
├── frontend/
│ ├── Dockerfile
│ ├── Dockerfile.dev
│ ├── nginx.conf
│ ├── package.json
│ ├── tsconfig.json
│ ├── vite.config.ts
│ ├── index.html
│ └── src/
│ ├── main.tsx
│ ├── App.tsx
│ ├── types/
│ │ └── index.ts # All TypeScript interfaces/types
│ ├── contexts/
│ │ └── AuthContext.tsx # Auth provider with JWT
│ ├── components/
│ │ ├── icons/
│ │ │ └── index.tsx # All SVG icon components
│ │ ├── layout/
│ │ │ ├── AppLayout.tsx # Sidebar + main content area
│ │ │ └── ProtectedRoute.tsx # Auth guard
│ │ ├── dashboard/
│ │ │ ├── PatientCard.tsx
│ │ │ ├── TodaySummary.tsx
│ │ │ ├── QuickActions.tsx
│ │ │ └── RecentActivityFeed.tsx
│ │ ├── forms/
│ │ │ ├── FeedingForm.tsx
│ │ │ ├── HealthForm.tsx
│ │ │ ├── ActivityForm.tsx
│ │ │ ├── IncidentForm.tsx
│ │ │ ├── LitterBoxForm.tsx
│ │ │ ├── SupplyForm.tsx
│ │ │ └── DiaryForm.tsx
│ │ ├── reports/
│ │ │ └── ReportPreview.tsx # Render HTML with DOMPurify
│ │ └── common/
│ │ ├── LoadingSpinner.tsx
│ │ └── StatusBadge.tsx
│ ├── pages/
│ │ ├── LoginPage.tsx
│ │ ├── DashboardPage.tsx
│ │ ├── PetListPage.tsx
│ │ ├── PetDetailPage.tsx
│ │ ├── DailyLogListPage.tsx
│ │ ├── DailyLogFormPage.tsx # Tab-based form with all 7 sections
│ │ ├── DailyLogDetailPage.tsx
│ │ ├── ReportListPage.tsx
│ │ ├── ReportDetailPage.tsx # Preview + PDF export
│ │ ├── AnalyticsPage.tsx
│ │ └── SettingsPage.tsx # LLM API configuration
│ ├── services/
│ │ └── api.ts # Axios instance with JWT interceptor
│ └── utils/
│ ├── pdfExport.ts # html2canvas + jsPDF
│ └── sanitize.ts # HTML sanitization
│
├── backend/
│ ├── Dockerfile
│ ├── Dockerfile.dev
│ ├── package.json
│ ├── tsconfig.json
│ ├── prisma/
│ │ ├── schema.prisma # Database schema (see Section 5)
│ │ └── seed.ts # Seed data: 3 cats, admin user
│ └── src/
│ ├── index.ts # Express app entry point
│ ├── config.ts # Environment variables
│ ├── middleware/
│ │ ├── auth.ts # JWT authentication
│ │ └── errorHandler.ts
│ ├── routes/
│ │ ├── auth.ts
│ │ ├── pets.ts
│ │ ├── dailyLogs.ts
│ │ ├── reports.ts
│ │ ├── analytics.ts
│ │ ├── users.ts
│ │ └── settings.ts
│ ├── services/
│ │ ├── llm-service.ts # LLM API abstraction (OpenRouter + OpenAI Compatible)
│ │ ├── report-generator.ts # Data aggregation + LLM call
│ │ └── report-system-prompt.ts # The LLM system prompt (see Section 8)
│ └── scheduler.ts # node-cron for auto-generated reports
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

---

## 5. DATABASE SCHEMA (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

enum Role { ADMIN STAFF VIEWER }
enum Gender { MALE FEMALE }
enum FoodType { WET DRY BOTH }
enum AppetiteLevel { NORMAL DECREASED INCREASED NONE }
enum Mood { PLAYFUL CALM AGITATED LETHARGIC HIDING }
enum StoolType { NORMAL SOFT DIARRHEA CONSTIPATION NONE }
enum ActivityType { PLAY WALK RUN SLEEP GROOMING EXPLORING OTHER }
enum Severity { INFO MINOR MODERATE CRITICAL }
enum SupplyType { DRY_FOOD WET_FOOD LITTER TREATS SUPPLEMENTS MEDICATION OTHER }
enum ReportType { DAILY WEEKLY MONTHLY }
enum ProviderType { OPENROUTER OPENAI_COMPAT }

model User {
id String @id @default(cuid())
username String @unique
passwordHash String
displayName String
role Role @default(STAFF)
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
dailyLogs DailyLog[]
reports Report[] @relation("ReportAuthor")
}

model Pet {
id String @id @default(cuid())
nameZh String
nameEn String
species String @default("Cat")
breed String
gender Gender
dob DateTime
weight Float?
avatarSvg String?
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
dailyLogs DailyLog[]
reports Report[] @relation("ReportPet")
}

model DailyLog {
id String @id @default(cuid())
date DateTime @unique
summary String?
createdById String
createdBy User @relation(fields: [createdById], references: [id])
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
feedings FeedingRecord[]
health HealthRecord[]
activities ActivityRecord[]
incidents IncidentRecord[]
litterBoxes LitterBoxRecord[]
supplies SupplyRecord[]
diaryEntries DiaryEntry[]
}

model FeedingRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
petId String
pet Pet @relation(fields: [petId], references: [id])
mealTime DateTime
foodType FoodType
wetFoodBrand String?
wetFoodQty Float?
dryFoodGrams Float?
isAutoFeeder Boolean @default(false)
consumedBy String[]
notes String?
createdAt DateTime @default(now())
}

model HealthRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
petId String
pet Pet @relation(fields: [petId], references: [id])
weightKg Float?
temperature Float?
appetite AppetiteLevel?
mood Mood?
stool StoolType?
vomit Boolean @default(false)
medication String?
symptoms String?
notes String?
createdAt DateTime @default(now())
}

model ActivityRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
petId String
pet Pet @relation(fields: [petId], references: [id])
activityType ActivityType
startTime DateTime?
durationMin Int?
notes String?
createdAt DateTime @default(now())
}

model IncidentRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
petId String
pet Pet @relation(fields: [petId], references: [id])
severity Severity
title String
description String
actionTaken String?
resolved Boolean @default(false)
createdAt DateTime @default(now())
}

model LitterBoxRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
boxNumber Int
fullyChanged Boolean @default(false)
scooped Boolean @default(true)
notes String?
createdAt DateTime @default(now())
}

model SupplyRecord {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
supplyType SupplyType
refilled Boolean @default(false)
brand String?
quantity String?
notes String?
createdAt DateTime @default(now())
}

model DiaryEntry {
id String @id @default(cuid())
dailyLogId String
dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
petId String
pet Pet @relation(fields: [petId], references: [id])
content String
createdAt DateTime @default(now())
}

model Report {
id String @id @default(cuid())
type ReportType
periodStart DateTime
periodEnd DateTime
title String
htmlContent String
rawData Json
generatedById String
generatedBy User @relation("ReportAuthor", fields: [generatedById], references: [id])
petIds String[]
createdAt DateTime @default(now())
}

model LlmConfig {
id String @id @default("default")
provider ProviderType
apiBaseUrl String
apiKey String
defaultModel String @default("deepseek/deepseek-v4-flash")
temperature Float @default(0.3)
maxTokens Int @default(4000)
isActive Boolean @default(true)
updatedAt DateTime @updatedAt
updatedById String?
updatedBy User? @relation(fields: [updatedById], references: [id])
}
```

### Seed Data

```typescript
// backend/prisma/seed.ts
const pets = [
{ nameZh: '餅餅', nameEn: 'Banban', breed: 'British Shorthair', gender: 'FEMALE', dob: new Date('2025-08-11'), weight: 3.8 },
{ nameZh: '糕糕', nameEn: 'Gogo', breed: 'Maine Coon', gender: 'MALE', dob: new Date('2026-01-02'), weight: 2.1 },
{ nameZh: '包包', nameEn: 'Pawpaw', breed: 'Maine Coon', gender: 'MALE', dob: new Date('2026-01-02'), weight: 2.3 },
];

const adminUser = {
username: 'admin',
password: bcrypt.hashSync('admin123', 10),
displayName: 'Dr. Sarah Chen',
role: 'ADMIN',
};
```

---

## 6. BACKEND API ENDPOINTS

Implement all endpoints with proper error handling and validation:

### Authentication
```
POST /api/auth/login → { username, password } → { token, user }
POST /api/auth/refresh → { token } → { token }
POST /api/auth/logout → invalidate token
GET /api/auth/me → get current user
```

### Pets
```
GET /api/pets → list all active pets
GET /api/pets/:id → get pet detail
POST /api/pets → create pet
PUT /api/pets/:id → update pet
DELETE /api/pets/:id → soft delete (set isActive=false)
```

### Daily Logs
```
GET /api/daily-logs → list logs (query: ?start=&end=&page=)
GET /api/daily-logs/today → get today's log or null
GET /api/daily-logs/:date → get log by date (YYYY-MM-DD)
POST /api/daily-logs → upsert by date
DELETE /api/daily-logs/:date → delete log and all related records
```

### Sub-resources (nested under daily logs)
```
All follow the pattern: /api/daily-logs/:date/{resource}
Resources: feedings, health, activities, incidents, litter-box, supplies, diary
GET → list all for that date
POST → create new record
PUT /:id → update record
DELETE /:id → delete record
```

### Reports
```
GET /api/reports → list all reports (query: ?type=&page=)
GET /api/reports/:id → get report with htmlContent
POST /api/reports/generate → trigger AI generation { type: 'DAILY'|'WEEKLY'|'MONTHLY', date?: string }
DELETE /api/reports/:id → delete report
```

### Analytics
```
GET /api/analytics/weight?petId=&start=&end=
GET /api/analytics/feeding?start=&end=
GET /api/analytics/health?petId=&start=&end=
GET /api/analytics/activity?petId=&start=&end=
```

### Settings
```
GET /api/settings/llm → get LLM config (key masked)
PUT /api/settings/llm → save LLM config
POST /api/settings/llm/test → test connection { provider, apiBaseUrl, apiKey, model }
```

### Users (admin only)
```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

---

## 7. FRONTEND PAGES — IMPLEMENTATION DETAILS

### 7.1 LoginPage
- Minimal black-and-white login form
- Centered on page, subtle shadow
- SVG logo (hospital icon) on top
- Error message display
- Redirect to /dashboard on success

### 7.2 DashboardPage
- **Layout**: Must match `templates/dashboard.html` exactly
- **Top**: Greeting with user name and current date
- **Patient Roster**: 3 cards in a grid (PatientCard component)
- Each card shows: name, breed, gender badge, DOB, age, weight
- Vital signs: appetite badge, mood badge
- Color-coded left border accent
- **Two-column section**: TodaySummary (feeding count, health count, incidents, supplies) + QuickActions (4 buttons)
- **Recent Activity Feed**: Timestamped list of latest entries
- **Footer**: Version info

### 7.3 DailyLogFormPage
- Tab-based navigation with 7 sections
- Tabs: Feeding Record | Health Observations | Activity Log | Incident Report | Litter Box Log | Supply Management | Clinical Diary
- Each tab contains the corresponding form component
- Date selector at top
- "Save & Generate Report" button at bottom
- After save, redirect to report preview

### 7.4 ReportDetailPage
- Toolbar at top: Report title, type, period, Export PDF button
- Report content rendered in a container with `dangerouslySetInnerHTML`
- **CRITICAL**: Use DOMPurify to sanitize HTML before rendering
- Export PDF button triggers html2canvas + jsPDF
- The rendered HTML must match the style from `templates/daily-report.html`

### 7.5 SettingsPage
- LLM API Configuration section
- Provider toggle: OpenRouter / OpenAI Compatible
- API Base URL text input
- API Key password input with Show/Hide toggle
- Default Model text input (default: `deepseek/deepseek-v4-flash`)
- Temperature slider (0.0 - 1.0)
- Max Tokens number input
- Test Connection button
- Save Configuration button
- Test result display (success/error)

### 7.6 AnalyticsPage
- Data visualization dashboard using Recharts
- Line chart: Weight trends over time (selectable by pet)
- Bar chart: Feeding consumption by brand
- Heatmap-like table: Appetite over days
- Pie chart: Activity distribution
- All charts in black and white only

---

## 8. LLM SYSTEM PROMPT (for Report Generation)

This is the system prompt that the backend sends to the LLM API. Store this in `backend/src/services/report-system-prompt.ts` as a string constant.

```typescript
export const SYSTEM_PROMPT = `You are a veterinary clinical report writer for PetCare CMS...

[Copy the full system prompt from the existing document:
"PetCare CMS - LLM System Prompt for Report Generation"
Include everything: SYSTEM RULES, REPORT TYPES, DATA INPUT FORMAT,
HTML TEMPLATE REQUIREMENTS, SVG ICON LIBRARY, CLINICAL TERMINOLOGY GUIDE,
OUTPUT REQUIREMENTS]
`;
```

**IMPORTANT**: The LLM prompt must instruct the AI to generate HTML that matches the style of `/templates/daily-report.html`, `/templates/weekly-report.html`, and `/templates/monthly-report.html`.

---

## 9. LLM SERVICE (Backend)

```typescript
// backend/src/services/llm-service.ts

export class LlmService {
async getConfig(): Promise<LlmConfig | null>
async saveConfig(data): Promise<LlmConfig>
async testConnection(config): Promise<{ success, response }>
async generateReport(aggregatedData, customConfig?): Promise<string>

private async callLlm(config, request, modelOverride?): Promise<string> {
// 1. Build endpoint URL: {apiBaseUrl}/chat/completions
// 2. Set headers:
// - Content-Type: application/json
// - Authorization: Bearer {apiKey}
// - If OpenRouter: add HTTP-Referer and X-Title
// 3. Build body:
// - model: config.defaultModel or modelOverride
// - messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: JSON.stringify(data) }]
// - temperature: config.temperature
// - max_tokens: config.maxTokens
// 4. POST to endpoint
// 5. Return data.choices[0].message.content
// 6. Handle errors with meaningful messages
}
}
```

---

## 10. PDF EXPORT

```typescript
// frontend/src/utils/pdfExport.ts
export async function exportReportToPDF(elementId: string, filename: string): Promise<void> {
// 1. Get element by ID
// 2. Use html2canvas to capture the element (scale: 2, background: #FFFFFF)
// 3. Create jsPDF instance (A4, portrait)
// 4. Add image to PDF
// 5. Handle multi-page content (if content exceeds page height)
// 6. Save as PDF
}
```

---

## 11. SCHEDULER

```typescript
// backend/src/scheduler.ts
import cron from 'node-cron';

export function initializeScheduler() {
// Daily report at 10:00 PM
cron.schedule('0 22 * * *', async () => {
// Generate report for yesterday
});

// Weekly report every Saturday at 10:00 PM
cron.schedule('0 22 * * 6', async () => {
// Generate report for past 7 days
});

// Monthly report on last day of month at 10:00 PM
cron.schedule('0 22 28-31 * *', async () => {
// Check if today is last day of month
// Generate report for past month
});
}
```

---

## 12. DOCKER DEPLOYMENT

### docker-compose.yml
```yaml
version: '3.8'
services:
postgres:
image: postgres:16-alpine
environment:
POSTGRES_DB: petcare_cms
POSTGRES_USER: petcare
POSTGRES_PASSWORD: ${DB_PASSWORD}
volumes:
- postgres_data:/var/lib/postgresql/data
healthcheck:
test: ["CMD-SHELL", "pg_isready -U petcare"]
interval: 10s
timeout: 5s
retries: 5
ports:
- "5432:5432"

backend:
build: ./backend
depends_on:
postgres: { condition: service_healthy }
environment:
DATABASE_URL: postgresql://petcare:${DB_PASSWORD}@postgres:5432/petcare_cms
JWT_SECRET: ${JWT_SECRET}
PORT: 4000
ports:
- "4000:4000"
command: sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"

frontend:
build: ./frontend
depends_on: [backend]
ports:
- "80:80"

volumes:
postgres_data:
```

### nginx.conf
```nginx
server {
listen 80;
root /usr/share/nginx/html;
index index.html;

location /api/ {
proxy_pass http://backend:4000/api/;
proxy_read_timeout 120s;
proxy_send_timeout 120s;
}

location / {
try_files $uri $uri/ /index.html;
}
}
```

---

## 13. BUILD ORDER — IMPLEMENTATION SEQUENCE

Follow this order to build the system:

```
PHASE 1: Foundation
Step 1: Initialize project structure (frontend/ + backend/)
Step 2: Set up Prisma schema + seed data
Step 3: Set up Express server with TypeScript
Step 4: Set up React + Vite with TypeScript
Step 5: Implement JWT authentication (backend + frontend)

PHASE 2: Core Features
Step 6: Implement Pets CRUD API + frontend pages
Step 7: Implement DailyLog API + all sub-resources
Step 8: Build DailyLogFormPage with 7 tabs
Step 9: Build DashboardPage with patient cards
Step 10: Implement Report generation service

PHASE 3: Reports & AI
Step 11: Implement LLM service (OpenRouter + OpenAI Compatible)
Step 12: Build ReportDetailPage (preview + PDF export)
Step 13: Build SettingsPage (LLM API configuration)
Step 14: Set up scheduler (cron jobs)

PHASE 4: Enhancement
Step 15: Build AnalyticsPage with charts
Step 16: Add PDF export functionality
Step 17: Implement error handling and loading states
Step 18: Add Docker configuration

PHASE 5: Polish
Step 19: Open HTML templates in /templates/ and ensure design matches
Step 20: Test all pages for design consistency
Step 21: Write README.md with setup instructions
```

---

## 14. CRITICAL DESIGN RULES

These rules override any other considerations:

1. **NO emoji** — anywhere in the entire application. Use SVG icons only.
2. **NO external icon libraries** — no FontAwesome, Material Icons, Heroicons, etc.
3. **NO Tailwind CSS** — use inline styles or plain CSS only.
4. **NO color** — black, white, and greys only. No blue links, no red errors (use bold text instead).
5. **Arial only** — font-family: Arial, Helvetica, sans-serif everywhere.
6. **Design must match templates** — open `/templates/*.html` and replicate the exact visual style.
7. **All reports must be A4-compatible** — max-width: 210mm, printable.
8. **API Key security** — never return full API key from backend to frontend. Mask it.
9. **HTML sanitization** — always use DOMPurify before rendering LLM-generated HTML.
10. **No streaming** — reports are generated in full, not streamed.

---

## 15. STARTUP INSTRUCTIONS

After building, the system should be runnable with:

```bash
# Development
cd backend && npm run dev # Express on :4000
cd frontend && npm run dev # Vite on :5173

# Production (Docker)
docker compose up -d --build # App on :80

# First-time setup:
# 1. Open http://localhost
# 2. Login with admin / admin123
# 3. Go to Settings → configure LLM API Key
# 4. Start recording daily logs!