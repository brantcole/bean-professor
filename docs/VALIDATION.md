# Phase 1 validation

The prototype was validated in the current Linux cloud workspace with Node 24.19.0. The following checks are performed against the new workspace, never the legacy application or production services.

| Check                                                 | Outcome                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Frozen dependency installation (`npm ci`)             | Passed                                                                      |
| Strict TypeScript (`npm run typecheck`)               | Passed                                                                      |
| ESLint (`npm run lint`)                               | Passed                                                                      |
| Domain acceptance/unit tests (`npm test`)             | 16 passed                                                                   |
| Browser acceptance (`npm run test:e2e`)               | 12 passed: six journeys at each of 390px and 320px                          |
| Phone screenshots and horizontal overflow             | Captured for all five screen areas; no horizontal overflow at tested widths |
| Formatting (`npm run format:check`)                   | Passed                                                                      |
| Expo web export                                       | Passed                                                                      |
| Expo iOS and Android exports                          | Passed: JavaScript/Hermes bundles generated                                 |
| Local Expo development startup                        | Started and checked through local requests                                  |
| Legacy preservation                                   | Original ZIPs unchanged; all 128 extracted legacy files match the archive   |
| GitHub Actions                                        | Workflow configured; no remote workflow run claimed                         |
| Physical iPhone/Android, simulators and signed builds | Not run in this Linux environment                                           |

## Environment-specific commands

The runner restricts writes to its normal home cache directories. npm uses an explicit cache under `/workspace`. Expo SDK 57 exposes a shell-only settings-directory override, used here solely for the isolated CLI cache; it is not placed in `.env` and contains no application credentials. A normal local computer does not need this override.

```sh
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run check
npm run format:check
__UNSAFE_EXPO_HOME_DIRECTORY=/workspace/.expo-home EXPO_NO_TELEMETRY=1 CI=1 npm run export:web --workspace @bean-professor/mobile
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
__UNSAFE_EXPO_HOME_DIRECTORY=/workspace/.expo-home EXPO_NO_TELEMETRY=1 CI=1 npm run export:native --workspace @bean-professor/mobile
```

The Playwright browser download was denied by the network policy. Tests instead used the already installed Chromium 154.0.8037.57 with a configurable executable path. No TLS or checksum verification was disabled and no network policy expansion was needed. On an ordinary machine or GitHub runner, use Playwright's own browser installation as documented in the README.

The initial Expo project generator also tried to write to the restricted home directory. The project was instead bootstrapped from the official npm Expo TypeScript template through npm's verified package installation route. Dependencies follow SDK 57's bundled-native-module version recommendations and the workspace lockfile.

Expo development startup was checked using `--offline --port 8081`; SDK 57 rejects combining `--offline` with `--localhost`, so the redundant host flag was removed. Metro status and both native manifests returned the expected application and SDK. The optional latest React Native DevTools download could not write its normal home cache and used the framework's fallback. Native debugger attachment has not been tested. CI mode is useful for a startup smoke check but disables reloads; use normal watch mode for development.

Normal watch mode was subsequently validated on port 8082 using `CI=0` and `XDG_CACHE_HOME=/workspace/.cache`. Both SDK 57 manifests passed again. The optional Electron-based native DevTools shell cannot launch with this host's sandbox-helper permissions. Metro and the prototype remain available; no sandbox permissions or helper modes were changed. Native debugging must be checked on a suitable local development machine.

## Functional evidence and corrections

The browser suite checks the default Coffee School route and sample lesson, tab/settings navigation, custom equipment and duplicate rejection, captured-plan inputs after form editing, saved timer markers, note editing, journal search/filter/favorites/empty state, and roast observation saving. It checks that the primary navigation/lesson journey makes no external application requests.

Initial browser checks exposed inactive tab content in the accessibility tree. Screens now use Expo Router focus state to hide inactive content visually and from accessibility APIs while retaining the mock state. A regression assertion verifies the inactive Brew Lab heading is absent from accessible journal navigation. Repeated browser checks passed after the correction.

Timer tests verify timestamp-derived elapsed time across delayed ticks, exact pause/resume behavior, and marker snapshots. They do not establish native background/process-recovery readiness. Full accessibility acceptance still needs VoiceOver/TalkBack, large text, real keyboard layouts, safe-area behavior and physical-device testing. Screenshot artifacts are evidence of the rendered web prototype, not native-device captures or a complete visual-regression baseline.

Legacy file hashes include the ignored original `.env`, but its values are never printed, shipped with the new mobile app, or accessed by the prototype. No Supabase, Lovable, research connector or AI provider requests were made.
