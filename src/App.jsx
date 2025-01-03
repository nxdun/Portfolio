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
import "@fontsource/roboto"; //TODO: change roboto font to a good one

export default function App() {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 500], [1, 3]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfLoadingComplete = async () => {
      const sectionsLoaded = [Navbar, Hero, Projects, Contact, Footer].every(
        (section) => typeof section === "function"
      );
      const assetsLoaded = document.fonts.status === "loaded";

      if (sectionsLoaded && assetsLoaded) {
        setTimeout(() => setIsLoading(false), 500); // Smooth transition
      }
    };

    checkIfLoadingComplete();
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex min-h-screen items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key="loading"
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && (
        <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
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
