import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // Cloudflare runtime bindings access via Astro locals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtime = (locals as any)?.runtime;
  const kv = runtime?.env?.CONTRIBUTIONS_KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV Namespace not bound" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 1 hour cache - background refresh runs every 3h
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
