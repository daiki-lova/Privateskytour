# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Rules

- マネージャー/Agent オーケストレーターとして振る舞うこと
- 実装は全て Sub Agent や Task Agent に委託し、自分では実装しない
- タスクは超細分化し、PDCA サイクルを構築すること
- 日本語でアウトプットすること
- 絵文字の使用は禁止

## Project Overview

ヘリフロント (HeliFont) - A helicopter tour booking platform with customer-facing booking flow, admin dashboard, Stripe payments, and multi-language support (ja/en/zh).

## Commands

```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
npm run seed:slots   # Seed test flight slots (tsx scripts/seed-test-slots.ts)
```

**Single test file:**
```bash
npx vitest run src/lib/cancellation/__tests__/policy.test.ts
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + RLS)
- **Payments:** Stripe
- **Email:** Resend
- **UI:** Radix UI + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Data fetching:** SWR

## Architecture

### Route Structure
```
src/app/
├── (public)/           # Customer-facing (booking, tours, mypage)
├── admin/              # Protected admin dashboard
├── api/
│   ├── auth/           # Login, logout, session
│   ├── admin/          # Protected CRUD endpoints
│   ├── public/         # Unauthenticated API (courses, slots, reservations)
│   └── stripe/         # Webhook handlers
└── booking/            # Payment success/error pages
```

### Key Directories
- `src/components/admin/views/` - Admin page-level components
- `src/components/booking/` - Multi-step booking wizard (Step1-3)
- `src/components/ui/` - shadcn/ui components
- `src/lib/api/hooks/` - SWR hooks (useCourses, useSlots, etc.)
- `src/lib/supabase/` - Database client and actions

### Database Schema
Core tables: `courses`, `slots`, `reservations`, `customers`, `admin_users`, `passengers`, `payments`

RLS policies enforce data access. Admin operations use `SUPABASE_SERVICE_ROLE_KEY`.

### Authentication
- **Admin:** Supabase Auth with middleware protection on `/admin/*`
- **Customer:** Anonymous booking with email, mypage via token
- **Dev mode:** Set `DEV_SKIP_AUTH=true` to bypass admin auth

### Type System
- `src/lib/data/types.ts` - Domain types (Course, Slot, Reservation, etc.)
- `src/lib/supabase/database.types.ts` - Auto-generated from schema

## Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Optional:
```
RESEND_API_KEY           # Email notifications
DEV_SKIP_AUTH=true       # Skip admin auth in development
```

## Supabase Migrations

Migrations are in `supabase/migrations/`. The initial schema is `20250126000000_initial_schema.sql`.

Flight slots are constrained to 09:00-19:00 at 30-minute intervals.
