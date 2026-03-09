import type {
  Base64ToolOptions,
  ToolMountOptions,
  ToolMountUiSlots,
  ToolTeardown,
} from "../types";
import { BASE64_TOOL_TEMPLATE } from "./template";
import { resolveBase64DomRefs } from "./dom";
import { Base64ToolController } from "./controller";

export function mountBase64Tool(
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
): ToolTeardown {
  const base64Options = options as Base64ToolOptions | undefined;

  container.innerHTML = BASE64_TOOL_TEMPLATE;

  const responseHost = slots?.responseHost;
  if (!responseHost) {
    return () => {};
  }

  const refs = resolveBase64DomRefs(container);
  if (!refs) {
    return () => {};
  }

  const toolViewPanel = container.closest(
    "#tool-view-panel"
  ) as HTMLElement | null;

  const controller = new Base64ToolController({
    refs,
    responseHost,
    toolViewPanel,
    options: base64Options,
  });

  return controller.init();
}
