import { sanitizeText } from "@/scripts/tools/validation";
import type {
  ToolMountOptions,
  ToolMountUiSlots,
  ToolTeardown,
  AioToolOptions,
} from "@/scripts/tools/types";
import { validateAioConfigInput } from "./validation";
import { AioApiClient } from "./apiClient";
import { CaptchaManager } from "@/utils/captchaManager";
import { AioToolController } from "./controller";
import { resolveAioDomRefs } from "./dom";
import { AIO_TOOL_TEMPLATE } from "./template";
import { createCaptchaDialog } from "@/scripts/tools/ui/captchaDialog";

export function mountAioTool(
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
): ToolTeardown {
  const aioOptions = options as AioToolOptions | undefined;

  container.innerHTML = AIO_TOOL_TEMPLATE;

  const responseHost = slots?.responseHost;
  if (!responseHost) {
    return () => {};
  }

  const refs = resolveAioDomRefs(container);
  if (!refs) {
    return () => {};
  }

  const captchaDialog = createCaptchaDialog(container, {
    idPrefix: "aio",
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
  const backendUrl = sanitizeText(configEl?.dataset.aioBackendUrl ?? null, {
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

  const configValidation = validateAioConfigInput({
    backendUrl,
    recaptchaSiteKey,
  });

  const isCaptchaFeatureEnabled = configValidation.isValid;
  const apiClient = configValidation.isValid
    ? new AioApiClient(configValidation.normalized.backendUrl)
    : undefined;

  let controller: AioToolController | null = null;

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

  controller = new AioToolController({
    refs,
    responseHost,
    toolViewPanel,
    options: aioOptions,
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
