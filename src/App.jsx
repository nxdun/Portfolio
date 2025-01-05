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
import { useState, useEffect } from "react";
import BackToTop from "./components/BackToTop.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { handleInvalidRoute } from "./utils/routeGuard";
// todo: Change roboto font to a better alternative
import "@fontsource/roboto";

export default function App() {
  // Add route guard effect
  useEffect(() => {
    // Check route on initial load
    handleInvalidRoute();

    // Listen for hash changes
    const handleHashChange = () => {
      handleInvalidRoute();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // * Scroll Animation Setup
  // note: Controls background scale on scroll
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 500], [1, 3]);

  // * Loading State Management
  // 💡 Could add progress tracking
  const [isLoading, setIsLoading] = useState(true);

  // * Section Loading Validation
  // hack: Using Promise.all for parallel loading
  useEffect(() => {
    const checkIfLoadingComplete = async () => {
      // * Section Loading Check
      // ✅ Validates all sections are loaded
      const sectionsLoaded = await Promise.all([
        Navbar,
        Hero,
        Projects,
        Contact,
        Footer,
      ].map((section) => Promise.resolve(typeof section === "function")));

      // * Font Loading Check
      // ! Critical for UI rendering
      const assetsLoaded = document.fonts.status === "loaded";

      if (sectionsLoaded.every(Boolean) && assetsLoaded) {
        setTimeout(() => setIsLoading(false), 300); // Faster smooth transition
      }
    };

    checkIfLoadingComplete();
  }, []);

  return (
    <>
      {/* * Loading Screen
          work: Add loading progress indicator */}
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
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

    
      {!isLoading && (
        <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
          {/* * Background Shader
              💡 Could be optimized for performance */}
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
              urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.8&cAzimuthAngle=270&cDistance=0.5&cPolarAngle=180&cameraZoom=15.1&color1=%2373bfc4&color2=%23b70000&color3=%230000a2&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=env&pixelDensity=1&positionX=-0.1&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=3.5&reflection=0.5&rotationX=0&rotationY=130&rotationZ=70&shader=defaults&type=sphere&uAmplitude=3.2&uDensity=0.8&uFrequency=5.5&uSpeed=0.3&uStrength=0.3&uTime=3.5&wireframe=false"
            />
          </ShaderGradientCanvas>

          {/* * Main Sections
              note: Order affects scroll behavior */}
          <Navbar />
          <Hero />
          <Projects />
          <Contact />
          <BackToTop />
          <Footer />
        </main>
      )}
    </>
  );
}
