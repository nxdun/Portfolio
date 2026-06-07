import { startTypingAnimation } from "@/utils/typingAnimation";

/**
 * Initializes home page specific features.
 * Handles typing animations, contribution graph, and session state.
 */
export const initHomePage = () => {
  const mainContent = document.querySelector(
    "#main-content"
  ) as HTMLElement | null;
  const indexLayout = mainContent?.dataset?.layout;

  if (indexLayout === "index") {
    sessionStorage.setItem("backUrl", "/");
  }

  // Dynamic Typing Animation
  startTypingAnimation("dynamic-text", [
    "DevOps Engineer",
    "Software Designer",
    "Natural Programmer",
  ]);

  // Contribution Graph Initialization
  // We defer the loading of the graph logic until the main page is ready.
  const isLargeScreen = window.matchMedia("(min-width: 1280px)").matches;
  const graphContainer = document.querySelector("[data-contribution-graph]");

  if (isLargeScreen && graphContainer) {
    const initGraph = async () => {
      try {
        const { initContributionGraph } =
          await import("@/scripts/contributionGraph");
        initContributionGraph();
      } catch (error) {
        console.error("Failed to initialize contribution graph:", error);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(initGraph);
    } else {
      setTimeout(initGraph, 200);
    }
  }
};

// Auto-initialize on page load
if (typeof window !== "undefined") {
  document.addEventListener("astro:page-load", initHomePage);
}
