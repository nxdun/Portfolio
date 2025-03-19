import { useEffect, useRef } from "react";
import { useColorScheme } from "../contexts/ColorSchemeContext";

export function useSectionObserver(sectionRefs, isLoading) {
  const { activeSection, startSectionTransition } = useColorScheme();
  const lastSectionChangeTime = useRef(Date.now());
  const pendingSectionChange = useRef(null);
  
  // Handle section visibility changes using Intersection Observer
  useEffect(() => {
    if (isLoading) return; // Don't set up observers until content is loaded

    // First, ensure we have proper initial detection of visible sections
    setTimeout(() => {
      const initialSection = determineInitialActiveSection();
      if (initialSection && initialSection !== activeSection) {
        startSectionTransition(initialSection);
      }
    }, 100);

    const observerOptions = {
      root: null, // viewport
      rootMargin: "-10% 0px -10% 0px", // Adjust margins to improve detection
      threshold: [0.15, 0.3, 0.5, 0.7], // More thresholds for better precision
    };

    // Keep track of section visibility values
    const sectionVisibility = new Map();

    const handleIntersection = (entries) => {
      // Update section visibility ratios
      entries.forEach((entry) => {
        const sectionId = entry.target.id.replace("-section", "");

        if (entry.isIntersecting) {
          sectionVisibility.set(sectionId, {
            ratio: entry.intersectionRatio,
            timestamp: Date.now(),
          });
        } else {
          // Keep entry but mark as not intersecting
          if (sectionVisibility.has(sectionId)) {
            sectionVisibility.set(sectionId, {
              ratio: 0,
              timestamp: Date.now(),
            });
          }
        }
      });

      // Find section with highest visibility ratio
      let highestRatio = 0.1; // Minimum threshold to consider
      let mostVisibleSection = null;
      let mostRecentHighSection = { section: null, timestamp: 0 };

      sectionVisibility.forEach((data, section) => {
        if (data.ratio > highestRatio) {
          highestRatio = data.ratio;
          mostVisibleSection = section;
        }

        // Track most recently highly visible section as fallback
        if (
          data.ratio > 0.3 &&
          data.timestamp > mostRecentHighSection.timestamp
        ) {
          mostRecentHighSection = { section, timestamp: data.timestamp };
        }
      });

      // If no section has sufficient visibility, use most recent one with high visibility
      if (!mostVisibleSection && mostRecentHighSection.section) {
        mostVisibleSection = mostRecentHighSection.section;
      }

      // Default to current section if nothing else is determined
      mostVisibleSection = mostVisibleSection || activeSection;

      // Check if we should change section (with debounce)
      if (mostVisibleSection && mostVisibleSection !== activeSection) {
        const now = Date.now();
        const timeSinceLastChange = now - lastSectionChangeTime.current;

        // Clear any pending change
        if (pendingSectionChange.current) {
          clearTimeout(pendingSectionChange.current);
          pendingSectionChange.current = null;
        }

        // Debounce section changes to prevent rapid flipping
        if (timeSinceLastChange < 600) {
          pendingSectionChange.current = setTimeout(() => {
            startSectionTransition(mostVisibleSection);
            pendingSectionChange.current = null;
            lastSectionChangeTime.current = Date.now();
          }, 300);
        } else {
          startSectionTransition(mostVisibleSection);
          lastSectionChangeTime.current = Date.now();
        }
      }
    };

    // Create observer
    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    // Function to determine initial active section
    function determineInitialActiveSection() {
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      const viewportMiddle = scrollPosition + viewportHeight / 2;

      // Find which section contains the middle of the viewport
      let activeSection = "hero"; // Default
      Object.entries(sectionRefs).forEach(([section, ref]) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const sectionTop = rect.top + scrollPosition;
          const sectionBottom = rect.bottom + scrollPosition;

          if (viewportMiddle >= sectionTop && viewportMiddle <= sectionBottom) {
            activeSection = section;
          }
        }
      });

      return activeSection;
    }

    // Observe all sections
    Object.entries(sectionRefs).forEach(([section, ref]) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
      if (pendingSectionChange.current) {
        clearTimeout(pendingSectionChange.current);
        pendingSectionChange.current = null;
      }
    };
  }, [activeSection, isLoading, sectionRefs, startSectionTransition]);
}
