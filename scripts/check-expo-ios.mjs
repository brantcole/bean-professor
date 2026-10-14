// Inspect the same native manifest and launch asset that Expo Go downloads.
// Uses Node's HTTP client, with no external credentials, SDKs, or database calls.
import { request } from "node:http";
import { request as secureRequest } from "node:https";

const address = process.argv[2];
if (!address) {
  console.error("Usage: npm run diagnose:ios -- http://YOUR_MAC_WIFI_IP:8081");
  process.exit(1);
}

function get(url, headers = {}, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? secureRequest : request;
    const req = client(url, { headers }, (res) => {
      let bytes = 0;
      const chunks = [];
      res.on("data", (chunk) => {
        bytes += chunk.length;
        chunks.push(chunk);
      });
      res.on("error", reject);
      res.on("aborted", () =>
        reject(new Error("Response ended before the download completed")),
      );
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bytes,
          body: Buffer.concat(chunks),
        }),
      );
    });
    req.setTimeout(timeout, () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    req.end();
  });
}

try {
  const base = new URL(address);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password
  ) {
    throw new Error("Supply an HTTP(S) server address without credentials");
  }
  base.pathname = "/";
  base.search = "";
  base.hash = "";
  const status = await get(new URL("/status", base), {}, 15000);
  if (
    status.status !== 200 ||
    status.body.toString() !== "packager-status:running"
  ) {
    throw new Error(`Metro status endpoint failed: HTTP ${status.status}`);
  }
  const manifestResponse = await get(
    base,
    {
      "expo-platform": "ios",
      Accept: "application/expo+json",
      "User-Agent": "Expo/57.0.9",
    },
    30000,
  );
  if (manifestResponse.status !== 200)
    throw new Error(`iOS manifest failed: HTTP ${manifestResponse.status}`);
  const manifest = JSON.parse(manifestResponse.body.toString());
  const config = manifest.extra?.expoClient;
  const bundle = new URL(manifest.launchAsset?.url);
  console.log(
    `App: ${config?.name}; SDK: ${config?.sdkVersion}; runtime: ${manifest.runtimeVersion}`,
  );
  console.log(`Manifest host: ${config?.hostUri}`);
  console.log(`iOS bundle: ${bundle.href}`);
  if (config?.sdkVersion !== "57.0.0") throw new Error("Expected SDK 57");
  if (config?.hostUri !== base.host || bundle.origin !== base.origin) {
    throw new Error(
      "Manifest advertises a different host/port. Check REACT_NATIVE_PACKAGER_HOSTNAME, EXPO_PACKAGER_PROXY_URL, and VPN/interface selection. No bundle from another origin was fetched.",
    );
  }
  if (bundle.searchParams.get("platform") !== "ios")
    throw new Error("Manifest launch asset is not an iOS bundle");
  const response = await get(bundle, { Accept: "*/*" });
  console.log(
    `Bundle: HTTP ${response.status}; ${response.headers["content-type"]}; ${response.bytes} bytes downloaded`,
  );
  if (response.status !== 200) {
    throw new Error(
      `Bundle download failed. Read Metro's error output. Response: ${response.body.toString().slice(0, 200)}`,
    );
  }
  if (
    !String(response.headers["content-type"]).includes("javascript") ||
    !response.bytes
  ) {
    throw new Error("Server did not return a nonempty JavaScript bundle");
  }
  console.log(
    "PASS: this computer received the native manifest and complete iOS bundle. This does not prove the iPhone can download or execute it.",
  );
} catch (error) {
  console.error(
    `FAIL: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
