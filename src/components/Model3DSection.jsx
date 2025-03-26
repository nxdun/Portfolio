import { PresentationControls, Stage, useProgress, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, lazy, useState, useEffect, useRef, memo } from "react";
import LoadingSpinner from './LoadingSpinner';
import HeroModel from "../assets/optimal-hero.glb";

// Preload the model
useGLTF.preload(HeroModel);

// Use memo to prevent unnecessary re-renders of Model3D
const Model3D = memo(lazy(() => import('./Model3D')));

const Model3DSection = () => {
  // Track loading progress
  const { progress } = useProgress();
  const [showModel, setShowModel] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const requestRef = useRef();
  const modelMounted = useRef(false);
  
  // Handle loading states
  useEffect(() => {
    // When fully loaded
    if (progress === 100) {
      const timer = setTimeout(() => {
        setShowModel(true);
        modelMounted.current = true;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [progress]);
  
  // Smooth progress animation
  useEffect(() => {
    const animateProgress = () => {
      setDisplayProgress(prevProgress => {
        const diff = progress - prevProgress;
        const step = diff * 0.1;
        
        if (Math.abs(diff) < 0.5) return progress;
        return prevProgress + step;
      });
      
      requestRef.current = requestAnimationFrame(animateProgress);
    };
    
    requestRef.current = requestAnimationFrame(animateProgress);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [progress]);
  
  return (
    <div className="h-[70vh] w-full relative rounded-lg overflow-hidden">
      {/* 3D Canvas - always render once initialized */}
      <div className="h-full w-full">
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ fov: 45, position: [0, 0, 5] }}
          style={{
            height: "100%",
            backgroundColor: "transparent",
            width: "100%",
          }}
          frameloop="always" // Ensure animation loop keeps running
        >
          <Suspense fallback={null}>
            {/* Always render the model once it's been shown the first time */}
            {(showModel || modelMounted.current) && (
              <motion.group
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: showModel ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <PresentationControls
                  speed={1.5}
                  zoom={0.5}
                  polar={[-0.1, Math.PI / 4]}
                  azimuth={[-Math.PI / 2, Math.PI / 2]}
                  config={{ mass: 1, tension: 170, friction: 26 }}
                >
                  <Stage
                    environment={null}
                    intensity={0.5}
                    contactShadowOpacity={0.6}
                    preset="rembrandt"
                  >
                    <Model3D scale={[1, 1, 1]} />
                  </Stage>
                </PresentationControls>
              </motion.group>
            )}
          </Suspense>
        </Canvas>
      </div>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {!showModel && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center"
          >
            <LoadingSpinner progress={Math.round(displayProgress)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Model3DSection;
