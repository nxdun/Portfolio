import type { YtdlpToolOptions } from "../types";
import { getQueryTextParam } from "../validation";
import { YTDLP_URL_MAX_LENGTH } from "./validation";

export function getYtdlpMountOptions(
  params: URLSearchParams
): YtdlpToolOptions {
  const url = getQueryTextParam(params, ["url", "u"], {
    maxLength: YTDLP_URL_MAX_LENGTH,
    preserveWhitespace: false,
  });

  return {
    url,
  };
}
