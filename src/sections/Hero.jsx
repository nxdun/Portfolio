/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { AnimationMixer } from "three";
import { motion, AnimatePresence } from "framer-motion";
import Heroo from "../assets/optimal-hero.glb";

function Model(props) {
  const { scene, animations } = useGLTF(Heroo);
  const mixer = useRef();

  useEffect(() => {
    if (animations.length) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => mixer.current.clipAction(clip).play());
    }
    return () => mixer.current && mixer.current.stopAllAction();
  }, [animations, scene]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={scene} {...props} />;
}

export const Hero = () => {
  const [isVisible, setIsVisible] = useState(true);

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

  const handleDownloadClick = () => {
    window.open(
      "https://drive.google.com/file/d/1jWOOgDv0Tiw1gk9UcmsUjUVdZKgyVHgt/view?usp=sharing",
      "_blank"
    );
  };
  

  return (
    <section className="body-font h-full w-full text-gray-400">
      <div className="container mx-auto flex flex-col items-center px-5 py-10 md:flex-row md:py-24">
        <motion.div
          className="mb-12 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="title-font mb-4 whitespace-nowrap text-2xl font-extrabold text-yellow-300 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            variants={itemVariants}
          >
            Welcome to My Portfolio
          </motion.h1>
          <motion.h2
            className="title-font mb-4 text-lg font-medium text-white sm:text-xl md:text-2xl lg:text-3xl"
            variants={itemVariants}
          >
            I am{" "}
            <motion.span
              id="highlight"
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
              initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
              animate={{
                backgroundColor: [
                  "rgba(0, 0, 0, 0)",
                  "#FFD700",
                  "rgba(0, 0, 0, 0)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Software Engineer Intern
            </motion.span>
          </motion.h2>
          <motion.p
            className="mb-8 mt-4 leading-relaxed"
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
  className="flex w-[180px] cursor-pointer items-center justify-between rounded-full bg-transparent border-2 border-transparent bg-clip-padding px-4 py-3 font-mono tracking-wider text-white shadow-2xl duration-500 hover:scale-105 hover:bg-transparent hover:border-violet-500 hover:border-gradient-to-r hover:from-violet-500 hover:via-sky-500 hover:to-pink-500"
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
    className="h-5 w-5 animate-bounce"
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
              height: "60vh",
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
    </section>
  );
};
