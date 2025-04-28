import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const LoadingSpinner = ({ progress }) => {
  // States for animated elements
  const [particleCount] = useState(12);
  
  // Generate particles with dynamic properties
  const particles = useMemo(() => 
    Array.from({ length: particleCount }).map((_, i) => {
      // Calculate base radius for each particle group
      const baseRadius = i % 3 === 0 ? 72 : (i % 3 === 1 ? 82 : 92);
      
      // Return particle config
      return {
        id: i,
        angle: (360 / particleCount) * i,
        baseRadius,
        // Slightly unique animation properties for each particle
        pulseDelay: i * 0.1,
        orbitDuration: 3 + (i % 3) * 2, // 3, 5, or 7 seconds
        pulseScale: 1.4 + (i % 5) * 0.1,
        hue: (i * 30) % 360, // Varying colors around color wheel
      };
    }),
  [particleCount]);
  
  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Main loader container */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute w-full h-full rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(59,130,246,0.3) 60%, transparent 100%)",
          }}
        />
        
        {/* Rotating particles with dynamic animation */}
        {particles.map((particle) => {
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                width: particle.id % 2 === 0 ? "2.5px" : "3px",
                height: particle.id % 2 === 0 ? "2.5px" : "3px",
                background: `hsl(${particle.hue}, 80%, 70%)`,
                boxShadow: `0 0 8px 2px hsla(${particle.hue}, 80%, 60%, 0.7)`,
              }}
              animate={{
                x: [
                  Math.cos((particle.angle * Math.PI) / 180) * particle.baseRadius,
                  Math.cos(((particle.angle + 20) * Math.PI) / 180) * (particle.baseRadius + 5),
                  Math.cos(((particle.angle + 40) * Math.PI) / 180) * particle.baseRadius,
                  Math.cos(((particle.angle + 20) * Math.PI) / 180) * (particle.baseRadius - 5),
                  Math.cos((particle.angle * Math.PI) / 180) * particle.baseRadius,
                ],
                y: [
                  Math.sin((particle.angle * Math.PI) / 180) * particle.baseRadius,
                  Math.sin(((particle.angle + 20) * Math.PI) / 180) * (particle.baseRadius + 5),
                  Math.sin(((particle.angle + 40) * Math.PI) / 180) * particle.baseRadius,
                  Math.sin(((particle.angle + 20) * Math.PI) / 180) * (particle.baseRadius - 5),
                  Math.sin((particle.angle * Math.PI) / 180) * particle.baseRadius,
                ],
                scale: [1, particle.pulseScale, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                x: { duration: particle.orbitDuration, repeat: Infinity, ease: "easeInOut" },
                y: { duration: particle.orbitDuration, repeat: Infinity, ease: "easeInOut" },
                scale: { 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: particle.pulseDelay,
                  ease: "easeInOut" 
                },
                opacity: { 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: particle.pulseDelay,
                  ease: "easeInOut" 
                },
              }}
            />
          );
        })}
        
        {/* Rotating gradient rings with improved visibility */}
        <motion.div 
          className="absolute w-40 h-40 rounded-full border-4 border-transparent"
          style={{
            borderRightColor: '#8B5CF6', 
            borderTopColor: '#EC4899',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
          }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 3, 
            ease: "linear", 
            repeat: Infinity,
          }}
        />
        
        <motion.div 
          className="absolute w-32 h-32 rounded-full border-4 border-transparent"
          style={{
            borderLeftColor: '#3B82F6', 
            borderBottomColor: '#EC4899',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
          }}
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 4, 
            ease: "linear", 
            repeat: Infinity,
          }}
        />
        
        {/* Small orbiting accent particles */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-pink-400"
          style={{ boxShadow: "0 0 10px rgba(236, 72, 153, 0.8)" }}
          animate={{
            rotate: 360,
            x: [0, 10, 0, -10, 0],
            y: [0, -10, 0, 10, 0],
          }}
          transition={{
            rotate: { duration: 5, repeat: Infinity, ease: "linear" },
            x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        
        {/* Percentage display with improved gradient glow */}
        <div className="relative bg-gray-900/70 w-28 h-28 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
          <motion.div
            className="text-5xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, #8B5CF6, #3B82F6, #EC4899, #8B5CF6)",
              backgroundSize: "200% 100%",
            }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: progress === 100 ? [1, 1.05, 1] : 1,
              backgroundPosition: ["0% center", "100% center"],
            }}
            transition={{ 
              opacity: { duration: 2, repeat: Infinity },
              scale: { duration: 0.5, repeat: progress === 100 ? 1 : 0 },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
          >
            {Math.round(progress)}
          </motion.div>
          
          {/* Percentage sign */}
          <div className="absolute text-white/50 text-sm font-medium top-[45%] right-[18%]">%</div>
        </div>
      </div>
      
      {/* Modern progress bar with refined animation */}
      <div className="w-80 mt-6 relative">
        {/* Progress track */}
        <div className="h-1.5 w-full bg-gray-800/40 rounded-full overflow-hidden backdrop-blur-md relative">
          {/* Animated progress indicator */}
          <motion.div 
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #8B5CF6, #3B82F6, #EC4899)",
              backgroundSize: "200% 100%",
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${progress}%`,
              backgroundPosition: ["0% 0%", "100% 0%"]
            }}
            transition={{ 
              width: { type: "spring", stiffness: 50, damping: 12 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          >
            {/* Enhanced shine effect */}
            <motion.div 
              className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: [-100, 300] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Status text with improved animation */}
        <motion.div 
          className="text-center text-white/80 text-xs mt-3 tracking-widest font-light uppercase"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {progress < 30 ? 'Preparing Environment' : 
           progress < 70 ? 'Loading 3D Assets' : 
           progress < 90 ? 'Initializing Renderer' : 
           'Ready Now'}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
