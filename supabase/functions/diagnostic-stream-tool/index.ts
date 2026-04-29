// index.ts
const TARGET_DOMAIN = Deno.env.get("TARGET_DOMAIN") || "";

// These headers are "snitch" headers. We remove them so the traffic looks like a 
// standard browser visit, not a relay or a tunnel.
const STRIP_HEADERS = [
  "x-forwarded-for", "x-real-ip", "via", "forwarded", 
  "x-vercel-id", "x-powered-by", "cf-ray"
];

Deno.serve(async (req: Request) => {
  if (!TARGET_DOMAIN) return new Response("Config Error", { status: 500 });

  try {
    const url = new URL(req.url);
    const destination = TARGET_DOMAIN.replace(/\/$/, "") + url.pathname + url.search;

    const cleanHeaders = new Headers();
    for (const [key, value] of req.headers) {
      if (!STRIP_HEADERS.includes(key.toLowerCase())) {
        cleanHeaders.set(key, value);
      }
    }

    // This is the most important part: Masking the Host.
    // It makes the request look like it's staying within the "Business Lane."
    cleanHeaders.set("Host", new URL(TARGET_DOMAIN).host);

    const response = await fetch(destination, {
      method: req.method,
      headers: cleanHeaders,
      body: req.body,
      // @ts-ignore: Required for streaming in Deno
      duplex: "half",
      redirect: "manual",
    });

    return response;
  } catch (e) {
    return new Response("Node Offline", { status: 502 });
  }
});
