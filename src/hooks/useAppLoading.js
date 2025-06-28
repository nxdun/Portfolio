import { useState, useEffect } from "react";

const MAX_LOADING_TIME = 10000; // 10 seconds maximum loading time

export function useAppLoading(sections) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeoutId;
    console.clear(); // Clear console for better readability
    
    const checkIfLoadingComplete = async () => {
      try {
        // Start with font loading - 20% weight
        const fontPromise = new Promise((resolve) => {
          if (document.fonts.status === "loaded") {
            setProgress((prev) => Math.min(prev + 20, 100));
            resolve(true);
          }
          document.fonts.ready.then(() => {
            setProgress((prev) => Math.min(prev + 20, 100));
            resolve(true);
          });
        });

        // Section loading - 60% weight
        // With React.lazy, components are not functions until loaded.
        // We'll assume `sections` are now identifiers or names for progress tracking.
        // The actual loading is handled by Suspense.
        // This hook now primarily manages initial asset loading like fonts
        // and provides a general loading progress.
        const sectionLoadIncrement = sections.length > 0 ? 60 / sections.length : 0;
        sections.forEach(() => {
          setProgress((prev) => Math.min(prev + sectionLoadIncrement, 100));
        });

        // Wait for font loading to complete
        await fontPromise;

        // If sections were actual promises, you would await them here.
        // await Promise.all(sectionPromises);

        // Simulate remaining progress for other assets or steps (20%)
        // This part might need to be connected to actual asset loading if any.
        // For now, we assume fonts (20%) + section placeholders (60%) = 80%
        // The remaining 20% can be for other assets or just to complete to 100%.
        setProgress((prev) => Math.min(prev + 20, 100));


        // Final progress
        // Ensure progress reaches 100 smoothly
        const finalProgressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev < 100) {
              return Math.min(prev + 5, 100);
            }
            clearInterval(finalProgressInterval);
            setIsLoading(false);
            return 100;
          });
        }, 50); // Adjust timing as needed


      } catch (error) {
        console.error("Loading error:", error);
        setIsLoading(false); // Fallback in case of error
        setProgress(100); // Ensure progress is marked as complete
      }
    };

    // Start loading check
    checkIfLoadingComplete();

    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isLoading) { // Check if still loading
        console.warn("Loading timeout reached. Forcing UI display.");
        setIsLoading(false);
        setProgress(100);
      }
    }, MAX_LOADING_TIME);

    return () => {
      clearTimeout(timeoutId);
      // Potentially clear intervals if any are still running
    };
  }, [sections, isLoading]); // Added isLoading to dependencies to avoid issues if component unmounts then remounts

  return { isLoading, progress };
}
