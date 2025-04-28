import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect, useMemo, useState, useCallback, useRef } from "react";
import Button from "../components/BotButton";
import ChatBot from "../sections/ChatBot";
import posterImage from "../assets/poster.webp";
import LoadingSpinner from "../components/LoadingSpinner";

// Preload the Model3DSection component but don't render it immediately
const Model3DSection = lazy(() => import('../components/Model3DSection'));

export const Hero = () => {
  // * State Management
  const [isVisible, setIsVisible] = useState(true);
  const [dynamicText, setDynamicText] = useState("Student");
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [show3DModel, setShow3DModel] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoverPosition, setHoverPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const progressTimerRef = useRef(null);
  // Flag to start the model initialization process
  const [modelInitiated, setModelInitiated] = useState(false);

  // * Text Animation Configuration
  // note: Words for typing effect
  const words = useMemo(() => ["a Student", "a Developer", "a Programmer"], []);

  // * Typing Effect
  // work: Improve typing animation smoothness
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentWord = words[wordIndex];
      const currentChar = currentWord.substring(0, charIndex);
      setDynamicText(currentChar);

      if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
        setTimeout(typeEffect, 200);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect, 100);
      } else {
        isDeleting = !isDeleting;
        wordIndex = !isDeleting ? (wordIndex + 1) % words.length : wordIndex;
        setTimeout(typeEffect, 1200);
      }
    };

    typeEffect();
    return () => {};
  }, [words]);

  // * Animation Variants
  // 💡 Could be moved to a separate config file
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.5,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.5 },
    },
    exit: { opacity: 0, y: 50, transition: { duration: 0.5 } },
  };

  // * Event Handlers
  // ✅ Implements smooth scrolling
  const handleProjectsClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      const targetElement = document.getElementById("projects");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setIsVisible(true);
    }, 800);
  };

  // * Download Handler
  // ! Update resume link when needed
  const handleDownloadClick = () => {
    window.open(
      "https://drive.google.com/file/d/1XzQZsXANRcjnOsbiTVlY0AKQD0FP-eGN/view",
      "_blank"
    );
  };

  // * ChatBot Controls
  // note: Handles ChatBot visibility
  const toggleChatBot = () => {
    setIsChatBotOpen(!isChatBotOpen);
  };

  const closeChatBot = () => {
    setIsChatBotOpen(false);
  };

  // Enhanced model loading function with unified loading process
  const handleLoadModel = () => {
    setIsModelLoading(true);
    setLoadingProgress(0);
    
    // Start simulated preloading sequence for better UX
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        // Gradual initial progress to show activity 
        if (prev < 25) {
          return prev + 1.5;
        }
        // Slower middle phase to show "processing"
        else if (prev < 65) {
          return prev + 0.5;
        } 
        // Final phase waits for the actual model loading
        else if (prev < 90) {
          return prev + 0.2; 
        }
        return prev;
      });
    }, 30);
    
    // Start the model initialization but don't show it yet
    setModelInitiated(true);
    
    // When progress reaches 100%, we'll set show3DModel to true
    const completeTimer = setTimeout(() => {
      clearInterval(progressTimerRef.current);
      setLoadingProgress(100);
      
      // Short delay to ensure smooth transition
      setTimeout(() => {
        setShow3DModel(true);
        setIsModelLoading(false);
      }, 300);
    }, 3000); // Total loading time (adjust as needed for perceived performance)
    
    return () => {
      clearInterval(progressTimerRef.current);
      clearTimeout(completeTimer);
    };
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPosition({ x, y });
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setHoverPosition({ x, y });
  }, []);

  const commonButtonStyles = `
    relative z-10 cursor-pointer text-[14px] font-bold text-white
    before:absolute before:-z-10 before:content-['']
    before:transition-all before:duration-[1s] before:ease-in-out
    hover:animate-gradient-xy bg-[length:400%]
    bg-gradient-to-r from-violet-500 from-10% via-sky-500 via-30% to-pink-500 to-90%
  `;

  return (
    <section className="body-font h-full w-full text-gray-300">
      {/* * Main Container */}
      <div className="container mx-auto flex flex-col items-center px-5 py-10 md:flex-row md:py-24">
          <motion.div
            className="mb-12 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1
              className="title-font mb-4 tracking-tight whitespace-nowrap text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 inline-block text-transparent bg-clip-text sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              variants={itemVariants}
            >
              Welcome to My Portfolio
            </motion.h1>
            <motion.h2
              className="title-font mb-6 text-xl font-medium text-white sm:text-2xl md:text-3xl lg:text-4xl"
              variants={itemVariants}
            >
              I am <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 inline-block text-transparent bg-clip-text font-bold sm:text-2xl md:text-3xl lg:text-4xl">{dynamicText}</span>
            </motion.h2>
            <motion.p
              className="mb-10 mt-4 leading-relaxed text-base tracking-wide text-gray-300 p-5 rounded-lg lg:text-lg xl:text-xl backdrop-blur-sm bg-gray-900/30 border border-gradient-to-r from-violet-500/30 via-sky-500/20 to-pink-500/30"
              variants={itemVariants}
            >
              <span className="font-medium text-gradient bg-gradient-to-r from-sky-300 to-blue-400 inline-block text-transparent bg-clip-text">Final-year Software Engineering</span> student passionate about <span className="font-medium text-emerald-300">AI research</span> and <span className="font-medium text-violet-300">multi-agent systems</span>. Leading research at LOLC, focusing on <span className="italic text-sky-200">agent coordination</span> and <span className="italic text-sky-200">collaborative AI</span>. Experienced with <span className="font-medium text-orange-300">Scrum methodologies</span> and <span className="font-medium text-orange-300">team leadership</span>. My <span className="font-medium text-fuchsia-300">GitHub portfolio</span> showcases clean code and continuous learning. Seeking an <span className="font-medium text-yellow-200">internship</span> to apply technical expertise in innovative challenges.
            </motion.p>
            <motion.div
              className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0"
              variants={itemVariants}
            >
              <AnimatePresence>
                {isVisible && (
            <>
              <motion.button
                className="hover:animate-gradient-xy relative z-10 h-[3.2em] w-[13em] cursor-pointer rounded-[30px] bg-gradient-to-r from-violet-500 from-10% via-sky-500 via-30% to-pink-500 to-90% bg-[length:400%] text-center text-[14px] font-bold text-white before:absolute before:-bottom-[5px] before:-left-[5px] before:-right-[5px] before:-top-[5px] before:-z-10 before:rounded-[35px] before:bg-gradient-to-r before:from-violet-500 before:from-10% before:via-sky-500 before:via-30% before:to-pink-500 before:bg-[length:400%] before:transition-all before:duration-[1s] before:ease-in-out before:content-[''] hover:bg-[length:100%] before:hover:bg-[length:10%] before:hover:blur-xl focus:ring-violet-700 active:bg-violet-700 uppercase tracking-wider"
                onClick={handleProjectsClick}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <span className="drop-shadow-md">Explore Projects</span>
              </motion.button>
              <motion.button
                className="flex w-52 cursor-pointer items-center justify-center rounded-full border border-gradient-to-r from-violet-500 via-sky-500 to-pink-500 backdrop-blur-sm bg-gray-900/30 px-5 py-3 font-mono text-sm tracking-wide text-white shadow-lg hover:shadow-violet-500/25 transition-all transform hover:scale-105 hover:border-violet-400"
                onClick={handleDownloadClick}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                Download Resume
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 ml-2 animate-bounce text-violet-300"
                >
                  <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
              </motion.button>
            </>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* 3D Model Section with Unified Loading */}
        <motion.div
          className="w-full md:w-1/2 lg:w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative h-[70vh] w-full rounded-lg">
            {/* Image background for when model is not shown */}
            {!show3DModel && (
              <div 
                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg z-10"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onTouchStart={() => setIsHovering(true)}
                onTouchEnd={() => setIsHovering(false)}
              >
                <img 
                  src={posterImage} 
                  alt="3D Model Preview" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <motion.div 
                  className="absolute inset-0 backdrop-blur-[2px]"
                  animate={{
                    background: isHovering ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                    backdropFilter: isHovering ? "blur(4px)" : "blur(0px)"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute w-[200px] h-[200px] rounded-full pointer-events-none mix-blend-overlay"
                  animate={{
                    x: hoverPosition.x + "%",
                    y: hoverPosition.y + "%",
                    scale: isHovering ? 1 : 0,
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  style={{
                    background: "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.9) 80%)",
                    backdropFilter: "blur(16px)",
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                />
                
                {/* Load button (only show when not loading and not showing model) */}
                {!isModelLoading && !show3DModel && (
                  <motion.button
                    className={`${commonButtonStyles} absolute z-10 h-[3em] px-6 rounded-[30px] backdrop-blur-sm
                      before:absolute before:-bottom-[5px] before:-left-[5px] before:-right-[5px] before:-top-[5px]
                      before:rounded-[35px] before:bg-gradient-to-r before:from-violet-500 before:from-10%
                      before:via-sky-500 before:via-30% before:to-pink-500 before:bg-[length:400%]
                      before:hover:bg-[length:10%] before:hover:blur-xl`}
                    onClick={handleLoadModel}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={false}
                    animate={{
                      y: isHovering ? -10 : 0,
                      scale: isHovering ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      mass: 1
                    }}
                  >
                    Load 3D Model
                  </motion.button>
                )}
              </div>
            )}
            
            {/* Loading overlay */}
            <AnimatePresence>
              {isModelLoading && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoadingSpinner progress={loadingProgress} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Model section - preload when initiated, show when ready */}
            <div className={`absolute inset-0 z-0 ${show3DModel ? 'z-30' : ''}`}>
              {modelInitiated && (
                <Suspense fallback={null}>
                  <div className={`opacity-0 transition-opacity duration-500 ${show3DModel ? 'opacity-100' : ''}`}>
                    <Model3DSection />
                  </div>
                </Suspense>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ChatBot Integration */}
      <div onClick={toggleChatBot} className="fixed bottom-6 right-8 z-50">
        <Button />
      </div>

      <AnimatePresence>
        {isChatBotOpen && (
          <motion.div
            className="fixed bottom-32 right-0 w-80 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 50 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <ChatBot closeMe={closeChatBot} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
