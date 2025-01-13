import { PresentationControls, Stage, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, lazy, useState, useEffect } from "react";

const Model3D = lazy(() => import('./Model3D'));

const LoadingScreen = () => {
  const { progress, total } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Ensure progress only goes up
    setDisplayProgress(prev => Math.max(prev, progress));
  }, [progress]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="text-white text-lg mb-2">Loading 3D Model...</div>
      <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-violet-500 transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <div className="text-violet-400 mt-2">{displayProgress.toFixed(0)}%</div>
    </div>
  );
};

const Model3DSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setShowModel(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  return (
    <div className="h-[70vh] w-[110%] relative -mx-[5%] overflow-visible">
      <AnimatePresence mode="wait">
        <motion.div
          key="canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full"
        >
          <Canvas
            dpr={[1, 2]}
            shadows
            camera={{ fov: 50, position: [0, 0, 5] }}
            style={{
              height: "100%",
              backgroundColor: "transparent",
              width: "100%",
            }}
            onCreated={setIsLoaded}
          >
            <Suspense fallback={null}>
              {showModel && (
                <motion.group
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 1,
                    ease: "easeOut",
                    delay: 0.2
                  }}
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
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence>
        {!showModel && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gray-900/30 rounded-lg"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Model3DSection;
