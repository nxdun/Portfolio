export const startTypingAnimation = (elementId: string, words: string[]) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const el = element as HTMLElement & { _typingTimeout?: number };
  const previousTimeout = el._typingTimeout;
  if (previousTimeout) clearTimeout(previousTimeout);

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeEffect = () => {
    if (!document.body.contains(element)) return;

    const currentWord = words[wordIndex];
    const currentChar = currentWord.substring(0, charIndex);
    element.textContent = currentChar;

    let typeSpeed = 200;

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex++;
      typeSpeed = 200;
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      typeSpeed = 100;
    } else {
      isDeleting = !isDeleting;
      wordIndex = !isDeleting ? (wordIndex + 1) % words.length : wordIndex;
      typeSpeed = 1200;
    }

    el._typingTimeout = window.setTimeout(typeEffect, typeSpeed);
  };

  typeEffect();
};
