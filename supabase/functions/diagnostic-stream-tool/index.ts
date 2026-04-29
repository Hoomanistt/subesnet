Deno.serve(async (req) => {
  const url = new URL(req.url);
  const TARGET_DOMAIN = "https://de1.matmonamii.ir:2087";

  const newHeaders = new Headers(req.headers);
  
  // FIX: Even if v2rayN sends "Host: storage.googleapis.com", 
  // we force it to your VPS domain so the connection doesn't break.
  newHeaders.set("Host", new URL(TARGET_DOMAIN).host);

  try {
    return await fetch(TARGET_DOMAIN + url.pathname + url.search, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      redirect: "manual",
    });
  } catch (e) {
    return new Response("Bridge Active", { status: 200 });
  }
});
