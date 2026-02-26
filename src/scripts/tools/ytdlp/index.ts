import {
  createToolResponseDock,
  type ToolResponseState,
} from "../ui/responseDock";
import { sanitizeText } from "../validation";
import type {
  ToolMountOptions,
  ToolMountUiSlots,
  YtdlpToolOptions,
} from "../types";
import {
  validateYtdlpActionInput,
  validateYtdlpConfigInput,
} from "./validation";

type CaptchaApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: CaptchaApi;
  }
}

const CAPTCHA_VERIFY_PATH = "/api/v1/captcha/verify";
const YTDLP_ENQUEUE_PATH = "/api/v1/ytdlp";
const YTDLP_JOB_PATH = "/api/v1/ytdlp/jobs";
const YTDLP_DOWNLOAD_PATH = "/api/v1/ytdlp/download";
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readStatus(job: Record<string, unknown>): string {
  return (
    sanitizeText(typeof job.status === "string" ? job.status : null, {
      maxLength: 80,
      preserveWhitespace: false,
    }) ?? ""
  ).toLowerCase();
}

export function mountYtdlpTool(
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
): void {
  const ytdlpOptions = options as YtdlpToolOptions | undefined;

  container.innerHTML = `
    <section class="grid gap-6">
      <div class="grid gap-2 relative group/input">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold flex items-center gap-2" for="ytdlp-url-input">
            YouTube URL
          </label>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              id="ytdlp-paste"
              type="button"
              class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
              title="Paste from clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M7 18V2h13v16zm2-2h9V4H9zm-6 6V6h2v14h11v2zm6-6V4z"/></svg>
              <span class="hidden sm:inline">Paste</span>
            </button>
            <button
              id="ytdlp-clear"
              type="button"
              class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
              title="Clear input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linejoin="round" d="m7 6l4 4m0-4l-4 4M5 3.5h9.5v9H5L1.5 8z"/></svg>
              <span class="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
        <input
          id="ytdlp-url-input"
          type="url"
          class="h-11 rounded-xl border border-border/60 bg-muted/5 px-4 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
          placeholder="https://www.youtube.com/watch?v=..."
          autocomplete="off"
          inputmode="url"
        />
        <p class="text-xs opacity-75">Only single YouTube videos are allowed. Playlists are blocked.</p>
      </div>

      <div class="flex gap-3">
        <button
          id="ytdlp-submit"
          type="button"
          class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-accent bg-accent/5 px-6 text-sm font-bold text-accent shadow-sm transition-all hover:bg-accent hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Submit Download
        </button>
      </div>

      <div
        id="ytdlp-captcha-modal"
        aria-hidden="true"
        class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4 backdrop:backdrop-blur-sm"
      >
        <section class="w-full max-w-xl overflow-visible rounded-xl border border-border bg-background p-0 text-foreground shadow-2xl outline-none">
          <div class="flex h-full max-h-full flex-col">
            <div class="sticky top-0 z-10 rounded-t-xl border-b border-border bg-background px-6 py-4">
              <div class="flex items-start justify-between">
                <div class="mr-4">
                  <h2 class="text-xl font-bold text-accent sm:text-2xl">Captcha Verification</h2>
                  <div class="mt-1 text-sm text-foreground/70">Confirm you are human to start download</div>
                </div>

                <button
                  id="ytdlp-dialog-close"
                  type="button"
                  class="rounded-full p-2 transition-colors hover:bg-muted focus:outline-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="flex-1 space-y-4 overflow-visible p-6">
              <div id="ytdlp-captcha-host" class="min-h-20 flex justify-center overflow-visible"></div>
              <button
                id="ytdlp-verify-captcha"
                type="button"
                class="h-10 w-full rounded-lg border border-accent/70 bg-accent/5 px-4 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                Verify and Continue
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;

  const responseHost = slots?.responseHost;
  if (!responseHost) {
    return;
  }

  const inputEl = container.querySelector(
    "#ytdlp-url-input"
  ) as HTMLInputElement | null;
  const pasteBtn = container.querySelector(
    "#ytdlp-paste"
  ) as HTMLButtonElement | null;
  const clearBtn = container.querySelector(
    "#ytdlp-clear"
  ) as HTMLButtonElement | null;
  const submitBtn = container.querySelector(
    "#ytdlp-submit"
  ) as HTMLButtonElement | null;
  const captchaModal = container.querySelector(
    "#ytdlp-captcha-modal"
  ) as HTMLElement | null;
  const closeDialogBtn = container.querySelector(
    "#ytdlp-dialog-close"
  ) as HTMLButtonElement | null;
  const captchaHostEl = container.querySelector(
    "#ytdlp-captcha-host"
  ) as HTMLElement | null;
  const verifyCaptchaBtn = container.querySelector(
    "#ytdlp-verify-captcha"
  ) as HTMLButtonElement | null;

  if (
    !inputEl ||
    !pasteBtn ||
    !clearBtn ||
    !submitBtn ||
    !captchaModal ||
    !closeDialogBtn ||
    !captchaHostEl ||
    !verifyCaptchaBtn
  ) {
    return;
  }

  const toolViewPanel = container.closest(
    "#tool-view-panel"
  ) as HTMLElement | null;

  const responseDock = createToolResponseDock(responseHost, {
    title: "YouTube Downloader Response",
    hiddenOnIdle: true,
    minStateDurationMs: 220,
    onStateChange: state => {
      if (toolViewPanel) {
        toolViewPanel.dataset.responseState = state;
      }
    },
  });

  const configEl = document.querySelector(
    "#tool-captcha-config"
  ) as HTMLElement | null;
  const backendUrl = sanitizeText(configEl?.dataset.ytdlpBackendUrl ?? null, {
    maxLength: 512,
    preserveWhitespace: false,
  });
  const recaptchaSiteKey = sanitizeText(
    configEl?.dataset.recaptchaSiteKey ?? null,
    {
      maxLength: 256,
      preserveWhitespace: false,
    }
  );

  const configValidation = validateYtdlpConfigInput({
    backendUrl,
    recaptchaSiteKey,
  });
  const isCaptchaFeatureEnabled = configValidation.isValid;
  const resolvedBackendUrl = configValidation.isValid
    ? configValidation.normalized.backendUrl
    : undefined;
  const resolvedRecaptchaSiteKey = configValidation.isValid
    ? configValidation.normalized.recaptchaSiteKey
    : undefined;

  const helperButtons = [pasteBtn, clearBtn];
  const gatedButtons = [submitBtn, verifyCaptchaBtn];

  let busy = false;
  let captchaToken = "";
  let captchaWidgetId: number | null = null;
  let hasCaptchaRendered = false;
  let pendingUrl = "";
  let pollTimer: number | null = null;
  let pollAttempts = 0;
  let primaryStage: "submit" | "pending" | "download" = "submit";
  let readyDownloadUrl: string | null = null;

  const setPrimaryStage = (stage: "submit" | "pending" | "download") => {
    primaryStage = stage;

    if (stage === "submit") {
      submitBtn.textContent = "Submit Download";
      submitBtn.classList.remove(
        "bg-green-600",
        "border-green-600",
        "text-white",
        "hover:bg-green-700"
      );
      submitBtn.classList.add(
        "border-accent",
        "bg-accent/5",
        "text-accent",
        "hover:bg-accent",
        "hover:text-white"
      );
      return;
    }

    if (stage === "pending") {
      submitBtn.textContent = "Downloading... Please wait";
      submitBtn.classList.remove(
        "bg-green-600",
        "border-green-600",
        "text-white",
        "hover:bg-green-700"
      );
      submitBtn.classList.add(
        "border-accent",
        "bg-accent/5",
        "text-accent",
        "hover:bg-accent",
        "hover:text-white"
      );
      return;
    }

    submitBtn.textContent = "Save File";
    submitBtn.classList.remove(
      "border-accent",
      "bg-accent/5",
      "text-accent",
      "hover:bg-accent",
      "hover:text-white"
    );
    submitBtn.classList.add(
      "bg-green-600",
      "border-green-600",
      "text-white",
      "hover:bg-green-700"
    );
  };

  const openCaptchaModal = () => {
    captchaModal.classList.remove("hidden");
    captchaModal.classList.add("flex");
    captchaModal.setAttribute("aria-hidden", "false");
  };

  const closeCaptchaModal = () => {
    captchaModal.classList.add("hidden");
    captchaModal.classList.remove("flex");
    captchaModal.setAttribute("aria-hidden", "true");
  };

  const stopPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    pollAttempts = 0;
  };

  const setUiState = (
    state: ToolResponseState,
    message: string,
    setOptions?: { showWhenIdle?: boolean }
  ) => {
    responseDock.setState(state, message, setOptions);

    const isDisabled = state === "disabled";
    helperButtons.forEach(button => {
      button.disabled = busy;
    });
    gatedButtons.forEach(button => {
      button.disabled = isDisabled || busy || !isCaptchaFeatureEnabled;
    });

    if (primaryStage === "pending") {
      submitBtn.disabled = true;
    }

    verifyCaptchaBtn.disabled =
      isDisabled ||
      busy ||
      !isCaptchaFeatureEnabled ||
      captchaToken.trim().length === 0;
    inputEl.toggleAttribute("readonly", isDisabled && isCaptchaFeatureEnabled);
  };

  const waitForCaptchaApi = (): Promise<boolean> => {
    return new Promise(resolve => {
      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        if (window.grecaptcha?.render) {
          window.clearInterval(timer);
          resolve(true);
          return;
        }

        if (Date.now() - startedAt > 12000) {
          window.clearInterval(timer);
          resolve(false);
        }
      }, 180);
    });
  };

  const openCaptchaDialog = async () => {
    if (
      !isCaptchaFeatureEnabled ||
      !resolvedRecaptchaSiteKey ||
      !resolvedBackendUrl
    ) {
      setUiState("disabled", "Verification service is unavailable right now.");
      return;
    }

    openCaptchaModal();

    if (hasCaptchaRendered) {
      if (window.grecaptcha && captchaWidgetId !== null) {
        window.grecaptcha.reset(captchaWidgetId);
      }
      captchaToken = "";
      verifyCaptchaBtn.disabled = true;
      setUiState("idle", "Solve captcha and verify to continue.", {
        showWhenIdle: true,
      });
      return;
    }

    setUiState("pending", "Loading reCAPTCHA widget...");
    const loaded = await waitForCaptchaApi();
    if (!loaded || !window.grecaptcha) {
      setUiState("fail", "Verification failed to load. Refresh and try again.");
      return;
    }

    window.grecaptcha.ready(() => {
      if (!window.grecaptcha) {
        setUiState("fail", "Verification is unavailable.");
        return;
      }

      captchaWidgetId = window.grecaptcha.render(captchaHostEl, {
        sitekey: resolvedRecaptchaSiteKey,
        theme:
          document.firstElementChild?.getAttribute("data-theme") === "dark"
            ? "dark"
            : "light",
        callback: token => {
          captchaToken = token;
          verifyCaptchaBtn.disabled = false;
          setUiState("idle", "Captcha solved. Click Verify and Continue.", {
            showWhenIdle: true,
          });
        },
        "expired-callback": () => {
          captchaToken = "";
          verifyCaptchaBtn.disabled = true;
          setUiState("fail", "Captcha expired. Please solve it again.");
        },
        "error-callback": () => {
          captchaToken = "";
          verifyCaptchaBtn.disabled = true;
          setUiState("fail", "Captcha error. Please try again.");
        },
      });

      hasCaptchaRendered = true;
      setUiState("idle", "Solve captcha and verify to continue.", {
        showWhenIdle: true,
      });
    });
  };

  const verifyCaptchaAndQueue = async () => {
    const captchaValidation = validateYtdlpActionInput("verify-captcha", {
      backendUrl: resolvedBackendUrl,
      captchaToken,
    });

    if (!captchaValidation.isValid) {
      setUiState("fail", captchaValidation.message);
      return;
    }

    const urlValidation = validateYtdlpActionInput("enqueue", {
      backendUrl: resolvedBackendUrl,
      url: pendingUrl,
    });

    if (!urlValidation.isValid) {
      setUiState("fail", urlValidation.message);
      return;
    }

    busy = true;
    setUiState("pending", "Verifying...");

    try {
      const captchaResponse = await fetch(
        `${normalizeBaseUrl(captchaValidation.normalized?.backendUrl ?? "")}${CAPTCHA_VERIFY_PATH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            captcha: captchaValidation.normalized?.captchaToken,
          }),
        }
      );

      const captchaPayload = asObject(await parseJsonSafe(captchaResponse));
      if (!captchaResponse.ok || captchaPayload?.success !== true) {
        if (window.grecaptcha && captchaWidgetId !== null) {
          window.grecaptcha.reset(captchaWidgetId);
        }
        captchaToken = "";
        busy = false;
        setUiState("fail", "Verification failed. Please try again.");
        return;
      }

      setUiState("pending", "Starting download...");

      const enqueueResponse = await fetch(
        `${normalizeBaseUrl(urlValidation.normalized?.backendUrl ?? "")}${YTDLP_ENQUEUE_PATH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: urlValidation.normalized?.url,
            quality: "best",
            format: "mp4",
          }),
        }
      );

      const payload = asObject(await parseJsonSafe(enqueueResponse));
      const job = asObject(payload?.job);
      const jobId = sanitizeText(typeof job?.id === "string" ? job.id : null, {
        maxLength: 128,
        preserveWhitespace: false,
      });

      if (enqueueResponse.status !== 202 || !jobId) {
        busy = false;
        setUiState("fail", "Could not start download. Please try again.");
        return;
      }

      inputEl.value = urlValidation.normalized?.url ?? inputEl.value;
      closeCaptchaModal();
      if (window.grecaptcha && captchaWidgetId !== null) {
        window.grecaptcha.reset(captchaWidgetId);
      }
      captchaToken = "";
      readyDownloadUrl = null;

      busy = false;
      setPrimaryStage("pending");
      setUiState("pending", "Downloading... Please wait.");

      stopPolling();
      pollTimer = window.setInterval(() => {
        void (async () => {
          if (!resolvedBackendUrl) {
            stopPolling();
            setPrimaryStage("submit");
            setUiState("fail", "Download service is unavailable.");
            return;
          }

          pollAttempts += 1;
          if (pollAttempts > MAX_POLL_ATTEMPTS) {
            stopPolling();
            setPrimaryStage("submit");
            setUiState(
              "fail",
              "Download is taking longer than expected. Please try again."
            );
            return;
          }

          try {
            const response = await fetch(
              `${normalizeBaseUrl(resolvedBackendUrl)}/${YTDLP_JOB_PATH.replace(/^\//, "")}/${encodeURIComponent(jobId)}`,
              { method: "GET" }
            );

            const statusPayload = asObject(await parseJsonSafe(response));
            const statusJob = asObject(statusPayload?.job);

            if (!response.ok || !statusJob) {
              return;
            }

            const status = readStatus(statusJob);

            if (["failed", "error", "cancelled", "canceled"].includes(status)) {
              stopPolling();
              setPrimaryStage("submit");
              setUiState("fail", "Download failed. Try another URL.");
              return;
            }

            if (
              ["completed", "complete", "done", "finished", "success"].includes(
                status
              )
            ) {
              stopPolling();
              const downloadUrl = `${normalizeBaseUrl(resolvedBackendUrl)}/${YTDLP_DOWNLOAD_PATH.replace(/^\//, "")}/${encodeURIComponent(jobId)}`;
              readyDownloadUrl = downloadUrl;
              setPrimaryStage("download");
              setUiState("success", "Download is ready.");
            }
          } catch {
            // Keep polling to tolerate transient errors.
          }
        })();
      }, POLL_INTERVAL_MS);
    } catch {
      busy = false;
      setPrimaryStage("submit");
      setUiState("fail", "Unable to start download right now.");
    }
  };

  const clearForm = () => {
    inputEl.value = "";
    pendingUrl = "";
    stopPolling();
    setPrimaryStage("submit");
    readyDownloadUrl = null;

    if (window.grecaptcha && captchaWidgetId !== null) {
      window.grecaptcha.reset(captchaWidgetId);
    }

    captchaToken = "";
    verifyCaptchaBtn.disabled = true;
    setUiState("success", "Fields cleared.");
  };

  submitBtn.addEventListener("click", () => {
    if (primaryStage === "pending") {
      return;
    }

    if (primaryStage === "download" && readyDownloadUrl) {
      window.open(readyDownloadUrl, "_blank", "noopener,noreferrer");
      setUiState("success", "Download started.");
      return;
    }

    const urlValidation = validateYtdlpActionInput("enqueue", {
      backendUrl: resolvedBackendUrl,
      url: inputEl.value,
    });

    if (!urlValidation.isValid) {
      if (!isCaptchaFeatureEnabled) {
        setUiState("disabled", configValidation.message);
        return;
      }

      setUiState("fail", urlValidation.message);
      return;
    }

    pendingUrl = urlValidation.normalized?.url ?? inputEl.value;
    readyDownloadUrl = null;
    setPrimaryStage("submit");
    void openCaptchaDialog();
  });

  pasteBtn.addEventListener("click", async () => {
    if (busy) {
      return;
    }

    if (!navigator.clipboard || !window.isSecureContext) {
      inputEl.focus();
      setUiState(
        "fail",
        "Clipboard access is unavailable. Focused URL field—press Ctrl+V to paste."
      );
      return;
    }

    busy = true;
    setUiState("pending", "Reading from clipboard...");

    try {
      const text = await navigator.clipboard.readText();
      inputEl.value = text;
      busy = false;
      setUiState("success", "Pasted from clipboard.");
    } catch {
      busy = false;
      setUiState("fail", "Clipboard read failed.");
    }
  });

  clearBtn.addEventListener("click", () => {
    clearForm();
  });

  verifyCaptchaBtn.addEventListener("click", () => {
    void verifyCaptchaAndQueue();
  });

  closeDialogBtn.addEventListener("click", () => {
    closeCaptchaModal();
  });

  captchaModal.addEventListener("click", event => {
    if (event.target === captchaModal) {
      closeCaptchaModal();
    }
  });

  if (typeof ytdlpOptions?.url === "string") {
    inputEl.value = ytdlpOptions.url;
  }

  setPrimaryStage("submit");

  if (!isCaptchaFeatureEnabled) {
    setUiState("disabled", configValidation.message);
    return;
  }

  setUiState("idle", "Paste a YouTube URL and click Submit Download.", {
    showWhenIdle: true,
  });
}
