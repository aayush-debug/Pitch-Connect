# VentureGate product-wide design refinement

## Goal
Replace the remaining “template-built” feel with a cohesive, credible institutional product experience across the public site, authentication, onboarding, dashboards, discovery, requests, data rooms, uploads, and membership.

## What will change

### 1. Complete the VentureGate rebrand
- Replace every user-visible LetsPitch reference with VentureGate.
- Update page titles, descriptions, navigation, account screens, checkout branding, and product copy.
- Keep existing features, data, permissions, and flows unchanged.

### 2. Establish one restrained design system
- Use the specified charcoal palette: background `#121414`, surfaces `#1a1c1c`, borders `#38393a`.
- Use IBM Plex Serif for headings and IBM Plex Sans for interface and body text.
- Remove neon, cyan glow, animated gradients, aurora, scanlines, grid textures, glass blur, floating cards, and decorative motion.
- Replace them with precise 1px rules, square-to-subtly-rounded controls, measured typography, strong spacing, and restrained warm-neutral highlights.
- Refine shared buttons, cards, fields, tabs, badges, selects, progress indicators, and focus states so every screen inherits the same finish.

### 3. Refine the landing page
- Preserve the headline and product story while restyling the page with editorial hierarchy and institutional restraint.
- Convert the Founders / Investors / VentureGate introduction into a true three-column section with border separators.
- Simplify demo product views so they resemble credible investment software rather than decorative marketing cards.
- Keep all fictional and upcoming content clearly labelled.

### 4. Refine the signed-in application
- Create a consistent product header and page hierarchy across dashboard, discovery, founder requests, onboarding, password recovery, and subscription screens.
- Improve information density and alignment in startup, investor, thesis, match, upload, deck, and AI-summary views.
- Replace informal or generic wording where necessary with concise, professional language.
- Preserve Save, Pass, matching, subscriptions, uploads, AI summaries, private deck access, and Q&A behavior.

### 5. Validate the full experience
- Check every content route for VentureGate metadata and brand consistency.
- Verify desktop and mobile layouts, key interactions, and critical signed-out screens in the browser.
- Confirm the preview builds without errors and no obsolete LetsPitch or futuristic-effect references remain.

## Technical notes
- Styling will remain token-driven in the global design system; page code will use semantic colors only.
- Existing TanStack routing, authentication, Lovable Cloud data, storage, payment, and AI logic will not be changed.
- Shared UI primitives will carry most of the visual refinement, with route-level edits limited to layout and content presentation.
