/**
 * Options for the typing animation
 */
interface TypingOptions {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

/**
 * Typing Animation Class
 * Handles typing/deleting cycles
 */
export class TypingAnimation {
  private element: HTMLElement;
  private words: string[];
  private typingSpeed: number;
  private deletingSpeed: number;
  private pauseDuration: number;

  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: number | null = null;
  private isRunning = false;

  constructor(elementId: string, options: TypingOptions) {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`Element with id "${elementId}" not found.`);
    }
    this.element = el;
    this.words = options.words;
    this.typingSpeed = options.typingSpeed ?? 150;
    this.deletingSpeed = options.deletingSpeed ?? 75;
    this.pauseDuration = options.pauseDuration ?? 1500;

    // Preserve initial content if it exists to avoid double-typing on init
    const initialText = this.element.textContent?.trim() || "";
    if (initialText && this.words[0] === initialText) {
      this.charIndex = initialText.length;
      this.isDeleting = true; // Start by deleting the first word after pause
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  public stop() {
    this.isRunning = false;
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private tick() {
    if (!this.isRunning || !document.body.contains(this.element)) {
      this.stop();
      return;
    }

    const currentWord = this.words[this.wordIndex];

    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }

    this.element.textContent = currentWord.substring(0, this.charIndex);

    let delta = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.charIndex === currentWord.length) {
      // Word complete, pause then delete
      this.isDeleting = true;
      delta = this.pauseDuration;
    } else if (this.isDeleting && this.charIndex === 0) {
      // Deletion complete, move to next word
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delta = 500; // Small pause before typing next word
    }

    this.timeoutId = window.setTimeout(() => this.tick(), delta);
  }
}

/**
 * Element extended with typing animation instance for cleanup tracking.
 */
interface TypingElement extends HTMLElement {
  _typingInstance?: TypingAnimation;
}

/**
 * Functional wrapper for backward compatibility and easy usage.
 * Attaches the instance to the element to prevent duplicate animations.
 */
export const startTypingAnimation = (elementId: string, words: string[]) => {
  const element = document.getElementById(elementId) as TypingElement | null;
  if (!element) return;

  // Cleanup existing instance
  if (element._typingInstance) {
    element._typingInstance.stop();
  }

  const animation = new TypingAnimation(elementId, { words });
  element._typingInstance = animation;
  animation.start();
};
