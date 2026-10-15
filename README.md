# Step-in-CRM

Agentic CRM for Indian B2B — built by Step-in-Digitech.

## Quick Start (Local)

```bash
# 1. Install pnpm if needed
corepack enable pnpm

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase + Neon credentials

# 4. Generate database schema (optional - uses mock data by default)
pnpm db:generate

# 5. Start development
pnpm dev
```

Open http://localhost:3000 → redirects to `/login` → use demo credentials or sign up.

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "M0+M1 vertical slice"
gh repo create step-in-crm --push --source=.
```

### 2. Import in Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repo
3. Framework preset: **Next.js**
4. Root directory: `apps/web` (if monorepo) or leave as root
5. Add environment variables from `.env.example`

### 3. Required Vercel Environment Variables
| Variable | Required | Source |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your Vercel deployment URL (e.g. `https://step-in-crm.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `NEXTAUTH_URL` |

### 4. Deploy
Click **Deploy** — first build will take ~2-3 minutes.

## Project Structure

```
step-in-crm/
├── apps/
│   └── web/                 # Next.js 14 App Router
│       ├── src/
│       │   ├── app/         # Pages (Dashboard, Leads, Pipeline, Deals, Orders)
│       │   ├── actions/     # Server Actions (data layer)
│       │   ├── components/  # App-specific components (AppShell)
│       │   ├── lib/         # Utilities, seed data
│       │   └── middleware.ts # Auth + org context
│       ├── design/          # Design tokens (copied from replica/design)
│       └── tailwind.config.ts
├── packages/
│   ├── db/                  # Drizzle ORM schema (24 tables)
│   └── ui/                  # Shared component library (10 primitives)
├── replica/                 # Recon, architecture, design specs
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml
```

## Current Features (M0 + M1)

| Screen | Status |
|--------|--------|
| Dashboard | ✅ KPI cards, pipeline funnel, recent activity, hot leads |
| Leads List | ✅ Search, filters, pagination, modal CRUD |
| Pipeline (Kanban) | ✅ Drag-drop, 5 stages, add deal |
| Deals List | ✅ Table with inline stage actions, modal CRUD |
| Orders List | ✅ Status badges, JSON addresses, modal CRUD |
| Login | ✅ Supabase Auth ready (email/password + OAuth) |

## Design System

- **Tokens**: `replica/design/tokens.json` → Tailwind config
- **WCAG AA**: 17/17 contrast pairs pass
- **Components**: 10 primitives (Button, Input, Badge, Avatar, Card, Table, Modal, Select, Toast, Sidebar)
- **Colors**: Slate neutrals + deep blue accent (placeholder for brand)

## Next Milestones

- **M2**: Operations (Tickets, Procurement, Inventory, Contacts, Activities)
- **M3**: AION Voice AI (LiveKit + Deepgram + OpenAI Realtime)
- **M4**: WhatsApp AI Chatbot (Meta Cloud API)
- **M5-9**: Bulk calling, Generative AI, Mobile, Integrations, Verticals

## License

Proprietary — Step-in-Digitech