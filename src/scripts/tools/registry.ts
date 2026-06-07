import {
  DEFAULT_TOOL_QUERY_KEYS,
  TOOL_CATALOG,
  type ToolCatalogItem,
  type ToolKey,
} from "./catalog";
import type { ToolMount, ToolMountOptions } from "./types";
import { mountBase64Tool } from "@/features/base64";
import { getBase64MountOptions } from "@/features/base64";
import { mountAioTool } from "@/features/aio-downloader";
import { getAioMountOptions } from "@/features/aio-downloader";
import { getQueryTextParam, sanitizeSafeToken } from "./validation";

type ToolUrlOptionsResolver = (params: URLSearchParams) => ToolMountOptions;

export type ToolDefinition = ToolCatalogItem & {
  loadMount: () => Promise<ToolMount>;
  getMountOptions?: ToolUrlOptionsResolver;
};

const TOOL_LOADERS: Record<ToolKey, ToolDefinition["loadMount"]> = {
  base64: async () => mountBase64Tool,
  aio: async () => mountAioTool,
};

const TOOL_URL_OPTIONS_RESOLVERS: Partial<
  Record<ToolKey, ToolUrlOptionsResolver>
> = {
  base64: getBase64MountOptions,
  aio: getAioMountOptions,
};

function createToolDefinition(item: ToolCatalogItem): ToolDefinition {
  return {
    ...item,
    loadMount: TOOL_LOADERS[item.key],
    getMountOptions: TOOL_URL_OPTIONS_RESOLVERS[item.key],
  };
}

export const TOOL_REGISTRY = TOOL_CATALOG.reduce<
  Record<ToolKey, ToolDefinition>
>(
  (registry, item) => {
    registry[item.key] = createToolDefinition(item);
    return registry;
  },
  {} as Record<ToolKey, ToolDefinition>
);

export function isToolKey(value: string | null | undefined): value is ToolKey {
  const token = sanitizeSafeToken(value);
  if (!token) return false;
  return token in TOOL_REGISTRY;
}

export function getInitialToolKey(params: URLSearchParams): ToolKey | null {
  const candidate = getQueryTextParam(params, DEFAULT_TOOL_QUERY_KEYS, {
    maxLength: 32,
    preserveWhitespace: false,
  });
  const key = sanitizeSafeToken(candidate ?? null);

  return key && isToolKey(key) ? key : null;
}
