export type Base64ToolAction = "encode" | "decode" | "clear";

export type Base64ToolOptions = {
  input?: string;
  output?: string;
  action?: Base64ToolAction;
};

export type ToolMountOptions = Base64ToolOptions | undefined;

export type ToolMountUiSlots = {
  responseHost?: HTMLElement | null;
};

export type ToolMount = (
  container: HTMLElement,
  options?: ToolMountOptions,
  slots?: ToolMountUiSlots
) => void;
