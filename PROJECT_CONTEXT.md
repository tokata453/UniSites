# Project Context: UniSites

## What This Project Is

UniSites is a full-stack platform for discovering universities, majors, organizations, and opportunities in Cambodia. It combines public discovery pages with role-based dashboards and a shared inbox system so students, universities, organizations, and admins can interact inside one product.

At a high level:

- Students browse universities, majors, organizations, and opportunities
- Authenticated users can access a personalized feed and inbox
- University owners manage their university content and related resources
- Organizations manage their own profile, events, reviews, and opportunities
- Admins oversee platform-wide moderation and operations

## Product Areas

### Public Experience

- Landing page and about page
- University listing and university detail pages
- Organization listing and organization detail pages
- Majors listing, major detail, and major quiz
- Opportunities listing and opportunity detail pages

### Authenticated Experience

- Personalized feed
- Inbox and conversation system
- Saved items and profile management for students

### Dashboards

- Student dashboard
- University owner dashboard
- Organization dashboard
- Admin dashboard

## Roles

### `student`

- Browses content
- Saves items
- Uses the feed
- Applies to opportunities
- Sends and receives inbox messages

### `owner`

- Manages a university profile
- Maintains university content such as gallery, faculties, programs, news, FAQs, reviews, and opportunities

### `organization`

- Manages an organization profile
- Maintains organization content such as events, news, FAQs, reviews, and opportunities

### `admin`

- Manages users, universities, organizations, majors, opportunities, reviews, and feed-related moderation

## Current Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Zustand
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- Sequelize
- PostgreSQL
- Passport
- Socket.IO
- Cloudinary

### Authentication

- Local email/password
- Google OAuth
- Facebook OAuth

## Repository Structure

```text
UniSites/
  backend/   Express API, Sequelize models, migrations, seeders, Socket.IO
  frontend/  React app, routes, layouts, dashboards, API client layer
```

## Important Frontend Structure

- `frontend/src/App.jsx`
  Main route map for public pages, dashboards, auth callbacks, feed, and inbox access
- `frontend/src/pages/`
  Public pages and role-based dashboard pages
- `frontend/src/components/layout/`
  Shared app layouts such as `MainLayout` and `DashboardLayout`
- `frontend/src/store/`
  Zustand stores for auth, inbox, and UI state
- `frontend/src/api/`
  Axios client and grouped API helpers

## Important Backend Structure

- `backend/server.js`
  Server bootstrap, database connection, and Socket.IO startup
- `backend/app.js`
  Express app configuration, middleware, `/api` mounting, and error handling
- `backend/routes/index.js`
  Main API route registration
- `backend/controllers/`
  Request handlers grouped by domain
- `backend/models/`
  Sequelize models for auth, universities, organizations, opportunities, inbox, and feed
- `backend/migrations/`
  Database schema history
- `backend/seeders/`
  Development seed data for roles, users, majors, universities, organizations, and related content

## Main Backend Domains

- Auth
- Universities
- Organizations
- Opportunities
- Majors
- Feed
- Inbox
- Analytics
- Uploads
- Admin

## Data / Status Model Notes

The project separates account status from organization publishing and approval state.

- User account access is based on `users.is_active`
- Organization approval is based on `organizations.is_approved`
- Organization verification is based on `organizations.is_verified`
- Organization public visibility is based on `organizations.is_published`
- Opportunity public visibility is based on `opportunities.is_published`
- Review visibility is based on approval fields in review tables

This matters because user moderation and institution publishing are treated as different workflows.

## Inbox / Communication Model

UniSites includes an inbox system that supports conversations across different contexts, including personal and institution-related messaging. The backend contains dedicated inbox models and migrations, and the frontend exposes inbox access in multiple dashboards.

## Current Architectural Direction

Based on the existing routes, models, and recent migrations, the project is evolving beyond a university directory into a broader education-and-institutions platform with:

- University content management
- Organization content management
- Opportunity publishing
- Social/feed interactions
- Moderation workflows
- Institution-scoped messaging

## Useful Local Commands

### Backend

```bash
cd backend
npm install
npm run dev
npm run db:migrate
npm run db:seed
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Working Assumptions For Future Sessions

When resuming work on this repo, assume:

- This is one product with separate frontend and backend apps
- The frontend talks to the backend through `/api`
- Role-based access is central to the product design
- Universities and organizations are distinct domains with overlapping management needs
- Admin workflows are important and actively developed
- Inbox, feed, and moderation are first-class features, not side features

## Good Entry Points For Reorientation

If we need to get context quickly in a future session, start with:

1. `README.md`
2. `frontend/src/App.jsx`
3. `backend/routes/index.js`
4. the relevant dashboard page under `frontend/src/pages/dashboard/`
5. the matching backend controller and route files
