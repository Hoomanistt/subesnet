/**
 * Deno Deploy XHTTP Relay
 * Equivalent to your Vercel Edge Function
 */

// In Deno, we use Deno.env.get() instead of process.env
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

async function handler(req: Request): Promise<Response> {
  if (!TARGET_BASE) {
    return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    // Construct the target URL (preserving path and query)
    const targetUrl = TARGET_BASE + url.pathname + url.search;

    const outHeaders = new Headers();
    let clientIp = "";

    // Forward headers while stripping forbidden ones
    for (const [k, v] of req.headers) {
      const key = k.toLowerCase();
      if (STRIP_HEADERS.has(key)) continue;
      
      // Vercel-specific headers aren't needed on Deno, but we'll ignore them anyway
      if (key.startsWith("x-vercel-") || key.startsWith("x-forwarded-")) continue;

      outHeaders.set(k, v);
    }

    // Capture the real client IP provided by Deno Deploy
    // Deno passes this in the 'x-forwarded-for' header by default
    clientIp = req.headers.get("x-forwarded-for") || "";
    if (clientIp) {
      outHeaders.set("x-forwarded-for", clientIp.split(',')[0].trim());
    }

    // Match the exact method and body streaming of your Vercel code
    const init: RequestInit = {
      method: req.method,
      headers: outHeaders,
      redirect: "manual",
    };

    // Only attach body if method allows it
    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = req.body;
      // Deno Deploy requires 'duplex: half' for streaming bodies
      // @ts-ignore: duplex is required for streaming in Deno/Node/Vercel fetch
      init.duplex = "half";
    }

    const res = await fetch(targetUrl, init);

    // Prepare response headers to send back to client
    const resHeaders = new Headers(res.headers);
    resHeaders.delete("content-encoding"); // Let Deno handle re-encoding

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });

  } catch (err) {
    console.error("Relay Error:", err);
    return new Response(`Relay Error: ${err.message}`, { status: 502 });
  }
}

// Start the Deno server
Deno.serve(handler);
