// * Hero Section Component
// ? Consider splitting into smaller components
// ! Requires proper 3D model optimization

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { AnimationMixer } from "three";
import { motion, AnimatePresence } from "framer-motion";
import Heroo from "../assets/optimal-hero.glb";
import Button from "../components/BotButton";
import ChatBot from "../sections/ChatBot";

// * 3D Model Component
// note: Handles model loading and animation
function Model(props) {
  const { scene, animations } = useGLTF(Heroo);
  const mixer = useRef(null);

  // * Animation Setup
  // hack: Using ref to store mixer to prevent memory leaks
  useEffect(() => {
    if (animations.length) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => mixer.current.clipAction(clip).play());
    }
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [animations, scene]);

  // * Animation Frame Update
  // ? Consider optimizing frame updates
  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={scene} {...props} />;
}

// * Main Hero Component
// 💡 Could be split into Layout and Content components
export const Hero = () => {
  // * State Management
  // todo: Consider using context for global state
  const [isVisible, setIsVisible] = useState(true);
  const [dynamicText, setDynamicText] = useState("Student");
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  // * Text Animation Configuration
  // note: Words for typing effect
  const words = useMemo(() => ["Student", "Developer", "Programmer"], []);

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
      "https://drive.google.com/file/d/1jWOOgDv0Tiw1gk9UcmsUjUVdZKgyVHgt/view?usp=sharing",
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

        {/* * 3D Model Section 
            ! Ensure model is properly optimized
            ? Consider adding loading state */}
        <motion.div
          className="w-full md:w-1/2 lg:w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <Canvas
            dpr={[1, 2]}
            shadows
            camera={{ fov: 50 }}
            style={{
              height: "70vh",
              backgroundColor: "transparent",
              width: "100%",
            }}
          >
            <PresentationControls
              speed={1.5}
              zoom={0.5}
              polar={[-0.1, Math.PI / 4]}
            >
              <Stage
                environment={null}
                intensity={0.5}
                contactShadowOpacity={0.5}
              >
                <Model scale={[1, 1, 1]} />
              </Stage>
            </PresentationControls>
          </Canvas>
        </motion.div>
      </div>

      {/* * ChatBot Integration
          💡 Could be moved to layout component */}
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
