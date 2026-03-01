import { sanitizeText } from "../validation";
import type {
  ToolMountOptions,
  ToolMountUiSlots,
  ToolTeardown,
  YtdlpToolOptions,
} from "../types";
import { validateYtdlpConfigInput } from "./validation";
import { YtdlpApiClient } from "./apiClient";
import { CaptchaManager } from "../../../utils/captchaManager";
import { YtdlpToolController } from "./controller";
import { resolveYtdlpDomRefs } from "./dom";
import { YTDLP_TOOL_TEMPLATE } from "./template";
import { createCaptchaDialog } from "../ui/captchaDialog";

export function mountYtdlpTool(
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
): ToolTeardown {
  const ytdlpOptions = options as YtdlpToolOptions | undefined;

  container.innerHTML = YTDLP_TOOL_TEMPLATE;

  const responseHost = slots?.responseHost;
  if (!responseHost) {
    return () => {};
  }

  const refs = resolveYtdlpDomRefs(container);
  if (!refs) {
    return () => {};
  }

  const captchaDialog = createCaptchaDialog(container, {
    idPrefix: "ytdlp",
    labels: {
      title: "Captcha Verification",
      description: "Confirm you are human to start download",
      verifyButtonText: "Verify and Continue",
    },
  });

  if (!captchaDialog) {
    return () => {};
  }

  const toolViewPanel = container.closest(
    "#tool-view-panel"
  ) as HTMLElement | null;

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
  const apiClient = configValidation.isValid
    ? new YtdlpApiClient(configValidation.normalized.backendUrl)
    : undefined;

  let controller: YtdlpToolController | null = null;

  const captchaManager = configValidation.isValid
    ? new CaptchaManager({
        host: captchaDialog.refs.captchaHostEl,
        siteKey: configValidation.normalized.recaptchaSiteKey,
        onSolved: () => {
          controller?.handleCaptchaSolved();
        },
        onExpired: () => {
          controller?.handleCaptchaExpired();
        },
        onError: () => {
          controller?.handleCaptchaError();
        },
      })
    : undefined;

  controller = new YtdlpToolController({
    refs,
    responseHost,
    toolViewPanel,
    options: ytdlpOptions,
    isCaptchaFeatureEnabled,
    disabledReason: configValidation.isValid
      ? "Verification service is unavailable right now."
      : configValidation.message,
    backendUrl: configValidation.isValid
      ? configValidation.normalized.backendUrl
      : undefined,
    apiClient,
    captchaManager,
    captchaDialog,
  });

  return controller.init();
}
