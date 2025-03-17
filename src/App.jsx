// * Main Application Component
// ! Requires proper section and asset loading
// ? Consider implementing code splitting

import { Navbar, Hero, Projects, Contact, Footer } from "./sections";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import * as reactSpring from "@react-spring/three";
import * as drei from "@react-three/drei";
import * as fiber from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import BackToTop from "./components/BackToTop.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { handleInvalidRoute } from "./utils/routeGuard";
// todo: Change roboto font to a better alternative
import "@fontsource/roboto";

// Advanced color utility functions
const hexToRgb = (hex) => {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
};

const rgbToHex = (rgb) => {
  return rgb
    .map(value => {
      const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
};

// Advanced easing functions for natural transitions
const easing = {
  // Smooth start and end
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // Smooth start
  easeOutQuint: t => 1 - Math.pow(1 - t, 5),
  // Elastic feel
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  // Custom easing for color transitions
  colorEase: t => {
    // Smoother in the middle, quicker at the edges
    return t < 0.5 
      ? 0.5 * Math.pow(2 * t, 2.5)
      : 0.5 * (1 - Math.pow(-2 * t + 2, 2.5)) + 0.5;
  }
};

// Advanced color interpolation with improved easing
const interpolateColor = (color1, color2, factor, easingFn = easing.colorEase) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  // Apply easing function to factor for smoother transitions
  const easedFactor = easingFn(factor);
  
  // Use a more precise interpolation algorithm
  const result = rgb1.map((c1, i) => {
    return Math.round(c1 + easedFactor * (rgb2[i] - c1));
  });
  
  return rgbToHex(result);
};

export default function App() {
  // Suppress material initialization console logs
  useEffect(() => {
    // Store original console methods
    const originalConsoleLog = console.log;
    // Replace console.log with a filtered version
    console.log = function(...args) {
      // Filter out material initialization logs
      if (
        args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('material (onInit)') || 
         args[0].includes('MeshPhysicalMaterial'))
      ) {
        return; // Suppress these logs
      }
      
      // Pass through other logs
      originalConsoleLog.apply(console, args);
    };
    
    // Cleanup: restore original console.log on unmount
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Add route guard effect
  useEffect(() => {
    // Check route on initial load
    handleInvalidRoute();

    // Listen for hash changes
    const handleHashChange = () => {
      handleInvalidRoute();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // * Scroll Animation Setup
  // note: Controls background scale on scroll
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 500], [1, 3]);

  // * Loading State Management
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // * Enhanced Section-Based Shader Color Management with Intersection Observer
  const sectionColorSchemes = {
    navbar: { color1: "0a2342", color2: "2c75d8", color3: "061326", name: "Header Blue" },
    hero: { color1: "222e50", color2: "e14b5a", color3: "131b31", name: "Hero Impact" },
    projects: { color1: "1e3231", color2: "1ea896", color3: "0f1a1a", name: "Projects Green" },
    contact: { color1: "2f2440", color2: "9c6db0", color3: "16101f", name: "Contact Purple" },
    footer: { color1: "0c2427", color2: "f7d002", color3: "071618", name: "Footer Gold" }
  };
  
  // Track current active section
  const [activeSection, setActiveSection] = useState("hero");
  const [prevSection, setPrevSection] = useState("hero");
  const [transitionProgress, setTransitionProgress] = useState(1); // Start with completed transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Transition config
  const transitionDuration = 1200; // ms
  const transitionStartTimeRef = useRef(0);
  const lastSectionChangeTime = useRef(Date.now());
  const pendingSectionChange = useRef(null);
  const activeIntersections = useRef(new Set());
  
  // Section refs for observer
  const sectionRefs = {
    navbar: useRef(null),
    hero: useRef(null),
    projects: useRef(null),
    contact: useRef(null),
    footer: useRef(null)
  };
  
  // Store cached shader URL
  const [cachedShaderUrl, setCachedShaderUrl] = useState('');
  
  // Start transition between sections
  const startSectionTransition = useCallback((newSection) => {
    if (newSection !== activeSection) {
      setPrevSection(activeSection);
      setActiveSection(newSection);
      setIsTransitioning(true);
      setTransitionProgress(0);
      transitionStartTimeRef.current = Date.now();
      lastSectionChangeTime.current = Date.now();
    }
  }, [activeSection]);
  
  // Handle section visibility changes using Intersection Observer
  useEffect(() => {
    if (isLoading) return; // Don't set up observers until content is loaded
    
    // First, ensure we have proper initial detection of visible sections
    setTimeout(() => {
      const initialSection = determineInitialActiveSection();
      if (initialSection && initialSection !== activeSection) {
        setActiveSection(initialSection);
        setPrevSection(initialSection); // Prevent initial transition
      }
    }, 100);
    
    const observerOptions = {
      root: null, // viewport
      rootMargin: '-10% 0px -10% 0px', // Adjust margins to improve detection
      threshold: [0.15, 0.3, 0.5, 0.7] // More thresholds for better precision
    };
    
    // Keep track of section visibility values
    const sectionVisibility = new Map();
    
    const handleIntersection = (entries) => {
      // Update section visibility ratios
      entries.forEach(entry => {
        const sectionId = entry.target.id.replace('-section', '');
        
        if (entry.isIntersecting) {
          sectionVisibility.set(sectionId, {
            ratio: entry.intersectionRatio,
            timestamp: Date.now()
          });
        } else {
          // Keep entry but mark as not intersecting
          if (sectionVisibility.has(sectionId)) {
            sectionVisibility.set(sectionId, {
              ratio: 0,
              timestamp: Date.now()
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
        if (data.ratio > 0.3 && data.timestamp > mostRecentHighSection.timestamp) {
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
        
        // Debug to help confirm section changes
        console.log(`Detected section change: ${activeSection} → ${mostVisibleSection}`);
        
        // Debounce section changes to prevent rapid flipping
        if (timeSinceLastChange < 600) {
          pendingSectionChange.current = setTimeout(() => {
            startSectionTransition(mostVisibleSection);
            pendingSectionChange.current = null;
          }, 300);
        } else {
          startSectionTransition(mostVisibleSection);
        }
      }
    };
    
    // Create observer
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Function to determine initial active section
    function determineInitialActiveSection() {
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      const viewportMiddle = scrollPosition + viewportHeight / 2;
      
      // Find which section contains the middle of the viewport
      let activeSection = 'hero'; // Default
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
  }, [activeSection, isLoading, startSectionTransition]);
  
  // Fix the color interpolation function to ensure it works correctly
  const hexToRgbFixed = (hex) => {
    // Ensure we're working with a clean hex string
    if (!hex || typeof hex !== 'string') {
      console.error(`Invalid hex color: ${hex}`);
      return [0, 0, 0]; // Default to black
    }
    
    // Handle potential issues with the hex format
    const cleanHex = hex.replace(/^#/, '');
    
    try {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      
      // Check for NaN values and provide fallbacks
      return [
        isNaN(r) ? 0 : r,
        isNaN(g) ? 0 : g,
        isNaN(b) ? 0 : b
      ];
    } catch (err) {
      console.error(`Error parsing hex color ${hex}:`, err);
      return [0, 0, 0]; // Default to black
    }
  };
  
  // Update the build shader URL function to ensure proper color transitions
  const buildShaderUrl = useCallback(() => {
    // Get color schemes for current and previous sections
    const currentColors = sectionColorSchemes[activeSection] || sectionColorSchemes.hero;
    const previousColors = sectionColorSchemes[prevSection] || sectionColorSchemes.hero;
    
    // Apply easing to transition
    const easeTransition = isTransitioning 
      ? easing.easeInOutCubic(transitionProgress) 
      : 1;
    
    // Log transition for debugging
    if (isTransitioning && (transitionProgress === 0 || transitionProgress >= 0.99)) {
      console.log(`Color transition: ${prevSection} (${previousColors.name}) → ` + 
                  `${activeSection} (${currentColors.name}) - Progress: ${Math.round(transitionProgress * 100)}%`);
    }
    
    // Use the fixed hex to RGB function
    const interpolateColorFixed = (color1, color2, factor, easingFn = easing.colorEase) => {
      const rgb1 = hexToRgbFixed(color1);
      const rgb2 = hexToRgbFixed(color2);
      
      // Apply easing function to factor for smoother transitions
      const easedFactor = easingFn(factor);
      
      // Use a more precise interpolation algorithm
      const result = rgb1.map((c1, i) => {
        return Math.round(c1 + easedFactor * (rgb2[i] - c1));
      });
      
      return rgbToHex(result);
    };
    
    // Blend colors based on transition progress
    const color1 = interpolateColorFixed(
      previousColors.color1, 
      currentColors.color1, 
      easeTransition
    );
    
    const color2 = interpolateColorFixed(
      previousColors.color2, 
      currentColors.color2, 
      easeTransition,
      easing.easeOutQuint
    );
    
    const color3 = interpolateColorFixed(
      previousColors.color3, 
      currentColors.color3, 
      easeTransition
    );
    
    // Generate shader URL with explicit HEX formatting
    return `https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.3&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23${color1}&color2=%23${color2}&color3=%23${color3}&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.5&uFrequency=0&uSpeed=0.2&uStrength=1.5&uTime=8&wireframe=false`;
  }, [activeSection, prevSection, isTransitioning, transitionProgress]);
  
  // Handle transition animation
  useEffect(() => {
    if (!isTransitioning) return;
    
    const animateTransition = () => {
      const elapsed = Date.now() - transitionStartTimeRef.current;
      const newProgress = Math.min(1, elapsed / transitionDuration);
      
      setTransitionProgress(newProgress);
      
      if (newProgress < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        setIsTransitioning(false);
      }
    };
    
    const animationId = requestAnimationFrame(animateTransition);
    
    return () => cancelAnimationFrame(animationId);
  }, [isTransitioning]);
  
  // Update shader URL when transition state changes
  useEffect(() => {
    setCachedShaderUrl(buildShaderUrl());
  }, [buildShaderUrl, activeSection, transitionProgress]);

  // * Section Loading Validation
  // hack: Using Promise.all for parallel loading
  useEffect(() => {
    const MAX_LOADING_TIME = 10000; // 10 seconds maximum loading time
    let timeoutId;

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
        const sections = [Navbar, Hero, Projects, Contact, Footer];
        const sectionPromises = sections.map((section, index) =>
          Promise.resolve(typeof section === "function").then((result) => {
            setProgress((prev) => Math.min(prev + 12, 100)); // 12% per section
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
  }, []);

  return (
    <>
      {/* * Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex min-h-screen items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} // Shortened duration
            key="loading"
          >
            <LoadingSpinner progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
          {/* * Background Shader */}
          <ShaderGradientCanvas
            importedfiber={{ ...fiber, ...drei, ...reactSpring }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: -1,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <ShaderGradient
              control="query"
              urlString={cachedShaderUrl}
            />
          </ShaderGradientCanvas>

          {/* * Main Sections with refs for intersection observer */}
          <div id="navbar-section" ref={sectionRefs.navbar}>
            <Navbar />
          </div>
          <div id="hero-section" ref={sectionRefs.hero}>
            <Hero />
          </div>
          <div id="projects-section" ref={sectionRefs.projects}>
            <Projects />
          </div>
          <div id="contact-section" ref={sectionRefs.contact}>
            <Contact />
          </div>
          <div id="footer-section" ref={sectionRefs.footer}>
            <Footer />
          </div>
          <BackToTop />
          
          {/* Development indicator (optional, can be removed for production) */}
          <div className="fixed bottom-2 right-2 bg-black/50 text-white text-xs p-1 rounded z-50 pointer-events-none">
            {activeSection} {isTransitioning ? `(${Math.round(transitionProgress * 100)}%)` : ''}
          </div>
        </main>
      )}
    </>
  );
}
