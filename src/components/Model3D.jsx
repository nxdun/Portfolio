import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AnimationMixer } from "three";
import HeroModel from "../assets/optimal-hero.glb"; // Import the model

const Model3D = (props) => {
  // Update preload path to use imported model
  useGLTF.preload(HeroModel);
  
  // Use imported model path
  const { scene, animations } = useGLTF(HeroModel);
  const mixer = useRef(null);

  useEffect(() => {
    if (animations.length) {
      mixer.current = new AnimationMixer(scene);
      const actions = animations.map(clip => mixer.current.clipAction(clip));
      actions.forEach(action => action.play());

      return () => {
        actions.forEach(action => action.stop());
        mixer.current.stopAllAction();
        mixer.current.uncacheRoot(scene);
        mixer.current = null;
      };
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  useEffect(() => {
    // Cleanup function
    return () => {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return <primitive object={scene} {...props} />;
};

export default Model3D;
