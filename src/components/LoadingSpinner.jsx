import { motion } from "framer-motion";

const LoadingSpinner = ({ progress }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated spinner with gradient */}
      <div className="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 md:w-48 md:h-48 h-32 w-32 aspect-square rounded-full">
        <div className="rounded-full h-full w-full bg-slate-100 dark:bg-zinc-900 background-blur-md"></div>
      </div>
      
      {/* Progress text */}
      <h2 className="text-zinc-900 dark:text-white mt-4 font-bold text-lg">Loading...</h2>
      
      {/* Custom progress bar */}
      <div className="w-64 mt-4 relative">
        {/* Progress bar background */}
        <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md">
          {/* Animated progress indicator */}
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-500 from-10% via-sky-500 via-30% to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 50,
              damping: 10,
            }}
          />
        </div>
        
        {/* Percentage indicator with glow effect */}
        <motion.div
          className="absolute right-0 top-0 -translate-y-full -translate-x-1/2 mb-1 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: `${progress}%`,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 80,
            damping: 15
          }}
          style={{
            textShadow: "0 0 8px rgba(167, 139, 250, 0.8)"
          }}
        >
          <span className="text-sm font-bold">{Math.round(progress)}%</span>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
