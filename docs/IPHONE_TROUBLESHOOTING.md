# Phase 1 iPhone / Expo Go diagnostics

## Confirmed findings

The Phase 1 root `npm start` wrapper did not forward command-line flags to Expo. For example, `npm start -- --go --lan --port 8091` reproduced `expo start 8091`, followed by `Invalid project root`. The wrapper now includes npm's argument separator. `npm run start:iphone` explicitly chooses Expo Go and LAN, and accepts additional flags. The root web wrapper was corrected in the same way. This is a configuration fix; application behavior and design are unchanged.

This issue does **not** establish the cause of a failure after launching directly with `npx expo start --lan` in `apps/mobile`. The reported `exp://172.168.3.164:8081` link is an Expo Go link, and the error's `entry.bundle?platform=ios...` path is the expected native bundle path. The generic error's AppDelegate advice does not mean this managed Expo project needs an AppDelegate edit.

Cloud checks confirmed SDK 57.0.0, Expo 57.0.28, React 19.2.3, and React Native 0.86.3. Installed Expo modules match the SDK's bundled version recommendations. No `expo-dev-client`, custom native module, native iOS directory, or custom runtime-version setting requires a development build. The app's custom `beanprofessor` scheme is for future application links and does not replace the Expo Go `exp://` URL.

No Metro override is needed: Expo's default configuration includes the workspace package directories and both mobile/root node_modules locations. The shared TypeScript domain package resolves, and the actual development iOS launch bundle downloads successfully. JSON and multipart native manifest requests, including an Expo signature-request header, return HTTP 200. These checks validate the cloud development server, not an iPhone or Mac network.

## Test the updated branch on your Mac

1. From the repository root, update your branch and install the locked dependencies:

   ```sh
   git switch phase-1-prototype
   git pull --ff-only origin phase-1-prototype
   npm ci
   node -v
   ```

   Use Node 24 or a supported Node >=22.13. Keep any local work before switching/updating; do not discard it. Run npm installation at the workspace root, not inside `legacy/`.

2. Stop your previous Metro process with Control-C. For a clean LAN test, clear only development-address overrides in this terminal, then start:

   ```sh
   unset REACT_NATIVE_PACKAGER_HOSTNAME EXPO_PACKAGER_PROXY_URL
   npm run start:iphone -- --clear --port 8081
   ```

   Expect the command to show `expo start --go --lan --clear --port 8081` and “Using Expo Go.” Use the **new** QR code. A generated development-client link or an `exp+beanprofessor` URL is not the intended Expo Go launch target. If 8081 is occupied, stop the server you started or choose a free port and use that port consistently.

3. While Metro runs, open a second terminal at the repository root. Check the Wi-Fi interface with `networksetup -listallhardwareports`, then run `ipconfig getifaddr en0` (substitute the device listed for Wi-Fi if it is not en0). Compare the result with the QR address. `172.168.3.164` is outside the usual private 172.16–172.31 range; this alone does not make it invalid, especially since Safari can reach it. Verify it is actually your Mac's Wi-Fi address rather than a VPN/virtual-adapter address.

4. Use the actual Wi-Fi address and Metro port for the native download diagnostic:

   ```sh
   npm run diagnose:ios -- http://YOUR_MAC_WIFI_IP:8081
   ```

   It checks Metro status, the **iOS** manifest, advertised host/port, and downloads the **exact launchAsset URL**, including Hermes/bytecode parameters. PASS proves that this computer can fetch the full response, not that the phone can. A 500 identifies a Metro compilation error; a host mismatch identifies an advertised-address problem; a timeout or incomplete transfer identifies a transport problem. Preserve the output and matching Metro errors.

5. Scan the fresh QR using iPhone Camera and open it in your already verified SDK-57-compatible Expo Go. Watch Metro during that attempt. If the Mac diagnostic passes but Expo Go still fails, try the diagnostic's exact iOS bundle URL in iPhone Safari—not a different platform or shortened bundle URL. Note whether Expo Go triggers a request, whether Metro reports an error, and whether the download completes. If necessary, obtain Expo Go's detailed failure log or macOS Console output for the connected iPhone; do not share tokens or unrelated private logs.

## Remaining possibilities, not confirmed causes

A successful Safari download and failed Expo Go download can differ in app-specific traffic filtering, proxy/VPN/security software, response timeout, or client-side handling. The supplied failure message does not include the HTTP status or native transport error, so it cannot distinguish those cases. Check per-app filtering/firewall logs rather than disabling the firewall globally. If temporarily disconnecting a VPN is permitted on your network, use that as an isolated test, then restore it.

If the QR address is wrong, an explicit `REACT_NATIVE_PACKAGER_HOSTNAME` equal to the verified Wi-Fi IP can test interface selection for LAN only. Do not hard-code the reported address into project files or carry the override into tunnel testing. A tunnel requires its HTTPS endpoint to be reachable by both clients and is not proof of LAN or iOS runtime health. Since both modes were already tried, repeating them without new evidence is unlikely to isolate the failure.

The cloud environment cannot reproduce a physical iPhone's connection or app execution. No claim is made that the iPhone problem is resolved. Phase 2, production databases and original Lovable source are untouched.

## Validation of this correction

Root flag forwarding was reproduced before the change and a corrected root command started Expo Go/LAN on the requested port afterward. The iOS development bundle returned HTTP 200 with approximately 5.77 MB over loopback and a non-loopback network address. Native JSON and multipart manifests passed. TypeScript, lint, the 16 existing domain tests and all 12 browser acceptance checks passed. Expo Doctor passed 19 of 21 checks; the remaining schema/API and React Native Directory checks could not complete because the cloud cannot reach their external services. No claim is made that those online checks passed or that the physical iPhone launch succeeded.
