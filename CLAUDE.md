# NuruOS Field Intelligence — CLAUDE.md

Enterprise-grade, offline-first PWA for agricultural field auditors in Tanzania.
Stitch design system: dark navy backgrounds, neon-lime (#BEF264) accent, Sora + Manrope typography.

## Design System

### Colors (src/design-system.ts)
- **Backgrounds:** bgDeep `#0B0F19`, bgCard `#111622`, bgSlate `#161C2A`
- **Accents:** neonLime `#BEF264`, neonCyan `#67E8F9`, neonRed `#FF4B4B`, neonAmber `#FFBF00`, neonPurple `#D8B4FE`
- **Glass:** `rgba(255,255,255,0.03)` with blur(24px) backdrop

### Typography
- **Sora** — headings, display text (font-sora)
- **Manrope** — body, labels, UI text (font-manrope)
- **IBM Plex Mono** — data, IDs (font-mono)

### CSS Classes (src/styles/main.css)
- `.glass-card`, `.glass-card-md`, `.glass-pill` — glassmorphism
- `.glow-lime`, `.glow-lime-strong`, `.glow-cyan`, `.glow-red` — neon shadows
- `.text-glow-lime`, `.text-glow-cyan` — text glow
- `.bg-grid` — subtle grid texture
- `.animate-pulse-cyan`, `.animate-pulse-lime` — pulsing animations
- `.scrollbar-hide`, `.pb-safe` — utility classes

### Icons
- Material Symbols Outlined only. Class: `material-symbols-outlined`

## Screens (12 total)

| # | Screen | File | Route |
|---|--------|------|-------|
| 1 | Loading | src/pages/LoadingScreen.tsx | / (splash) |
| 2 | Welcome | src/pages/WelcomeScreen.tsx | /welcome |
| 3 | Sign In | src/pages/SignInScreen.tsx | /signin |
| 4 | Sign Up | src/pages/SignUpScreen.tsx | /signup |
| 5 | Dashboard | src/pages/DashboardScreen.tsx | /dashboard |
| 6 | Schedule | src/pages/ScheduleScreen.tsx | /schedule |
| 7 | Audit Type Selector | src/pages/AuditTypeSelectorScreen.tsx | /audit/select |
| 8-9 | Audit Form (normal + error) | src/pages/AuditFormScreen.tsx | /audit/new/:type |
| 10 | Sync Dashboard | src/pages/SyncDashboardScreen.tsx | /sync |
| 11 | Camera | src/pages/CameraScreen.tsx | /camera |
| 12 | Settings | src/App.tsx (inline) | /settings |

## Components

### UI (src/components/ui/)
- **BottomNav** — 5-item fixed nav, neon-lime active states
- **ProgressRing** — SVG circular progress indicator
- **StatusBadge** — color-coded status labels (completed/syncing/failed/etc.)
- **GlassCard** — glassmorphism container with configurable padding/radius
- **NeonButton** — lime/cyan/ghost/red variants with glow effects
- **FormInput** — labeled input with focus/error/password states
- **StepProgressBar** — horizontal step dots with connecting lines
- **SyncStatusBar** — online/offline/pending sync indicator

### Forms (src/components/forms/)
- **AuditFormStep** — full-page step layout with progress, error timeline
- **GPSCaptureField** — geolocation capture with accuracy indicator
- **PhotoCaptureField** — camera capture with AI analysis simulation

## Branch Structure
```
main
└── feat/stitch-design-system (integration)
    ├── feat/design-tokens        ✅ merged
    ├── feat/shared-components    ✅ merged
    ├── feat/screen-auth          ✅ merged
    ├── feat/screen-dashboard     ✅ merged
    ├── feat/screen-audit-form    ✅ merged
    ├── feat/screen-sync-camera   ✅ merged
    └── feat/routing-integration  ✅ merged
```

## Service Layer (DO NOT BYPASS)
- **Zustand stores** (src/store/index.ts): useAuthStore, useAuditStore, useUIStore
- **Supabase** (src/lib/supabase.ts): auth, audits, farms, profiles
- **Validation** (src/lib/validations.ts): Zod schemas for all forms

## Key Constraints
- Tailwind v4 with @theme block — no arbitrary color values in components
- TypeScript strict mode — no `any`, no `!` assertions
- Offline-first — all data through stores, sync queue for uploads
- PWA — service-worker.js must not be modified
- Max 430px mobile viewport design target
- Min 44x44px touch targets (WCAG 2.5.5)
