# Clarix

**AI-powered project management for modern teams.**

Clarix is a full-stack project management app — workspaces, projects, Kanban/list/analytics views, AI-assisted planning, and team collaboration — built on Next.js 16 and the App Router, with a multi-tenant architecture designed around strict workspace isolation.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

Every workspace in Clarix is a fully isolated tenant — a user in Workspace A can never see, query, or modify data in Workspace B, enforced at the server-action layer, not just hidden in the UI. Within a workspace, teams organize work into projects, each viewable as a Kanban board, a filterable list, or an analytics dashboard, with AI assistance available at several points in the workflow (writing task descriptions, breaking a task into subtasks, suggesting priority, summarizing a project).

## Features

**Workspaces & Teams**
- Multi-tenant workspaces, each with its own members, roles (admin / member), and settings
- Email invitations with role-based acceptance flow
- Workspace switcher for users who belong to more than one workspace

**Projects & Tasks**
- Kanban board with drag-and-drop (keyboard-accessible, via dnd-kit)
- List view with status/priority/assignee filters
- Per-project analytics (status breakdown, priority breakdown, completion trends)
- Tasks carry status, priority, assignee, due date, comments, file attachments, and a full activity log
- Project archiving

**AI Assistance** (Google Gemini via the Vercel AI SDK)
- Generate a task description from its title
- Break a task down into an AI-suggested set of subtasks
- Priority suggestions based on task content
- AI-written project summaries on the analytics page

**Collaboration**
- Threaded comments on tasks
- File attachments (images and documents) via Cloudinary, with correct cleanup on delete
- In-app notifications (assignment, comments, mentions)
- Workspace-wide search across projects and tasks

**Auth**
- Email/password (hashed with bcrypt) and Google OAuth, via Auth.js v5

**Quality**
- Dark mode, fully responsive down to phone widths (375px), keyboard-navigable, screen-reader-tested
- SEO-correct public pages (metadata, sitemap, robots.txt, structured data) alongside fully noindexed authenticated pages
- Error monitoring via Sentry, with source maps uploaded on build

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | Auth.js v5 (Credentials + Google) |
| Styling | Tailwind CSS v4 |
| Forms / validation | React Hook Form + Zod v4 |
| Drag & drop | dnd-kit |
| AI | Vercel AI SDK + Google Gemini |
| File storage | Cloudinary |
| Testing | Vitest + mongodb-memory-server |
| Error monitoring | Sentry |

## Architecture

- **Server Actions, not a REST API.** All mutations (`src/actions/`) run as Next.js Server Actions, validated with Zod schemas (`src/lib/validations/`) before touching the database.
- **Tenant isolation is enforced server-side**, not just by hiding UI. Every query that touches workspace-scoped data filters by `workspaceId`, and permission checks (`src/lib/authorization.ts`) run before any read or write — verified by a dedicated cross-workspace isolation test suite.
- **Data access layer** (`src/lib/dal/`) centralizes read queries used by Server Components, keeping permission checks out of the page components themselves.
- **Cascading deletes** (`src/lib/cascade.ts`) clean up tasks, comments, and attachments (including the actual Cloudinary files, not just the DB records) when a project or workspace is deleted.

## Project Structure

```
src/
├── actions/        # Server Actions (mutations), one file per domain
├── app/
│   ├── (auth)/      # login, register
│   ├── (main)/      # authenticated app, under [workspaceSlug]
│   ├── api/         # route handlers (uploads, AI streaming, auth, search)
│   └── invite/      # invitation acceptance flow
├── components/      # organized by feature (tasks, projects, ai, members, ...)
├── hooks/
├── lib/
│   ├── dal/         # data access layer — read queries
│   └── validations/ # Zod schemas
├── models/          # Mongoose schemas
└── types/
```

## Getting Started

### Prerequisites

- Node.js 22+
- A MongoDB instance (local, or free tier on [Atlas](https://www.mongodb.com/cloud/atlas/register))

### Setup

```bash
git clone https://github.com/maaz-afzal/clarix.git
cd clarix
npm install
cp .env.example .env.local
```

Fill in `.env.local` using the table below, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Connection string |
| `AUTH_SECRET` | Yes | Generate with `openssl rand -hex 32` |
| `AUTH_URL` | Yes | App URL; used by Auth.js for OAuth callback construction |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | For Google login | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Powers all AI features |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | For file uploads | From [Cloudinary console](https://cloudinary.com/console) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Used for invite links, sitemap, and Open Graph tags |
| `SENTRY_AUTH_TOKEN` | Optional | For source map uploads during `next build` |

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start         # run the production build
npm run lint          # ESLint
npm test              # run the test suite once
npm run test:watch    # watch mode
```

## Testing

The test suite runs against a real MongoDB instance (`mongodb-memory-server`), not a mocked database layer — only true third-party boundaries (Cloudinary's SDK) are mocked. Coverage focuses on what actually breaks production apps:

- Cross-workspace tenant isolation (a member of Workspace A can never read or mutate Workspace B's data)
- Permission checks for every role combination
- Open-redirect safety on post-login callback URLs
- Correct `resource_type` handling when deleting non-image Cloudinary attachments

## Security

- Passwords hashed with bcrypt; sessions via Auth.js v5 (JWT)
- Every server action re-verifies the caller's workspace membership and role — the client is never trusted
- Input validated with Zod on every mutation, server-side, regardless of client-side validation
- Private routes are excluded from both `robots.txt` and page-level `<meta name="robots">`

## Deployment

Deploys cleanly to [Vercel](https://vercel.com):

1. Set every variable from the table above in the Vercel project's environment variables
2. Add `https://<your-domain>/api/auth/callback/google` to your Google OAuth app's authorized redirect URIs
3. Push to `main` — Vercel builds and deploys automatically

## License

MIT — see [LICENSE](./LICENSE).