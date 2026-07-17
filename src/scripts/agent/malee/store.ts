export interface ProductCard {
  id: string;
  name: string;
  price_lkr: number;
  image_url: string | null;
  in_stock: boolean;
}

export interface ProductDetailView {
  id: string;
  name: string;
  description: string | null;
  price_lkr: number;
  image_urls: string[];
  in_stock: boolean;
  is_perishable: boolean;
  vendor_name: string | null;
}

export interface CartItem {
  product_id: string;
  name: string;
  price_lkr: number;
  quantity: number;
  image_url: string | null;
}

export interface CartView {
  items: CartItem[];
  subtotal_lkr: number;
  item_count: number;
}

export interface CheckoutDraft {
  recipient_name: string | null;
  delivery_city: string | null;
  delivery_date: string | null;
  sender_name: string | null;
  gift_message: string | null;
}

export interface SessionView {
  session_id: string;
  language_mode: string;
  cart: CartView;
  checkout_draft: CheckoutDraft;
  last_product_ids: string[];
}

export interface TrackingTimeline {
  timestamp: string;
  description: string;
}

export interface TrackingResult {
  status: string;
  recipient: string;
  items: string[];
  timeline: TrackingTimeline[];
}

export interface OrderHistoryItem {
  order_ref: string;
  date: string;
  items: string[];
  total_lkr: number;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  zip_code: string | null;
  currency: string | null;
  preferred_language: string | null;
  favorite_categories: string[];
  memories: string[];
  order_history: OrderHistoryItem[];
}

export interface SessionProfileResponse {
  session_id: string;
  profile: UserProfile;
}

export interface SseLogEntry {
  id: number;
  timestamp: Date;
  type: string;
  payload: unknown;
}

export interface CheckoutProgressState {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  missingFields: string[];
}

export interface MaleeDebugStore {
  sessionId: string | null;
  phase: string;
  languageMode: "auto" | "english" | "sinhala" | "mixed";
  cart: CartView;
  checkoutDraft: CheckoutDraft;
  checkoutProgress: CheckoutProgressState | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  lastActivity: Date | null;
  sseEventLog: SseLogEntry[];
  profile: UserProfile | null;
}

type StoreListener = (store: MaleeDebugStore) => void;

const getInitialState = (): MaleeDebugStore => ({
  sessionId: null,
  phase: "init",
  languageMode: "auto",
  cart: {
    items: [],
    subtotal_lkr: 0,
    item_count: 0,
  },
  checkoutDraft: {
    recipient_name: null,
    delivery_city: null,
    delivery_date: null,
    sender_name: null,
    gift_message: null,
  },
  checkoutProgress: null,
  connectionStatus: "disconnected",
  lastActivity: null,
  sseEventLog: [],
  profile: null,
});

export class MaleeStore {
  private state: MaleeDebugStore;
  private listeners: Set<StoreListener>;
  private logCounter: number = 0;

  constructor() {
    this.state = getInitialState();
    this.listeners = new Set();
  }

  get(): Readonly<MaleeDebugStore> {
    return this.state;
  }

  update(partial: Partial<MaleeDebugStore>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(fn: StoreListener): () => void {
    this.listeners.add(fn);
    fn(this.state); // Immediate call with current state
    return () => {
      this.listeners.delete(fn);
    };
  }

  appendLog(type: string, payload: unknown): void {
    const entry: SseLogEntry = {
      id: ++this.logCounter,
      timestamp: new Date(),
      type,
      payload,
    };

    const newLog = [entry, ...this.state.sseEventLog];
    if (newLog.length > 200) {
      newLog.length = 200;
    }

    this.update({ sseEventLog: newLog });
  }

  reset(): void {
    const currentLang = this.state.languageMode;
    this.state = {
      ...getInitialState(),
      languageMode: currentLang,
    };
    this.logCounter = 0;
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const maleeStore = new MaleeStore();
