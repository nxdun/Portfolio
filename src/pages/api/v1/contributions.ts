import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

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

export const GET: APIRoute = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (env as any)?.CONTRIBUTIONS_KV;

    if (!kv) {
      return new Response(
        JSON.stringify({
          error: "KV Namespace CONTRIBUTIONS_KV not bound",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

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
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};
