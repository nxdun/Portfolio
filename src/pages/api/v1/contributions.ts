import type { APIRoute } from "astro";

export const prerender = false;

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const GET: APIRoute = async ({ locals }) => {
  // Cloudflare runtime bindings access via Astro locals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtime = (locals as any)?.runtime;
  const kv = runtime?.env?.CONTRIBUTIONS_KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV Namespace not bound" }), {
      status: 500,
      headers: corsHeaders,
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
        // 1 hour cache - background refresh runs every 3h
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
