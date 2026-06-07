import {
  sanitizeText,
  validateToolTextInput,
  type ToolValidationResult,
} from "@/scripts/tools/validation";
import type { AioToolAction } from "@/scripts/tools/types";

export const AIO_URL_MAX_LENGTH = 2048;
export const AIO_BACKEND_URL_MAX_LENGTH = 512;
export const AIO_RECAPTCHA_SITE_KEY_MAX_LENGTH = 256;
export const AIO_CAPTCHA_TOKEN_MAX_LENGTH = 4096;

export type AioActionInput = {
  url?: string;
  backendUrl?: string;
  captchaToken?: string;
};

export type AioActionValidationResult =
  | {
      isValid: true;
      normalized?: {
        url?: string;
        backendUrl?: string;
        captchaToken?: string;
      };
    }
  | {
      isValid: false;
      message: string;
    };

export type AioConfigInput = {
  backendUrl?: string;
  recaptchaSiteKey?: string;
};

export type AioConfigValidationResult =
  | {
      isValid: true;
      normalized: {
        backendUrl: string;
        recaptchaSiteKey: string;
      };
    }
  | {
      isValid: false;
      message: string;
    };

function validateHttpUrl(value: string, label: string): ToolValidationResult {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        message: `${label} must use http or https.`,
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      message: `${label} is not a valid URL.`,
    };
  }
}

function normalizeVideoUrl(url: string): AioActionValidationResult {
  const textValidation = validateToolTextInput(url, {
    label: "URL",
    required: true,
    maxLength: AIO_URL_MAX_LENGTH,
  });

  if (!textValidation.isValid) {
    return textValidation;
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return {
      isValid: false,
      message: "URL is not a valid link.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      message: "URL must use http or https.",
    };
  }

  return {
    isValid: true,
    normalized: {
      url: parsed.href,
    },
  };
}

export function validateAioActionInput(
  action: AioToolAction,
  input: AioActionInput
): AioActionValidationResult {
  const backendUrl = sanitizeText(input.backendUrl, {
    maxLength: AIO_BACKEND_URL_MAX_LENGTH,
    preserveWhitespace: false,
  });

  const backendValidation = validateToolTextInput(backendUrl ?? "", {
    label: "Backend URL",
    required: true,
    maxLength: AIO_BACKEND_URL_MAX_LENGTH,
  });

  if (!backendValidation.isValid) {
    return backendValidation;
  }

  const backendUrlValidation = validateHttpUrl(backendUrl ?? "", "Backend URL");
  if (!backendUrlValidation.isValid) {
    return backendUrlValidation;
  }

  if (action === "verify-captcha") {
    const captchaToken = sanitizeText(input.captchaToken, {
      maxLength: AIO_CAPTCHA_TOKEN_MAX_LENGTH,
      preserveWhitespace: false,
    });

    const tokenValidation = validateToolTextInput(captchaToken ?? "", {
      label: "Captcha",
      required: true,
      maxLength: AIO_CAPTCHA_TOKEN_MAX_LENGTH,
    });

    if (!tokenValidation.isValid) {
      return tokenValidation;
    }

    return {
      isValid: true,
      normalized: {
        backendUrl,
        captchaToken,
      },
    };
  }

  if (action === "enqueue") {
    const url = sanitizeText(input.url, {
      maxLength: AIO_URL_MAX_LENGTH,
      preserveWhitespace: false,
    });

    const urlValidation = normalizeVideoUrl(url ?? "");
    if (!urlValidation.isValid) {
      return urlValidation;
    }

    return {
      isValid: true,
      normalized: {
        backendUrl,
        url: urlValidation.normalized?.url,
      },
    };
  }

  return {
    isValid: false,
    message: "Invalid action.",
  };
}

export function validateAioConfigInput(
  input: AioConfigInput
): AioConfigValidationResult {
  const backendUrl = sanitizeText(input.backendUrl, {
    maxLength: AIO_BACKEND_URL_MAX_LENGTH,
    preserveWhitespace: false,
  });
  const recaptchaSiteKey = sanitizeText(input.recaptchaSiteKey, {
    maxLength: AIO_RECAPTCHA_SITE_KEY_MAX_LENGTH,
    preserveWhitespace: false,
  });

  const backendValidation = validateToolTextInput(backendUrl ?? "", {
    label: "Backend URL",
    required: true,
    maxLength: AIO_BACKEND_URL_MAX_LENGTH,
  });

  if (!backendValidation.isValid) {
    return backendValidation;
  }

  const backendUrlValidation = validateHttpUrl(backendUrl ?? "", "Backend URL");
  if (!backendUrlValidation.isValid) {
    return backendUrlValidation;
  }

  const recaptchaValidation = validateToolTextInput(recaptchaSiteKey ?? "", {
    label: "reCAPTCHA site key",
    required: true,
    maxLength: AIO_RECAPTCHA_SITE_KEY_MAX_LENGTH,
  });

  if (!recaptchaValidation.isValid) {
    return {
      isValid: false,
      message:
        "Captcha configuration is missing. Download submission is disabled.",
    };
  }

  return {
    isValid: true,
    normalized: {
      backendUrl: backendUrl ?? "",
      recaptchaSiteKey: recaptchaSiteKey ?? "",
    },
  };
}
