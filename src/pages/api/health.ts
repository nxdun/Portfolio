// info: static health check endpoint
export const prerender = false;
export async function GET() {
  return new Response("OK");
}
