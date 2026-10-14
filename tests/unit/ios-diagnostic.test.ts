import { createServer } from "node:http";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const exec = promisify(execFile);

async function runDiagnostic(
  mode:
    | "gzip"
    | "br"
    | "bad-compression"
    | "different-content"
    | "bad-multipart"
    | "different-manifest"
    | "bundle-error"
    | "truncated-bundle-stream"
    | "stream-error",
) {
  let base = "";
  const plain = Buffer.from(
    "/* transport fixture, not an app execution test */\n".repeat(100),
  );
  const server = createServer((req, res) => {
    if (req.url === "/status") {
      res.end("packager-status:running");
      return;
    }
    if (req.url === "/") {
      const native = req.headers.accept === "multipart/mixed";
      const manifest = JSON.stringify({
        runtimeVersion: "exposdk:57.0.0",
        extra: {
          expoClient: {
            name: "Transport fixture",
            sdkVersion: "57.0.0",
            hostUri: new URL(base).host,
          },
        },
        launchAsset: {
          url: `${base}/entry.bundle?platform=ios${native && mode === "different-manifest" ? "&other=true" : ""}`,
        },
      });
      if (!native) {
        res.setHeader("Content-Type", "application/expo+json");
        res.end(manifest);
        return;
      }
      res.setHeader(
        "Content-Type",
        'multipart/mixed; boundary="test-boundary"',
      );
      res.end(
        mode === "bad-multipart"
          ? "--test-boundary--\r\n"
          : `--test-boundary\r\nContent-Disposition: form-data; name="manifest"\r\nContent-Type: application/json\r\n\r\n${manifest}\r\n--test-boundary--\r\n`,
      );
      return;
    }
    if (mode === "bundle-error") {
      res.writeHead(500);
      res.end("Metro fixture error");
      return;
    }
    if (req.headers.accept === "multipart/mixed") {
      res.setHeader(
        "Content-Type",
        'multipart/mixed; boundary="stream-boundary"',
      );
      const head = Buffer.from(
        `Metro preamble\r\n--stream-boundary\r\nContent-Type: application/json\r\n\r\n{"done":100}\r\n--stream-boundary\r\nContent-Type: application/javascript\r\nX-Http-Status: ${mode === "stream-error" ? 500 : 200}\r\n\r\n`,
      );
      const tail = Buffer.from(
        mode === "truncated-bundle-stream" ? "" : "\r\n--stream-boundary--\r\n",
      );
      res.end(Buffer.concat([head, plain, tail]));
      return;
    }
    res.setHeader("Content-Type", "application/javascript");
    if (req.headers["accept-encoding"] === "identity") {
      res.end(plain);
      return;
    }
    res.setHeader("Content-Encoding", mode === "br" ? "br" : "gzip");
    const content =
      mode === "different-content"
        ? Buffer.from("different JavaScript")
        : plain;
    res.end(
      mode === "bad-compression"
        ? plain
        : mode === "br"
          ? brotliCompressSync(content)
          : gzipSync(content),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Fixture failed to bind");
  base = `http://127.0.0.1:${address.port}`;
  try {
    try {
      const output = await exec(
        process.execPath,
        ["scripts/check-expo-ios.mjs", base],
        { cwd: process.cwd(), timeout: 10000 },
      );
      return { passed: true, text: output.stdout + output.stderr };
    } catch (error) {
      const result = error as Error & { stdout?: string; stderr?: string };
      return {
        passed: false,
        text: (result.stdout ?? "") + (result.stderr ?? ""),
      };
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

describe("native iOS transport diagnostic", () => {
  it.each(["gzip", "br"] as const)(
    "reads a multipart manifest and compares the %s bundle to plain bytes",
    async (encoding) => {
      const result = await runDiagnostic(encoding);
      expect(result.passed).toBe(true);
      expect(result.text).toContain("Native multipart manifest: HTTP 200");
      expect(result.text).toContain("matches plain bundle");
      expect(result.text).toContain("Native bundle stream: HTTP 200");
    },
  );
  it("fails on corrupt compression instead of reporting a successful JS download", async () => {
    const result = await runDiagnostic("bad-compression");
    expect(result.passed).toBe(false);
    expect(result.text).toContain("FAIL:");
    expect(result.text).not.toContain("PASS:");
  });
  it("detects different decoded content", async () => {
    const result = await runDiagnostic("different-content");
    expect(result.passed).toBe(false);
    expect(result.text).toContain(
      "Compressed and plain bundle contents differ",
    );
  });
  it("rejects multipart responses without a manifest", async () => {
    const result = await runDiagnostic("bad-multipart");
    expect(result.passed).toBe(false);
    expect(result.text).toContain("no manifest part");
  });
  it("rejects disagreement between JSON and multipart URLs", async () => {
    const result = await runDiagnostic("different-manifest");
    expect(result.passed).toBe(false);
    expect(result.text).toContain("manifests disagree");
  });
  it("reports a bundle compilation error without passing the transport test", async () => {
    const result = await runDiagnostic("bundle-error");
    expect(result.passed).toBe(false);
    expect(result.text).toContain("Bundle download failed");
    expect(result.text).toContain("Metro fixture error");
  });
  it("detects a truncated native stream even when the ordinary bundle download succeeds", async () => {
    const result = await runDiagnostic("truncated-bundle-stream");
    expect(result.passed).toBe(false);
    expect(result.text).toContain("before its closing boundary");
    expect(result.text).not.toContain("PASS:");
  });
  it("detects a failure status inside a successful HTTP multipart envelope", async () => {
    const result = await runDiagnostic("stream-error");
    expect(result.passed).toBe(false);
    expect(result.text).toContain(
      "did not end with a successful JavaScript part",
    );
  });
});
