# Githogoro Connect

The #1 community super-app for **Githogoro, Nairobi** — connecting residents with their neighbors, local jobs, businesses, and everything happening around Karura ward (near Runda and the Northern Bypass).

**Live:** [githogoro.vercel.app](https://githogoro.vercel.app)

## About

Githogoro Connect is an all-in-one neighborhood platform built for the Githogoro community in Westlands, Nairobi, Kenya. It brings social networking, commerce, governance, health, safety, and community finance into a single mobile-first PWA.

## Features

### Social
- **Feed** — posts, comments, likes from neighbors
- **Stories & Videos** — share moments with the community
- **Photo Memories** — community photo albums
- **Chat** — direct messages, group chats, and neighborhood chat rooms with polls, pinned messages, and call views
- **Events** — discover and organize local events
- **Groups** — join or create interest groups

### Economy
- **Jobs Board** — full-time, part-time, and casual work listings
- **Marketplace** — buy & sell within the neighborhood
- **Businesses Directory** — discover local businesses
- **Skills & Talents** — showcase and find local talent
- **Group Buy** — pool orders for better prices
- **Prices** — shared local market price tracking

### Community Finance
- **Tontine** — rotating savings groups
- **Harambee** — community fundraising
- **Loans & Savings** — informal lending circles

### Governance & Civic
- **Governance** — budget transparency, complaints, meetings, volunteering
- **Petitions** — start and sign community petitions

### Health & Safety
- **Health** — clinics directory, blood donors registry, mood check-ins
- **Safety & SOS** — emergency alerts and one-tap SOS
- **Lost & Found**, **Errands**, **Rides**, **Tools** (borrowing), **Meals**

### More
- **Map** — interactive Mapbox map of local places with reporting
- **Gamification** — reputation, leaderboard, activity streaks
- **Obituaries, Parenting, Recipes** — community life sections
- **i18n** — English/Swahili language toggle
- **PWA** — installable on phones with push notifications
- **Admin Panel** (`/c-panel`) — user management, content moderation, reports handling

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Radix UI, lucide-react |
| Database | PostgreSQL ([Supabase](https://supabase.com)) via [Prisma](https://prisma.io) ORM |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Maps | Leaflet + Mapbox |
| State | Zustand |
| Notifications | Web Push |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (database, auth, storage)
- A [Mapbox](https://mapbox.com) token for the map feature

### Setup

1. Clone the repo:

```bash
git clone https://github.com/elvisbitolo/githogoro.git
cd githogoro
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Direct DB connection (for migrations) |
| `ADMIN_USER_ID` | Supabase user ID of the admin |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `NEXT_PUBLIC_SITE_URL` | Site URL |

4. Apply the database schema:

```bash
npx prisma migrate dev
```

SQL migrations for specific features live in [`sql/`](sql) and at the repo root (`supabase-schema.sql`, etc.).

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on [Vercel](https://vercel.com): **githogoro.vercel.app**. Pushes to `main` trigger automatic deployments.

A `render.yaml` is also included for deploying to [Render](https://render.com) as an alternative.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── (auth)/           # Login / signup
│   ├── (dashboard)/      # Main app routes (feed, chat, jobs, marketplace, ...)
│   ├── c-panel/          # Admin panel
│   └── api/              # API route handlers
├── components/           # Shared UI components
├── hooks/                # React hooks (push notifications, etc.)
├── lib/                  # Utilities, i18n, guards
└── types/                # Shared TypeScript types
prisma/schema.prisma      # Database schema
```
