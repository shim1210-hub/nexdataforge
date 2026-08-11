# NexDataForge Design System v1.0

Release evidence date: 2026-08-11
Recommended tag: `design-system-v1.0.0`

## Included

- Foundation and semantic tokens
- Breakpoints and Safe Area variables
- Button and IconButton
- Input, Textarea, Select, Checkbox, RadioGroup, and Switch
- Tabs, TabList, Tab, and TabPanel
- Alert, Progress, and Skeleton
- Dialog and Drawer/Sheet
- Toast
- Public API through `@/components/design-system`
- Studio verification surfaces
- Accessibility contracts
- PriceGo adoption evidence

## Verified

- TypeScript
- Production Core ESLint
- Studio ESLint
- Production build
- 320px layout
- 200% effective reflow
- Tabs keyboard behavior
- Dialog focus containment and restoration
- Drawer/Sheet behavior
- Toast behavior and live-region implementation
- Reduced motion
- Forced colors

The executable browser evidence is recorded in [`../production-core-manual-verification.md`](../production-core-manual-verification.md).

## Known limitations

- Screen-reader listening verification is `ENVIRONMENT VERIFICATION PENDING`.
- Semantic/code verification passed, browser keyboard verification passed, and live-region implementation passed. Actual Narrator, VoiceOver, or TalkBack listening has not been claimed as passed.
- Repository-wide legacy lint debt remains at 47 errors and 31 warnings. Production Core and Studio add no lint errors or warnings.
- Some Studio previews are reference patterns or mocks rather than public Production components.
- React Native does not consume the web components directly. A product-local adapter maps shared intent to native tokens and controls.
- Native-device evidence at 360px and 390px, including native font scaling, remains follow-up verification.

## Not included in v1.0

The following are planned extensions, not v1.0 blockers:

- Search Input
- Pagination primitive
- Menu
- Popover
- Tooltip
- Combobox
- Table/Data Grid
- Stepper
- File Upload
- Production AI component API

## Screen-reader condition

Status: **ENVIRONMENT VERIFICATION PENDING**

| Evidence | Status |
| --- | --- |
| Semantic and code verification | PASS |
| Browser keyboard verification | PASS |
| Live-region implementation | PASS |
| Narrator/VoiceOver/TalkBack listening | PENDING |

No synthetic or inferred listening evidence is used for this release.

## Production status classification

| Status | Meaning |
| --- | --- |
| PRODUCTION | A supported component exported by the `components/design-system` public API. |
| PRODUCTION PREVIEW | A Studio preview that imports and exercises a Production component. |
| REFERENCE PATTERN | An explanatory UX, AI, or workflow implementation that is guidance rather than a supported component API. |
| STUDIO MOCK | A visual validation mock that is not a Production API. |
| PLANNED | A future candidate that is not implemented or released. |

The status of a Studio route does not promote its entire UI to Production. Mixed boards must identify which sample imports the public API; surrounding explanatory UI remains Studio-only.

## Release boundary

| Boundary | Path | Release meaning |
| --- | --- | --- |
| Production | `components/design-system/` | Supported web components, public types, tokens, and foundation exports. |
| Studio verification | `app/studio/` | Previews, reference patterns, mocks, documentation routes, and quality views. Not every UI element is Production. |
| Documentation, governance, and evidence | `studio/` | Design language, review rules, adoption records, manual evidence, and release records. |

## PriceGo adoption boundary

PriceGo evidence demonstrates adoption and governance; it does not make React Native controls part of the web Production Core. The governing rule is documented in [`../projects/pricego/pricego-adoption-pilot.md`](../projects/pricego/pricego-adoption-pilot.md).
