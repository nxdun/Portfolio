interface EventContext {
  env: {
    CONTRIBUTIONS_KV?: {
      get(key: string, type: string): Promise<string | null>;
    };
  };
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequest(context: EventContext) {
  // context.env contains bound KV namespaces and other environment variables
  const kv = context.env.CONTRIBUTIONS_KV;

  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV Namespace CONTRIBUTIONS_KV not bound" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  try {
    const data = await kv.get("contributions", "text");

    if (!data) {
      return new Response(
        JSON.stringify({ error: "No contribution data available in KV" }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new Response(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        // 1 hour cache; stale-while-revalidate allows serving stale during background refresh
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[contributions] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
