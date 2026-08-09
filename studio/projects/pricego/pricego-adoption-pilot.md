# PriceGo Design System Adoption Pilot

Status: Analysis complete · Stage 15 implementation preparation

This document records a read-only analysis of `C:\dev\pricego`. No PriceGo source, route, storage key, navigation order, calculation logic, OCR behavior, or AI behavior is changed in this stage.

## 1. Current Project Inventory

### Project structure

- `src/app/_layout.tsx`, `src/app/index.tsx`: Expo Router entry and root layout.
- `src/screens/PriceGoAppPremium.tsx`: primary app shell and screen-level state transitions.
- `src/components`: reusable UI and feature surfaces.
- `src/components/ui`: `Button`, `Card`, `CurrencyBadge`, `ScreenHeader`, `SettingRow`, `StatusChip`, `ToggleSwitch`.
- `src/services`: exchange rates, OCR, speech recognition, AI assist, settings, storage, and price parsing.
- `src/constants/design.ts`: current colors, spacing, radius, typography, shadows, and sizes.
- `docs/voice/VOICE_ENGINE_V2_PLAN.md`: existing voice-engine planning document.

### Screen and flow inventory

| Area | Observed implementation | Primary risk to protect |
| --- | --- | --- |
| Home | `PriceGoAppPremium.tsx` home state | Existing navigation and result entry points |
| Scan | `ScanScreen.tsx`, camera/gallery picker, OCR service | Camera/gallery permission and OCR result flow |
| Direct input | `PriceGoAppPremium.tsx`, number pad and currency selection | Amount parsing and currency conversion |
| Settings | `PriceGoAppPremium.tsx`, `SettingRow`, `ToggleSwitch`, settings service | AsyncStorage keys and setting persistence |
| Result | `KRWResultCard`, `LocalCurrencyCard`, `ExchangeRateCard` | Currency calculation and displayed amounts |
| Voice | `AudioWavePremium`, `MicButtonPremium`, speech service | Voice parser and diagnostics behavior |
| Common navigation | `BottomNavigationPremium`, `ScreenHeader` | Tab order, scan entry, safe-area layout |
| Error/offline | `OfflineBannerPremium`, service fallbacks | Offline and fallback messaging |

### Existing design assets

`src/constants/design.ts` currently centralizes the PriceGo visual system:

- Colors: `#F8FAFC` page background, `#FFFFFF` surface, `#1769FF` primary, `#0F172A` primary dark, slate text colors, green success, amber warning.
- Spacing: `4, 8, 12, 16, 20, 24, 32`.
- Radius: `8, 12, 16, 20, 999`.
- Typography: title 26, heading 22, body 18, body medium 15, amount 32, KRW amount 52.
- Sizes: button 52, small button 40, icon button 44, tab bar 72, header 52.
- Shadows: small, medium, and large React Native shadow objects.

## 2. Protected Functionality

The following remain unchanged during the pilot and must be regression-tested before Stage 15 implementation:

- Voice amount recognition and parser behavior.
- Currency selection and exchange-rate calculation.
- OCR image selection, OCR parsing, and OCR result display.
- Camera and gallery permission flows.
- Exchange-rate cache and fallback behavior.
- AsyncStorage keys and settings persistence.
- Existing bottom navigation order: Home, Scan, Direct Input, Settings.
- Existing screen routes and Expo Router entry behavior.
- Existing logs and diagnostics.

## 3. NexDataForge Mapping

| PriceGo area | Design System mapping | Pilot disposition |
| --- | --- | --- |
| Primary buttons and number-pad actions | Action Board / Button | Adapt |
| Cards and currency result surfaces | Display Board / Card | Adapt |
| OCR, voice, offline, and parser feedback | Feedback Board / Alert / Error State | Adapt |
| Settings rows and toggles | Form / Navigation patterns | Adapt |
| Bottom navigation and safe area | Navigation Board / Mobile Template | Keep + Adapt |
| Direct input flow | Form Pattern / Workflow Pattern | Adapt |
| OCR result trust and confidence | AI Trust Pattern / Quality checklist | Adapt |
| Voice processing status | AI Status Pattern | Adapt |
| Price result emphasis | Foundation typography and semantic status tokens | Adapt |
| PriceGo-only parser or native permission behavior | No direct web equivalent | Keep |

Disposition meanings: `Reuse` means close application of the system; `Adapt` means preserve PriceGo constraints while translating the rule to React Native; `Keep` means existing implementation is already appropriate; `Create Later` means a missing shared rule; `Not Applicable` means no current PriceGo need.

## 4. PriceGo-Specific Constraints

- Large readable price output is more important than dashboard density.
- Touch targets should preserve or exceed the current 44px icon and 52px primary-button sizes.
- Bottom navigation must remain simple and labels must stay visible.
- One primary task per screen is preferred over dense multi-panel layouts.
- Currency and amount errors need cause plus recovery action.
- OCR and voice results need explicit confidence, source, or limitation language when uncertain.
- Safe area and keyboard behavior must be verified on the actual mobile flow.
- Existing route order, AsyncStorage keys, parser behavior, and calculation behavior are protected.

## 5. Candidate Screen Evaluation

| Priority | Candidate | Reason | Stage 15 scope |
| --- | --- | --- | --- |
| 1 | Settings / About and version | Simple screen, high reuse, low calculation risk | First implementation candidate |
| 2 | Settings main screen | Exercises rows, toggles, divider, navigation, touch targets | Second candidate |
| 3 | Direct input | Validates form, number pad, currency, validation, keyboard | Third candidate |
| 4 | OCR result | Validates result hierarchy, confidence, feedback, recovery | Fourth candidate |
| 5 | Scan / voice screen | Highest permission, async, parser, and service coupling | Later pilot |

The order is a recommendation based on risk and reuse, not a completed product decision. Stage 15 may change it after a deeper screen-level review.

## 6. Recommended Adoption Method

React Native / Expo should use a PriceGo-local theme adapter rather than copying web CSS variables directly:

```ts
export const priceGoTheme = {
  color: {
    backgroundPage: '#F8FAFC',
    backgroundSurface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    actionPrimary: '#1769FF',
    statusSuccess: '#10B981',
    statusWarning: '#F59E0B',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 999 },
  size: { button: 52, iconButton: 44, tabBar: 72, header: 52 },
} as const;
```

This is a mapping example only. Stage 14 does not create this file, change `design.ts`, or modify component imports. Stage 15 should decide whether the existing `src/constants/design.ts` can become the adapter source.

## 7. Stage 15 Planned Files

### First candidate: About / Version

- Existing screen file: `C:\dev\pricego\src\screens\PriceGoAppPremium.tsx`
- Existing shared components to reuse: `ScreenHeader`, `SettingRow`, `Card`, `BottomNavigationPremium`
- Candidate additions: none until the screen boundary and route behavior are confirmed.
- Protected behavior: version text, back navigation, bottom navigation, and existing app metadata.

### Second candidate: Settings main

- Existing screen file: `C:\dev\pricego\src\screens\PriceGoAppPremium.tsx`
- Existing shared components: `SettingRow`, `ToggleSwitch`, `ScreenHeader`
- Candidate token work: spacing, row height, text hierarchy, border, focus/pressed state.
- Protected behavior: country selection, haptic toggle, currency setting, storage keys, and navigation.

### Third candidate: Direct input

- Existing screen file: `C:\dev\pricego\src\screens\PriceGoAppPremium.tsx`
- Existing shared components: `NumberPadPremium`, `Button`, `CurrencyBadge`, result cards.
- Candidate pattern mapping: Form Pattern, Workflow Pattern, Feedback Pattern.
- Protected behavior: price parsing, currency conversion, validation, and result calculation.

## 8. Verification Plan

For each Stage 15 screen:

1. Run the existing PriceGo TypeScript/lint checks when available.
2. Run existing parser tests and retain the current voice regression cases.
3. Verify Home → Scan → Direct Input → Settings navigation.
4. Verify back navigation and safe-area layout.
5. Verify keyboard and vertical scrolling at 320px-equivalent mobile widths.
6. Verify camera/gallery permission fallback without changing service behavior.
7. Verify OCR, voice, currency, and offline error recovery paths.
8. Verify touch targets, labels, focus/readability, and status text.
9. Run `git diff --check` and inspect the changed-file list.
10. Roll back if protected behavior, routes, storage keys, calculation output, or accessibility quality regresses.

Automatic `Verified` status must not be claimed unless the corresponding check was actually run. Unknown behavior remains `Needs Review`.

## 9. Rollback Plan

Stop and restore the previous screen implementation if any of the following occurs:

- Existing calculation or parser output changes.
- Camera, gallery, voice, OCR, or permission flow breaks.
- AsyncStorage setting keys change or persistence regresses.
- Bottom navigation order or route behavior changes.
- Mobile scroll, safe area, keyboard, or touch target behavior regresses.
- TypeScript, lint, or build quality worsens.

## 10. Follow-up Roadmap

1. About / version screen.
2. Settings rows and shared setting controls.
3. Direct amount input.
4. Currency and voice result feedback.
5. Scan / OCR trust and recovery.
6. Full PriceGo responsive and accessibility review.

No full-app replacement, npm package, React Native UI library, Expo SDK change, or service-logic rewrite is part of this pilot.

## 11. Stage 15 Implementation Result

Status: About / Version pilot implemented

### Changed PriceGo files

- `src/constants/design.ts`: added `PRICE_GO_THEME`, a minimal semantic adapter backed by existing constants.
- `src/components/AboutVersionScreen.tsx`: added the isolated About / Version screen.
- `src/screens/PriceGoAppPremium.tsx`: replaced the inline About implementation with the isolated screen while preserving the existing `about` state and return to `settings`.
- `src/components/ui/ScreenHeader.tsx`: added an accessible role, label, and 48px effective touch target to the existing back action.

### Applied behavior

- Preserved `PriceGo v1.0` as the service label.
- Reads the installed Expo version through `Constants.expoConfig?.version`, with `1.0.0` only as a defensive fallback.
- Displays a decorative `PG` brand mark, NexDataForge developer attribution, product description, and copyright.
- Uses safe-area layout and vertically scrollable content with a 640px maximum content width.
- Supports text wrapping and font scaling without fixed text heights or forced line truncation.
- Uses only existing PriceGo colors, spacing, typography, radius, and shadow values through semantic aliases.

### Protected areas confirmed unchanged by implementation scope

- Voice recognition, parser, OCR, AI assist, exchange-rate service, cache/fallback, and AsyncStorage services.
- Bottom navigation component and tab order.
- `app.json`, EAS configuration, dependencies, and package lock.
- Settings rows, values, toggles, storage behavior, and screen layout outside the existing About entry link.

### Rollback boundary

The pilot can be rolled back by restoring the inline `AboutScreenPremium`, removing `AboutVersionScreen.tsx`, removing `PRICE_GO_THEME`, and reverting the accessibility-only `ScreenHeader` attributes. No service data migration or storage rollback is required.

### Next pilot recommendation

Proceed with the Settings main screen only after device review confirms About screen scrolling, font scaling, back navigation, and 320px-equivalent width behavior.

### Verification result

- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed for the PriceGo implementation changes.
- `npx.cmd expo-doctor`: 19 of 20 checks passed. The remaining check reports eight pre-existing Expo package patch-version mismatches; Stage 15 did not change dependency manifests or lockfiles.
- `npm.cmd run lint`: not established as a clean gate. The existing `expo lint` script found no project ESLint configuration and attempted to install ESLint automatically; the generated config and manifest changes were removed to preserve the no-dependency-change constraint.
- Device/runtime review: still required for 320px-equivalent width, large font scaling, scrolling, safe area, and Settings back navigation.

## 12. Stage 16 Settings Main Pilot Result

Status: Settings main UI pilot implemented

### Implementation scope

- Reorganized the existing Settings content into `일반 설정`, `사용 편의`, and `앱 정보` sections.
- Updated the existing `SettingRow` with a 64px minimum height, responsive text/value sizing, pressed state, semantic button role, and decorative icon/chevron handling.
- Updated the existing `ToggleSwitch` with a switch role, checked state, accessible label, and expanded effective touch area.
- Added `SettingsSection` as a presentation-only surface and section-label component.
- Added only `settingRowMinHeight` to `PRICE_GO_THEME`; all colors, spacing, typography, radius, border, and shadow values continue to reference existing PriceGo tokens.

### Changed PriceGo files

- `src/screens/PriceGoAppPremium.tsx`
- `src/components/ui/SettingRow.tsx`
- `src/components/ui/ToggleSwitch.tsx`
- `src/constants/design.ts`

### Added PriceGo file

- `src/components/ui/SettingsSection.tsx`

### Protected behavior

- Existing `onCountryPress`, `onRatePress`, `onVoiceDiagnostics`, `onToggle`, and `onAboutPress` handlers remain owned and implemented by `PriceGoApp`.
- `AppSettingsService`, AsyncStorage keys, country selection, exchange-rate navigation, vibration storage, large-result-text storage, and About navigation were not moved or rewritten.
- The existing `음성 진단 보기` row remains visible because Stage 16 prohibits removing existing settings and protects existing diagnostic logs.
- Voice, parser, OCR, AI assist, exchange-rate calculation/cache/fallback, Bottom Navigation, Expo configuration, and dependency manifests have no Stage 16 content changes.

### Responsive and accessibility behavior

- Settings content remains vertical-only scrolling with bottom padding above Bottom Navigation.
- The content width is constrained to 640px and uses flexible text/value columns with no forced single-line truncation.
- Rows can grow beyond 64px under font scaling; values shrink or wrap without horizontal scrolling.
- Interactive rows expose natural Korean labels and a button role. Toggle controls expose a switch role and actual checked state.

### Verification result

- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed.
- `npx.cmd expo-doctor`: baseline retained at 19 of 20 checks. The same eight pre-existing Expo patch-version mismatches remain.
- Metro: existing server confirmed listening at `http://localhost:8082`.
- Manual/device regression: not completed. Country/rate/About navigation, toggle persistence after restart, 320px-equivalent width, large system font, and physical safe-area behavior remain device-review items.

### Known issues and rollback

- The repository still has no established non-mutating ESLint gate, and Stage 16 did not run `expo lint` or create ESLint configuration.
- Expo package patch mismatches remain outside this pilot.
- Rollback is limited to restoring the previous Settings JSX and the two existing UI components, removing `SettingsSection.tsx`, and removing `settingRowMinHeight`. No storage or service migration is required.

### Next pilot recommendation

After device verification of Settings, use Direct Input as the next pilot while preserving parser, exchange-rate calculation, and keyboard behavior.

## 13. Stage 17 Direct Input Pilot Result

Status: Direct Input UI pilot implemented

### Existing flow confirmed

- `PriceGoApp` owns `manualInput` and `displayAmount` state.
- `handleManualInputChange`, `handleManualBackspace`, and `resetManualInput` remain unchanged.
- KRW conversion remains automatic through the existing `useMemo` call to `exchangeRateService.calculateKrw`; no Convert action or new validation condition was introduced.
- Country changes still use `handleManualCountrySelect`, which preserves the existing country update and input reset behavior.

### Changed PriceGo files

- `src/screens/PriceGoAppPremium.tsx`: reorganized only the Direct Input presentation and associated styles.
- `src/components/NumberPadPremium.tsx`: added button roles and natural Korean labels without changing key values or callbacks.

No new PriceGo file or Theme token was required. The existing `PRICE_GO_THEME` supplies page width, surface, text, border, spacing, radius, and shadow values.

### Direct Input structure

- Added a context surface for the current country, flag, currency, and existing country selector.
- Added a labeled amount section with the existing formatted display value and currency label.
- Preserved the existing `KRWResultCard` and its amount formatting; the result wrapper now provides a polite accessibility update and a natural result label.
- Preserved the existing number pad and Reset action. Reset remains available under the same condition and calls the same handler.
- No Primary Convert action was added because the existing implementation calculates automatically.

### Responsive, keyboard, and accessibility behavior

- Reused the existing `KeyboardAvoidingView`, vertical `ScrollView`, `keyboardShouldPersistTaps`, compact-height mode, Safe Area, and Bottom Navigation structure.
- Constrained content to the existing 640px theme width and allowed vertical growth with mobile padding.
- The amount display uses width-aware font fitting for long values; labels and context text remain wrap-capable.
- Number keys and backspace expose button roles and explicit labels. Decorative key text is excluded from duplicate reading.
- The amount and result regions expose current currency/value context without changing calculation data.

### Protected behavior

- No changes were made to services, parser, exchange-rate calculation, rounding, formatting service, cache/fallback, settings storage, OCR, AI assist, voice, Bottom Navigation, Expo configuration, or dependency content.
- The calculation expression, input filtering, leading-zero handling, backspace behavior, and number formatting remain source-identical.
- Existing empty-result behavior is retained; the visual amount placeholder is presentation-only and does not mutate input state.

### Verification result

- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed.
- `npx.cmd expo-doctor`: baseline retained at 19 of 20 checks with the same eight Expo patch-version mismatches.
- Metro: existing server confirmed listening at `http://localhost:8082`.
- Calculation regression: source-level identity confirmed for handlers and calculation expression. Runtime before/after value comparison was not performed.
- Manual/device regression: not completed. Numeric entry, reset, country propagation, navigation, 320px-equivalent width, large system font, and physical keyboard/safe-area behavior remain review items.

### Known issues and rollback

- The non-mutating ESLint gate remains unavailable and `expo lint` was not run.
- Expo patch-version mismatches remain outside this pilot.
- Rollback is limited to the Direct Input JSX/styles and NumberPad accessibility attributes. No data or service migration is required.

### Next pilot recommendation

After device verification of Direct Input, use Currency and Voice Result Feedback as the next pilot without changing recognition, parser, or exchange-rate behavior.

## 14. Stage 18 Currency and Voice Result Feedback Pilot Result

Status: Voice result feedback UI pilot implemented

### Existing state model confirmed

- Idle is the existing Home screen, Listening is the existing `listening` screen, Success is the existing `result` screen, and amount review is the existing `recognition-check` screen.
- The project has no separate Processing screen or persisted Error state. Stage 18 did not add synthetic business states.
- Existing errors continue through `showRetryAlert` and the existing `startListening` retry callback.

### Changed PriceGo files

- `src/screens/PriceGoAppPremium.tsx`: updated only Home voice guidance, Listening presentation, Success feedback, amount-review feedback, and related styles.
- `src/components/MicButtonPremium.tsx`: added role, state-aware label/hint, busy state, and decorative-icon exclusion without changing size or callback behavior.

No new PriceGo component or Theme token was added. Existing `PRICE_GO_THEME` values supply responsive width, surfaces, borders, spacing, radius, typography, and text colors.

### Feedback structure

- Idle retains the existing microphone action and examples with a clearer heading.
- Listening now provides a live status panel, current country/currency context, and vertically scrollable content while preserving the microphone, audio wave, Stop action, and cancel handler.
- Success adds a feedback surface for the exact recognized text, existing parsed amount, and existing detected currency.
- The existing `LocalCurrencyCard`, `KRWResultCard`, exchange-rate text, update timestamp, replay, edit, and show-to-other-person actions remain connected to the same values and handlers.
- The existing large-VND amount-review screen now exposes a warning status, exact recognized text, and review guidance. Candidate generation and confirmation callbacks are unchanged.
- Existing Alert-based permission, no-speech, parse, currency, and recognition errors remain unchanged; no duplicate retry handler or error criterion was introduced.

### Responsive and accessibility behavior

- Voice and result content is constrained to the existing 640px theme width and remains vertically scrollable.
- Recognition metadata wraps, and secondary result actions stack vertically to avoid 320px and large-font collisions.
- The existing responsive 150-180px microphone sizing remains unchanged and fits a 320px viewport by source constraints.
- Microphone controls expose state-aware Korean labels and hints. Listening, success, KRW result, and review status use focused live-region announcements.
- Decorative microphone and status visuals do not replace textual state descriptions.

### Protected behavior

- `startListening`, speech permission/start/cancel/result flow, `parseDetailed`, confidence threshold, candidate ordering, currency selection, amount-review threshold, KRW calculation, Cache/Fallback, and `VOICE_01` through `VOICE_07` logging were not changed.
- No service, parser, OCR, AI assist, AsyncStorage, Bottom Navigation, Expo configuration, or dependency content was changed.
- Given the same `RecognitionState` and exchange-rate snapshot, local and KRW result values use the same expressions and formatters as before Stage 18.

### Verification result

- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed.
- `npx.cmd expo-doctor`: baseline retained at 19 of 20 checks with the same eight Expo patch-version mismatches.
- Metro: existing server confirmed listening at `http://localhost:8082`.
- Voice and result regression: source-level identity confirmed for handlers, parsing, thresholds, logs, and calculations. Runtime voice examples and errors were not exercised.
- Manual/device review: not completed for microphone permission, Listening/Stop, retry Alerts, result navigation, 320px-equivalent width, large system font, and physical safe area.

### Known issues and rollback

- Processing feedback cannot be represented without adding a state not present in the current flow; it remains intentionally unimplemented.
- Errors remain native Alerts because no screen-level error state is available without changing behavior.
- The non-mutating ESLint gate remains unavailable, and Expo patch mismatches remain outside this pilot.
- Rollback is limited to the voice/result JSX and styles plus `MicButtonPremium` accessibility attributes. No service or data rollback is required.

### Next pilot recommendation

After device voice regression, use Scan and OCR Trust/Recovery as the next pilot while keeping OCR extraction, permissions, currency conversion, and fallback behavior unchanged.

## 15. Stage 19 Scan and OCR Trust/Recovery Pilot Result

Status: Scan and OCR feedback UI pilot implemented

### Existing flow confirmed

- `ScanScreen` owns only the existing `loading` and `result` state.
- The existing `pick` handler still launches camera or gallery with the same options, passes the same image URI and country code to `recognizePriceFromImage`, clears the result before analysis, and uses the same failure Alert.
- Image selection immediately starts OCR; no Analyze action or image-preview state was added.
- The OCR result already provides `rawText`, `items`, and the service-defined `confidence: 'high' | 'low'` value.

### Changed PriceGo file

- `src/components/ScanScreen.tsx`: replaced only presentation JSX/styles and consumed the previously unused `onBack` prop in the header.

No new PriceGo file or Theme token was added. Existing `PRICE_GO_THEME` values supply page width, surfaces, borders, spacing, radius, typography, status colors through existing components, and shadows.

### Scan and OCR feedback structure

- Idle provides a clear camera-first action, gallery secondary action, and a short capture tip.
- Analyzing reuses the existing loading state and spinner with a live textual status. No progress percentage or synthetic processing stages were added.
- Success displays the exact OCR `rawText`, every existing OCR item, translated menu name when supplied, detected currency, and the existing KRW conversion result.
- Low-confidence review uses only the service-provided `confidence === 'low'` state and explains that the selected travel-country currency fallback was used. No confidence threshold was added or changed.
- Recovery actions reuse the same camera/gallery handler and the existing `onNavigate('input')` path for Direct Input.
- Existing failures remain in the same Alert path. Permission and OCR errors were not converted into new business states because `ScanScreen` does not receive structured error data.
- No image preview was added because the existing component does not retain an image URI after passing it to OCR.

### Responsive and accessibility behavior

- Content is constrained to the existing 640px theme width and remains vertically scrollable above Bottom Navigation.
- Capture and recovery actions stack vertically; raw OCR text wraps; large local/KRW amounts use bounded font fitting.
- Camera, gallery, loading, result, review, and direct-input recovery states all retain explicit text labels.
- Loading, OCR status, and KRW result use focused live-region announcements.
- The scan header now uses the existing `onBack` handler already supplied by `PriceGoApp`.

### Protected behavior

- ImagePicker options, cancellation behavior, URI handling, OCR service invocation, result assignment, failure Alert, OCR extraction, AI assist, currency inference, confidence generation, logging, and KRW calculation services were not changed.
- No service, parser, voice, AsyncStorage, Bottom Navigation, Expo configuration, or dependency content was changed.
- Given the same `OcrAmountResult`, each item still uses `exchangeRateService.calculateKrw(item.amount, item.currency)` followed by `formatKrw`.

### Regression findings

- Scan first click: code path is connected. Bottom Navigation calls `setScreen('scan')` on the first `scan` tab event and `ScanScreen` marks `activeTab="scan"`; runtime confirmation was not performed.
- OCR to KRW: code path is connected for every result item; physical OCR and live/cached rate execution remain unverified.

### Verification result

- `npx.cmd tsc --noEmit`: passed after adding the existing `onBack` prop to destructuring.
- `git diff --check`: passed.
- `npx.cmd expo-doctor`: baseline retained at 19 of 20 checks with the same eight Expo patch-version mismatches.
- Metro: existing server confirmed listening at `http://localhost:8082`.
- Manual/device OCR regression: not completed for permissions, camera/gallery launch, cancellation, image transfer, OCR output, low-confidence fallback, errors, first-click navigation, 320px-equivalent width, or large system font.

### Known issues and rollback

- Structured Permission/OCR/Calculation error panels are unavailable without changing the current Alert-only error contract.
- Image-selected preview is unavailable without introducing new URI state.
- The non-mutating ESLint gate remains unavailable, and Expo patch mismatches remain outside this pilot.
- Rollback is limited to restoring the previous `ScanScreen` JSX/styles/imports. OCR and storage data require no rollback.

### Next pilot recommendation

After physical camera/gallery regression, perform the full PriceGo responsive and accessibility quality review across the adopted screens.

## 16. Stage 20 Pilot Integration Audit and Quality Gate

Release decision: **Ready for Device Validation**

### Audit scope and changed files

The integrated Stage 15-19 PriceGo change set contains:

- `src/components/AboutVersionScreen.tsx`
- `src/components/MicButtonPremium.tsx`
- `src/components/NumberPadPremium.tsx`
- `src/components/ScanScreen.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/ScreenHeader.tsx`
- `src/components/ui/SettingRow.tsx`
- `src/components/ui/SettingsSection.tsx`
- `src/components/ui/ToggleSwitch.tsx`
- `src/constants/design.ts`
- `src/screens/PriceGoAppPremium.tsx`

Stage 20 made only these integration fixes:

- Changed shared Button sizing from fixed height to minimum height, added wrapping/padding, button role, disabled state, and decorative-icon exclusion.
- Changed ScreenHeader from fixed height to minimum height, allowed title shrink/growth, and exposed only actionable right icons as labeled buttons.
- Replaced the Settings literal 640px width with `PRICE_GO_THEME.size.contentMaxWidth`.
- Allowed result metadata columns to wrap on narrow or large-font layouts.
- Removed per-item OCR KRW live regions while retaining result context, preventing repeated announcements.

No new component, screen, state, handler, Theme token, package, or configuration was added in Stage 20.

### Integrated screen review

- About / Version: header, Settings return, Expo version `1.0.1`, NexDataForge attribution, Safe Area, scroll, wrapping, and semantic theme usage are connected.
- Settings: all existing country, rate, voice diagnostics, vibration, large-result-text, and About entries remain connected. Rows grow with content, values shrink/wrap, and content scrolls above Bottom Navigation.
- Direct Input: parent-owned input state, automatic conversion, country reset, number pad, backspace, reset, KeyboardAvoidingView, and result formatting remain unchanged. Amount fitting and vertical scroll cover the code-level narrow layout.
- Voice: Idle, Listening, Success, and existing large-VND review states use existing data and handlers. The project still has no separate Processing or screen-level Error state.
- Scan/OCR: camera/gallery handler, automatic OCR, service confidence, all result items, KRW conversion, and recovery navigation remain connected. Permission/OCR failures remain Alerts and no image-preview state exists.

### Theme, typography, spacing, and surface review

- Pilot surfaces consistently reuse `PRICE_GO_THEME` aliases backed by existing PriceGo constants.
- Required pilot content uses the shared 640px maximum width token after the Stage 20 Settings correction.
- Heading, body, caption, local amount, and KRW result hierarchy remains based on existing PriceGo typography.
- Cards use existing radius, border, surface, and shadow values; no nested decorative card structure was introduced.
- Shared buttons and headers can now grow under font scaling instead of clipping at fixed heights.

### Responsive, Safe Area, scroll, and accessibility review

- Code-level 320px review found no horizontal ScrollView. Settings values use shrink constraints, result metadata wraps, secondary voice actions and OCR recovery actions stack, and large amounts use bounded fitting.
- About, Settings, Direct Input, Voice results, Listening, and Scan results retain vertical scrolling where content can grow.
- All pilot screens use the existing top Safe Area and keep Bottom Navigation outside the content ScrollView.
- Back, microphone, number pad, Setting rows, toggles, and shared buttons expose semantic roles/state. Decorative brand, chevrons, microphone, keypad, and button icons avoid duplicate reading.
- Live regions are limited to meaningful status/result changes; repeated per-item OCR KRW announcements were removed.
- Physical 320px, system font scaling, screen-reader reading order, keyboard, and device Safe Area remain unverified.

### Navigation, handlers, and known regression checks

- Settings country/rate/diagnostics/About, About return, all four bottom tabs, Scan to Direct Input, voice retry, OCR recovery, and Direct Input country/reset paths are connected to existing handlers.
- Scan first click is source-connected: the first Scan tab event sets active tab and `screen` to `scan`, and ScanScreen renders with `activeTab="scan"`. Runtime verification is still required.
- The reported initial `300,000` value was not found in current state initialization or storage restoration. `manualInput` and `displayAmount` initialize to empty strings, and AppSettings storage does not contain amount state. Runtime restart verification is still required.
- OCR item amount and currency are source-connected to `calculateKrw` and `formatKrw` for every result item. A physical 2,000 VND capture remains unverified.

### Protected files and quality commands

- Git diff contains no content changes under `src/services`, `BottomNavigationPremium.tsx`, `app.json`, `eas.json`, `package.json`, or `package-lock.json`.
- `package.json` and `package-lock.json` may appear modified in status because of index/worktree metadata, but their content hashes match the corresponding HEAD blobs.
- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed for PriceGo and NexDataForge.
- Metro: port 8082 is listening. A direct HTTP root request did not return successfully, and no rendered preview was inspected.
- Manual integration/device tests: not performed.

### Expo Doctor and ESLint known issues

- Expo Doctor remains 19/20. Required/found versions are: `@expo/ui` ~57.0.9/57.0.8, `expo` ~57.0.11/57.0.9, `expo-constants` ~57.0.9/57.0.8, `expo-image` ~57.0.2/57.0.1, `expo-image-picker` ~57.0.8/57.0.7, `expo-linking` ~57.0.5/57.0.4, `expo-router` ~57.0.11/57.0.9, and `expo-symbols` ~57.0.2/57.0.1.
- These patch mismatches can affect SDK compatibility and should be handled in a separate Package Alignment stage before APK readiness; Stage 20 did not update packages.
- No `eslint.config.*` or `.eslintrc.*` is present. The `lint` script is `expo lint`, which previously attempted automatic setup. Status: **Lint Gate Unavailable; Lint Setup Required Later**.

### Quality Gate

- Gate A - Code Safety: **Pass**.
- Gate B - UI Consistency: **Pass** for the pilot scope.
- Gate C - Responsive: **Pass by code review; Needs Device Review**.
- Gate D - Accessibility: **Pass by code review; Needs Screen Reader Review**.
- Gate E - Functional Regression: **Pass by source review; Needs Runtime Review**.
- Gate F - Runtime: **Needs Review**.

### Remaining blockers and next stage

- Device/emulator validation is required for startup, navigation, 320px width, large font, keyboard, settings persistence, voice, permissions, camera/gallery, OCR, and live/cached exchange rates.
- Package alignment and a non-mutating lint setup remain separate release-readiness work.
- The next recommended stage is **Stage 20.1 - Device Validation Checklist**, followed by Package Alignment and APK Build Readiness only after runtime evidence is recorded.
