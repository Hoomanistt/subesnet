Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // --- CONFIGURATION ---
  // Your real VPS destination
  const TARGET_DOMAIN = "https://de1.matmonamii.ir:2087";
  // Your Deno Project Host
  const MY_DENO_HOST = "subesnet.hoomanistt.deno.net";

  // 1. Build the full destination path including query strings (like ?ed=2560)
  const destination = TARGET_DOMAIN.replace(/\/$/, "") + url.pathname + url.search;

  // 2. Clone headers and apply the "Vercel Method" Fix
  const newHeaders = new Headers(req.headers);
  
  // This tells your VPS exactly which domain it's serving
  newHeaders.set("Host", new URL(TARGET_DOMAIN).host);
  
  // This tells Deno's 2026 infrastructure to route to your specific script
  newHeaders.set("x-deno-subhost", MY_DENO_HOST);

  // 3. Execute the Relay with Streaming Support
  try {
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.body, // This pipes your encrypted XHTTP data directly
      redirect: "manual",
    });

    // Return the response directly from the VPS to your PC
    return response;

  } catch (err) {
    console.error("Relay Error:", err.message);
    return new Response(`Relay Failed: ${err.message}`, { 
      status: 502,
      headers: { "content-type": "text/plain" }
    });
  }
});
