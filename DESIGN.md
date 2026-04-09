# NuruOS Design System

Inferred from the shipped Stitch implementation. This is the source of truth for new screens, components, and design reviews. If code drifts from this file, either fix the code or update this file with a commit explaining why.

## Principles

- **Dark-first.** `color-scheme: dark`. Every surface assumes a near-black canvas. Light mode is not supported.
- **Field-ready.** Agents use this one-handed, outdoors, on 375px phones with gloves. Large tap targets, high contrast, no hover-only affordances.
- **Calm density.** Generous spacing, 32px card radii, glassmorphism on layered surfaces. Cards breathe.
- **Lime is a signal, not a decoration.** Accent lime means "action you can take right now" — primary buttons, live indicators, active nav. Don't sprinkle it.

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / H1 | Sora | 300 (Light) | 44px |
| Heading / H2 | Sora | 400 | 28–32px |
| Subheading / H3 | Sora | 500 | 20–24px |
| Body | Manrope | 400 | 16px |
| Label / Caption | Manrope | 500–600 | 12–13px |
| Metric | Sora | 300 | 32–44px |
| Icon | Material Symbols Outlined | — | 20 / 24 / 32 |

Tailwind: `font-heading` → Sora, `font-base` → Manrope.

Body line-height `1.5`, headings tracking `-0.01em` to `-0.02em`.

## Color

All colors live as CSS custom properties on `:root` and are exposed through Tailwind `@theme` tokens.

| Token | Value | Use |
|---|---|---|
| `bg-bg-primary` | `#0B0F19` | App canvas |
| `bg-bg-card` | `rgb(17, 22, 34)` | Raised cards, inputs |
| `bg-bg-glass` | `rgba(17, 22, 34, 0.6)` + backdrop-blur | Sidenav, drawers, toolbars |
| `text-white` | `#FFFFFF` | Primary text |
| `text-text-secondary` | `rgba(255,255,255,0.72)` | Body copy |
| `text-text-tertiary` | `rgb(107, 114, 128)` | Muted, hints |
| `text-accent` / `bg-accent` | `rgb(190, 242, 100)` lime | Primary actions, active state, success |
| `text-secondary` / `bg-secondary` | `rgb(103, 232, 249)` cyan | Secondary accent, info, links |
| `border-border` | `rgba(255,255,255,0.08)` | Card borders |
| `border-border-glass` | `rgba(255,255,255,0.05)` | Glass-surface borders |
| status error | `#EF4444` | Errors, destructive |
| status warning | `#F59E0B` | Pending sync, cautions |

Contrast: all text/background pairs must meet WCAG AA (4.5:1 body, 3:1 large). `text-text-tertiary` on `bg-bg-card` is the current floor — do not go lighter.

## Radii

| Token | Value | Use |
|---|---|---|
| `rounded-full` | 9999px | Pills, chips, avatars, primary buttons |
| `rounded-[32px]` | 32px | Cards, modals, glass panels |
| `rounded-[22px]` | 22px | Icon tiles inside cards |
| `rounded-[20px]` | 20px | Banners, inline alerts |
| `rounded-xl` | 12px | Inputs, small buttons |

Default card = `rounded-[32px]`. No 4px or 8px radii except on inputs.

## Spacing & Layout

- Base unit: 4px. Use Tailwind scale (`p-2` = 8px, `p-6` = 24px).
- Card padding: `p-7` (28px) to `p-8` (32px).
- Card gap: `gap-6` (24px) vertical, `gap-4` (16px) between inline items.
- Screen side padding: `px-6` on mobile, content capped by an outer `max-w-screen-2xl mx-auto` in `AppShell`.
- Desktop sidebar: 260px fixed left. Main content offset with `md:ml-[260px]`.
- Mobile bottom nav: ~90px with `pb-[100px]` safe zone on pages.

## Components

### Buttons
- **Primary**: `bg-accent text-black rounded-full h-12 px-6 font-semibold`. Glow shadow `0 0 16px rgba(190,242,100,0.35)`.
- **Secondary**: `bg-bg-card border border-border rounded-full h-12 px-6 text-white`.
- **Ghost / icon**: 48×48 `rounded-full` with `text-white/50 hover:text-white`.
- Minimum tap target: **44×44px**. Icon buttons: **48×48px**.

### Cards
- `nuru-glassmorphism rounded-[32px] p-7`. Backdrop blur + 1px inner border.
- Header row: icon tile (64×64 `rounded-[22px]`) + pill badge on the right.

### Inputs
- `bg-bg-card border border-border rounded-xl h-12 px-4 text-white placeholder:text-text-tertiary`.
- Focus ring: `ring-2 ring-accent/40`.

### Pills / Badges
- `px-3.5 py-1.5 rounded-full border border-white/10`. 10px text, `uppercase`, `tracking-[0.1em]`.

### Navigation
- **Sidenav** (desktop ≥ md): fixed 260px, glass surface, active item = lime left border + lime icon.
- **Bottom nav** (mobile < md): 5 items, center FAB for "New Audit", active = lime icon + label.

### Toasts
- Slide down from top. `bg-bg-card border border-border rounded-2xl shadow-xl`. Color accent on the left border per type (success/warning/error/info).

## Motion

- Transitions use `var(--transition-base)` = `200ms ease-out`.
- Nav drawer: `300ms cubic-bezier(0.16,1,0.3,1)`.
- No bouncy springs. Calm, fast, predictable.

## Iconography

Material Symbols Outlined only. Weight 300, grade 0, optical size 24. Never mix icon families.

## Accessibility floor

- Tap targets ≥ 44×44px. Icon-only buttons ≥ 48×48px.
- Focus rings are visible on every interactive element (keyboard nav must work).
- No color-only state — always pair color with icon or text.
- `lang="en"` at minimum. Real copy swaps for all placeholder strings before ship.

## What this system is NOT

- Not a marketing site system. No hero gradients, no oversized display type on app screens.
- Not light-mode compatible. Don't try.
- Not a Material clone. Pills, 32px radii, and Sora light weights are the signature — preserve them.

---

_Last synced with code: 2026-04-09 (design audit, branch `main`)._
