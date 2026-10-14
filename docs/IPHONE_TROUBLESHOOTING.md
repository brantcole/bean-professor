# Phase 1 iPhone / Expo Go diagnostics

## Confirmed findings

The Phase 1 root `npm start` wrapper did not forward command-line flags to Expo. For example, `npm start -- --go --lan --port 8091` reproduced `expo start 8091`, followed by `Invalid project root`. The wrapper now includes npm's argument separator. `npm run start:iphone` explicitly chooses Expo Go and LAN, and accepts additional flags. The root web wrapper was corrected in the same way. This is a configuration fix; application behavior and design are unchanged.

This issue does **not** establish the cause of a failure after launching directly with `npx expo start --lan` in `apps/mobile`. The reported `exp://172.168.3.164:8081` link is an Expo Go link, and the error's `entry.bundle?platform=ios...` path is the expected native bundle path. The generic error's AppDelegate advice does not mean this managed Expo project needs an AppDelegate edit.

Cloud checks confirmed SDK 57.0.0, Expo 57.0.28, React 19.2.3, and React Native 0.86.3. Installed Expo modules match the SDK's bundled version recommendations. No `expo-dev-client`, custom native module, native iOS directory, or custom runtime-version setting requires a development build. The app's custom `beanprofessor` scheme is for future application links and does not replace the Expo Go `exp://` URL.

No Metro override is needed: Expo's default configuration includes the workspace package directories and both mobile/root node_modules locations. The shared TypeScript domain package resolves, and the actual development iOS launch bundle downloads successfully. JSON and multipart native manifest requests, including an Expo signature-request header, return HTTP 200. These checks validate the cloud development server, not an iPhone or Mac network.

## Current next step: test the native bundle on the iPhone

Your Mac has already passed the earlier download diagnostic, and Safari on your iPhone loads the **web** app. Those are different tests: the root web page uses a web bundle, while Expo Go downloads a native iOS bundle and runs it in a native runtime. Neither earlier result proves the iPhone downloaded the native bundle.

1. Update this branch (`git pull --ff-only origin phase-1-prototype`) in your existing checkout. Keep Metro running normally. In a second Mac Terminal window, from the repository root, run:

   ```sh
   npm run diagnose:ios -- http://172.168.3.164:8081
   ```

   The expanded diagnostic checks both JSON and native multipart manifests, compares uncompressed/compressed iOS bundle bytes, and validates the native **multipart bundle progress stream**. It should print `same iOS bundle URL`, `Native bundle stream: HTTP 200`, and `matches plain bundle`. This is still a Mac-side test.

2. Find the line starting **iOS bundle:**. Copy **only the complete URL**, starting with `http://` and ending after the last query parameter. Do not copy the label, insert spaces, or omit anything after `?`. Terminal may wrap a long URL onto several display lines; the URL itself is one continuous string.

3. Send that URL to yourself using Messages, an iCloud-synced note, or AirDrop. On the iPhone, copy it, open Safari, tap the address bar, paste the entire URL, and tap **Go**. Use Safari's address bar, not a search engine. The earlier URL for this project is shown below; use the diagnostic's printed URL if it differs:

   ```text
   http://172.168.3.164:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable
   ```

4. **Expected result:** a large page of JavaScript text (often starting with `var __BUNDLE_START_TIME__`) or an offered/downloaded `.bundle` file, roughly 5.8 MB decoded for this version. It should **not** display the Coffee School web interface. Safari does not execute this React Native bundle as an application; seeing text or a downloaded file is expected. If a download is offered, finish it and note whether Safari reports it complete. Plain text appearing alone does not guarantee that every byte arrived.

5. Record whether it completed, timed out, showed an error page, or displayed the web app. On the Mac, note any Metro error at the same time. If it fails, share Safari's exact message and the expanded diagnostic output. If it succeeds but Expo Go still fails, proceed to the native error-log step below; do not keep cycling the same cache/network resets.

### If the native URL works in Safari but Expo Go still fails

We need the underlying iOS error, not just the generic red screen:

1. Connect the unlocked iPhone to the Mac using USB. Accept **Trust This Computer** if asked.
2. On the Mac, open **Applications → Utilities → Console**. Select your iPhone under **Devices** in the sidebar, then click **Start** or **Start streaming**, if shown. If the phone is not listed, report that instead of installing additional tools immediately.
3. Note the time, scan the Expo QR once, and wait for the failure. Search the captured messages for `RCTMultipartDataTask`, `172.168.3.164`, `NSURLErrorDomain`, `Expo`, or `Exponent`; use one search at a time. The process name can differ from the displayed app name.
4. Share the matching connection-error lines and any `Code=...` value. Include `node -v`, the iOS version from **Settings → General → About**, and whether Metro displayed an iOS request/error during the attempt. Share only the relevant lines, not a full device log. If the red screen offers an expanded/copyable error, include that too.

Examples: `-999` is a cancellation and can also be generated when React Native fails to finish reading a multipart stream; `-1015`/`-1016` concern response/content decoding; `-1001` is a timeout; `-1004` means the connection failed; `-1022` identifies an App Transport Security rejection; `-1009` indicates unavailable/disallowed connectivity and can require deeper local-network-policy diagnosis. A specific code determines the next investigation. A JavaScript exception with a stack trace would instead direct us to execution after download. None of these causes has been confirmed on this iPhone.

## Additional verified investigation

- Every installed SDK-pinned runtime dependency satisfies Expo 57's bundled-native-module versions. React, React Native and Expo resolve from the same workspace node_modules installation. The router entry is `expo-router/entry`, with valid app routes and no manual Metro override.
- The native JSON and multipart/signature-request manifests advertise the same HTTP host, iOS launch URL and `exposdk:57.0.0` runtime. The Safari-style request to that **exact** URL returns JavaScript, not the web interface, on the cloud server.
- Identity, gzip and Brotli bundle responses decode to identical bytes in cloud tests. The earlier Mac diagnostic requested no compressed response and only a JSON manifest; its PASS did not cover these native transport differences. The helper now covers both, rejects malformed/inconsistent responses, and normalizes default ports when comparing advertised origins (for example, HTTPS port 443).
- [Expo's upstream SDK 57 Info.plist](https://github.com/expo/expo/blob/sdk-57/apps/expo-go/ios/Exponent/Supporting/Info.plist) sets `NSAllowsArbitraryLoads` to true. The fetched branch's app version was 57.0.6, so this is source evidence, not inspection of the installed 57.0.9 binary. Adding `ios.infoPlist` ATS exceptions here would affect a custom app build, **not** the installed Expo Go app. No such speculative change was made.
- The shipped React Native source, `node_modules/react-native/React/Base/RCTJavaScriptLoader.mm`, constructs the exact “Could not connect to development server” message for `NSURLErrorDomain` failures before JavaScript execution. `RCTMultipartDataTask.m` sends `Accept: multipart/mixed` for the **bundle**; Safari normally does not. It uses an iOS stream reader for that response and generates a cancelled error if the multipart read does not finish. The older diagnostic requested ordinary JavaScript, so its PASS did not test that native-specific path. The expanded helper now validates complete boundaries, the final JavaScript part/status, and byte equality with the ordinary bundle. It cannot emulate iOS's stream implementation.
- The real cloud server's multipart bundle response is uncompressed and complete; its final JavaScript part is byte-identical to the normal 5.77 MB response. Nine local transport-fixture tests cover valid compression/multipart responses and errors including a truncated native stream and an HTTP-200 envelope containing a failure status. Combined with the 16 domain tests, 25 unit tests pass, as do the 12 browser acceptance checks, TypeScript, lint, and formatting.
- No physical iPhone, iOS simulator, or installed Expo Go binary can be exercised in this Linux environment. No new defect was reproduced in the application or its launch configuration. Changes in this investigation improve diagnostics and instructions only; they do not claim to fix the iPhone failure.

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
