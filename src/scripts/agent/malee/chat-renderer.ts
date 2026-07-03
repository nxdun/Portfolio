import { marked } from "marked";
import type {
  ProductCard,
  ProductDetailView,
  CartView,
  CartItem,
  CheckoutDraft,
  TrackingResult,
  TrackingTimeline,
} from "./store";
import type { MaleeStore } from "./store";

import imgDeliveryNo from "../../../assets/malee/delivery-no.png?url";
import imgDeliveryOk from "../../../assets/malee/delivery-ok.png?url";
import imgOrderSuccess from "../../../assets/malee/order-success.png?url";
import imgProductPlaceholder from "../../../assets/malee/product-placeholder.png?url";
import imgTrackingPackage from "../../../assets/malee/tracking-package.png?url";
import imgWarningPerishable from "../../../assets/malee/warning-perishable.png?url";
import imgMaleeAvatar from "../../../assets/malee/malee-avatar.png?url";

export class ChatRenderer {
  private currentStreamBuffer: string = "";
  private messagesArea: HTMLElement;
  private canvas: HTMLElement;
  private welcomeHero: HTMLElement;

  constructor(
    private root: HTMLElement,
    private store: MaleeStore
  ) {
    this.canvas = root.querySelector(".conversation-canvas") as HTMLElement;
    this.messagesArea = root.querySelector(".messages-area") as HTMLElement;
    this.welcomeHero = root.querySelector(".welcome-hero") as HTMLElement;

    if (this.messagesArea) {
      this.messagesArea.innerHTML = "";
      // We will show it only when chat starts
    }
  }

  private appendComponent(element: HTMLElement): void {
    const lastChild = this.messagesArea.lastElementChild as HTMLElement;

    if (
      window.innerWidth >= 1024 &&
      lastChild &&
      (lastChild.classList.contains("msg-assistant-finished") ||
        lastChild.classList.contains("msg-streaming"))
    ) {
      // Inline split view for a single response
      const splitWrapper = document.createElement("div");
      splitWrapper.className =
        "split-wrapper w-full flex flex-row items-center gap-12 my-12";

      const leftCol = document.createElement("div");
      leftCol.className =
        "w-[40%] flex flex-col shrink-0 pl-8 border-r border-white/5 pr-8 bg-background/20 rounded-3xl py-8 max-h-[60vh] overflow-y-auto overscroll-contain animate-in slide-in-from-right-8 duration-1000";

      // Move the text bubble to the left column
      lastChild.classList.remove("msg-constrained", "mb-8", "mb-10");
      lastChild.classList.add("mb-0", "w-full");
      this.messagesArea.removeChild(lastChild);
      leftCol.appendChild(lastChild);

      const rightCol = document.createElement("div");
      rightCol.className =
        "right-col w-[60%] flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-8 duration-1000";
      rightCol.appendChild(element);

      splitWrapper.appendChild(leftCol);
      splitWrapper.appendChild(rightCol);

      this.messagesArea.appendChild(splitWrapper);
    } else {
      element.classList.add("msg-constrained");
      this.messagesArea.appendChild(element);
    }

    this.scrollToBottom(true);
  }

  public renderConnecting(): void {
    const bubble = this.getStreamingBubble();
    if (bubble.querySelector(".inline-lotus-skeleton")) return;

    bubble.innerHTML = "";
    const skeleton = document.createElement("div");
    skeleton.className =
      "inline-lotus-skeleton relative w-40 h-40 ml-0 -mt-4 overflow-hidden opacity-95 animate-in fade-in duration-500";
    skeleton.innerHTML = `
      <span class="loader-skeleton-bloom" style="position: absolute; inset: 0; background-size: 16px 16px; background-position: center; --loader-dot-size: 1.8px; --loader-dot-blur: 1.2px;"></span>
    `;
    bubble.appendChild(skeleton);
    this.scrollToBottom(false);
  }

  public finalizeStream(): void {
    const bubble = this.messagesArea.querySelector(
      ".msg-streaming .prose"
    ) as HTMLElement | null;
    if (!bubble) return;

    if (bubble.querySelector(".inline-lotus-skeleton") || !this.currentStreamBuffer.trim()) {
      const container = bubble.closest(".msg-streaming");
      if (container) container.remove();
      this.currentStreamBuffer = "";
      return;
    }

    const container = bubble.closest(".msg-streaming");
    if (container) {
      container.classList.remove("msg-streaming");
      container.classList.add("msg-assistant-finished");
      bubble.style.animation = "msg-finish-bloom 0.8s ease-out forwards";
    }
    const cursor = bubble.querySelector(".inline-flex");
    if (cursor) cursor.remove();
    this.currentStreamBuffer = "";
    this.scrollToBottom(true);
  }

  handleEvent(event: { type: string; [key: string]: unknown }): void {
    this.hideWelcome();
    switch (event.type) {
      case "session_created":
        this.store.update({ sessionId: event.session_id as string });
        break;
      case "token":
        this.appendToken(event.text as string);
        break;
      case "assistant_message_done":
        this.finishAssistantMessage(event.full_text as string);
        break;
      case "product_carousel":
        this.renderProductCarousel(
          event.title as string,
          event.subtitle as string | undefined,
          event.items as ProductCard[]
        );
        break;
      case "product_detail":
        this.renderProductDetail(event.item as ProductDetailView);
        break;
      case "category_grid":
        this.renderCategoryGrid(event.categories as any[]);
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
        // Disabled per request: this.renderCheckoutForm(event.draft as CheckoutDraft, event.missing_fields as string[]);
        break;
      case "checkout_progress":
        this.store.update({
          checkoutProgress: {
            currentStep: event.current_step as number,
            totalSteps: event.total_steps as number,
            stepName: event.step_name as string,
            missingFields: event.missing_fields as string[],
          },
        });
        break;
      case "checkout_ready":
        this.renderCheckoutReady(
          event.pay_url as string,
          event.order_ref as string,
          event.expires_in_minutes as number,
          event.cart_summary as CartItem[]
        );
        break;
      case "question_prompt":
        this.renderQuestionPrompt(event.questions as any[]);
        break;
      case "tracking_result":
        this.renderTrackingResult(event as unknown as TrackingResult);
        break;
      case "thinking":
        this.renderThinking(event.text as string);
        break;
      case "cart_updated":
        this.store.update({ cart: event.cart as CartView });
        break;
      case "error":
        this.appendSystemNotice(`Error: ${event.message}`, "error");
        break;
    }
  }

  private hideWelcome(): void {
    if (this.welcomeHero && !this.welcomeHero.classList.contains("hidden")) {
      this.welcomeHero.classList.add("hidden");
    }
    if (this.messagesArea && this.messagesArea.classList.contains("hidden")) {
      this.messagesArea.classList.remove("hidden");
      this.messagesArea.classList.add("flex", "flex-col");
    }
  }

  appendUserMessage(text: string): void {
    this.activeQuestionPrompt = null;
    const bubble = document.createElement("div");
    bubble.className =
      "msg-constrained flex flex-col items-end mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700";
    bubble.innerHTML = `
      <span class="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-white/40 mb-2 mr-2">You</span>
      <div class="text-xl sm:text-2xl font-light tracking-wide text-white italic text-right max-w-[85%] leading-relaxed">${text}</div>
    `;
    this.messagesArea.appendChild(bubble);
    this.scrollToBottom(false);
  }

  appendSystemNotice(text: string, type: "info" | "error" = "info"): void {
    const notice = document.createElement("div");
    notice.className = `msg-constrained text-xs text-center py-2 opacity-70 self-center ${type === "error" ? "text-red-500 font-bold" : ""}`;
    notice.textContent = text;
    this.messagesArea.appendChild(notice);
    this.scrollToBottom(true);
  }

  private getStreamingBubble(): HTMLElement {
    let bubble = this.messagesArea.querySelector(
      ".msg-streaming .prose"
    ) as HTMLElement | null;
    if (!bubble) {
      const container = document.createElement("div");
      container.className =
        "msg-streaming msg-constrained flex flex-col items-start mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700";

      const header = document.createElement("div");
      header.className = "flex items-center gap-4 mb-4";
      header.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
          <img src="${imgMaleeAvatar}" alt="Malee" class="w-full h-full object-contain" />
        </div>
        <span class="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-white/90">Malee</span>
      `;

      bubble = document.createElement("div");
      bubble.className =
        "prose text-lg sm:text-xl font-light tracking-wide text-white/95 leading-relaxed dark:prose-invert prose-p:my-2 prose-a:text-accent w-full";

      container.appendChild(header);
      container.appendChild(bubble);
      this.messagesArea.appendChild(container);
      this.currentStreamBuffer = "";
    }
    return bubble as HTMLElement;
  }

  private appendToken(text: string): void {
    const bubble = this.getStreamingBubble();
    const skeleton = bubble.querySelector(".inline-lotus-skeleton");
    if (skeleton) skeleton.remove();

    const thinkingSpan = bubble.querySelector(".thinking-text");
    if (thinkingSpan) thinkingSpan.remove();

    this.currentStreamBuffer += text;
    const html = marked.parse(this.currentStreamBuffer) as string;
    // Add malee cursor at the end
    bubble.innerHTML =
      html +
      `<span class="inline-flex w-5 h-5 ml-2 align-baseline animate-[pulse_0.8s_ease-in-out_infinite]"><img src="${imgMaleeAvatar}" alt="" class="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(249,168,212,0.9)] scale-110" /></span>`;
    this.scrollToBottom();
  }

  private finishAssistantMessage(fullText: string): void {
    const bubble = this.getStreamingBubble();
    const container = bubble.closest(".msg-streaming");

    if (!fullText.trim()) {
      if (container) container.remove();
      this.currentStreamBuffer = "";
      return;
    }

    if (container) {
      container.classList.remove("msg-streaming");
      container.classList.add("msg-assistant-finished");
      // Add a post-animation glow effect for smoothness
      bubble.style.animation = "msg-finish-bloom 0.8s ease-out forwards";
    }
    this.currentStreamBuffer = "";
    bubble.innerHTML = marked.parse(fullText) as string; // The cursor is automatically removed here
    this.scrollToBottom(true);
  }

  private renderThinking(text: string): void {
    this.renderConnecting();
  }

  private renderProductCarousel(
    title: string,
    subtitle: string | undefined,
    items: ProductCard[]
  ): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "w-full my-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-[1200ms] relative";

    let headerHtml = "";
    if (title || subtitle) {
      headerHtml = `
        <div class="mb-8 px-4 flex flex-col items-center z-40 text-center w-full">
          ${subtitle ? `<span class="text-[10px] sm:text-xs opacity-50 font-mono uppercase tracking-[0.3em] mb-3">${subtitle}</span>` : ""}
          ${title ? `<h3 class="text-2xl sm:text-4xl font-light tracking-wide text-foreground/90 italic">${title}</h3>` : ""}
          <div class="w-12 h-px bg-accent/50 mt-6 mb-2"></div>
        </div>
      `;
    }

    const carouselArea = document.createElement("div");
    carouselArea.className =
      "relative w-full max-w-[700px] h-[360px] sm:h-[400px] flex items-center justify-center perspective-[1200px] select-none touch-pan-y z-30";

    const cards: HTMLElement[] = [];
    let activeIndex = 0;

    items.forEach((item, i) => {
      const cardWrapper = document.createElement("div");
      cardWrapper.className =
        "absolute w-[220px] h-[320px] sm:w-[260px] sm:h-[360px] transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center justify-center cursor-pointer group";
      cardWrapper.dataset.index = i.toString();

      const imgHtml = item.image_url
        ? `<img src="${item.image_url}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] scale-110 pointer-events-none" alt="${item.name}" />`
        : `<div class="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/30 via-background to-background pointer-events-none">
             <img src="${imgProductPlaceholder}" class="w-full h-full object-cover opacity-20" />
           </div>`;

      cardWrapper.innerHTML = `
        <div class="absolute inset-0 rounded-[100px] group-hover:rounded-[32px] overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl border border-white/10 bg-background pointer-events-none">
          ${imgHtml}
          <div class="card-overlay absolute inset-0 transition-all duration-[800ms] pointer-events-none"></div>
        </div>
        
        <div class="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-30 pointer-events-none">
          <h4 class="font-light text-xl tracking-wide leading-tight mb-4 text-white/90 drop-shadow-md transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-2">${item.name}</h4>
          
          <div class="w-full flex items-center justify-center">
             <div class="shrink-0 w-12 sm:w-14 transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-0"></div>
             <div class="flex-grow transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:flex-grow-0 group-hover:w-0"></div>
             
             <div class="shrink-0 px-4 py-2 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 text-white flex items-center justify-center shadow-lg pointer-events-none transition-colors duration-[800ms] group-hover:bg-white/10">
                <span class="font-mono font-bold tracking-widest text-xs sm:text-sm whitespace-nowrap">LKR ${item.price_lkr.toLocaleString()}</span>
             </div>

             <div class="flex-grow transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:flex-grow-0 group-hover:w-4"></div>

             <button class="product-add-btn shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/90 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-auto group/btn
                            translate-x-6 translate-y-6 sm:translate-x-7 sm:translate-y-6 
                            group-hover:translate-x-0 group-hover:translate-y-0
                            group-hover:bg-white/15 group-hover:border-white/30 hover:!bg-white hover:!text-black hover:scale-110" ${!item.in_stock ? "disabled" : ""}>
                
                <div class="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] group-hover:scale-0 group-hover:opacity-0 group-hover:-rotate-90">
                   <span class="text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${item.in_stock ? "text-foreground" : "text-red-500"} text-center leading-tight">${item.in_stock ? "In<br>Stock" : "Sold<br>Out"}</span>
                </div>
                
                <div class="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] scale-0 opacity-0 rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-white group-hover/btn:text-black">
                   ${
                     item.in_stock
                       ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
                       : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
                   }
                </div>
             </button>
          </div>
        </div>
      `;

      const btn = cardWrapper.querySelector(
        ".product-add-btn"
      ) as HTMLButtonElement;
      if (btn && item.in_stock) {
        btn.onclick = e => {
          e.stopPropagation();
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          btn.classList.add("bg-green-500", "border-green-500", "text-white");
          btn.classList.remove(
            "bg-white/15",
            "hover:bg-white",
            "hover:text-black"
          );

          cardWrapper.dispatchEvent(
            new CustomEvent("action:add_to_cart", {
              bubbles: true,
              detail: {
                product_id: item.id,
                name: item.name,
                price_lkr: item.price_lkr,
                image_url: item.image_url,
              },
            })
          );
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove(
              "bg-green-500",
              "border-green-500",
              "text-white"
            );
            btn.classList.add(
              "bg-white/15",
              "hover:bg-white",
              "hover:text-black"
            );
          }, 2000);
        };
      }

      cardWrapper.onclick = () => {
        if (activeIndex !== i) {
          activeIndex = i;
          updateCarousel();
        }
      };

      cards.push(cardWrapper);
      carouselArea.appendChild(cardWrapper);
    });

    const navHtml = `
      <div class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4 pointer-events-none z-50">
        <button id="nav-prev" class="w-12 h-12 rounded-full bg-background/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-foreground hover:bg-background/80 hover:scale-110 transition-all duration-300 pointer-events-auto disabled:opacity-0 disabled:pointer-events-none shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button id="nav-next" class="w-12 h-12 rounded-full bg-background/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-foreground hover:bg-background/80 hover:scale-110 transition-all duration-300 pointer-events-auto disabled:opacity-0 disabled:pointer-events-none shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    `;
    const navContainer = document.createElement("div");
    navContainer.innerHTML = navHtml;
    carouselArea.appendChild(navContainer.firstElementChild as HTMLElement);

    const btnPrev = carouselArea.querySelector(
      "#nav-prev"
    ) as HTMLButtonElement;
    const btnNext = carouselArea.querySelector(
      "#nav-next"
    ) as HTMLButtonElement;

    btnPrev.onclick = () => {
      if (activeIndex > 0) {
        activeIndex--;
        updateCarousel();
      }
    };
    btnNext.onclick = () => {
      if (activeIndex < cards.length - 1) {
        activeIndex++;
        updateCarousel();
      }
    };

    const paginationArea = document.createElement("div");
    paginationArea.className = "flex gap-2.5 mt-6 z-40";
    const dots: HTMLElement[] = [];
    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.onclick = () => {
        activeIndex = i;
        updateCarousel();
      };
      dots.push(dot);
      paginationArea.appendChild(dot);
    });

    const updateCarousel = () => {
      btnPrev.disabled = activeIndex === 0;
      btnNext.disabled = activeIndex === cards.length - 1;

      cards.forEach((card, i) => {
        const diff = i - activeIndex;
        const transX = diff * 55;
        const scale = 1 - Math.abs(diff) * 0.2;
        const rotateY = diff * -10;

        card.style.transform = `translateX(${transX}%) scale(${scale}) rotateY(${rotateY}deg)`;
        card.style.zIndex = (100 - Math.abs(diff)).toString();

        card.style.opacity = Math.abs(diff) > 1 ? "0" : "1";
        card.style.pointerEvents = Math.abs(diff) > 1 ? "none" : "auto";

        const overlay = card.querySelector(".card-overlay") as HTMLElement;
        const content = card.querySelector(".bottom-0") as HTMLElement;
        const innerImg = card.querySelector("img");
        const actionBtn = card.querySelector(".product-add-btn") as HTMLElement;

        if (diff === 0) {
          overlay.style.background =
            "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2) 60%, transparent)";
          content.classList.remove("translate-y-4");
          content.style.opacity = "1";
          if (innerImg) {
            innerImg.style.transform = "scale(1)";
            innerImg.style.opacity = "1";
          }
          if (actionBtn) {
            actionBtn.style.opacity = "1";
            actionBtn.style.pointerEvents = "auto";
          }
        } else {
          overlay.style.background =
            "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.4))";
          content.classList.add("translate-y-4");
          content.style.opacity = "0";
          if (innerImg) {
            innerImg.style.transform = "scale(1.1)";
            innerImg.style.opacity = "0.6";
          }
          if (actionBtn) {
            actionBtn.style.opacity = "0";
            actionBtn.style.pointerEvents = "none";
          }
        }
      });

      dots.forEach((dot, i) => {
        dot.className = `h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === activeIndex ? "w-10 bg-accent" : "w-2 bg-white/20 hover:bg-white/40 cursor-pointer"}`;
      });
    };

    let startX = 0;
    let isDragging = false;
    let dragThreshold = 40;

    carouselArea.addEventListener("mousedown", e => {
      startX = e.pageX;
      isDragging = true;
    });
    window.addEventListener("mouseup", () => {
      isDragging = false;
    });
    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const diffX = e.pageX - startX;
      if (diffX > dragThreshold && activeIndex > 0) {
        activeIndex--;
        updateCarousel();
        isDragging = false;
      } else if (diffX < -dragThreshold && activeIndex < cards.length - 1) {
        activeIndex++;
        updateCarousel();
        isDragging = false;
      }
    });

    let scrollTimeout: any;
    carouselArea.addEventListener(
      "wheel",
      e => {
        e.preventDefault();
        if (scrollTimeout) return;

        if (e.deltaX > 20 || e.deltaY > 20) {
          if (activeIndex < cards.length - 1) {
            activeIndex++;
            updateCarousel();
          }
        } else if (e.deltaX < -20 || e.deltaY < -20) {
          if (activeIndex > 0) {
            activeIndex--;
            updateCarousel();
          }
        }
        scrollTimeout = setTimeout(() => {
          scrollTimeout = null;
        }, 400);
      },
      { passive: false }
    );

    updateCarousel();

    wrapper.innerHTML = headerHtml;
    wrapper.appendChild(carouselArea);
    wrapper.appendChild(paginationArea);

    this.appendComponent(wrapper);
  }

  private renderProductDetail(item: ProductDetailView): void {
    const card = document.createElement("div");
    card.className =
      "relative w-full max-w-[340px] sm:max-w-[380px] self-start my-6 group cursor-default select-none animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10";

    const imgHtml =
      item.image_urls && item.image_urls.length > 0
        ? `<img src="${item.image_urls[0]}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-[1.08] pointer-events-none" alt="${item.name}" />`
        : `<div class="absolute inset-0 w-full h-full bg-gradient-to-br from-accent/40 via-purple-500/20 to-background pointer-events-none flex items-center justify-center opacity-60"><img src="${imgProductPlaceholder}" class="w-full h-full object-cover"/></div>`;

    card.innerHTML = `
      <div class="relative w-full h-[320px] rounded-[40px] overflow-hidden shadow-2xl border border-white/10 z-0">
         ${imgHtml}
         <div class="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none"></div>

         <div class="absolute top-6 left-6 flex flex-col items-start gap-2 z-20 pointer-events-none">
            <div class="px-4 py-1.5 bg-background/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-[9px] uppercase tracking-widest font-bold ${item.in_stock ? "text-white" : "text-red-500"}">
               ${item.in_stock ? "In Stock" : "Sold Out"}
            </div>
            ${item.is_perishable ? `<div class="px-4 py-1.5 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full shadow-lg text-[9px] uppercase tracking-widest font-bold text-amber-500">Perishable</div>` : ""}
         </div>
      </div>

      <div class="relative w-[94%] mx-auto -mt-20 z-10 bg-background/60 backdrop-blur-3xl border border-white/15 rounded-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pointer-events-none">
         
         ${item.vendor_name ? `<div class="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/90 mb-3 ml-1">By ${item.vendor_name}</div>` : ""}
         
         <h3 class="text-3xl sm:text-4xl font-light tracking-wide text-white/95 leading-none mb-4 drop-shadow-md transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-1">${item.name}</h3>
         
         <p class="text-xs sm:text-sm font-light leading-relaxed text-white/50 mb-10 line-clamp-3 transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-1">
            ${item.description || "Experience the essence of elegance with this premium selection. Carefully curated for the finest taste."}
         </p>
         
         <div class="w-full h-14 flex items-center justify-center relative pointer-events-none">
            
            <div class="shrink-0 w-14 transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-0"></div>
            
            <div class="flex-grow transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:flex-grow-0 group-hover:w-0"></div>
            
            <div class="shrink-0 px-6 py-3.5 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-white/15">
               <span class="font-mono font-bold tracking-[0.15em] text-sm">LKR ${item.price_lkr.toLocaleString()}</span>
            </div>

            <div class="flex-grow transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:flex-grow-0 group-hover:w-4"></div>
            
            <button class="product-add-btn shrink-0 relative w-14 h-14 rounded-full bg-background/90 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.7)] transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-auto group/btn
                           translate-x-14 translate-y-12
                           group-hover:translate-x-0 group-hover:translate-y-0
                           group-hover:bg-white/15 group-hover:border-white/30 hover:!bg-white hover:!text-black hover:scale-110" ${!item.in_stock ? "disabled" : ""}>
               
               <div class="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] group-hover:scale-0 group-hover:opacity-0 group-hover:-rotate-90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
               </div>
               
               <div class="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] scale-0 opacity-0 rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-white group-hover/btn:text-black">
                  ${
                    item.in_stock
                      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
                      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
                  }
               </div>
            </button>
         </div>
      </div>
    `;

    const btn = card.querySelector(".product-add-btn") as HTMLButtonElement;
    if (btn && item.in_stock) {
      btn.onclick = e => {
        e.stopPropagation();
        const orig = btn.innerHTML;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        btn.classList.add("bg-green-500", "border-green-500", "text-white");
        btn.classList.remove(
          "bg-white/15",
          "hover:bg-white",
          "hover:text-black"
        );

        card.dispatchEvent(
          new CustomEvent("action:add_to_cart", {
            bubbles: true,
            detail: {
              product_id: item.id,
              name: item.name,
              price_lkr: item.price_lkr,
              image_url: item.image_urls?.[0],
            },
          })
        );
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove(
            "bg-green-500",
            "border-green-500",
            "text-white"
          );
          btn.classList.add(
            "bg-white/15",
            "hover:bg-white",
            "hover:text-black"
          );
        }, 2000);
      };
    }

    this.appendComponent(card);
  }

  private renderCategoryGrid(categories: any[]): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "w-full max-w-[340px] sm:max-w-[380px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000";

    wrapper.innerHTML = `
      <div class="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/80 mb-4 ml-2">Browse Collections</div>
      <div class="grid grid-cols-2 gap-3" id="cat-grid"></div>
    `;

    const grid = wrapper.querySelector("#cat-grid") as HTMLElement;

    const displayCategories = categories.slice(0, 8);
    displayCategories.forEach((catObj, i) => {
      const catName = typeof catObj === "string" ? catObj : catObj.name;
      const imageUrl =
        typeof catObj === "object" && catObj.image_url
          ? catObj.image_url
          : null;

      const btn = document.createElement("button");
      btn.className =
        "relative overflow-hidden h-28 p-5 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 backdrop-blur-2xl shadow-xl transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] group flex flex-col items-start justify-between text-left";

      const hue = (i * 50 + 200) % 360;

      let bgHtml = `<div class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[32px] opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" style="background-color: hsl(${hue}, 80%, 65%);"></div>`;
      if (imageUrl) {
        bgHtml += `<img src="${imageUrl}" class="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />`;
      }

      btn.innerHTML = `
        ${bgHtml}
        
        <div class="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-sm self-end relative z-10">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white group-hover:text-black transition-colors"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <span class="text-sm sm:text-base font-semibold tracking-wide text-white group-hover:text-white transition-colors z-10 drop-shadow-md leading-tight">${catName}</span>
      `;

      btn.onclick = () => {
        btn.dispatchEvent(
          new CustomEvent("action:send_message", {
            bubbles: true,
            detail: { text: `Show me ${catName}` },
          })
        );
      };
      grid.appendChild(btn);
    });

    this.appendComponent(wrapper);
  }

  private renderCitySuggestions(cities: string[]): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[380px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000";

    wrapper.innerHTML = `
      <div class="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 mb-2 ml-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        Select Delivery Zone
      </div>
      <div class="flex flex-col gap-3" id="city-list"></div>
    `;

    const list = wrapper.querySelector("#city-list") as HTMLElement;

    cities.forEach(city => {
      const btn = document.createElement("button");
      btn.className =
        "relative w-full flex items-center justify-between p-4 pr-5 rounded-[28px] bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 hover:border-white/40 transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] group shadow-lg overflow-hidden";

      btn.innerHTML = `
         <div class="flex items-center gap-4 z-10">
           <div class="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-accent/20 group-hover:border-accent/40 transition-colors duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 group-hover:text-accent transition-colors duration-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
           </div>
           <span class="font-light text-lg tracking-wide text-white drop-shadow-sm">${city}</span>
         </div>
         
         <div class="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-colors duration-500 z-10 shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white group-hover:text-black transition-colors duration-500"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
         </div>
         
         <div class="absolute inset-0 rounded-[28px] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none"></div>
         <div class="absolute inset-0 rounded-[28px] border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>
      `;

      btn.onclick = () => {
        btn.dispatchEvent(
          new CustomEvent("action:set_city", {
            bubbles: true,
            detail: { city },
          })
        );
      };
      list.appendChild(btn);
    });

    this.appendComponent(wrapper);
    this.scrollToBottom();
  }

  private renderDeliveryQuote(
    city: string,
    date: string,
    rateLkr: number,
    deliverable: boolean,
    perishableWarning: boolean,
    nextAvailable: string | null
  ): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-full max-w-[340px] sm:max-w-[400px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000";

    const isError = !deliverable;
    const isWarning = deliverable && perishableWarning;
    const glowColor = isError
      ? "bg-red-500/20"
      : isWarning
        ? "bg-amber-500/20"
        : "bg-green-500/20";
    const borderColor = isError
      ? "border-red-500/30"
      : isWarning
        ? "border-amber-500/30"
        : "border-green-500/30";
    const iconBg = isError
      ? "bg-red-500/20"
      : isWarning
        ? "bg-amber-500/20"
        : "bg-green-500/20";
    const iconColor = isError
      ? "text-red-500"
      : isWarning
        ? "text-amber-500"
        : "text-green-500";
    const statusText = isError
      ? "Unavailable"
      : isWarning
        ? "Restricted"
        : "Available";

    let iconImgSrc = "";
    if (isError) iconImgSrc = imgDeliveryNo;
    else if (isWarning) iconImgSrc = imgWarningPerishable;
    else iconImgSrc = imgDeliveryOk;

    wrapper.innerHTML = `
      <div class="relative w-full rounded-[28px] bg-background/80 backdrop-blur-3xl border border-white/15 p-6 shadow-2xl overflow-hidden group">
         <div class="absolute -top-10 -right-10 w-40 h-40 ${glowColor} rounded-full blur-[40px] pointer-events-none opacity-40"></div>
         
         <div class="flex items-center gap-4 mb-5 relative z-10">
            <div class="w-16 h-16 flex items-center justify-center shrink-0">
               <img src="${iconImgSrc}" alt="Status" class="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <div class="flex flex-col gap-0.5">
               <h4 class="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white/90">Delivery Quote</h4>
               <span class="text-[9px] font-mono uppercase tracking-widest font-bold ${iconColor}">${statusText}</span>
            </div>
         </div>

         <div class="flex flex-col gap-3 relative z-10">
            <div class="text-sm font-light tracking-wide text-white/90">
               To <span class="font-medium text-white">${city}</span> <span class="opacity-50">on</span> ${date || "the selected date"}
            </div>
            
            ${
              deliverable
                ? `
               <div class="mt-1 flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                  <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">Shipping Rate</span>
                  <span class="font-mono font-bold tracking-wider text-white">LKR ${rateLkr.toLocaleString()}</span>
               </div>
            `
                : `
               <div class="mt-1 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500/90 leading-relaxed shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]">
                  Sorry, we cannot deliver to this zone on the requested date.
               </div>
            `
            }
            
            ${
              perishableWarning
                ? `
               <div class="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500/90 mt-1">
                  <img src="${imgWarningPerishable}" alt="Warning" class="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Certain perishable items in your cart require special temperature-controlled handling.</span>
               </div>
            `
                : ""
            }
            
            ${nextAvailable ? `<div class="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1 pl-1">Next available: <span class="text-white/80 font-medium">${nextAvailable}</span></div>` : ""}
         </div>
      </div>
    `;

    this.appendComponent(wrapper);
  }

  private renderCheckoutForm(
    draft: CheckoutDraft,
    missingFields: string[]
  ): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-full max-w-[340px] sm:max-w-[400px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000";

    const fields = [
      { key: "recipient_name", label: "Recipient" },
      { key: "delivery_city", label: "City" },
      { key: "delivery_date", label: "Date" },
      { key: "sender_name", label: "Sender Name" },
      { key: "gift_message", label: "Gift Note" },
    ];

    const fieldHtmlArray = fields.map(f => {
      const isMissing = missingFields.includes(f.key);
      const val = (draft as any)[f.key];
      return `
        <div class="flex flex-col p-3.5 rounded-2xl bg-white/5 border ${isMissing ? "border-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]" : "border-white/10"} hover:border-white/20 transition-all duration-500 group/field">
           <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] uppercase tracking-[0.2em] font-bold ${isMissing ? "text-amber-500" : "text-white/40 group-hover/field:text-white/60 transition-colors"}">${f.label}</span>
              ${
                isMissing
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 animate-pulse"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white/20 group-hover/field:text-white/40 transition-colors"><polyline points="20 6 9 17 4 12"></polyline></svg>`
              }
           </div>
           <span class="text-sm font-medium tracking-wide ${isMissing ? "text-amber-500/80 italic" : "text-white/95"}">${val || (isMissing ? "Awaiting Input..." : "None")}</span>
        </div>
      `;
    });

    wrapper.innerHTML = `
      <div class="relative w-full rounded-[32px] bg-background/80 backdrop-blur-3xl border border-white/15 p-6 shadow-2xl overflow-hidden group">
         <div class="absolute -top-20 -right-20 w-56 h-56 bg-accent/20 rounded-full blur-[50px] opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"></div>

         <div class="flex items-center justify-between mb-6 relative z-10">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               </div>
               <h4 class="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white/90">Order Draft</h4>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full shadow-sm">
               <div class="w-1.5 h-1.5 rounded-full ${missingFields.length > 0 ? "bg-amber-500 animate-[pulse_2s_ease-in-out_infinite]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"}"></div>
               <span class="text-[9px] uppercase tracking-widest font-bold ${missingFields.length > 0 ? "text-amber-500" : "text-green-500"}">
                 ${missingFields.length > 0 ? "Pending" : "Complete"}
               </span>
            </div>
         </div>

         <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            <div class="sm:col-span-1">${fieldHtmlArray[0] || ""}</div>
            <div class="sm:col-span-1">${fieldHtmlArray[1] || ""}</div>
            <div class="sm:col-span-2 grid gap-3">
               ${fieldHtmlArray.slice(2).join("")}
            </div>
         </div>
      </div>
    `;

    this.appendComponent(wrapper);
    this.scrollToBottom();
  }

  private renderCheckoutReady(
    payUrl: string,
    orderRef: string,
    expiresMins: number,
    cartSummary: CartItem[]
  ): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-full max-w-[340px] sm:max-w-[400px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000";

    let itemsHtml = "";
    if (cartSummary && cartSummary.length > 0) {
      const total = cartSummary.reduce(
        (acc, curr) => acc + curr.price_lkr * curr.quantity,
        0
      );
      itemsHtml = `<div class="mb-8 flex flex-col gap-3">
        <div class="w-full border-t border-dashed border-white/20 mb-1"></div>
        ${cartSummary
          .map(
            item => `
           <div class="flex justify-between items-center text-sm">
             <div class="flex items-center gap-3 text-white/80">
                <span class="text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded shadow-sm">${item.quantity}x</span>
                <span class="font-light tracking-wide truncate max-w-[160px] text-left drop-shadow-md">${item.name}</span>
             </div>
             <span class="font-mono font-medium tracking-wide text-white/95">Rs. ${(item.price_lkr * item.quantity).toLocaleString()}</span>
           </div>
        `
          )
          .join("")}
        <div class="w-full border-t border-dashed border-white/20 mt-1"></div>
        <div class="flex justify-between items-center text-base mt-2">
           <span class="font-mono uppercase tracking-[0.2em] text-[10px] font-bold text-white/50">Total Amount</span>
           <span class="font-mono font-bold text-emerald-400 drop-shadow-md">Rs. ${total.toLocaleString()}</span>
        </div>
      </div>`;
    }

    wrapper.innerHTML = `
      <div class="relative w-full rounded-[32px] bg-background/80 backdrop-blur-3xl border border-white/15 p-8 shadow-2xl overflow-hidden group text-center">
         <div class="absolute -top-20 inset-x-0 mx-auto w-64 h-64 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none transition-opacity duration-1000"></div>

         <div class="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
            <img src="${imgOrderSuccess}" alt="Order Success" class="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-transform duration-[800ms] hover:scale-105" />
         </div>

         <h4 class="text-3xl font-light tracking-wide text-white/95 mb-2 drop-shadow-md">Order Ready</h4>
         
         <div class="flex items-center justify-center gap-3 mb-8">
            <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Reference</span>
            <span class="text-[11px] font-mono uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-sm">${orderRef}</span>
         </div>
         
         ${itemsHtml}

         <a href="${payUrl}" target="_blank" class="relative flex items-center justify-center gap-3 w-full bg-white text-black font-semibold tracking-wide py-4 rounded-[20px] transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(255,255,255,0.25)] group/btn mb-5">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:-translate-y-0.5 transition-transform"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
           Pay Securely Now
         </a>
         
         <div class="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest font-bold text-white/30">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
         Link expires in <span class="text-amber-500/80">${expiresMins} mins</span>
         </div>
      </div>
    `;

    this.appendComponent(wrapper);
  }

  private activeQuestionPrompt: {
    wrapper: HTMLElement;
    questions: any[];
    currentSlide: number;
  } | null = null;

  private renderQuestionPrompt(questions: any[]): void {
    if (this.activeQuestionPrompt) {
      const existingFields = new Set(
        this.activeQuestionPrompt.questions.map(q => q.field)
      );
      const newQuestions = questions.filter(q => !existingFields.has(q.field));
      if (newQuestions.length > 0) {
        this.activeQuestionPrompt.questions.push(...newQuestions);
        this.updateQuestionPromptDOM(
          this.activeQuestionPrompt.wrapper,
          this.activeQuestionPrompt.questions,
          this.activeQuestionPrompt.currentSlide
        );
      }
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-full max-w-[340px] sm:max-w-[400px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000";

    this.activeQuestionPrompt = {
      wrapper,
      questions: [...questions],
      currentSlide: 0,
    };
    this.updateQuestionPromptDOM(
      wrapper,
      this.activeQuestionPrompt.questions,
      this.activeQuestionPrompt.currentSlide
    );
    this.appendComponent(wrapper);
  }

  private updateQuestionPromptDOM(
    wrapper: HTMLElement,
    questions: any[],
    currentSlide: number
  ): void {
    const existingForm = wrapper.querySelector("form");
    const existingValues: Record<string, string> = {};
    if (existingForm) {
      const inputs = Array.from(
        existingForm.querySelectorAll("input, textarea")
      ) as HTMLInputElement[];
      inputs.forEach(i => {
        existingValues[i.name] = i.value;
      });
    }

    const chunkSize = 3;
    const slides = [];
    for (let i = 0; i < questions.length; i += chunkSize) {
      slides.push(questions.slice(i, i + chunkSize));
    }

    let trackHtml = "";
    slides.forEach((slide, idx) => {
      let slideHtml = "";
      slide.forEach(q => {
        const ph = q.placeholder ? `placeholder="${q.placeholder}"` : "";
        const baseClass =
          "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white/90 focus:outline-none focus:border-accent focus:bg-white/10 transition-colors shadow-inner placeholder:text-white/20";

        let inputHtml =
          q.input_type === "textarea"
            ? `<textarea name="${q.field}" class="${baseClass} min-h-[100px] resize-none" ${ph} required></textarea>`
            : `<input type="${q.input_type === "date" ? "date" : q.input_type === "tel" ? "tel" : "text"}" name="${q.field}" class="${baseClass}" ${ph} required />`;

        slideHtml += `
          <div class="mb-4">
            <label class="block text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-white/50 mb-2 pl-1">${q.label}</label>
            ${inputHtml}
          </div>
        `;
      });

      trackHtml += `
        <div class="w-full shrink-0 px-1">
          ${slideHtml}
        </div>
      `;
    });

    wrapper.innerHTML = `
      <div class="relative w-full rounded-[32px] bg-background/80 backdrop-blur-3xl border border-white/15 p-7 shadow-2xl overflow-hidden group">
         <div class="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-[40px] pointer-events-none opacity-40"></div>
         
         <div class="flex items-center justify-between mb-6 relative z-10">
            <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
               </div>
               <h4 class="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white/90">Required Info</h4>
            </div>
            <span class="step-indicator text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">1 / ${slides.length}</span>
         </div>

         <form class="flex flex-col relative z-10 overflow-hidden w-full">
            <div class="flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" id="carousel-track" style="width: 100%;">
               ${trackHtml}
            </div>
            
            <div class="flex gap-3 mt-4">
               <button type="button" id="prev-btn" class="hidden relative items-center justify-center gap-2 px-4 bg-white/5 border border-white/10 text-white font-semibold tracking-wide py-3.5 rounded-[16px] transition-all duration-300 hover:bg-white/10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
               </button>
               <button type="button" id="next-btn" class="${slides.length > 1 ? "flex" : "hidden"} flex-1 relative items-center justify-center gap-2 bg-white/10 text-white font-semibold tracking-wide py-3.5 rounded-[16px] transition-all duration-[600ms] hover:scale-[1.02] hover:bg-white/20">
                 <span>Next</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="translate-x-0.5"><path d="M9 18l6-6-6-6"/></svg>
               </button>
               <button type="submit" id="submit-btn" class="${slides.length === 1 ? "flex" : "hidden"} flex-1 relative items-center justify-center gap-2 bg-white text-black font-semibold tracking-wide py-3.5 rounded-[16px] transition-all duration-[600ms] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(255,255,255,0.15)] group/btn">
                 <span>Submit</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
               </button>
            </div>
         </form>
      </div>
    `;

    const totalSlides = slides.length;
    const track = wrapper.querySelector("#carousel-track") as HTMLElement;
    const prevBtn = wrapper.querySelector("#prev-btn") as HTMLButtonElement;
    const nextBtn = wrapper.querySelector("#next-btn") as HTMLButtonElement;
    const submitBtn = wrapper.querySelector("#submit-btn") as HTMLButtonElement;
    const indicator = wrapper.querySelector(".step-indicator") as HTMLElement;

    const updateCarousel = () => {
      const offset = currentSlide * 100;
      track.style.transform = `translateX(-${offset}%)`;
      indicator.textContent =
        totalSlides > 0 ? `${currentSlide + 1} / ${totalSlides}` : "0 / 0";

      if (currentSlide === 0) {
        prevBtn.classList.add("hidden");
        prevBtn.classList.remove("flex");
      } else {
        prevBtn.classList.remove("hidden");
        prevBtn.classList.add("flex");
      }

      if (currentSlide >= totalSlides - 1) {
        nextBtn.classList.add("hidden");
        nextBtn.classList.remove("flex");
        submitBtn.classList.remove("hidden");
        submitBtn.classList.add("flex");
      } else {
        nextBtn.classList.remove("hidden");
        nextBtn.classList.add("flex");
        submitBtn.classList.add("hidden");
        submitBtn.classList.remove("flex");
      }
    };

    updateCarousel();

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentSlide > 0) {
          currentSlide--;
          if (this.activeQuestionPrompt)
            this.activeQuestionPrompt.currentSlide = currentSlide;
          updateCarousel();
        }
      });
      nextBtn.addEventListener("click", () => {
        const slideElement = track.children[currentSlide];
        if (!slideElement) return;
        const currentInputs = Array.from(
          slideElement.querySelectorAll("input, textarea")
        ) as HTMLInputElement[];
        for (const currentInput of currentInputs) {
          if (!currentInput.checkValidity()) {
            currentInput.reportValidity();
            return;
          }
        }
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          if (this.activeQuestionPrompt)
            this.activeQuestionPrompt.currentSlide = currentSlide;
          updateCarousel();
        }
      });
    }

    const form = wrapper.querySelector("form");
    if (form) {
      const inputs = Array.from(
        form.querySelectorAll("input, textarea")
      ) as HTMLInputElement[];
      inputs.forEach(i => {
        if (existingValues[i.name] !== undefined) {
          i.value = existingValues[i.name];
        }
      });
      form.onsubmit = e => {
        e.preventDefault();
        const inputs = Array.from(
          form.querySelectorAll("input, textarea")
        ) as HTMLInputElement[];
        if (inputs.every(i => i.value.trim() !== "")) {
          const answerObj: Record<string, string> = {};
          inputs.forEach(i => {
            answerObj[i.name] = i.value;
          });
          const answers = JSON.stringify(answerObj);
          wrapper.dispatchEvent(
            new CustomEvent("action:send_chat", {
              bubbles: true,
              detail: { text: answers, silent: true },
            })
          );
          inputs.forEach(i => {
            i.disabled = true;
            i.classList.add("opacity-50");
          });
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="text-gray-500">Submitted</span>`;
          submitBtn.className =
            "flex-1 mt-2 flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 py-3.5 rounded-[16px] cursor-not-allowed";
        }
      };
    }
  }

  private renderTrackingResult(result: TrackingResult): void {
    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-full max-w-[340px] sm:max-w-[400px] self-start my-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000";

    let timelineHtml =
      '<div class="flex flex-col pl-4 relative before:absolute before:left-[21px] before:top-2 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-accent/50 before:to-transparent z-10">';

    result.timeline.forEach((t, i) => {
      const isFirst = i === 0;
      const time = new Date(t.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = new Date(t.timestamp).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });

      timelineHtml += `
        <div class="flex gap-5 relative pb-6 last:pb-0">
          <div class="relative w-4 h-4 rounded-full bg-background border-2 ${isFirst ? "border-accent shadow-[0_0_12px_rgba(var(--color-accent),0.8)]" : "border-white/20"} flex items-center justify-center shrink-0 z-10 mt-1">
            ${isFirst ? '<div class="absolute inset-0 rounded-full bg-accent animate-ping opacity-30"></div>' : ""}
            ${isFirst ? '<div class="w-1.5 h-1.5 rounded-full bg-accent"></div>' : ""}
          </div>
          <div class="flex flex-col -mt-0.5">
            <span class="text-sm font-medium tracking-wide ${isFirst ? "text-white" : "text-white/60"} drop-shadow-sm">${t.description}</span>
            <span class="text-[10px] font-mono uppercase tracking-[0.1em] opacity-50 mt-1">${date}, ${time}</span>
          </div>
        </div>
      `;
    });
    timelineHtml += "</div>";

    wrapper.innerHTML = `
      <div class="relative w-full rounded-[32px] bg-background/80 backdrop-blur-3xl border border-white/15 p-7 shadow-2xl overflow-hidden group">
         
         <div class="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-[40px] pointer-events-none opacity-40"></div>
         
         <div class="flex items-center justify-between border-b border-white/10 pb-5 mb-6 relative z-10">
            <div class="flex flex-col gap-1.5">
               <h4 class="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/50">Tracking Status</h4>
               <div class="text-xs uppercase tracking-widest font-bold text-accent drop-shadow-sm">${result.status}</div>
            </div>
            <div class="w-16 h-16 flex items-center justify-center shrink-0">
               <img src="${imgTrackingPackage}" alt="Package" class="w-full h-full object-contain drop-shadow-xl" />
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4 mb-7 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
            <div class="flex flex-col gap-1">
               <span class="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">Recipient</span>
               <span class="text-xs font-medium tracking-wide text-white/90 truncate">${result.recipient}</span>
            </div>
            <div class="flex flex-col gap-1">
               <span class="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">Items</span>
               <span class="text-xs font-medium tracking-wide text-white/90 truncate">${result.items.join(", ")}</span>
            </div>
         </div>

         <!-- Interactive Timeline -->
         ${timelineHtml}
      </div>
    `;

    this.appendComponent(wrapper);
    this.scrollToBottom();
  }

  scrollToBottom(forceSmooth = false): void {
    if (this.canvas) {
      this.canvas.scrollTo({
        top: this.canvas.scrollHeight,
        behavior: forceSmooth ? "smooth" : "auto",
      });
    }
  }
}
