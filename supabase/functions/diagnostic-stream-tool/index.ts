/**
 * Deno Port of vercel-xhttp-relay
 * Optimized for Deno Deploy 2026
 */

// 1. Cache TARGET_DOMAIN at cold start for speed
const TARGET_BASE = (Deno.env.get("TARGET_DOMAIN") || "").replace(/\/$/, "");

const STRIP_HEADERS = new Set([
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
  "x-forwarded-port",
]);

Deno.serve(async (req: Request) => {
  if (!TARGET_BASE) {
    return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  }

  try {
    // 2. High-speed path extraction (Matches your Vercel logic)
    const pathStart = req.url.indexOf("/", 8);
    const targetUrl = pathStart === -1 
      ? TARGET_BASE + "/" 
      : TARGET_BASE + req.url.slice(pathStart);

    // 3. Single-pass Header Filtering
    const out = new Headers();
    let clientIp = null;

    for (const [k, v] of req.headers) {
      const lowerK = k.toLowerCase();
      
      if (STRIP_HEADERS.has(lowerK)) continue;
      if (lowerK.startsWith("x-vercel-") || lowerK.startsWith("x-deno-")) continue;
      
      if (lowerK === "x-real-ip") {
        clientIp = v;
        continue;
      }
      if (lowerK === "x-forwarded-for") {
        if (!clientIp) clientIp = v.split(',')[0].trim();
        continue;
      }
      out.set(k, v);
    }
    
    if (clientIp) out.set("x-forwarded-for", clientIp);
    
    // CRITICAL: Deno needs the Host header set to the VPS domain to route correctly
    out.set("Host", new URL(TARGET_BASE).host);

    // 4. True Bidirectional Streaming
    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    return await fetch(targetUrl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,
      // @ts-ignore: duplex is essential for XHTTP streaming
      duplex: "half",
      redirect: "manual",
    });

  } catch (err) {
    console.error("Relay error:", err);
    return new Response("Bad Gateway: Tunnel Failed", { status: 502 });
  }
});
