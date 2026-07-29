export async function onRequest(context) {
  // context.env contains bound KV namespaces and other environment variables
  const kv = context.env.CONTRIBUTIONS_KV;
  
  if (!kv) {
    return new Response(JSON.stringify({ error: "KV Namespace not bound" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await kv.get("contributions", "text");
    
    if (!data) {
      return new Response(
        JSON.stringify({ error: "No contribution data available" }),
        { 
          status: 503, 
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          } 
        }
      );
    }

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 1 hour cache - background refresh runs every 3h
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
