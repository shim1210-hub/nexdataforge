# Production Core Architecture

NexDataForge separates supported runtime assets from Studio verification and from governance evidence. This boundary allows products to share a minimum implementation without treating the Studio as a separate application framework.

## Release boundary

### Production — `components/design-system/`

- Supported web tokens, foundation exports, components, and public prop types.
- Consumers use the `@/components/design-system` public entry point.
- Internal helpers such as field contracts, portals, and modal surfaces are not public APIs unless explicitly exported.

### Studio verification — `app/studio/`

- Exercises Production components and documents their states, responsive behavior, and accessibility contracts.
- Also contains reference patterns, visual mocks, documentation routes, governance views, and adoption evidence views.
- Not every UI element rendered under `app/studio/` is a Production component.

### Documentation, governance, and evidence — `studio/`

- Stores design language, architecture decisions, manual verification, adoption evidence, and release records.
- Defines review and release rules without duplicating runtime components.

## Production status classification

| Status | Definition |
| --- | --- |
| PRODUCTION | Exported by the Production Core public API and supported for web product use. |
| PRODUCTION PREVIEW | Imports and exercises a Production component inside Studio. |
| REFERENCE PATTERN | Explains a reusable UX, AI, or workflow decision but is not a supported component API. |
| STUDIO MOCK | Provides visual validation only and is not a Production API. |
| PLANNED | Identifies a future candidate with no current release commitment. |

If a board mixes statuses, only the sample that imports the public API is a Production Preview. Its surrounding layout and explanatory controls remain Studio-only unless separately exported.

## Adoption flow

```text
Design System Production Core
  -> Studio Preview / Validation
  -> Project Adoption
  -> PriceGo / BidMe / SoolMap / AI Measure

Documentation / Constitution / Compliance
  -> evidence, review, exception, and release requirements
```

A primitive is added to Production Core only when a real product or Studio consumer needs the same reusable implementation. Board-specific explanatory or mock UI remains in Studio.

See [`releases/design-system-v1.0.0.md`](./releases/design-system-v1.0.0.md) for the v1.0 release evidence.
