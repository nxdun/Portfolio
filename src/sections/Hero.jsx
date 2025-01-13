import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect, useMemo, useState, useCallback } from "react";
import Button from "../components/BotButton";
import ChatBot from "../sections/ChatBot";
import posterImage from "../assets/poster.webp";  // Add this import

// Lazy load the 3D components
const Model3DSection = lazy(() => import('../components/Model3DSection'));

export const Hero = () => {
  // * State Management
  // todo: Consider using context for global state
  const [isVisible, setIsVisible] = useState(true);
  const [dynamicText, setDynamicText] = useState("Student");
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [show3DModel, setShow3DModel] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

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
      "https://drive.google.com/file/d/1AzNbcTf6hO_pM46sE2BF-WxjECxok8s1/view?usp=sharing",
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

  const handleLoadModel = () => {
    setIsModelLoading(true);
    setShow3DModel(true);
  };

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
    <section className="body-font h-full w-full text-gray-400">
      {/* * Main Container */}
      <div className="container mx-auto flex flex-col items-center px-5 py-10 md:flex-row md:py-24">
        {/* * Left Content Section */}
        <motion.div
          className="mb-12 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="title-font mb-4 whitespace-nowrap text-3xl font-extrabold text-yellow-300 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            variants={itemVariants}
          >
            Welcome to My Portfolio
          </motion.h1>
          <motion.h2
            className="title-font mb-4 text-xl font-medium text-white sm:text-2xl md:text-3xl lg:text-4xl"
            variants={itemVariants}
          >
            I am <span className="text-xl text-purple-400 sm:text-2xl md:text-3xl lg:text-4xl">{dynamicText}</span>
          </motion.h2>
          <motion.p
            className="mb-8 mt-4 leading-relaxed text-base lg:text-lg xl:text-xl"
            variants={itemVariants}
          >
            Passionate software engineering student with hands-on experience in
            modern technologies. Seeking opportunities to contribute to
            impactful projects and gain industry experience.
          </motion.p>
          <motion.div
            className="flex flex-col items-center space-y-4 md:flex-row md:space-x-4 md:space-y-0"
            variants={itemVariants}
          >
            <AnimatePresence>
              {isVisible && (
                <>
                  <motion.button
                    className="hover:animate-gradient-xy relative z-10 h-[3em] w-[12em] cursor-pointer rounded-[30px] bg-gradient-to-r from-violet-500 from-10% via-sky-500 via-30% to-pink-500 to-90% bg-[length:400%] text-center text-[14px] font-bold text-white before:absolute before:-bottom-[5px] before:-left-[5px] before:-right-[5px] before:-top-[5px] before:-z-10 before:rounded-[35px] before:bg-gradient-to-r before:from-violet-500 before:from-10% before:via-sky-500 before:via-30% before:to-pink-500 before:bg-[length:400%] before:transition-all before:duration-[1s] before:ease-in-out before:content-[''] hover:bg-[length:100%] before:hover:bg-[length:10%] before:hover:blur-xl focus:ring-violet-700 active:bg-violet-700"
                    onClick={handleProjectsClick}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    MY PROJECTS
                  </motion.button>
                  <motion.button
                    className="flex w-48 cursor-pointer items-center justify-center rounded-full border border-gradient-to-r from-violet-500 via-sky-500 to-pink-500 px-4 py-2 font-mono text-sm tracking-wide text-white shadow-lg transition-transform transform hover:scale-105"
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
                      className="h-5 w-5 ml-2 animate-bounce"
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

        {/* 3D Model Section */}
        <motion.div
          className="w-full md:w-1/2 lg:w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {show3DModel ? (
            <Suspense fallback={
              <div className="h-[70vh] w-full flex items-center justify-center bg-gray-900/30 rounded-lg">
                <div className="text-white">Preparing 3D Environment...</div>
              </div>
            }>
              <div className="relative w-full flex justify-center items-center">
                <Model3DSection />
              </div>
            </Suspense>
          ) : (
            <div 
              className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-lg"
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
                  background: isHovering ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
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
                {isModelLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Initializing...
                  </span>
                ) : (
                  <>
                   
                    Load 3D Model
                  </>
                )}
              </motion.button>
            </div>
          )}
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
