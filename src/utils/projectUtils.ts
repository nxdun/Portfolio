import projectsData from "@/data/projects/ProjectData.json";
import { slugifyStr } from "./slugify";

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

const normalizeIconName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildIconIndex = (imports: Record<string, string>) => {
  const index: Record<string, string> = {};

  Object.keys(imports).forEach(path => {
    const fileName = path.split("/").pop() || "";
    const baseName = fileName.replace(/\.svg$/i, "");
    index[normalizeIconName(baseName)] = path;
  });

  return index;
};

const tagIconIndex = buildIconIndex(iconImports);
const uiIconIndex = buildIconIndex(uiIconImports);

const resolveIcon = (
  name: string,
  imports: Record<string, string>,
  index: Record<string, string>,
  basePath: string
) => {
  const directPath = `${basePath}/${name}.svg`;
  if (imports[directPath]) {
    return imports[directPath];
  }

  const normalizedPath = index[normalizeIconName(name)];
  if (normalizedPath) {
    return imports[normalizedPath];
  }

  return undefined;
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
 * Get the SVG content for a project tag icon.
 */
export const getTagIcon = (name: string) => {
  return resolveIcon(name, iconImports, tagIconIndex, "/src/assets/tags");
};

/**
 * Get the SVG content for a UI/link icon.
 */
export const getUiIcon = (name: string) => {
  return resolveIcon(name, uiIconImports, uiIconIndex, "/src/assets/icons");
};

/**
 * Backward-compatible resolver. Prefer `getTagIcon` or `getUiIcon` in new code.
 */
export const getIcon = (name: string) => {
  return getTagIcon(name) || getUiIcon(name);
};

/**
 * Returns all raw project data.
 */
export const getAllProjects = () => {
  return projectsData;
};

type Project = (typeof projectsData)[number] & { featured?: number };

/**
 * Returns all projects sorted by their featured rank (lower numbers first).
 * Non-featured projects are placed at the end.
 */
export const getSortedProjects = () => {
  return [...projectsData].sort((a: Project, b: Project) => {
    const aRank = a.featured ?? 9999;
    const bRank = b.featured ?? 9999;
    return aRank - bRank;
  });
};

/**
 * Returns the top N featured projects.
 */
export const getFeaturedProjects = (limit: number) => {
  return getSortedProjects()
    .filter(project => typeof project.featured === "number")
    .slice(0, limit);
};

/**
 * Returns the slug for a project.
 */
export const getProjectSlug = (project: Project) => {
  return project.slug || slugifyStr(project.project_name);
};
