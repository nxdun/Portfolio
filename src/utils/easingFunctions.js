/**
 * Advanced easing functions for natural transitions
 */
export const easing = {
  // Smooth start and end
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    
  // Smooth start
  easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
  
  // Elastic feel
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Custom easing for color transitions
  colorEase: (t) => {
    // Smoother in the middle, quicker at the edges
    return t < 0.5
      ? 0.5 * Math.pow(2 * t, 2.5)
      : 0.5 * (1 - Math.pow(-2 * t + 2, 2.5)) + 0.5;
  },
};
