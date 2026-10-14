# The Bean Professor 2.0

An iOS and Android prototype built with React Native, Expo SDK 57, Expo Router, and strict TypeScript. Phase 1 uses local mock content only: no database, account, research, or AI service is connected.

## Try the prototype

Use Node.js 22.13 or newer (Node 24 is recommended) and npm. From this repository's root:

```sh
npm ci
cd apps/mobile
npx expo start --lan
```

Install a version of **Expo Go compatible with SDK 57** on your iPhone or Android phone. Connect the phone and computer to the same Wi-Fi. Scan the terminal QR code using the iPhone Camera or Expo Go on Android. No Expo account or API keys are required for the mock application.

This cloud workspace is not your phone's local network. To preview on your phone, download the Phase 1 source package or copy this updated checkout to your computer and run the commands there. The Phase 1 source is on the `phase-1-prototype` branch. On your Mac, clone with `git clone --branch phase-1-prototype https://github.com/brantcole/bean-professor.git`, then run the commands above from that checkout.

The downloadable preview package contains the new workspace and migration documentation. It omits the original legacy application and archives, which remain unchanged in the repository, and contains no `.env` values or installed dependencies.

If the QR code cannot connect, check the computer's firewall, disable an isolating guest Wi-Fi network, and confirm both devices are on the same network. If your Expo Go installation reports an SDK mismatch, use the matching Expo Go version where available. iOS App Store Expo Go may support only its current SDK; a development build is the later fallback, requiring the appropriate native tooling/signing. No development build or signing account was provisioned in Phase 1. Optional tunneling is not configured or tested here.

For a browser preview, run `npm run web` from the root. Expo prints its local address. On macOS with Xcode installed, start Expo and press `i` for an iOS simulator; with Android Studio and an emulator available, press `a`. Physical-device and simulator validation remain to be performed.

## What you can do

- **Coffee School:** ask a question or choose a starter, read a sample lesson, and jump to an experiment. Responses are local templates, clearly labeled as samples without verified citations.
- **Brew Lab:** choose starter/custom equipment, edit coffee details, produce a sample plan, run a timer, add markers, and save notes to the journal. The saved plan retains the inputs used when it was created.
- **Lab Journal:** search by beans, gear, origin, or notes; filter brews/roasts/favorites; open captured plans and markers; edit session notes.
- **Roast Lab:** record green coffee and goals, make an observation plan, mark first crack/cooling, and save the session. No machine settings, power changes, or temperature instructions are supplied.
- **Settings:** add brewing/roasting equipment and mark favorites. Favorites move to the front of equipment choices.

**Demo saves, equipment, and timers last only while the application remains running.** Reloading or closing resets everything to the sample data. A typed journal storage interface prepares for durable offline storage in a later phase; persistence and synchronization are not implemented yet. Photo scanning, authentication, live AI, citations, exports, and production migration are also outside Phase 1.

## Structure

```text
apps/mobile/       Native screens, reusable controls, mock data and state
packages/domain/   Shared session/equipment/guide types, storage port, timer and search logic
services/api/      Versioned API contract scaffold; no running backend
tests/             Domain tests and phone-width browser acceptance checks
docs/              Architecture, validation and phase report
specs/             Original migration package, prompts, assets and Phase 0 assessment
legacy/            Unchanged original Lovable source, for reference only
```

The two original ZIP archives are preserved unchanged. `legacy/.env` is ignored and never consumed by the new workspace. Legacy source is excluded from new lint/typecheck/format/test commands. Its original dependencies are not part of npm workspaces.

## Quality checks

```sh
npm run check
npm run format:check
npm run export:web --workspace @bean-professor/mobile
npx playwright install chromium
npm run test:e2e
npm run export:native --workspace @bean-professor/mobile
```

`check` runs strict TypeScript, lint, and domain unit tests. Browser acceptance tests exercise navigation, sample lessons, session snapshots, notes/markers, equipment management, journal filters, and the observation-only roast flow at 390px and 320px widths. They also capture screenshots and check horizontal overflow. Browser checks do not replace native device/accessibility testing. Native export validates iOS/Android JavaScript and Hermes bundle generation; it does not produce signed applications.

Cloud runners can use an installed Chromium with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` if browser downloads are restricted. See [validation notes](docs/VALIDATION.md) for the exact current-instance results and environment-specific cache settings.

Phase 1 is the approved scope. See [the phase report](docs/PHASE_1_REPORT.md) and [Phase 2 prompt](specs/PROMPTS/02_AUTH_AND_DATA.md). Do not begin Phase 2 without owner approval.
