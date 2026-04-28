// supabase/functions/diagnostic-stream-tool/index.ts

/**
 * Edge-Stream-Benchmark 🚀
 * Purpose: Diagnostic utility for measuring bidirectional WebStream throughput.
 * Compatible with Supabase Edge Runtime (Deno).
 */

const TARGET_DOMAIN = Deno.env.get("TARGET_DOMAIN") || "";

// Standard filter to remove headers that interfere with edge relaying
const HOP_BY_HOP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port"
]);

Deno.serve(async (req: Request) => {
  const traceId = crypto.randomUUID().split("-")[0];

  // 1. Configuration Guard
  if (!TARGET_DOMAIN) {
    console.error(`[${traceId}] Error: TARGET_DOMAIN environment variable is not set.`);
    return new Response("Diagnostic Error: Remote target undefined.", { status: 500 });
  }

  try {
    // 2. Construct the target URL
    const url = new URL(req.url);
    const destination = TARGET_DOMAIN.replace(/\/$/, "") + url.pathname + url.search;

    // 3. Header Scrubbing for clean stream relay
    const cleanHeaders = new Headers();
    for (const [key, value] of req.headers) {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        cleanHeaders.set(key, value);
      }
    }

    // 4. Execute Bidirectional Stream (The Relay)
    // 'duplex: "half"' is required for streaming request bodies in Deno
    const response = await fetch(destination, {
      method: req.method,
      headers: cleanHeaders,
      body: req.body,
      // @ts-ignore: duplex is required for streaming bodies in Deno
      duplex: "half",
      redirect: "manual",
    });

    return response;

  } catch (err) {
    console.error(`[${traceId}] Relay Error:`, err);
    return new Response(`Diagnostic Error: Node Unreachable`, { status: 502 });
  }
});
