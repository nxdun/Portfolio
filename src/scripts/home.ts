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

  if (indexLayout !== "index") return;

  sessionStorage.setItem("backUrl", "/");

  // Dynamic Typing Animation
  startTypingAnimation("dynamic-text", [
    "DevOps Engineer",
    "Software Designer",
    "Natural Programmer",
  ]);

  // Contribution Graph Initialization
  import("@/features/contribution-graph")
    .then(({ bootContributionGraph }) => {
      bootContributionGraph();
    })
    .catch(() => {
      // Gracefully handle module load failure
    });
};

// Auto-initialize on page load
if (typeof window !== "undefined") {
  document.addEventListener("astro:page-load", initHomePage);
}
