Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // 1. YOUR VPS CONFIG (Change this to your actual VPS domain and port)
  const TARGET_DOMAIN = "https://de1.matmonamii.ir:2087";

  // 2. PREPARE THE DESTINATION URL
  // This preserves your path (e.g., /?ed=2560) during the relay
  const destination = TARGET_DOMAIN.replace(/\/$/, "") + url.pathname + url.search;

  // 3. CLEAN & FIX HEADERS
  const newHeaders = new Headers(req.headers);
  
  // We force the Host header to match your VPS domain. 
  // This allows you to use ANY domain (like jsr.io) in v2rayN's Host field.
  newHeaders.set("Host", new URL(TARGET_DOMAIN).host);
  
  // This is a 2026 safety header for Deno internal routing
  newHeaders.set("x-deno-subhost", "subesnet.hoomanistt.deno.net");

  // 4. THE RELAY ENGINE
  try {
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      redirect: "manual",
    });

    return response;
  } catch (err) {
    console.error("Relay Error:", err.message);
    return new Response("Relay Failed: Check if VPS is up.", { status: 502 });
  }
});
