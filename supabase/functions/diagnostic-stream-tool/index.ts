Deno.serve(async (req) => {
  const url = new URL(req.url);
  const TARGET_DOMAIN = "https://de1.matmonamii.ir:2087"; 
  const SECRET_HEADER_NAME = "x-deno-subhost"; 
  const SECRET_VALUE = "subesnet.hoomanistt.deno.net";

  // 1. DEBUG LOGGING (Check these in Deno Console -> Logs)
  const incomingSecret = req.headers.get(SECRET_HEADER_NAME);
  console.log(`[${new Date().toISOString()}] Incoming Path: ${url.pathname}`);
  console.log(`[${new Date().toISOString()}] Secret Header Found: ${incomingSecret ? "YES" : "NO"}`);

  // 2. THE 404 GATEKEEPER
  // If the secret header doesn't match, we return 404.
  // This is likely where your error is happening because v2rayN isn't sending the header.
  if (incomingSecret !== SECRET_VALUE) {
    console.warn("Unauthorized Access Attempt - Returning 404");
    return new Response("<html><body><h1>404 Not Found</h1></body></html>", {
      status: 404,
      headers: { "content-type": "text/html" },
    });
  }

  // 3. THE RELAY LOGIC
  const newHeaders = new Headers(req.headers);
  newHeaders.set("Host", new URL(TARGET_DOMAIN).host);
  newHeaders.delete(SECRET_HEADER_NAME); // Clean up for the VPS

  try {
    const destination = TARGET_DOMAIN + url.pathname + url.search;
    
    // We use a Request clone to ensure the body stream isn't locked
    return await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.body, 
      redirect: "manual",
    });
  } catch (err) {
    console.error("Relay Error:", err.message);
    return new Response("Gateway Error", { status: 502 });
  }
});
