import { type CollectionEntry } from "astro:content";
import sharp from "sharp";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

async function svgBufferToPngBuffer(svg: string) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
