import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { AnimationMixer } from 'three';
import { annotate } from 'rough-notation';
import { motion } from 'framer-motion';
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
  const [annotation, setAnnotation] = useState(null);

  useEffect(() => {
    const element = document.querySelector('#highlight');
    const newAnnotation = annotate(element, {
      type: 'highlight',
      color: '#8B0000',
      animationDuration: 1000,
    });
    setTimeout(() => {
      newAnnotation.show();
    }, 2000);
    setAnnotation(newAnnotation);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        staggerChildren: 0.3, // Faster delay between each child animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5, // Faster duration for each item to animate
        delay: 0.5 // Faster delay before the item starts animating
      }
    },
  };

  return (
    <section className="body-font text-gray-400 w-full h-full">
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
            I'm{" "}
            <span id="highlight" className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
              Software Engineer Intern
            </span>
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
            className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-4"
            variants={itemVariants}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="inline-flex w-full justify-center rounded border-0 bg-indigo-500 px-6 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none md:w-auto"
            >
              Contact Me
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="inline-flex w-full justify-center rounded border-0 bg-gray-800 px-6 py-2 text-lg text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none md:w-auto"
            >
              My Resume
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div 
          className="w-full md:w-1/2 lg:w-full lg:max-w-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }} // Faster delay before the background image animation starts
        >
          <Canvas
            dpr={[1, 2]}
            shadows
            camera={{ fov: 50 }}
            style={{ height: "60vh", backgroundColor: "transparent", width: "100%" }}
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
