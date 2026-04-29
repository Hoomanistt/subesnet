Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // 1. SETTINGS - Replace with your real VPS details
  const TARGET_DOMAIN = "https://de1.matmonamii.ir:2087"; 
  const SECRET_HEADER_NAME = "x-deno-subhost"; // The "Secret Handshake"
  const SECRET_VALUE = "subesnet.hoomanistt.deno.net"; // Your Project ID

  // 2. CHECK THE HANDSHAKE
  // If the secret header isn't there, show a fake "Under Construction" page.
  // This fools anyone (or any bot) trying to browse your Deno URL directly.
  if (req.headers.get(SECRET_HEADER_NAME) !== SECRET_VALUE) {
    return new Response("<html><body><h1>404 Not Found</h1></body></html>", {
      status: 404,
      headers: { "content-type": "text/html" },
    });
  }

  // 3. EXECUTE THE RELAY
  const newHeaders = new Headers(req.headers);
  
  // Clean the headers for your VPS
  newHeaders.set("Host", new URL(TARGET_DOMAIN).host);
  
  // Optional: Remove the secret header before sending to VPS so X-UI doesn't get confused
  newHeaders.delete(SECRET_HEADER_NAME);

  try {
    const destination = TARGET_DOMAIN + url.pathname + url.search;
    return await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      redirect: "manual",
    });
  } catch (err) {
    return new Response("Gateway Error", { status: 502 });
  }
});
