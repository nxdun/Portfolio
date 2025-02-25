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

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // * Scroll Animation Setup
  // note: Controls background scale on scroll
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 500], [1, 3]);

  // * Loading State Management
  // 💡 Could add progress tracking
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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
            <LoadingSpinner progress={progress} />
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
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.3&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.5&uFrequency=0&uSpeed=0.2&uStrength=1.5&uTime=8&wireframe=false"/>
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
