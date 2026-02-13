// Get all tags icons only.
// Note: This relies on Vite's glob import feature.
const iconImports = import.meta.glob<string>("/src/assets/tags/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

/**
 * Generate distinct colorful styles for tags based on the tag name.
 * Generates a hue value between 0 and 360.
 */
export const getTagHue = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
};

/**
 * Get the SVG content for a given icon name.
 */
export const getIcon = (name: string) => {
  const path = `/src/assets/tags/${name}.svg`;
  return iconImports[path];
};
