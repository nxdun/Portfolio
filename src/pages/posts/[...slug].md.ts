import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import fs from "node:fs/promises";
import path from "node:path";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  
  return posts.map(post => ({
    params: { slug: getPath(post.id, post.filePath, false) },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  let markdown = "";
  
  try {
    // Attempt to read the raw file directly to include frontmatter
    if (post.filePath) {
      markdown = await fs.readFile(post.filePath, "utf-8");
    } else {
      // Fallback if filePath isn't available
      const filePath = path.join(process.cwd(), "src/data/blog", post.id);
      markdown = await fs.readFile(filePath, "utf-8");
    }
  } catch (e) {
    return new Response("Error reading markdown file", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
