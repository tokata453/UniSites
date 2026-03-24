# UniSites

UniSites is a full-stack platform for discovering universities, majors, organizations, opportunities, feed updates, and institution inbox conversations. It includes public discovery pages, role-based dashboards, and an admin workspace for review and moderation.

## Stack

- Frontend: React, Vite, React Router, Zustand, Tailwind CSS
- Backend: Node.js, Express, Sequelize, PostgreSQL, Passport, Socket.IO
- Storage/media: Cloudinary
- Auth: local email/password, Google OAuth, Facebook OAuth

## Repository Layout

```text
UniSites/
  backend/   Express API, Sequelize models, migrations, seeders, Socket.IO
  frontend/  React app, pages, layouts, dashboards, client API layer
```

## Core Product Areas

- Public university listing and detail pages
- Public organization listing and detail pages
- Opportunity discovery and detail pages
- Personalized feed with news, events, and opportunities
- Student dashboard
- University owner dashboard
- Organization dashboard
- Admin dashboard
- Inbox system for personal, university, organization, and admin conversations

## Roles

- `student`
  Browses content, saves items, uses feed, applies to opportunities, sends inbox messages
- `owner`
  Manages a university profile and its related content
- `organization`
  Manages an organization profile and its related content
- `admin`
  Manages platform-wide users, universities, organizations, reviews, feed items, and moderation workflows

## Approval and Status Model

- User account status lives on `users.is_active`
- Organization approval lives on `organizations.is_approved`
- Organization verification lives on `organizations.is_verified`
- Organization public visibility lives on `organizations.is_published`
- Opportunity public visibility lives on `opportunities.is_published`
- Review visibility lives on `*_reviews.is_approved`

This separation is intentional:

- `user` status controls account access and role management
- `organization` status controls institutional approval, verification, and publishing

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Cloudinary account
- Google OAuth app for Google sign-in
- Facebook app for Facebook sign-in

## Environment Variables

### Backend `.env`

Required:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

Optional but recommended:

```env
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/auth/facebook/callback
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3001/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

- Create `backend/.env`
- Create `frontend/.env`

### 3. Run database migrations

From `backend/`:

```bash
npm run db:migrate
```

### 4. Seed the database

From `backend/`:

```bash
npm run db:seed
```

### 5. Start both apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

## Useful Backend Scripts

From `backend/`:

```bash
npm run dev
npm start
npm run db:migrate
npm run db:seed
npm run db:reset
npm run import:universities
npm run enrich:universities
npm run refresh:universities
npm test
```

## Useful Frontend Scripts

From `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Database Notes

- Sequelize uses `DATABASE_URL` from `backend/config/config.json`
- Development and production are configured for PostgreSQL
- Development currently expects SSL-enabled connections because of the shared `dialectOptions`
- If you are using local Postgres without SSL, adjust `backend/config/config.json` accordingly

## Migration Workflow

When pulling new schema changes:

```bash
cd backend
npm run db:migrate
```

Recent architecture-sensitive migrations include:

- organization domain tables
- institution-owned inbox conversations
- extended organization profile fields
- organization-owned opportunities
- organization approval moved to the organization entity

If the app starts but features fail with missing relation/column errors, migrations are the first thing to verify.

## Seed Workflow

To repopulate development data:

```bash
cd backend
npm run db:seed
```

The seeders populate:

- roles
- users
- universities and related detail content
- opportunities
- supporting discovery data

## Testing

The backend now includes a small `node:test` foundation for core business rules:

- registration status defaults
- registration validation
- opportunity ownership policy
- inbox access policy

Run from `backend/`:

```bash
npm test
```

This is still a foundation, not a full integration suite.

## Short Architecture Map

### Frontend

- `frontend/src/App.jsx`
  Top-level route map for public pages and dashboards
- `frontend/src/api/`
  Axios client and API wrappers
- `frontend/src/components/layout/`
  Main public layout and dashboard layout shells
- `frontend/src/pages/`
  Public pages and dashboard pages
- `frontend/src/store/`
  Zustand auth, inbox, and UI state

### Backend

- `backend/server.js`
  HTTP server bootstrap and Socket.IO initialization
- `backend/app.js`
  Express app, middleware, and route mounting
- `backend/routes/`
  Route modules grouped by domain
- `backend/controllers/`
  HTTP handlers and orchestration logic
- `backend/models/`
  Sequelize models by domain
- `backend/migrations/`
  Schema evolution history
- `backend/seeders/`
  Development seed data
- `backend/utils/`
  shared helpers for responses, policies, auth, validation, and status rules

### Important Domain Boundaries

- `auth`
  login, register, profile, notifications, saved items
- `university`
  profile, gallery, faculties, programs, news, events, FAQs, reviews
- `organization`
  profile, contact, gallery, FAQs, news, events, reviews
- `opportunity`
  public listing/detail and role-managed creation
- `feed`
  mixed stream of news, events, and opportunities
- `inbox`
  personal and institution-owned messaging
- `admin`
  moderation, management, approval, and visibility control

## Current Ownership Rules

- University opportunities are associated by `university_id`
- Organization opportunities are associated by `organization_id`
- `posted_by` on opportunities is kept as the creator/audit user
- Institution inboxes are owned by `university_id` or `organization_id`, not by the current owner user alone

## Project Health Priorities

Current recommended next steps:

1. Expand backend tests into route/controller integration tests
2. Continue splitting very large dashboard pages into smaller hooks/components
3. Keep approval/publish/verification rules centralized in shared policy/status helpers
4. Add deployment docs and production env examples
5. Add API validation around write-heavy endpoints

## Troubleshooting

### Missing relation / column errors

Run:

```bash
cd backend
npm run db:migrate
```

### OAuth redirect issues

Check:

- `CLIENT_URL`
- Google/Facebook callback URLs
- frontend `VITE_API_URL`

### Images not rendering

Check:

- `CLOUDINARY_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- stored asset IDs/URLs in the database

### API requests hitting the wrong server

Check:

- `frontend/.env`
- `frontend/src/api/axios.js`
- Vite proxy in `frontend/vite.config.js`
