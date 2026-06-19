import { MaleeClient } from "./client";
import { maleeStore } from "./store";
import { MaleeRenderer } from "./renderer";

let activeStream: AbortController | null = null;
let client: MaleeClient | null = null;
let renderer: MaleeRenderer | null = null;

export function initMaleeDebug(): void {
  const root = document.getElementById("malee-debug-root");
  if (!root) return;

  const apiUrl = import.meta.env.PUBLIC_MALEE_API_URL;
  const apiKey = import.meta.env.PUBLIC_MALEE_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("Malee Debug UI requires PUBLIC_MALEE_API_URL and PUBLIC_MALEE_API_KEY");
    return;
  }

  client = new MaleeClient({ baseUrl: apiUrl, apiKey });
  
  const chatMessagesEl = document.getElementById("chat-messages");
  if (!chatMessagesEl) return;
  
  renderer = new MaleeRenderer(chatMessagesEl, maleeStore);
  
  // Wire up Store Subscription to update UI
  maleeStore.subscribe(state => {
    updateSessionPanel(state);
    updateCartPanel(state);
    updateProfilePanel(state);
    updateEventLogPanel(state);
    updateHeaderStatus(state.connectionStatus, state.sessionId);
  });

  // Init sections collapsed state
  initCollapsibleSections();

  // Wire up Inputs
  setupChatInput();
  setupActionButtons();
  setupEventDelegation(chatMessagesEl);
}

function updateSessionPanel(state: ReturnType<typeof maleeStore.get>) {
  const el = document.getElementById("panel-session-content");
  if (!el) return;

  el.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="opacity-70">Session ID</div>
      <div class="font-mono text-xs break-all">${state.sessionId || 'None'}</div>
      
      <div class="opacity-70">Phase</div>
      <div class="font-medium">${state.phase}</div>
      
      <div class="opacity-70">Language</div>
      <div class="font-medium">${state.languageMode}</div>
      
      <div class="opacity-70">Last Activity</div>
      <div class="text-xs">${state.lastActivity ? state.lastActivity.toLocaleTimeString() : 'Never'}</div>
    </div>
  `;
}

function updateCartPanel(state: ReturnType<typeof maleeStore.get>) {
  const el = document.getElementById("panel-cart-content");
  if (!el) return;

  if (state.cart.items.length === 0) {
    el.innerHTML = `<div class="text-sm opacity-50 italic py-2">Cart is empty</div>`;
    return;
  }

  const itemsHtml = state.cart.items.map(item => `
    <div class="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <div class="flex flex-col">
        <span class="text-sm font-medium line-clamp-1">${item.name}</span>
        <span class="text-xs opacity-70">Qty: ${item.quantity}</span>
      </div>
      <div class="text-sm font-mono whitespace-nowrap">Rs. ${(item.price_lkr * item.quantity).toLocaleString()}</div>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="flex flex-col gap-1 max-h-48 overflow-y-auto pr-2 mb-3">
      ${itemsHtml}
    </div>
    <div class="flex justify-between items-center pt-2 border-t border-border/50 font-semibold">
      <span>Subtotal</span>
      <span class="text-accent font-mono">Rs. ${state.cart.subtotal_lkr.toLocaleString()}</span>
    </div>
  `;
}

function updateProfilePanel(state: ReturnType<typeof maleeStore.get>) {
  const el = document.getElementById("panel-profile-content");
  if (!el) return;

  if (!state.profile) {
    el.innerHTML = `<div class="text-sm opacity-50 italic py-2">Profile not loaded</div>`;
    return;
  }

  const p = state.profile;
  el.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="opacity-70">Name</div>
      <div class="font-medium">${p.first_name || ''} ${p.last_name || ''}</div>
      
      <div class="opacity-70">Email</div>
      <div class="font-medium break-all">${p.email || 'None'}</div>
      
      <div class="opacity-70">Phone</div>
      <div class="font-medium">${p.phone || 'None'}</div>
      
      <div class="opacity-70">City</div>
      <div class="font-medium">${p.city || 'None'}</div>
    </div>
  `;
}

function updateEventLogPanel(state: ReturnType<typeof maleeStore.get>) {
  const el = document.getElementById("panel-log-content");
  if (!el) return;

  const logs = state.sseEventLog.slice(0, 50); // Show last 50
  if (logs.length === 0) {
    el.innerHTML = `<div class="text-sm opacity-50 italic py-2">No events yet</div>`;
    return;
  }

  const lines = logs.map(log => {
    const time = log.timestamp.toISOString().split('T')[1].slice(0, 12); // HH:MM:SS.ms
    let colorClass = "text-foreground";
    if (log.type === "token") colorClass = "opacity-40";
    else if (log.type === "error") colorClass = "text-[#f43f5e]";
    else if (["cart_updated", "checkout_ready", "checkout_form"].includes(log.type)) colorClass = "text-accent";

    let payloadStr = "";
    try {
      payloadStr = JSON.stringify(log.payload);
      if (payloadStr.length > 100) payloadStr = payloadStr.substring(0, 100) + "...";
    } catch {
      payloadStr = String(log.payload);
    }

    return `<div class="text-[10px] font-mono leading-tight mb-1 ${colorClass} break-all">
      <span class="opacity-50">[${time}]</span> <span class="font-bold">${log.type}</span> ${payloadStr}
    </div>`;
  }).join("");

  el.innerHTML = `<div class="max-h-64 overflow-y-auto pr-1">${lines}</div>`;
}

function updateHeaderStatus(status: string, sessionId: string | null) {
  const dot = document.getElementById("status-dot");
  const text = document.getElementById("session-id-display");
  if (dot) {
    dot.className = "w-2.5 h-2.5 rounded-full mt-0.5 shrink-0";
    if (status === "connected") {
      dot.classList.add("bg-green-500", "animate-ping"); // wait, ping makes it fully disappear, better add an inner dot or just use standard bg
      // Let's implement ping properly: a relative wrapper with a pinging ring and a solid inner dot. For simplicity here, just solid bg + pulse if we want
      dot.className = "w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 bg-green-500";
    } else if (status === "connecting") {
      dot.classList.add("bg-yellow-500", "animate-pulse");
    } else {
      dot.classList.add("bg-red-500");
    }
  }
  if (text) {
    text.textContent = sessionId ? `Session: ${sessionId}` : "No active session";
  }
}

function initCollapsibleSections() {
  const collapsed = new Set<string>();
  document.querySelectorAll(".debug-panel-section").forEach(section => {
    const header = section.querySelector(".section-header");
    const content = section.querySelector(".section-content");
    const icon = section.querySelector(".section-icon");
    const id = section.id;
    
    if (header && content && icon && id) {
      header.addEventListener("click", () => {
        if (collapsed.has(id)) {
          collapsed.delete(id);
          content.classList.remove("hidden");
          icon.textContent = "▼";
        } else {
          collapsed.add(id);
          content.classList.add("hidden");
          icon.textContent = "▶";
        }
      });
    }
  });
}

function setupChatInput() {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const sendBtn = document.getElementById("chat-send-btn") as HTMLButtonElement;
  const langSelect = document.getElementById("chat-lang-select") as HTMLSelectElement;

  if (!input || !sendBtn || !langSelect) return;

  langSelect.addEventListener("change", async () => {
    const newLang = langSelect.value as "auto" | "english" | "sinhala" | "mixed";
    maleeStore.update({ languageMode: newLang });
    
    const sid = maleeStore.get().sessionId;
    if (client && sid) {
      try {
        await client.sendAction({
          session_id: sid,
          action: "set_language",
          payload: { mode: newLang }
        });
      } catch (e) {
        console.error("Failed to sync language mode with server", e);
      }
    }
  });

  const send = async () => {
    const text = input.value.trim();
    if (!text || !client || !renderer) return;

    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;
    
    if (activeStream) {
      activeStream.abort();
    }

    renderer.appendUserMessage(text);
    maleeStore.update({ connectionStatus: "connecting", lastActivity: new Date() });

    try {
      activeStream = await client.streamChat(
        {
          message: text,
          session_id: maleeStore.get().sessionId,
          language_mode: maleeStore.get().languageMode
        },
        (event) => {
          maleeStore.update({ connectionStatus: "connected", lastActivity: new Date() });
          maleeStore.appendLog(event.type, event);
          renderer!.handleEvent(event);
        },
        () => {
          maleeStore.update({ connectionStatus: "disconnected" });
          input.disabled = false;
          sendBtn.disabled = false;
          input.focus();
          activeStream = null;
        },
        (err) => {
          maleeStore.update({ connectionStatus: "error" });
          maleeStore.appendLog("error", { message: err.message });
          renderer!.handleEvent({ type: "error", code: "NETWORK_ERROR", message: err.message, recoverable: true });
          input.disabled = false;
          sendBtn.disabled = false;
          activeStream = null;
        }
      );
    } catch (err: unknown) {
      input.disabled = false;
      sendBtn.disabled = false;
    }
  };

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
}

function setupActionButtons() {
  const newSessionBtn = document.getElementById("btn-new-session");
  const clearChatBtn = document.getElementById("btn-clear-chat");
  const clearLogBtn = document.getElementById("btn-clear-log");

  newSessionBtn?.addEventListener("click", () => {
    if (activeStream) activeStream.abort();
    maleeStore.reset();
    renderer?.clear();
  });

  clearChatBtn?.addEventListener("click", () => {
    renderer?.clear();
  });

  clearLogBtn?.addEventListener("click", () => {
    maleeStore.update({ sseEventLog: [] });
  });

  // Quick Actions
  const btnTrack = document.getElementById("qa-track") as HTMLButtonElement;
  const btnRefresh = document.getElementById("qa-refresh") as HTMLButtonElement;
  const btnClearCart = document.getElementById("qa-clear-cart") as HTMLButtonElement;
  const btnDeleteSession = document.getElementById("qa-delete-session") as HTMLButtonElement;
  const btnLoadProfile = document.getElementById("qa-load-profile") as HTMLButtonElement;

  btnTrack?.addEventListener("click", async () => {
    if (!client || !renderer) return;
    const orderNumber = prompt("Enter order number:");
    if (!orderNumber) return;
    try {
      btnTrack.disabled = true;
      const res = await client.trackOrder(orderNumber);
      renderer.handleEvent({ type: "tracking_result", ...res });
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      renderer.handleEvent({ type: "error", code: "TRACKING_ERROR", message: err.message, recoverable: false });
    } finally {
      btnTrack.disabled = false;
    }
  });

  btnRefresh?.addEventListener("click", async () => {
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    try {
      btnRefresh.disabled = true;
      const res = await client.getSession(sid);
      maleeStore.update({ cart: res.cart, checkoutDraft: res.checkout_draft, languageMode: res.language_mode as "auto" | "english" | "sinhala" | "mixed" });
      renderer.appendNotice("Session refreshed", "success");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      renderer.appendNotice(`Refresh failed: ${err.message}`, "error");
    } finally {
      btnRefresh.disabled = false;
    }
  });

  btnClearCart?.addEventListener("click", async () => {
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    try {
      btnClearCart.disabled = true;
      const res = await client.sendAction({ session_id: sid, action: "clear_cart", payload: {} });
      if (res.cart) maleeStore.update({ cart: res.cart });
      renderer.appendNotice("Cart cleared", "success");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      renderer.appendNotice(`Clear cart failed: ${err.message}`, "error");
    } finally {
      btnClearCart.disabled = false;
    }
  });

  btnDeleteSession?.addEventListener("click", async () => {
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    try {
      btnDeleteSession.disabled = true;
      await client.deleteSession(sid);
      maleeStore.reset();
      renderer.clear();
      renderer.appendNotice("Session deleted", "warning");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      renderer.appendNotice(`Delete failed: ${err.message}`, "error");
    } finally {
      btnDeleteSession.disabled = false;
    }
  });

  btnLoadProfile?.addEventListener("click", async () => {
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) {
      if (renderer) renderer.appendNotice("Need active session to load profile", "warning");
      return;
    }
    try {
      btnLoadProfile.disabled = true;
      const res = await client.getUserProfile(sid);
      maleeStore.update({ profile: res.profile });
      renderer.appendNotice("Profile loaded", "success");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      renderer.appendNotice(`Load profile failed: ${err.message}`, "error");
    } finally {
      btnLoadProfile.disabled = false;
    }
  });
}

function setupEventDelegation(chatContainer: HTMLElement) {
  chatContainer.addEventListener("action:add_to_cart", async (e: Event) => {
    const ev = e as CustomEvent;
    const { product_id, name, price_lkr, image_url } = ev.detail;
    const sid = maleeStore.get().sessionId;
    if (!client || !renderer || !sid) return;
    try {
      const res = await client.sendAction({
        session_id: sid,
        action: "add_to_cart",
        payload: { 
          product_id, 
          name, 
          price_lkr, 
          image_url, 
          quantity: 1 
        }
      });
      if (res.cart) maleeStore.update({ cart: res.cart });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      renderer.appendNotice(`Add to cart failed: ${error.message}`, "error");
    }
  });

  chatContainer.addEventListener("action:set_city", async (e: Event) => {
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
      if (res.session) maleeStore.update({ checkoutDraft: res.session.checkout_draft });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      renderer.appendNotice(`Set city failed: ${error.message}`, "error");
    }
  });

  chatContainer.addEventListener("action:send_message", (e: Event) => {
    const ev = e as CustomEvent;
    const text = ev.detail.text;
    const input = document.getElementById("chat-input") as HTMLInputElement;
    const sendBtn = document.getElementById("chat-send-btn") as HTMLButtonElement;
    if (input && sendBtn && !input.disabled) {
      input.value = text;
      sendBtn.click();
    }
  });
}
