import { validateToolTextInput, type ToolValidationResult } from "../validation";
import type { Base64ToolAction } from "../types";

export const BASE64_INPUT_MAX_LENGTH = 12000;

const BASE64_DECODE_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

export function validateBase64ActionInput(
  action: Base64ToolAction,
  input: string,
): ToolValidationResult {
  if (action === "clear") {
    return { isValid: true };
  }

  const requiredValidation = validateToolTextInput(input, {
    label: "Input",
    required: true,
    maxLength: BASE64_INPUT_MAX_LENGTH,
  });

  if (!requiredValidation.isValid) {
    return requiredValidation;
  }

  if (action === "decode") {
    const normalized = input.replace(/\s+/g, "");

    if (normalized.length % 4 !== 0) {
      return {
        isValid: false,
        message: "Invalid Base64 length.",
      };
    }

    if (!BASE64_DECODE_PATTERN.test(normalized)) {
      return {
        isValid: false,
        message: "Invalid Base64 format.",
      };
    }
  }

  return { isValid: true };
}
