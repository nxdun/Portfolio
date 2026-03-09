export const TOOL_CATALOG = [
  {
    key: "base64",
    title: "Base64",
    description: "Encode / Decode",
    subtitle: "Encode plain text or decode Base64 values.",
  },
  {
    key: "ytdlp",
    title: "YouTube Downloader",
    description: "Queue video download",
    subtitle: "Submit a YouTube video URL after reCAPTCHA verification.",
  },
] as const;

export type ToolCatalogItem = (typeof TOOL_CATALOG)[number];
export type ToolKey = ToolCatalogItem["key"];

export const DEFAULT_TOOL_QUERY_KEYS = ["tool", "t"] as const;
