import type { AioToolOptions } from "@/scripts/tools/types";
import { getQueryTextParam } from "@/scripts/tools/validation";
import { AIO_URL_MAX_LENGTH } from "./validation";

export function getAioMountOptions(params: URLSearchParams): AioToolOptions {
  const url = getQueryTextParam(params, ["url", "u"], {
    maxLength: AIO_URL_MAX_LENGTH,
    preserveWhitespace: false,
  });

  return {
    url,
  };
}
