export const bootContributionGraph = () => {
  const isLargeScreen = window.matchMedia("(min-width: 1280px)").matches;
  const graphContainer = document.querySelector("[data-contribution-graph]");

  if (isLargeScreen && graphContainer) {
    const initGraph = async () => {
      try {
        const { initContributionGraph } = await import("./graph/index");
        initContributionGraph();
      } catch (error) {
        // eslint-disable-next-line no-console
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
