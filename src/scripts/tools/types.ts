export type Base64ToolAction = "encode" | "decode" | "clear";

export type Base64ToolOptions = {
  input?: string;
  output?: string;
  action?: Base64ToolAction;
};

export type YtdlpToolAction = "verify-captcha" | "enqueue" | "clear";

export type YtdlpToolOptions = {
  url?: string;
};

export type ToolMountOptions = Base64ToolOptions | YtdlpToolOptions | undefined;

export type ToolMountUiSlots = {
  responseHost?: HTMLElement | null;
};

export type ToolTeardown = () => void;

export type ToolMount = (
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
) => void | ToolTeardown;
