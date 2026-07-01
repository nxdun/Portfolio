import { MaleeClient } from "./client";
import { maleeStore, chatUIStore } from "./chat-store";
import { ChatRenderer } from "./chat-renderer";

import imgEmptyCart from "../../../assets/malee/empty-cart-graphic.png?url";

let activeStream: AbortController | null = null;
let client: MaleeClient | null = null;
let renderer: ChatRenderer | null = null;

export function initMaleeChatUI(): void {
  const root = document.getElementById("malee-chat-root");
  if (!root) return;

  const apiUrl = import.meta.env.PUBLIC_MALEE_API_URL;
  const apiKey = import.meta.env.PUBLIC_MALEE_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("Malee API URL or Key is missing.");
    return;
  }

  client = new MaleeClient({ baseUrl: apiUrl, apiKey });
  renderer = new ChatRenderer(root, maleeStore);

  setupInputHandlers(root);
  setupEventDelegation(root);
  setupStoreSubscriptions(root);
}

function setupStoreSubscriptions(root: HTMLElement) {
  // Core state sync
  maleeStore.subscribe(state => {
    updateStatusIndicator(state.connectionStatus);
    updateGravityDock(state.cart, root);
  });
}

function updateStatusIndicator(status: string) {
  const dot = document.querySelector('.connection-dot') as HTMLElement;
  const text = document.querySelector('.connection-text') as HTMLElement;
  if (!dot || !text) return;

  dot.style.backgroundColor = status === 'connected' ? '#10b981' : (status === 'connecting' ? '#f59e0b' : '#ef4444');
  dot.style.animation = status === 'connected' ? 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none';
  text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

function updateGravityDock(cart: any, root: HTMLElement) {
  const dock = root.querySelector('.gravity-dock-placeholder') as HTMLElement;
  if (!dock) return;

  if (cart && cart.items && cart.items.length > 0) {
    dock.innerHTML = `
      <div class="flex flex-col w-full h-full p-6 relative overflow-hidden group/full">
        <!-- Abstract Glow -->
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-[40px] opacity-50 pointer-events-none transition-opacity duration-[800ms] group-hover/full:opacity-100"></div>
        
        <div class="flex justify-between items-center w-full border-b border-white/10 pb-4 mb-5 relative z-10">
          <div class="flex flex-col gap-1">
             <span class="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/50">Your Cart</span>
             <span class="text-xl font-light tracking-wide text-white/95 drop-shadow-sm">${cart.item_count} Items</span>
          </div>
          <div class="flex items-center justify-center px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm backdrop-blur-md">
             <span class="text-sm font-mono font-bold tracking-widest text-white">LKR ${cart.subtotal_lkr.toLocaleString()}</span>
          </div>
        </div>
        
        <button class="relative overflow-hidden w-full bg-white text-black rounded-[20px] py-4 mt-auto font-semibold tracking-wide hover:scale-[1.02] shadow-[0_15px_40px_rgba(255,255,255,0.2)] transition-all duration-[600ms] group/btn z-10" onclick="this.dispatchEvent(new CustomEvent('action:checkout', { bubbles: true }))">
          <span class="relative z-10 flex items-center justify-center gap-2">
             Checkout Now
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </span>
        </button>
      </div>
    `;
  } else {
    dock.innerHTML = `
      <div class="flex flex-col items-center justify-center text-white/50 w-full h-full p-4 relative overflow-hidden group/empty">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        <img src="${imgEmptyCart}" alt="Empty Cart" class="w-32 h-32 object-contain mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-40 group-hover/empty:opacity-80 transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/empty:-translate-y-3 group-hover/empty:scale-[1.15]" />
        <span class="text-[11px] font-mono uppercase tracking-[0.2em] font-bold opacity-60">Cart is Empty</span>
      </div>
    `;
  }
}

function setupInputHandlers(root: HTMLElement) {
  const input = root.querySelector('.chat-input') as HTMLTextAreaElement;
  const sendBtn = root.querySelector('.send-btn') as HTMLButtonElement;
  const langToggle = root.querySelector('.lang-toggle') as HTMLButtonElement;

  if (!input || !sendBtn) return;

  let currentLang = 'english';
  langToggle?.addEventListener('click', () => {
    if (currentLang === 'english') {
       currentLang = 'sinhala';
       langToggle.textContent = 'SI';
    } else if (currentLang === 'sinhala') {
       currentLang = 'auto';
       langToggle.textContent = 'AU';
    } else {
       currentLang = 'english';
       langToggle.textContent = 'EN';
    }
    maleeStore.update({ languageMode: currentLang as any });
  });

  const send = async () => {
    const text = input.value.trim();
    if (!text || !client || !renderer) return;

    input.value = "";
    input.style.height = "auto";
    
    if (activeStream) {
      activeStream.abort();
    }

    renderer.appendUserMessage(text);
    maleeStore.update({ connectionStatus: "connecting" });

    try {
      activeStream = await client.streamChat(
        {
          message: text,
          session_id: maleeStore.get().sessionId,
          language_mode: maleeStore.get().languageMode
        },
        (event) => {
          maleeStore.update({ connectionStatus: "connected", lastActivity: new Date() });
          renderer!.handleEvent(event);
        },
        () => {
          maleeStore.update({ connectionStatus: "connected" });
          input.focus();
          activeStream = null;
        },
        (err) => {
          maleeStore.update({ connectionStatus: "error" });
          renderer!.handleEvent({ type: "error", message: err.message });
          activeStream = null;
        }
      );
    } catch (err) {
      // Ignored
    }
  };

  sendBtn.addEventListener('click', send);
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });

  // Suggestion pills
  root.querySelectorAll('.suggestion-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      input.value = pill.textContent?.replace(/[^\w\s]/g, '').trim() || "";
      send();
    });
  });
}

function setupEventDelegation(root: HTMLElement) {
  root.addEventListener("action:add_to_cart", async (e: Event) => {
    const ev = e as CustomEvent;
    const { product_id, name, price_lkr, image_url } = ev.detail;
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    
    try {
      const res = await client.sendAction({
        session_id: sid,
        action: "add_to_cart",
        payload: { product_id, name, price_lkr, image_url, quantity: 1 }
      });
      if (res.cart) maleeStore.update({ cart: res.cart });
    } catch (err: any) {
      renderer.appendSystemNotice(`Add to cart failed: ${err.message}`, 'error');
    }
  });

  root.addEventListener("action:checkout", () => {
    const input = root.querySelector('.chat-input') as HTMLTextAreaElement;
    const sendBtn = root.querySelector('.send-btn') as HTMLButtonElement;
    if (input && sendBtn) {
      input.value = "I want to checkout";
      sendBtn.click();
    }
  });
}
