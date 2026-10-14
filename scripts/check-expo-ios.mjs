// Inspect the same native manifest and launch asset that Expo Go downloads.
// Uses Node's HTTP client, with no external credentials, SDKs, or database calls.
import { request } from "node:http";
import { request as secureRequest } from "node:https";
import { gunzipSync, inflateSync, brotliDecompressSync } from "node:zlib";
import { createHash } from "node:crypto";

function decode(response) {
  const encoding = String(
    response.headers["content-encoding"] ?? "identity",
  ).toLowerCase();
  if (encoding === "gzip") return gunzipSync(response.body);
  if (encoding === "deflate") return inflateSync(response.body);
  if (encoding === "br") return brotliDecompressSync(response.body);
  if (encoding !== "identity")
    throw new Error(`Unsupported response encoding: ${encoding}`);
  return response.body;
}

function readParts(response) {
  const type = String(response.headers["content-type"] ?? "");
  const boundary = type.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  if (!boundary) throw new Error("Native multipart response has no boundary");
  const bytes = decode(response);
  const marker = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  const nextMarker = Buffer.from(`\r\n${marker.toString()}`);
  const parts = [];
  let cursor = bytes.indexOf(marker);
  while (cursor >= 0) {
    const start = cursor + marker.length;
    if (bytes.subarray(start, start + 2).toString() === "--") return parts;
    if (bytes.subarray(start, start + 2).toString() !== "\r\n")
      throw new Error("Malformed native multipart boundary");
    const headerEnd = bytes.indexOf(Buffer.from("\r\n\r\n"), start + 2);
    if (headerEnd < 0) break;
    const next = bytes.indexOf(nextMarker, headerEnd + 4);
    if (next < 0) break;
    const headers = {};
    for (const line of bytes
      .subarray(start + 2, headerEnd)
      .toString()
      .split("\r\n")) {
      const colon = line.indexOf(":");
      if (colon > 0)
        headers[line.slice(0, colon).trim().toLowerCase()] = line
          .slice(colon + 1)
          .trim();
    }
    parts.push({ headers, body: bytes.subarray(headerEnd + 4, next) });
    cursor = next + 2;
  }
  throw new Error(
    "Native multipart response ended before its closing boundary",
  );
}

function readManifest(response) {
  const type = String(response.headers["content-type"] ?? "");
  if (!type.startsWith("multipart/mixed"))
    return JSON.parse(decode(response).toString());
  const part = readParts(response).find((p) =>
    /name="manifest"/i.test(p.headers["content-disposition"] ?? ""),
  );
  if (part) return JSON.parse(part.body.toString());
  throw new Error("Native multipart response has no manifest part");
}

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
  const manifest = readManifest(manifestResponse);
  const config = manifest.extra?.expoClient;
  const bundle = new URL(manifest.launchAsset?.url);
  if (bundle.username || bundle.password)
    throw new Error("Bundle URL unexpectedly contains credentials");
  console.log(
    `App: ${config?.name}; SDK: ${config?.sdkVersion}; runtime: ${manifest.runtimeVersion}`,
  );
  console.log(`Manifest host: ${config?.hostUri}`);
  console.log(`iOS bundle: ${bundle.href}`);
  if (config?.sdkVersion !== "57.0.0") throw new Error("Expected SDK 57");
  const advertisedOrigin = config?.hostUri
    ? new URL(`${base.protocol}//${config.hostUri}`).origin
    : null;
  if (advertisedOrigin !== base.origin || bundle.origin !== base.origin) {
    throw new Error(
      "Manifest advertises a different host/port. Check REACT_NATIVE_PACKAGER_HOSTNAME, EXPO_PACKAGER_PROXY_URL, and VPN/interface selection. No bundle from another origin was fetched.",
    );
  }
  if (bundle.searchParams.get("platform") !== "ios")
    throw new Error("Manifest launch asset is not an iOS bundle");
  const nativeManifestResponse = await get(
    base,
    {
      "expo-platform": "ios",
      "expo-protocol-version": "0",
      "expo-expect-signature": 'sig, keyid="expo-root", alg="rsa-v1_5-sha256"',
      Accept: "multipart/mixed",
      "User-Agent": "Expo/57.0.9",
    },
    30000,
  );
  if (nativeManifestResponse.status !== 200)
    throw new Error(
      `Native multipart manifest failed: HTTP ${nativeManifestResponse.status}`,
    );
  const nativeManifest = readManifest(nativeManifestResponse);
  if (
    nativeManifest.launchAsset?.url !== bundle.href ||
    nativeManifest.runtimeVersion !== manifest.runtimeVersion
  ) {
    throw new Error(
      "JSON and native multipart manifests disagree about the bundle or runtime",
    );
  }
  console.log(
    `Native multipart manifest: HTTP 200; runtime ${nativeManifest.runtimeVersion}; same iOS bundle URL`,
  );
  const response = await get(bundle, {
    Accept: "*/*",
    "Accept-Encoding": "identity",
  });
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
  const compressed = await get(bundle, {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "Expo/57.0.9",
  });
  if (compressed.status !== 200)
    throw new Error(`Compressed bundle failed: HTTP ${compressed.status}`);
  const decoded = decode(compressed);
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  if (hash(decoded) !== hash(decode(response))) {
    throw new Error(
      "Compressed and plain bundle contents differ. Check for a Metro rebuild during the test or response interference.",
    );
  }
  console.log(
    `Compressed bundle: HTTP 200; encoding ${compressed.headers["content-encoding"] ?? "identity"}; ${compressed.bytes} wire bytes; ${decoded.length} decoded bytes; matches plain bundle`,
  );
  // RCTMultipartDataTask requests a progress stream for the bundle itself.
  const nativeBundle = await get(bundle, {
    Accept: "multipart/mixed",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "Expo/57.0.9",
  });
  if (nativeBundle.status !== 200)
    throw new Error(`Native bundle stream failed: HTTP ${nativeBundle.status}`);
  const part = String(nativeBundle.headers["content-type"]).startsWith(
    "multipart/mixed",
  )
    ? readParts(nativeBundle).at(-1)
    : { headers: nativeBundle.headers, body: decode(nativeBundle) };
  if (
    !part ||
    Number(part.headers["x-http-status"] ?? 200) !== 200 ||
    !String(part.headers["content-type"]).includes("javascript")
  ) {
    throw new Error(
      "Native bundle stream did not end with a successful JavaScript part",
    );
  }
  if (hash(part.body) !== hash(decode(response)))
    throw new Error(
      "Native multipart bundle differs from the plain bundle; check for a Metro rebuild during the test",
    );
  console.log(
    `Native bundle stream: HTTP 200; ${nativeBundle.headers["content-type"]}; final JavaScript part ${part.body.length} bytes; matches plain bundle`,
  );
  console.log(
    "PASS: this computer received consistent native manifests and matching plain/compressed/multipart iOS bundles. This does not prove the iPhone can download or execute them.",
  );
} catch (error) {
  console.error(
    `FAIL: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
