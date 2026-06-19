import type { MaleeStore, ProductCard, ProductDetailView, CartView, CartItem, CheckoutDraft, TrackingResult, TrackingTimeline } from "./store";
import { marked } from "marked";

export class MaleeRenderer {
  private currentStreamBuffer: string = "";

  constructor(private container: HTMLElement, private store: MaleeStore) {}

  handleEvent(event: { type: string; [key: string]: unknown }): void {
    switch (event.type) {
      case "session_created":
        this.store.update({ sessionId: event.session_id as string });
        this.appendNotice("Session started", "info");
        break;

      case "token":
        this.appendToken(event.text as string);
        break;

      case "assistant_message_done":
        this.finishAssistantMessage(event.full_text as string);
        break;

      case "product_carousel":
        this.renderProductCarousel(event.title as string, event.subtitle as string | undefined, event.items as ProductCard[]);
        break;

      case "product_detail":
        this.renderProductDetail(event.item as ProductDetailView);
        break;

      case "category_grid":
        this.renderCategoryGrid(event.categories as string[]);
        break;

      case "cart_updated":
        this.store.update({ cart: event.cart as CartView });
        this.appendNotice(`🛒 Cart updated: ${(event.cart as CartView).item_count} items`, "info");
        break;

      case "city_suggestions":
        this.renderCitySuggestions(event.cities as string[]);
        break;

      case "delivery_quote":
        this.renderDeliveryQuote(
          event.city as string, 
          event.date as string, 
          event.rate_lkr as number, 
          event.deliverable as boolean,
          event.perishable_warning as boolean,
          event.next_available_date as string | null
        );
        break;

      case "checkout_form":
        this.renderCheckoutForm(event.draft as CheckoutDraft, event.missing_fields as string[]);
        break;

      case "checkout_progress":
        this.renderCheckoutProgress(
          event.current_step as number,
          event.total_steps as number,
          event.step_name as string,
          event.missing_fields as string[]
        );
        break;

      case "checkout_ready":
        this.renderCheckoutReady(event.pay_url as string, event.order_ref as string, event.expires_in_minutes as number, event.cart_summary as CartItem[]);
        break;

      case "question_prompt":
        this.renderQuestionPrompt(event.questions as any[]);
        break;

      case "language_changed":
        this.store.update({ languageMode: event.mode as "auto" | "english" | "sinhala" | "mixed" });
        this.appendNotice(`Language mode changed to: ${event.mode}`, "info");
        break;

      case "tracking_result":
        this.renderTrackingResult(event as unknown as TrackingResult);
        break;

      case "error":
        this.renderError(event.code as string, event.message as string, event.recoverable as boolean);
        break;

      case "thinking":
        this.renderThinking(event.text as string);
        break;

      default:
        console.warn("Unhandled SSE event type:", event.type);
    }
  }

  appendUserMessage(text: string): void {
    const bubble = document.createElement("div");
    bubble.className = "self-end max-w-[85%] rounded-2xl px-4 py-2.5 text-sm mb-3";
    bubble.style.backgroundColor = "color-mix(in oklab, var(--accent) 12%, var(--muted))";
    bubble.style.color = "var(--foreground)";
    bubble.textContent = text;
    this.container.appendChild(bubble);
    this.scrollToBottom();
  }

  appendNotice(text: string, variant: "info" | "success" | "error" | "warning"): void {
    const notice = document.createElement("div");
    notice.className = "text-xs text-center py-2 mb-3 tracking-wide rounded-lg";
    
    if (variant === "error") {
      notice.style.backgroundColor = "color-mix(in oklab, #f43f5e 10%, transparent)";
      notice.style.color = "#f43f5e";
    } else if (variant === "success") {
      notice.style.backgroundColor = "color-mix(in oklab, #10b981 10%, transparent)";
      notice.style.color = "#10b981";
    } else if (variant === "warning") {
      notice.style.backgroundColor = "color-mix(in oklab, #f59e0b 10%, transparent)";
      notice.style.color = "#f59e0b";
    } else {
      notice.style.backgroundColor = "color-mix(in oklab, var(--muted) 30%, transparent)";
      notice.style.color = "var(--foreground)";
      notice.style.opacity = "0.8";
    }
    
    notice.textContent = text;
    this.container.appendChild(notice);
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight;
  }

  clear(): void {
    this.container.innerHTML = "";
    // If empty, we can show the "Start chatting" centered text, handled by CSS or an empty state div
    const emptyState = document.createElement("div");
    emptyState.className = "flex h-full items-center justify-center text-sm opacity-50 italic";
    emptyState.id = "chat-empty-state";
    emptyState.textContent = "Start chatting";
    this.container.appendChild(emptyState);
  }

  private removeEmptyState(): void {
    const emptyState = this.container.querySelector("#chat-empty-state");
    if (emptyState) {
      emptyState.remove();
    }
  }

  private getStreamingBubble(): HTMLElement {
    this.removeEmptyState();
    let bubble = this.container.querySelector(".msg-streaming") as HTMLElement;
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "msg-assistant msg-streaming self-start max-w-[85%] w-full rounded-2xl px-4 py-2.5 text-sm mb-3 app-prose dark:prose-invert prose-p:my-1 prose-pre:my-2";
      bubble.style.backgroundColor = "color-mix(in oklab, var(--muted) 30%, transparent)";
      bubble.style.color = "var(--foreground)";
      this.container.appendChild(bubble);
      this.currentStreamBuffer = "";
    }
    return bubble;
  }

  private appendToken(text: string): void {
    const bubble = this.getStreamingBubble();
    const thinkingSpan = bubble.querySelector(".thinking-text");
    if (thinkingSpan) thinkingSpan.remove();

    this.currentStreamBuffer += text;
    // marked.parse can be synchronous if no async options are provided
    bubble.innerHTML = marked.parse(this.currentStreamBuffer) as string;
    this.scrollToBottom();
  }

  private finishAssistantMessage(fullText: string): void {
    const bubble = this.getStreamingBubble();
    bubble.classList.remove("msg-streaming");
    bubble.classList.add("msg-done");
    this.currentStreamBuffer = "";
    bubble.innerHTML = marked.parse(fullText) as string;
    this.scrollToBottom();
  }

  private renderThinking(text: string): void {
    const bubble = this.getStreamingBubble();
    bubble.innerHTML = "";
    const span = document.createElement("span");
    span.className = "thinking-text animate-pulse opacity-70 italic";
    span.textContent = text || "🤔 Thinking...";
    bubble.appendChild(span);
    this.scrollToBottom();
  }

  private renderProductCarousel(title: string, subtitle: string | undefined, items: ProductCard[]): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "mb-4";
    
    if (title) {
      const h4 = document.createElement("h4");
      h4.className = "text-sm font-semibold mb-1";
      h4.textContent = title;
      wrapper.appendChild(h4);
    }
    if (subtitle) {
      const sub = document.createElement("div");
      sub.className = "text-xs opacity-70 mb-2";
      sub.textContent = subtitle;
      wrapper.appendChild(sub);
    }

    const scrollArea = document.createElement("div");
    scrollArea.className = "flex gap-3 overflow-x-auto pb-2 snap-x";
    
    items.forEach(item => {
      const card = this.createProductCard(item, false);
      scrollArea.appendChild(card);
    });

    wrapper.appendChild(scrollArea);
    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderProductDetail(item: ProductDetailView): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "mb-4 w-full";
    
    const card = document.createElement("div");
    card.className = `border border-border/70 rounded-xl overflow-hidden shrink-0 flex flex-col snap-start w-full max-w-[320px]`;
    card.style.backgroundColor = "color-mix(in oklab, var(--muted) 10%, transparent)";
    card.dataset.productId = item.id;

    const imgWrap = document.createElement("div");
    imgWrap.className = "aspect-square w-full bg-muted/20 flex items-center justify-center overflow-x-auto snap-x";
    
    if (item.image_urls && item.image_urls.length > 0) {
      item.image_urls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = item.name;
        img.className = "w-full h-full object-cover shrink-0 snap-center";
        imgWrap.appendChild(img);
      });
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "text-xs opacity-50";
      placeholder.textContent = "No Image";
      imgWrap.appendChild(placeholder);
    }

    const infoWrap = document.createElement("div");
    infoWrap.className = "p-3 flex flex-col grow";

    const name = document.createElement("div");
    name.className = "text-base font-semibold line-clamp-2 mb-1";
    name.textContent = item.name;
    
    if (item.vendor_name) {
      const vendor = document.createElement("div");
      vendor.className = "text-xs text-accent mb-2";
      vendor.textContent = `By ${item.vendor_name}`;
      infoWrap.appendChild(vendor);
    }

    if (item.description) {
      const desc = document.createElement("div");
      desc.className = "text-sm opacity-80 mb-2 line-clamp-3";
      desc.textContent = item.description;
      infoWrap.appendChild(desc);
    }

    const priceRow = document.createElement("div");
    priceRow.className = "flex items-center justify-between mt-auto pt-2";
    
    const price = document.createElement("span");
    price.className = "text-sm font-mono text-accent font-bold";
    price.textContent = `Rs. ${item.price_lkr.toLocaleString()}`;

    const stockTags = document.createElement("div");
    stockTags.className = "flex gap-1 items-center";

    if (item.is_perishable) {
      const pTag = document.createElement("span");
      pTag.className = "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold bg-amber-500/20 text-amber-500";
      pTag.textContent = "Perishable";
      stockTags.appendChild(pTag);
    }

    const stock = document.createElement("span");
    stock.className = `text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${item.in_stock ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`;
    stock.textContent = item.in_stock ? 'In Stock' : 'Out';
    stockTags.appendChild(stock);

    priceRow.appendChild(price);
    priceRow.appendChild(stockTags);

    const addBtn = document.createElement("button");
    addBtn.className = "mt-3 w-full rounded-lg py-1.5 text-xs font-semibold bg-accent text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100";
    addBtn.textContent = "🛒 Add to Cart";
    addBtn.disabled = !item.in_stock;
    
    addBtn.onclick = () => {
      addBtn.textContent = "⏳ Adding...";
      card.dispatchEvent(new CustomEvent("action:add_to_cart", { 
        bubbles: true, 
        detail: { 
          product_id: item.id,
          name: item.name,
          price_lkr: item.price_lkr,
          image_url: (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : null
        } 
      }));
      setTimeout(() => { addBtn.textContent = "🛒 Add to Cart"; }, 1000);
    };

    infoWrap.appendChild(name);
    infoWrap.appendChild(priceRow);
    infoWrap.appendChild(addBtn);

    card.appendChild(imgWrap);
    card.appendChild(infoWrap);
    wrapper.appendChild(card);
    
    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private createProductCard(item: ProductCard, fullWidth: boolean): HTMLElement {
    const card = document.createElement("div");
    card.className = `border border-border/70 rounded-xl overflow-hidden shrink-0 flex flex-col snap-start ${fullWidth ? 'w-full max-w-[320px]' : 'w-48'}`;
    card.style.backgroundColor = "color-mix(in oklab, var(--muted) 10%, transparent)";
    card.dataset.productId = item.id;

    const imgWrap = document.createElement("div");
    imgWrap.className = "aspect-square w-full bg-muted/20 flex items-center justify-center overflow-hidden";
    if (item.image_url) {
      const img = document.createElement("img");
      img.src = item.image_url;
      img.alt = item.name;
      img.className = "w-full h-full object-cover";
      imgWrap.appendChild(img);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "text-xs opacity-50";
      placeholder.textContent = "No Image";
      imgWrap.appendChild(placeholder);
    }

    const infoWrap = document.createElement("div");
    infoWrap.className = "p-3 flex flex-col grow";

    const name = document.createElement("div");
    name.className = "text-sm font-semibold line-clamp-2 mb-1";
    name.textContent = item.name;

    const priceRow = document.createElement("div");
    priceRow.className = "flex items-center justify-between mt-auto pt-2";
    
    const price = document.createElement("span");
    price.className = "text-sm font-mono text-accent";
    price.textContent = `Rs. ${item.price_lkr.toLocaleString()}`;

    const stock = document.createElement("span");
    stock.className = `text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${item.in_stock ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`;
    stock.textContent = item.in_stock ? 'In Stock' : 'Out';

    priceRow.appendChild(price);
    priceRow.appendChild(stock);

    const addBtn = document.createElement("button");
    addBtn.className = "mt-3 w-full rounded-lg py-1.5 text-xs font-semibold bg-accent text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100";
    addBtn.textContent = "🛒 Add to Cart";
    addBtn.disabled = !item.in_stock;
    
    // The actual POST /action add_to_cart will be wired up via event delegation in ui.ts or directly here.
    // For simplicity, we can dispatch a custom event that ui.ts listens to.
    addBtn.onclick = () => {
      addBtn.textContent = "⏳ Adding...";
      card.dispatchEvent(new CustomEvent("action:add_to_cart", { 
        bubbles: true, 
        detail: { 
          product_id: item.id,
          name: item.name,
          price_lkr: item.price_lkr,
          image_url: item.image_url
        } 
      }));
      // Re-enable text will be handled when cart_updated arrives or by ui.ts
      setTimeout(() => { addBtn.textContent = "🛒 Add to Cart"; }, 1000);
    };

    infoWrap.appendChild(name);
    infoWrap.appendChild(priceRow);
    infoWrap.appendChild(addBtn);

    card.appendChild(imgWrap);
    card.appendChild(infoWrap);

    return card;
  }

  private renderCategoryGrid(categories: string[]): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-wrap gap-2 mb-4";

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "px-3 py-1.5 rounded-full text-xs font-medium border border-border/70 hover:border-accent hover:text-accent transition-colors bg-background";
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.onclick = () => {
        btn.dispatchEvent(new CustomEvent("action:send_message", {
          bubbles: true,
          detail: { text: `show me ${cat}` }
        }));
      };
      wrapper.appendChild(btn);
    });

    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderCitySuggestions(cities: string[]): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-wrap gap-2 mb-4";

    cities.forEach(city => {
      const btn = document.createElement("button");
      btn.className = "px-3 py-1.5 rounded-full text-xs font-medium border border-border/70 hover:border-accent hover:text-accent transition-colors bg-background";
      btn.textContent = city;
      btn.onclick = () => {
        btn.dispatchEvent(new CustomEvent("action:set_city", {
          bubbles: true,
          detail: { city }
        }));
      };
      wrapper.appendChild(btn);
    });

    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderDeliveryQuote(city: string, date: string, rateLkr: number, deliverable: boolean, perishableWarning: boolean, nextAvailable: string | null): void {
    this.removeEmptyState();
    const card = document.createElement("div");
    card.className = `p-3 rounded-xl border mb-4 text-sm ${deliverable && !perishableWarning ? 'border-green-500/30 bg-green-500/5 text-green-600' : (!deliverable ? 'border-red-500/30 bg-red-500/5 text-red-600' : 'border-amber-500/30 bg-amber-500/5 text-amber-600')}`;
    
    card.innerHTML = `
      <div class="flex items-center gap-2 font-semibold">
        <span>${deliverable ? (perishableWarning ? '⚠️' : '✅') : '❌'}</span>
        <span>Delivery to ${city} on ${date || 'TBD'}</span>
      </div>
      <div class="mt-1 opacity-90">
        ${deliverable ? `Rate: Rs. ${rateLkr.toLocaleString()}` : 'Sorry, we do not deliver to this city on the selected date.'}
      </div>
      ${perishableWarning ? `<div class="mt-1 text-xs font-medium">Note: Perishable items require special handling.</div>` : ''}
      ${nextAvailable ? `<div class="mt-1 text-xs">Next available date: ${nextAvailable}</div>` : ''}
    `;

    this.container.appendChild(card);
    this.scrollToBottom();
  }

  private renderCheckoutForm(draft: CheckoutDraft, missingFields: string[]): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "p-4 rounded-xl border border-border/70 bg-background mb-4";
    
    const h4 = document.createElement("h4");
    h4.className = "text-sm font-semibold mb-3 border-b border-border/50 pb-2 text-accent";
    h4.textContent = "Checkout Draft";
    wrapper.appendChild(h4);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 gap-2 text-sm";

    const fields: Array<{key: keyof CheckoutDraft, label: string}> = [
      { key: 'recipient_name', label: 'Recipient' },
      { key: 'delivery_city', label: 'City' },
      { key: 'delivery_date', label: 'Date' },
      { key: 'sender_name', label: 'Sender Name' },
      { key: 'gift_message', label: 'Gift Note' },
    ];

    fields.forEach(f => {
      const row = document.createElement("div");
      row.className = "flex flex-col sm:flex-row sm:items-center py-1";
      
      const label = document.createElement("span");
      label.className = "w-24 text-xs opacity-70 font-medium uppercase tracking-wide";
      label.textContent = f.label;
      
      const val = document.createElement("span");
      const isMissing = missingFields.includes(f.key);
      val.className = `font-medium ${isMissing ? 'text-red-500 italic text-xs' : ''}`;
      val.textContent = draft[f.key] || (isMissing ? 'Required' : 'None');

      row.appendChild(label);
      row.appendChild(val);
      grid.appendChild(row);
    });

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderCheckoutProgress(currentStep: number, totalSteps: number, stepName: string, missingFields: string[]): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "mb-4 w-full";
    
    wrapper.innerHTML = `
      <div class="p-3 rounded-xl border border-accent/30 bg-accent/5 text-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-accent">Checkout Progress</span>
          <span class="text-xs opacity-70">Step ${currentStep} of ${totalSteps}</span>
        </div>
        
        <div class="w-full bg-border/50 rounded-full h-1.5 mb-3">
          <div class="bg-accent h-1.5 rounded-full" style="width: ${(currentStep / totalSteps) * 100}%"></div>
        </div>
        
        <div class="font-medium mb-1">${stepName}</div>
        ${missingFields && missingFields.length > 0 ? 
          `<div class="text-xs opacity-70 mt-2">Missing: <span class="text-amber-500">${missingFields.join(", ")}</span></div>` 
          : '<div class="text-xs opacity-70 mt-2 text-green-500">All fields complete</div>'}
      </div>
    `;

    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderCheckoutReady(payUrl: string, orderRef: string, expiresMins: number, cartSummary: CartItem[]): void {
    this.removeEmptyState();
    const card = document.createElement("div");
    card.className = "p-5 rounded-xl border border-green-500/50 bg-green-500/10 mb-4 text-center";
    
    let itemsHtml = "";
    if (cartSummary && cartSummary.length > 0) {
      itemsHtml = `<div class="mt-3 text-xs text-left bg-background/50 p-2 rounded-lg text-foreground/80">
        <div class="font-semibold mb-1">Order Items:</div>
        <ul class="list-disc pl-4">
          ${cartSummary.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
        </ul>
      </div>`;
    }

    card.innerHTML = `
      <div class="text-green-500 mb-2">
        <svg class="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 class="font-bold text-lg mb-1">Order Ready!</h4>
      <div class="text-sm opacity-80 mb-4">Ref: <span class="font-mono">${orderRef}</span></div>
      <a href="${payUrl}" target="_blank" class="inline-block bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-transform hover:scale-105">
        Open Payment Link &rarr;
      </a>
      <div class="text-xs opacity-60 mt-3">Link expires in ${expiresMins} minutes</div>
      ${itemsHtml}
    `;

    this.container.appendChild(card);
    this.scrollToBottom();
  }

  private renderQuestionPrompt(questions: Array<{field: string, label: string, input_type: string, placeholder?: string}>): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "mb-4 w-full max-w-[85%] self-start";
    
    let fieldsHtml = "";
    questions.forEach(q => {
      const commonClasses = "w-full bg-muted/50 border border-border/70 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent min-w-0";
      const ph = q.placeholder ? `placeholder="${q.placeholder}"` : "";
      let inputHtml = "";
      
      if (q.input_type === 'textarea') {
        inputHtml = `<textarea name="${q.field}" class="${commonClasses} min-h-[80px]" ${ph} required></textarea>`;
      } else {
        const type = q.input_type === 'date' ? 'date' : (q.input_type === 'tel' ? 'tel' : 'text');
        inputHtml = `<input type="${type}" name="${q.field}" class="${commonClasses}" ${ph} required />`;
      }

      fieldsHtml += `
        <div class="mb-3">
          <div class="text-sm mb-1.5 opacity-90 font-medium">${q.label}</div>
          ${inputHtml}
        </div>
      `;
    });

    wrapper.innerHTML = `
      <form class="flex flex-col w-full bg-muted/5 p-3.5 rounded-xl border border-border/50">
        ${fieldsHtml}
        <button type="submit" class="mt-1 bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors self-end shrink-0">
          Send
        </button>
      </form>
    `;

    const form = wrapper.querySelector("form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const inputs = Array.from(form.querySelectorAll("input, textarea")) as Array<HTMLInputElement | HTMLTextAreaElement>;
        const allFilled = inputs.every(input => input.value.trim() !== "");
        if (allFilled) {
          const answers = inputs.map(input => input.value).join(", ");
          wrapper.dispatchEvent(new CustomEvent("action:send_message", {
            bubbles: true,
            detail: { text: answers }
          }));
          
          // Disable form after send
          inputs.forEach(input => input.disabled = true);
          const btn = form.querySelector("button");
          if (btn) btn.disabled = true;
        }
      };
    }

    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderTrackingResult(result: TrackingResult): void {
    this.removeEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "p-4 rounded-xl border border-border/70 bg-background mb-4";
    
    const header = document.createElement("div");
    header.className = "mb-4 border-b border-border/50 pb-3";
    header.innerHTML = `
      <div class="font-bold text-lg">Tracking Status: <span class="text-accent">${result.status}</span></div>
      <div class="text-sm opacity-80 mt-1">Recipient: ${result.recipient}</div>
      <div class="text-sm opacity-80">Items: ${result.items.join(", ")}</div>
    `;
    wrapper.appendChild(header);

    const timeline = document.createElement("div");
    timeline.className = "flex flex-col gap-0";

    result.timeline.forEach((t, i) => {
      const item = document.createElement("div");
      item.className = "flex gap-3 relative";
      
      const lineWrap = document.createElement("div");
      lineWrap.className = "flex flex-col items-center";
      
      const dot = document.createElement("div");
      dot.className = "w-2.5 h-2.5 rounded-full bg-accent mt-1.5";
      lineWrap.appendChild(dot);

      if (i < result.timeline.length - 1) {
        const line = document.createElement("div");
        line.className = "w-px h-full bg-border/80 my-1";
        lineWrap.appendChild(line);
      } else {
        const line = document.createElement("div");
        line.className = "w-px h-4 bg-transparent my-1";
        lineWrap.appendChild(line);
      }

      const content = document.createElement("div");
      content.className = "pb-4";
      
      const time = document.createElement("div");
      time.className = "text-xs font-mono opacity-60";
      time.textContent = new Date(t.timestamp).toLocaleString();
      
      const desc = document.createElement("div");
      desc.className = "text-sm mt-0.5";
      desc.textContent = t.description;

      content.appendChild(time);
      content.appendChild(desc);

      item.appendChild(lineWrap);
      item.appendChild(content);
      timeline.appendChild(item);
    });

    wrapper.appendChild(timeline);
    this.container.appendChild(wrapper);
    this.scrollToBottom();
  }

  private renderError(code: string, message: string, recoverable: boolean): void {
    this.removeEmptyState();
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl border border-red-500/50 bg-red-500/10 mb-4";
    
    card.innerHTML = `
      <div class="text-red-500 font-bold mb-1">Error: ${code}</div>
      <div class="text-sm text-red-400 mb-3">${message}</div>
      ${recoverable ? `<button class="retry-btn text-xs bg-red-500/20 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors">Retry</button>` : ''}
    `;

    if (recoverable) {
      const btn = card.querySelector(".retry-btn");
      if (btn) {
        btn.addEventListener("click", () => {
          card.dispatchEvent(new CustomEvent("action:retry", { bubbles: true }));
        });
      }
    }

    this.container.appendChild(card);
    this.scrollToBottom();
  }
}
