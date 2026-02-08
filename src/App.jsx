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
import { useRef } from "react";
import BackToTop from "./components/BackToTop.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import TopBanner from "./components/TopBanner.jsx";
import { handleInvalidRoute } from "./utils/routeGuard";
import { useEffect } from "react";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext.jsx";
import { useShaderBackground } from "./hooks/useShaderBackground";
import { useSectionObserver } from "./hooks/useSectionObserver";
import { useAppLoading } from "./hooks/useAppLoading";
import "@fontsource/roboto";

// App content separated from main to use hooks within context
function AppContent() {
  // Scroll animation for background scaling
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 500], [1, 3]);
  
  // Get active section and shader URL from our custom hooks
  const { shaderUrl } = useShaderBackground();
  
  // Section refs for observer
  const sectionRefs = {
    navbar: useRef(null),
    hero: useRef(null),
    projects: useRef(null),
    contact: useRef(null),
    footer: useRef(null),
  };
  
  // Loading state management
  const sections = [Navbar, Hero, Projects, Contact, Footer];
  const { isLoading, progress } = useAppLoading(sections);
  
  // Set up section observer after loading completes
  useSectionObserver(sectionRefs, isLoading);
  
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
  
  // Log welcome message
  useEffect(() => {
    if (!isLoading) {
      console.log(
        "%c👋 Welcome to my Portfolio! %c\n\nI appreciate you taking the time to explore my work. Your feedback is valuable to me! Please feel free to reach out through the Contact section with any thoughts or suggestions.\n\nThank you for visiting!",
        "color: #4CAF50; font-size: 18px; font-weight: bold;",
        "color: #333; font-size: 14px;"
      );
    }
  }, [isLoading]);

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex min-h-screen items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            key="loading"
          >
            <LoadingSpinner progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
          {/* Background Shader */}
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
            <ShaderGradient control="query" urlString={shaderUrl} />
          </ShaderGradientCanvas>

          {/* Top banner announcing prototype */}
          <TopBanner />

          {/* Main Sections with refs for intersection observer */}
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
        </main>
      )}
    </>
  );
}

// Main App component wraps content with providers
export default function App() {
  return (
    <ColorSchemeProvider>
      <AppContent />
    </ColorSchemeProvider>
  );
}
