/**
 * Color utility functions for handling color conversions and transitions
 */

// Convert hex string to RGB array
export const hexToRgb = (hex) => {
  // Ensure we're working with a clean hex string
  if (!hex || typeof hex !== "string") {
    console.error(`Invalid hex color: ${hex}`);
    return [0, 0, 0]; // Default to black
  }

  // Handle potential issues with the hex format
  const cleanHex = hex.replace(/^#/, "");

  try {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Check for NaN values and provide fallbacks
    return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
  } catch (err) {
    console.error(`Error parsing hex color ${hex}:`, err);
    return [0, 0, 0]; // Default to black
  }
};

// Convert RGB array to hex string
export const rgbToHex = (rgb) => {
  return rgb
    .map((value) => {
      const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
};

// Interpolate between two colors with easing
export const interpolateColor = (color1, color2, factor, easingFn) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Apply easing function to factor for smoother transitions
  const easedFactor = easingFn ? easingFn(factor) : factor;

  // Use a more precise interpolation algorithm
  const result = rgb1.map((c1, i) => {
    return Math.round(c1 + easedFactor * (rgb2[i] - c1));
  });

  return rgbToHex(result);
};
