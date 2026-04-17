export {};

type LoaderSpotlightMode = "hover" | "always" | "none";

const loaderSelector = "[data-loader]";
const skeletonSelector = '.loader-container[data-loader-skeleton="true"]';
const initializedLoaders = new WeakSet<HTMLElement>();
let skeletonElements: HTMLElement[] = [];
let skeletonListenersBound = false;
let isUpdating = false;

const refreshSkeletonElements = () => {
  skeletonElements = Array.from(
    document.querySelectorAll<HTMLElement>(skeletonSelector)
  );
};

const updateSkeletonOffsets = () => {
  if (isUpdating || skeletonElements.length === 0) return;
  isUpdating = true;

  requestAnimationFrame(() => {
    skeletonElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--bg-x", `${-rect.left}px`);
      el.style.setProperty("--bg-y", `${-rect.top}px`);
      if (el.dataset.skeletonSynced !== "true") {
        el.dataset.skeletonSynced = "true";
      }
    });
    isUpdating = false;
  });
};

const bindSkeletonListeners = () => {
  if (skeletonListenersBound) return;

  window.addEventListener("scroll", updateSkeletonOffsets, {
    passive: true,
  });
  window.addEventListener("resize", updateSkeletonOffsets, {
    passive: true,
  });

  skeletonListenersBound = true;
};

const openPopoverIfNeeded = (element: HTMLElement) => {
  if (element.hasAttribute("popover") && !element.matches(":popover-open")) {
    try {
      element.showPopover();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // ignore: popover support may vary by browser
    }
  }
};

class LoaderManager {
  private loader: HTMLElement | null;
  private fadeOutClass = "fade-out";
  private revealDuration = 420;
  private onRemove?: () => void;

  constructor(loaderElement: HTMLElement, onRemove?: () => void) {
    this.loader = loaderElement;
    this.onRemove = onRemove;
  }

  hide(): Promise<void> {
    return new Promise(resolve => {
      if (!this.loader) {
        resolve();
        return;
      }

      const element = this.loader;
      element.dataset.loaderState = "exit";
      const fallbackTimeout = this.revealDuration + 120;
      let resolved = false;

      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        element.removeEventListener("transitionend", onTransitionEnd);
        if (this.loader) {
          this.loader.style.display = "none";
          if (
            this.loader.hasAttribute("popover") &&
            this.loader.matches(":popover-open")
          ) {
            try {
              this.loader.hidePopover();
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_e) {
              // ignore: popover may not be available in all browsers
            }
          }
        }
        resolve();
      };

      const onTransitionEnd = (e: TransitionEvent) => {
        if (e.target === element && e.propertyName === "opacity") {
          cleanup();
        }
      };

      element.addEventListener("transitionend", onTransitionEnd);
      element.classList.add(this.fadeOutClass);
      setTimeout(cleanup, fallbackTimeout + 100);
    });
  }

  show(): void {
    if (!this.loader) return;

    openPopoverIfNeeded(this.loader);

    this.loader.style.display = "";
    this.loader.classList.remove(this.fadeOutClass);
    this.loader.dataset.loaderState = "enter";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.loader) {
          this.loader.dataset.loaderState = "ready";
        }
      });
    });
  }

  remove(): void {
    this.hide().then(() => {
      this.onRemove?.();
      if (this.loader && this.loader.parentNode) {
        this.loader.parentNode.removeChild(this.loader);
      }
    });
  }
}

class LoaderSpotlight {
  private loader: HTMLElement;
  private mode: LoaderSpotlightMode;
  private isPointerFine: boolean;
  private loaderRect: DOMRect | null = null;
  private rafId: number | null = null;
  private queuedEvent: PointerEvent | null = null;
  private boundTarget: HTMLElement | null = null;

  private readonly onWindowResize = () => {
    this.loaderRect = null;
  };

  private readonly onEnter = (event: Event) => {
    this.loader.classList.add("loader-spotlight-active");
    this.updateFromPointer(event as PointerEvent);
  };

  private readonly onMove = (event: Event) => {
    this.queuePointerUpdate(event as PointerEvent);
  };

  private readonly onLeave = () => {
    this.setSpotlightToCenter();
  };

  constructor(loaderElement: HTMLElement, mode: LoaderSpotlightMode) {
    this.loader = loaderElement;
    this.mode = mode;
    this.isPointerFine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
  }

  private isBackgroundLoader(): boolean {
    return this.loader.classList.contains("loader-container--background");
  }

  private shouldDisableBackgroundSpotlight(): boolean {
    if (!this.isBackgroundLoader()) return false;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const saveData = nav.connection?.saveData === true;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    ).matches;
    const lowCpuCores =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency > 0 &&
      navigator.hardwareConcurrency <= 4;

    return saveData || prefersReducedMotion || isCoarsePointer || lowCpuCores;
  }

  private clearSpotlightPosition(): void {
    this.loader.style.removeProperty("--loader-spotlight-x");
    this.loader.style.removeProperty("--loader-spotlight-y");
    this.loader.style.removeProperty("--loader-spotlight-size");
  }

  init(): void {
    // Native mobile optimization: Completely disable hover compute & spotlight elements
    if (!this.isPointerFine && this.mode !== "always") {
      this.clearSpotlightPosition();
      this.loader.classList.remove("loader-spotlight-active");
      return;
    }

    if (this.shouldDisableBackgroundSpotlight()) {
      this.clearSpotlightPosition();
      this.loader.classList.remove("loader-spotlight-active");
      return;
    }

    if (this.mode === "none") {
      this.clearSpotlightPosition();
      return;
    }

    this.setSpotlightToCenter();
    this.loader.classList.add("loader-spotlight-active");

    if (this.mode === "always" || !this.isPointerFine) return;

    this.attachHoverListeners();
  }

  private attachHoverListeners(): void {
    const isGlobal = this.loader.dataset.loaderGlobalHover === "true";
    const target = isGlobal ? document.documentElement : this.loader;
    this.boundTarget = target;
    const shouldTrackScroll = !isGlobal && !this.isBackgroundLoader();

    if (isGlobal) {
      this.loader.classList.add("loader-spotlight-active");
      target.addEventListener("pointermove", this.onMove as EventListener);
    } else {
      target.addEventListener("pointerenter", this.onEnter as EventListener);
      target.addEventListener("pointermove", this.onMove as EventListener);
      target.addEventListener("pointerleave", this.onLeave as EventListener);
    }

    window.addEventListener("resize", this.onWindowResize, {
      passive: true,
    });
    if (shouldTrackScroll) {
      window.addEventListener("scroll", this.onWindowResize, {
        passive: true,
      });
    }
  }

  destroy(): void {
    if (this.boundTarget) {
      this.boundTarget.removeEventListener(
        "pointermove",
        this.onMove as EventListener
      );
      this.boundTarget.removeEventListener(
        "pointerenter",
        this.onEnter as EventListener
      );
      this.boundTarget.removeEventListener(
        "pointerleave",
        this.onLeave as EventListener
      );
    }
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("scroll", this.onWindowResize);

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private queuePointerUpdate(event: PointerEvent): void {
    this.queuedEvent = event;
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.queuedEvent) {
        this.updateFromPointer(this.queuedEvent);
        this.queuedEvent = null;
      }
    });
  }

  private getLoaderRect(): DOMRect {
    if (!this.loaderRect) {
      this.loaderRect = this.loader.getBoundingClientRect();
    }

    return this.loaderRect;
  }

  private updateFromPointer(event: PointerEvent): void {
    const rect = this.getLoaderRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.loader.style.setProperty(
      "--loader-spotlight-x",
      `${Math.min(100, Math.max(0, x))}%`
    );
    this.loader.style.setProperty(
      "--loader-spotlight-y",
      `${Math.min(100, Math.max(0, y))}%`
    );
    this.loader.style.setProperty(
      "--loader-spotlight-size",
      `${Math.max(120, Math.min(rect.width, rect.height) * 0.3)}px`
    );
  }

  private setSpotlightToCenter(): void {
    const isMobile = window.innerWidth < 768;

    this.loader.style.setProperty(
      "--loader-spotlight-x",
      isMobile ? "0%" : "50%"
    );
    this.loader.style.setProperty(
      "--loader-spotlight-y",
      isMobile ? "0%" : "50%"
    );
    this.loader.style.setProperty(
      "--loader-spotlight-size",
      isMobile ? "0px" : "110px"
    );
  }
}

type LoaderManagerElement = HTMLElement & {
  __loaderManager?: LoaderManager;
};

const initLoader = (element: LoaderManagerElement) => {
  if (initializedLoaders.has(element)) return;
  initializedLoaders.add(element);

  const spotlightMode = (element.dataset.loaderSpotlight ||
    "hover") as LoaderSpotlightMode;
  const spotlight = new LoaderSpotlight(element, spotlightMode);
  spotlight.init();

  const manager = new LoaderManager(element, () => spotlight.destroy());
  element.__loaderManager = manager;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      openPopoverIfNeeded(element);

      if (element.dataset.loaderState === "enter") {
        element.dataset.loaderState = "ready";
      }
    });
  });
};

const initLoaders = () => {
  refreshSkeletonElements();
  bindSkeletonListeners();

  const loaders = document.querySelectorAll<HTMLElement>(loaderSelector);
  loaders.forEach(loader => initLoader(loader as LoaderManagerElement));

  updateSkeletonOffsets();
};

if (typeof window !== "undefined") {
  (
    window as unknown as { LoaderManager?: typeof LoaderManager }
  ).LoaderManager = LoaderManager;
  initLoaders();
  document.addEventListener("astro:page-load", initLoaders);
}
