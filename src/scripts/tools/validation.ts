export type QueryTextOptions = {
  maxLength?: number;
  preserveWhitespace?: boolean;
};

export type ToolValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

export type ToolTextValidationOptions = {
  label?: string;
  required?: boolean;
  maxLength?: number;
};

const CONTROL_CHARS_WITHOUT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SAFE_TOKEN_PATTERN = /^[a-z0-9-]+$/;

export function getQueryTextParam(
  params: URLSearchParams,
  keys: readonly string[],
  options?: QueryTextOptions,
): string | undefined {
  for (const key of keys) {
    const value = sanitizeText(params.get(key), options);
    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

export function sanitizeText(value: string | null | undefined, options?: QueryTextOptions): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const maxLength = options?.maxLength ?? 8192;
  const preserveWhitespace = options?.preserveWhitespace ?? true;

  let normalized = value.replace(CONTROL_CHARS_WITHOUT_WHITESPACE, "");
  normalized = preserveWhitespace ? normalized : normalized.trim();

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maxLength) {
    normalized = normalized.slice(0, maxLength);
  }

  return normalized;
}

export function sanitizeSafeToken(
  value: string | null | undefined,
  options?: { maxLength?: number },
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const maxLength = options?.maxLength ?? 32;
  const token = value.trim().toLowerCase();
  if (!token || token.length > maxLength) {
    return undefined;
  }

  if (!SAFE_TOKEN_PATTERN.test(token)) {
    return undefined;
  }

  return token;
}

export function validateToolTextInput(
  value: string,
  options?: ToolTextValidationOptions,
): ToolValidationResult {
  const label = options?.label ?? "Input";
  const required = options?.required ?? false;
  const maxLength = options?.maxLength;

  if (required && value.trim().length === 0) {
    return {
      isValid: false,
      message: `${label} cannot be empty.`,
    };
  }

  if (typeof maxLength === "number" && value.length > maxLength) {
    return {
      isValid: false,
      message: `${label} exceeds the ${maxLength.toString()} character limit.`,
    };
  }

  return { isValid: true };
}
