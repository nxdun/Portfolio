// Note: This relies on Vite's glob import feature.
const iconImports = import.meta.glob<string>("/src/assets/tags/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

const uiIconImports = import.meta.glob<string>("/src/assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

const iconAliases: Record<string, string> = {
  IconGitLab: "IconGitHub",
};

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
  const resolvedName = iconAliases[name] || name;
  const tagPath = `/src/assets/tags/${resolvedName}.svg`;
  const uiPath = `/src/assets/icons/${resolvedName}.svg`;

  return iconImports[tagPath] || uiIconImports[uiPath];
};
