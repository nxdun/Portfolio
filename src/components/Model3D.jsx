import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AnimationMixer } from "three";
import HeroModel from "../assets/optimal-hero.glb";

// Preload the model for faster loading
useGLTF.preload(HeroModel);

const Model3D = (props) => {
  const groupRef = useRef();
  const mixerRef = useRef();
  
  // Load the model with DRACO compression support if available
  const { scene, animations } = useGLTF(HeroModel);
  
  // Set up animations and mixer when component mounts
  useEffect(() => {
    if (!animations.length) return;
    
    // Create a new animation mixer directly on the scene
    const mixer = new AnimationMixer(scene);
    mixerRef.current = mixer;
    
    // Create and play all animations
    const actions = animations.map(clip => {
      const action = mixer.clipAction(clip);
      // Configure the animation
      action.loop = 2201; // Loop mode - repeat
      action.clampWhenFinished = false; 
      action.timeScale = 1;
      action.play();
      return action;
    });
    
    // Cleanup function to stop all animations
    return () => {
      actions.forEach(action => action.stop());
      mixer.stopAllAction();
    };
  }, [scene, animations]);
  
  // Update the animations on each frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
  
  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
};

export default Model3D;
