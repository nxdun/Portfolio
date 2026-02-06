export const startTypingAnimation = (elementId: string, words: string[]) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Optimization: Store timeout ID on the element to allow cleanup
  // This prevents multiple overlapping animations if the script runs multiple times
  const previousTimeout = (element as any)._typingTimeout;
  if (previousTimeout) clearTimeout(previousTimeout);

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeEffect = () => {
    // Optimization: Stop if element is removed from DOM (navigation)
    if (!document.body.contains(element)) return;

    const currentWord = words[wordIndex];
    const currentChar = currentWord.substring(0, charIndex);
    element.textContent = currentChar;

    let typeSpeed = 200;

    if (!isDeleting && charIndex < currentWord.length) {
      // Typing
      charIndex++;
      typeSpeed = 200;
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      charIndex--;
      typeSpeed = 100;
    } else {
      // Switch state
      isDeleting = !isDeleting;
      wordIndex = !isDeleting ? (wordIndex + 1) % words.length : wordIndex;
      typeSpeed = 1200;
    }

    (element as any)._typingTimeout = setTimeout(typeEffect, typeSpeed);
  };

  typeEffect();
};
