export const TOOL_CATALOG = [
  {
    key: "base64",
    title: "Base64",
    description: "Encode / Decode",
    subtitle: "Encode plain text or decode Base64 values.",
  },
  {
    key: "ytdlp",
    title: "AIO Downloader",
    description: "Multi-site video downloader",
    subtitle: "Submit a video URL from one of 2000+ supported sites.",
  },
] as const;

export type ToolCatalogItem = (typeof TOOL_CATALOG)[number];
export type ToolKey = ToolCatalogItem["key"];

export const DEFAULT_TOOL_QUERY_KEYS = ["tool", "t"] as const;

const TOOL_QUERY_PARAMS_DOCS_PATH = "/posts/tool-query-params";

const TOOL_QUERY_PARAMS_DOCS_PATHS_BY_TOOL: Partial<Record<ToolKey, string>> =
  {};

export function getToolQueryParamsDocsUrl(
  baseUrl: string,
  toolKey: ToolKey
): string {
  const path =
    TOOL_QUERY_PARAMS_DOCS_PATHS_BY_TOOL[toolKey] ??
    TOOL_QUERY_PARAMS_DOCS_PATH;
  return new URL(path, baseUrl).toString();
}
