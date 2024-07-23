import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { AnimationMixer } from 'three';
import Heroo from "../assets/optimal-hero.glb";

function Model(props) {
  const { scene, animations } = useGLTF(Heroo);
  const mixer = useRef();

  // Use useEffect to initialize the animation mixer and add animations
  useEffect(() => {
    if (animations.length) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => mixer.current.clipAction(clip).play());
    }
    return () => mixer.current && mixer.current.stopAllAction();
  }, [animations, scene]);

  // Update the mixer in the render loop
  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={scene} {...props} />;
}

export const Hero = () => {
  return (
    <section className="body-font text-gray-400">
      <div className="container mx-auto flex flex-col items-center px-5 py-24 md:flex-row">
        <div className="mb-16 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24">
          <h1 className="title-font mb-4 text-3xl font-medium text-white sm:text-4xl">
            Nadun Lakshan
            <br className="hidden lg:inline-block" />
            Software Engineer Intern
          </h1>
          <p className="mb-8 leading-relaxed">
            Passionate software engineering student with hands-on experience in
            modern technologies. Seeking opportunities to contribute to
            impactful projects and gain industry experience.
          </p>
          <div className="flex justify-center">
            <button className="inline-flex rounded border-0 bg-indigo-500 px-6 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none">
              Contact Me
            </button>
            <button className="ml-4 inline-flex rounded border-0 bg-gray-800 px-6 py-2 text-lg text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
              My Resume
            </button>
          </div>
        </div>
        <div className="w-100 md:w-1/2 lg:w-full lg:max-w-lg">
          <Canvas
            dpr={[1, 2]}
            shadows
            camera={{ fov: 50 }}
            style={{ height: "60vh", backgroundColor: "transparent", width: "100vh" }}
          >
            {/* <color attach="background" args={["#0D1117"]} /> */}
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
        </div>
      </div>
    </section>
  );
};
