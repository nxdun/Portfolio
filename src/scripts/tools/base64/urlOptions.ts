import type { Base64ToolAction, Base64ToolOptions } from "../types";
import { getQueryTextParam, sanitizeSafeToken } from "../validation";
import { BASE64_INPUT_MAX_LENGTH } from "./validation";

const BASE64_ACTIONS: Base64ToolAction[] = ["encode", "decode", "clear"];

function getBase64Action(
  value: string | null | undefined
): Base64ToolAction | undefined {
  const action = sanitizeSafeToken(value);
  if (!action) return undefined;

  if (BASE64_ACTIONS.includes(action as Base64ToolAction)) {
    return action as Base64ToolAction;
  }

  return undefined;
}

export function getBase64MountOptions(
  params: URLSearchParams
): Base64ToolOptions {
  const input = getQueryTextParam(params, ["input", "in"], {
    maxLength: BASE64_INPUT_MAX_LENGTH,
  });
  const output = getQueryTextParam(params, ["output", "out"], {
    maxLength: BASE64_INPUT_MAX_LENGTH,
  });

  return {
    input,
    output,
    action: getBase64Action(
      getQueryTextParam(params, ["action", "act"], { maxLength: 16 })
    ),
  };
}
