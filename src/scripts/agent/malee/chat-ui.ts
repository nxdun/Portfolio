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
    updateGravityDock(state, root);
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

function updateGravityDock(state: any, root: HTMLElement) {
  const dock = root.querySelector('.gravity-dock-placeholder') as HTMLElement;
  if (!dock) return;

  if (state.checkoutProgress) {
    dock.classList.remove('is-empty');
    dock.classList.add('has-items');
    
    const { currentStep, totalSteps, stepName, missingFields } = state.checkoutProgress;
    const segments = Array.from({length: totalSteps}).map((_, i) => {
       if (i + 1 < currentStep) return `<div class="h-1.5 flex-grow rounded-full bg-accent"></div>`;
       if (i + 1 === currentStep) return `<div class="h-1.5 flex-grow rounded-full bg-accent shadow-[0_0_12px_rgba(var(--color-accent),0.6)] animate-pulse"></div>`;
       return `<div class="h-1.5 flex-grow rounded-full bg-white/10"></div>`;
    }).join("");

    dock.innerHTML = `
      <div class="flex flex-col w-full h-full min-h-[240px] p-6 relative overflow-hidden group/full bg-background/70 backdrop-blur-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-[28px] animate-flip-in-y">
         <div class="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-[40px] pointer-events-none opacity-50"></div>

         <div class="flex items-center justify-between mb-5 relative z-10">
            <h4 class="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-accent/90">Checkout Progress</h4>
            <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">${currentStep} / ${totalSteps}</span>
         </div>

         <div class="flex items-center gap-2 mb-6 relative z-10">
            ${segments}
         </div>

         <div class="flex flex-col gap-2 relative z-10 flex-grow">
            <div class="flex items-center gap-3 mb-4">
               <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               </div>
               <span class="text-lg font-light tracking-wide text-white/95">${stepName}</span>
            </div>
            
            <button class="mt-auto self-center flex items-center gap-2 px-4 py-2 rounded-xl
                          bg-red-500/10 border border-red-500/20
                          text-red-400 hover:text-white
                          hover:bg-red-500/30 hover:border-red-400/40
                          transition-all duration-200 active:scale-95 shadow-sm"
                    onclick="this.dispatchEvent(new CustomEvent('action:cancel_checkout', { bubbles: true }))">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
              <span class="text-xs font-semibold tracking-wide">Cancel Checkout</span>
            </button>
         </div>
      </div>
    `;
    return;
  }

  const cart = state.cart;
  if (cart && cart.item_count > 0) {
    dock.classList.remove('is-empty');
    dock.classList.add('has-items');
    dock.innerHTML = `
      <div class="flex flex-col w-full h-full p-6 relative overflow-hidden group/full">
        <!-- Abstract Glow -->
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-[40px] opacity-50 pointer-events-none transition-opacity duration-[800ms] group-hover/full:opacity-100"></div>
        
        <button class="relative overflow-hidden w-full bg-white text-black rounded-[20px] py-3.5 mb-4 font-semibold tracking-wide hover:scale-[1.02] shadow-[0_15px_40px_rgba(255,255,255,0.2)] transition-all duration-[600ms] group/btn z-10 shrink-0" onclick="this.dispatchEvent(new CustomEvent('action:checkout', { bubbles: true }))">
          <span class="relative z-10 flex items-center justify-center gap-2">
             Checkout Now
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </span>
        </button>

        <!-- Cart Items List -->
        <div class="flex-grow overflow-y-auto max-h-[200px] flex flex-col gap-2.5 relative z-10 w-full mb-3" style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;">
          ${cart.items ? cart.items.map((item: any) => `
            <div class="group/item relative rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden shrink-0 hover:border-white/20 transition-colors duration-300">
               <!-- Content Row -->
               <div class="flex items-center justify-between px-4 py-3.5">
                 <div class="flex flex-col min-w-0 flex-1 pr-3">
                   <span class="text-sm text-white font-semibold line-clamp-1 leading-snug">${item.name}</span>
                   <div class="flex items-center gap-2 mt-1">
                     <span class="text-xs text-white/40 font-mono">Qty: ${item.quantity}</span>
                     <span class="w-1 h-1 rounded-full bg-white/20"></span>
                     <span class="text-xs font-mono text-white/60">LKR ${(item.price_lkr * item.quantity).toLocaleString()}</span>
                   </div>
                 </div>
               </div>

               <!-- Delete Overlay: full-width gradient slide-up from bottom half -->
               <div class="absolute inset-0 flex items-center justify-end
                           opacity-0 group-hover/item:opacity-100
                           transition-all duration-300 ease-out z-20 pointer-events-none group-hover/item:pointer-events-auto"
                    style="background: linear-gradient(to left, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.88) 55%, transparent 100%);">
                 <button class="flex items-center gap-2 mr-3 px-4 py-2 rounded-xl
                               bg-red-500/20 border border-red-500/30
                               text-red-400 hover:text-white
                               hover:bg-red-500/60 hover:border-red-400/50
                               transition-all duration-200 active:scale-95"
                         onclick="this.dispatchEvent(new CustomEvent('action:remove_from_cart', { bubbles: true, detail: { product_id: '${item.product_id}' } }))">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                   <span class="text-sm font-semibold tracking-wide">Remove</span>
                 </button>
               </div>
            </div>
          `).join('') : '<div class="text-white/50 text-xs italic text-center w-full mt-4">Loading items...</div>'}
        </div>

        <div class="flex justify-between items-center w-full border-t border-white/10 pt-4 mt-auto relative z-10 transition-all duration-[600ms] shrink-0">
          <div class="flex flex-col gap-1">
             <span class="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/50">Your Cart</span>
             <span class="text-xl font-light tracking-wide text-white/95 drop-shadow-sm">${cart.item_count} Items</span>
          </div>
          <div class="flex items-center justify-center px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm backdrop-blur-md">
             <span class="text-sm font-mono font-bold tracking-widest text-white">LKR ${cart.subtotal_lkr.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    dock.classList.add('is-empty');
    dock.classList.remove('has-items');
    dock.innerHTML = `
      <div class="flex flex-col items-center justify-start text-white/50 w-full h-full pt-4 pb-4 px-4 relative overflow-hidden group/empty">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        <span class="text-[11px] font-mono uppercase tracking-[0.2em] font-bold opacity-60 mb-2 relative z-10">Cart is Empty</span>
        <img src="${imgEmptyCart}" alt="Empty Cart" class="w-32 h-32 object-contain mt-auto mb-2 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-40 group-hover/empty:opacity-80 transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/empty:-translate-y-3 group-hover/empty:scale-[1.15] relative z-10" />
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

  const send = async (explicitText?: string, silent: boolean = false) => {
    const text = explicitText !== undefined ? explicitText : input.value.trim();
    if (!text || !client || !renderer) return;

    if (explicitText === undefined) {
      input.value = "";
      input.style.height = "auto";
    }
    
    if (activeStream) {
      activeStream.abort();
    }

    if (!silent) {
      renderer.appendUserMessage(text);
    }
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

  sendBtn.addEventListener('click', () => send());
  
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

  // Allow other components to trigger a send directly (e.g. silently from a form)
  root.addEventListener("action:send_chat", (e: Event) => {
    const ev = e as CustomEvent;
    send(ev.detail.text, ev.detail.silent);
  });
}

function setupEventDelegation(root: HTMLElement) {
  // Global double-click guard for all buttons
  root.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button, .suggestion-pill');
    if (target) {
      if (target.hasAttribute('data-clicked')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      target.setAttribute('data-clicked', 'true');
      setTimeout(() => target.removeAttribute('data-clicked'), 1000);
    }
  }, true);

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
      
      if (res && res.cart) {
        maleeStore.update({ cart: res.cart });
      } else if (res && res.session && res.session.cart) {
        maleeStore.update({ cart: res.session.cart });
      } else {
        // Fallback: Manually sync the entire session from the backend to guarantee correct state
        const session = await client.getSession(sid);
        if (session && session.cart) {
          maleeStore.update({ cart: session.cart });
        }
      }
    } catch (err: any) {
      renderer.appendSystemNotice(`Add to cart failed: ${err.message}`, 'error');
    }
  });

  root.addEventListener("action:remove_from_cart", async (e: Event) => {
    const ev = e as CustomEvent;
    const { product_id } = ev.detail;
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;

    try {
      const res = await client.sendAction({
        session_id: sid,
        action: "remove_from_cart",
        payload: { product_id }
      });

      if (res && res.cart) {
        maleeStore.update({ cart: res.cart });
      } else if (res && res.session && res.session.cart) {
        maleeStore.update({ cart: res.session.cart });
      } else {
        const session = await client.getSession(sid);
        if (session && session.cart) {
          maleeStore.update({ cart: session.cart });
        }
      }
    } catch (err: any) {
      renderer.appendSystemNotice(`Remove from cart failed: ${err.message}`, 'error');
    }
  });

  root.addEventListener("action:checkout", () => {
    root.dispatchEvent(new CustomEvent("action:send_chat", { bubbles: true, detail: { text: "I want to checkout my cart", silent: true } }));
  });

  root.addEventListener("action:cancel_checkout", () => {
    // Hide the checkout progress dock and return to cart
    maleeStore.update({ checkoutProgress: null });
    root.dispatchEvent(new CustomEvent("action:send_chat", { bubbles: true, detail: { text: "I want to cancel the order", silent: true } }));
  });

  root.addEventListener("action:send_message", (e: Event) => {
    const ev = e as CustomEvent;
    const text = ev.detail.text;
    const input = root.querySelector('.chat-input') as HTMLTextAreaElement;
    const sendBtn = root.querySelector('.send-btn') as HTMLButtonElement;
    if (input && sendBtn && !input.disabled) {
      input.value = text;
      sendBtn.click();
    }
  });

  root.addEventListener("action:set_city", async (e: Event) => {
    const ev = e as CustomEvent;
    const city = ev.detail.city;
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    
    try {
      renderer.appendUserMessage(`Set city to ${city}`);
      const res = await client.sendAction({
        session_id: sid,
        action: "set_delivery_city",
        payload: { city }
      });
      
      if (res && res.session) {
        maleeStore.update({ checkoutDraft: res.session.checkout_draft });
      } else {
        const session = await client.getSession(sid);
        if (session && session.checkout_draft) {
          maleeStore.update({ checkoutDraft: session.checkout_draft });
        }
      }
    } catch (err: any) {
      renderer.appendSystemNotice(`Set city failed: ${err.message}`, 'error');
    }
  });
}
