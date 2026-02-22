import {
  sanitizeText,
  validateToolTextInput,
  type ToolValidationResult,
} from "../validation";
import type { YtdlpToolAction } from "../types";

export const YTDLP_URL_MAX_LENGTH = 2048;
export const YTDLP_BACKEND_URL_MAX_LENGTH = 512;
export const YTDLP_CAPTCHA_TOKEN_MAX_LENGTH = 4096;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

export type YtdlpActionInput = {
  url?: string;
  backendUrl?: string;
  captchaToken?: string;
};

export type YtdlpActionValidationResult =
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

function normalizeYouTubeUrl(url: string): YtdlpActionValidationResult {
  const textValidation = validateToolTextInput(url, {
    label: "URL",
    required: true,
    maxLength: YTDLP_URL_MAX_LENGTH,
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

  const hostname = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(hostname)) {
    return {
      isValid: false,
      message: "Only YouTube video URLs are allowed.",
    };
  }

  if (parsed.searchParams.has("list") || parsed.pathname === "/playlist") {
    return {
      isValid: false,
      message: "Playlists are not allowed.",
    };
  }

  if (hostname === "youtu.be") {
    const videoId = parsed.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
    if (!videoId) {
      return {
        isValid: false,
        message: "Please provide a valid YouTube video URL.",
      };
    }

    return {
      isValid: true,
      normalized: {
        url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      },
    };
  }

  if (parsed.pathname.startsWith("/shorts/")) {
    const shortId = parsed.pathname.replace("/shorts/", "").split("/")[0] ?? "";
    if (!shortId) {
      return {
        isValid: false,
        message: "Please provide a valid YouTube Shorts URL.",
      };
    }

    return {
      isValid: true,
      normalized: {
        url: `https://www.youtube.com/watch?v=${encodeURIComponent(shortId)}`,
      },
    };
  }

  const videoId = parsed.searchParams.get("v")?.trim() ?? "";
  if (!videoId) {
    return {
      isValid: false,
      message: "Please provide a valid YouTube watch URL.",
    };
  }

  return {
    isValid: true,
    normalized: {
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    },
  };
}

export function validateYtdlpActionInput(
  action: YtdlpToolAction,
  input: YtdlpActionInput
): YtdlpActionValidationResult {
  if (action === "clear") {
    return { isValid: true };
  }

  const backendUrl = sanitizeText(input.backendUrl, {
    maxLength: YTDLP_BACKEND_URL_MAX_LENGTH,
    preserveWhitespace: false,
  });

  const backendValidation = validateToolTextInput(backendUrl ?? "", {
    label: "Backend URL",
    required: true,
    maxLength: YTDLP_BACKEND_URL_MAX_LENGTH,
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
      maxLength: YTDLP_CAPTCHA_TOKEN_MAX_LENGTH,
      preserveWhitespace: false,
    });

    const tokenValidation = validateToolTextInput(captchaToken ?? "", {
      label: "Captcha",
      required: true,
      maxLength: YTDLP_CAPTCHA_TOKEN_MAX_LENGTH,
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
      maxLength: YTDLP_URL_MAX_LENGTH,
      preserveWhitespace: false,
    });

    const urlValidation = normalizeYouTubeUrl(url ?? "");
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
