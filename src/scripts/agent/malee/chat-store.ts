import { maleeStore } from "./store";

export interface ChatUIState {
  dockExpanded: boolean;
  isStreaming: boolean;
  userScrolledAway: boolean;
  showWelcome: boolean;
  menuOpen: boolean;
}

const initialUIState: ChatUIState = {
  dockExpanded: false,
  isStreaming: false,
  userScrolledAway: false,
  showWelcome: true,
  menuOpen: false,
};

type UIListener = (state: ChatUIState) => void;

class ChatUIStore {
  private state: ChatUIState = { ...initialUIState };
  private listeners: Set<UIListener> = new Set();

  get(): Readonly<ChatUIState> {
    return this.state;
  }

  update(partial: Partial<ChatUIState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(fn: UIListener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    for (const listener of this.listeners) listener(this.state);
  }
}

export const chatUIStore = new ChatUIStore();
export { maleeStore };
