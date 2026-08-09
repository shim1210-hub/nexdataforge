# Production Core manual verification

Stage 22-E was executed on 2026-08-09 against the local production-core Studio using Microsoft Edge 151.0.4129.59.

## Browser evidence

- Required routes `/studio`, forms, navigation, feedback, overlays, quality, and release-gate loaded successfully.
- Tabs passed Arrow Left/Right, Home, End, disabled-tab skipping, wraparound, selected-panel linkage, and visible focus checks. Edge exposed the legacy `Right` key value in one path; the primitive now normalizes legacy Left/Right values and the same browser test passed after the fix.
- Dialog, protected confirmation, right Drawer, and bottom Sheet exposed modal names/descriptions, moved focus inside, locked and inerted the background, closed with Escape, and restored focus to their triggers. Default outside dismissal closed; protected outside dismissal remained blocked. Focus wrap and internal scrolling were exercised.
- Toasts preserved trigger focus, used status/alert roles, capped the visible queue at three, advanced queued items, supported action/dismiss controls, and honored both timed and persistent (`duration: 0`) lifetimes.
- Every required route had `scrollWidth === clientWidth` at an exact 320 CSS-pixel viewport. Controls and main content remained in the viewport. The same 320px reflow represents the effective layout width of a 640px viewport at 200% zoom; no critical control clipping was found. A separate 2x Edge raster pass also found no clipping.
- With `prefers-reduced-motion: reduce`, the browser media query matched and the inspected Studio route had zero running animations or non-zero control transitions.
- With `forced-colors: active`, the browser media query matched; controls retained solid one-pixel boundaries and system foreground/background colors.

## Environment-required evidence

Narrator is installed on the host, but the automated headless session cannot provide a trustworthy listening result. A human screen-reader pass must confirm announcements for required/error form states, selected tabs, dialog names/descriptions, and toast live regions on a desktop audio session.

## Candidate disposition

All executable browser and automated production-core checks pass. The only remaining item is the environment-dependent screen-reader listening session, so the release disposition is `V1.0 CANDIDATE READY — ENVIRONMENT VERIFICATION PENDING`.
