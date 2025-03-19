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
        const sectionPromises = sections.map((section) =>
          Promise.resolve(typeof section === "function").then((result) => {
            setProgress((prev) => Math.min(prev + (60 / sections.length), 100));
            return result;
          })
        );

        // Wait for all loading to complete
        await Promise.all([fontPromise, ...sectionPromises]);

        // Final progress
        setProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      } catch (error) {
        console.error("Loading error:", error);
        setIsLoading(false); // Fallback in case of error
      }
    };

    // Start loading check
    checkIfLoadingComplete();

    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      setIsLoading(false);
      setProgress(100);
    }, MAX_LOADING_TIME);

    return () => clearTimeout(timeoutId);
  }, [sections]);

  return { isLoading, progress };
}
