# Mohr Ads Dashboard

## Project Overview
A full-stack web application for Mohr Insurance Services to track Medicare webinar
Facebook ad campaign performance from Meta ad spend through to client acquisition
and revenue. The dashboard replaces a manual Google Sheets tracker with an
auto-calculating, diagnostics-driven interface that provides actionable advice
based on weekly trends.

This is a MANUAL INPUT dashboard. The owner enters all data weekly — both Meta
Ads Manager stats and downstream funnel metrics from GHL/internal tracking.
There is NO Meta API integration. Keep it simple.

## Owner Context
- **Business**: Mohr Insurance Services — family-owned Medicare insurance agency in Los Angeles
- **Funnel**: Facebook ads → Landing page (register.jmohrins.com) → Webinar → Appointment → Live Call → Client
- **Products sold**: Medicare Advantage, Medicare Supplement, Aetna ancillary (cancer, heart/stroke, HIP, DVH)
- **CRM**: GoHighLevel (GHL)
- **Deployment target**: Railway (owner already has a Railway account)
- **Developer context**: Owner is not a developer. Keep setup steps minimal and well-documented.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts (for sparklines and trend charts)
- **Backend**: Node.js (Express)
- **Database**: SQLite (via better-sqlite3) — simple, no external DB needed, single-user app
- **Deployment**: Railway (single service — Express serves API + static frontend)
  - SQLite db MUST be stored on a Railway Volume mount at /data/
  - Set RAILWAY_RUN_UID=0 for volume write permissions
  - Express serves built React frontend as static files in production
  - Railway auto-provides $PORT — always bind to process.env.PORT
- **Auth**: Simple password gate (single user, not multi-tenant)

## Architecture
```
┌──────────────────────────────────────────────────────┐
│              Railway (Single Service)                  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │            Express Server ($PORT)                │ │
│  │                                                  │ │
│  │  /api/weeks          → CRUD weekly data          │ │
│  │  /api/weeks/summary  → Aggregate totals          │ │
│  │  /api/alerts         → Diagnostic alerts         │ │
│  │  /api/advice/latest  → Latest week advice        │ │
│  │  /api/advice/:week   → Specific week advice      │ │
│  │  /api/backup         → Download SQLite file      │ │
│  │  /*                  → React SPA (static files)  │ │
│  │                                                  │ │
│  │  SQLite on Volume (/data/mohr-ads.db)            │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## Commands
- `pnpm install` — Install all dependencies
- `pnpm dev` — Run both frontend and backend in development
- `pnpm build` — Build frontend for production
- `pnpm start` — Start production server
