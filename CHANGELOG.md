# Changelog

This changelog records consumer-visible NexDataForge Design System releases. It does not reproduce the internal stage-by-stage development log.

## [Design System 1.0.0] - 2026-08-11

### Added

- Established the Production Core and its public entry point at `@/components/design-system`.
- Added raw, semantic, and component tokens, shared breakpoints, and Safe Area variables.
- Added Button, IconButton, Input, Textarea, Select, Checkbox, RadioGroup, Switch, and Tabs primitives.
- Added Alert, Progress, Skeleton, Dialog, Drawer/Sheet, and Toast feedback and overlay infrastructure.
- Added Studio previews and release-boundary documentation.
- Added accessibility contracts for keyboard interaction, modal focus management, live regions, reduced motion, and forced colors.
- Added PriceGo adoption evidence for applying the system to React Native through a product-local adapter.

### Verified

- TypeScript, Production Core ESLint, Studio ESLint, and the production build.
- 320px layout and 200% effective reflow.
- Tabs keyboard behavior; Dialog focus containment and restoration; Drawer/Sheet and Toast behavior.
- Reduced-motion and forced-colors behavior in Microsoft Edge.

### Known limitations

- Screen-reader listening verification remains an environment-dependent manual condition.
- Repository-wide legacy lint debt remains at 47 errors and 31 warnings; Production Core and Studio are clean.
- Some Studio surfaces are reference patterns or visual mocks, not Production components.
- React Native consumers use a local token and component adapter rather than importing web components.
- 360px/390px native-device and native font-scale evidence remains follow-up verification.

See [`studio/releases/design-system-v1.0.0.md`](studio/releases/design-system-v1.0.0.md) for the complete release evidence and scope boundary.
