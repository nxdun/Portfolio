import { useState, useEffect, useRef, useCallback } from "react";
import { useColorScheme } from "../contexts/ColorSchemeContext";
import { interpolateColor } from "../utils/colorUtils";
import { easing } from "../utils/easingFunctions";

// Transition configuration
const TRANSITION_DURATION = 1200; // ms

export function useShaderBackground() {
  const {
    activeSection, 
    prevSection, 
    isTransitioning, 
    transitionProgress,
    colorSchemes,
    setTransitionProgress,
    setIsTransitioning
  } = useColorScheme();
  
  // Store cached shader URL
  const [shaderUrl, setShaderUrl] = useState("");
  const transitionStartTimeRef = useRef(0);
  
  // Generate shader URL based on active section and transition state
  const buildShaderUrl = useCallback(() => {
    // Get color schemes for current and previous sections
    const currentColors = colorSchemes[activeSection] || colorSchemes.hero;
    const previousColors = colorSchemes[prevSection] || colorSchemes.hero;

    // Apply easing to transition
    const easeTransition = isTransitioning
      ? easing.easeInOutCubic(transitionProgress)
      : 1;

    // Log transition for debugging
    if (
      isTransitioning &&
      (transitionProgress === 0 || transitionProgress >= 0.99)
    ) {
      console.log(
        `Color transition: ${prevSection} (${previousColors.name}) → ` +
          `${activeSection} (${currentColors.name}) - Progress: ${Math.round(transitionProgress * 100)}%`
      );
    }

    // Blend colors based on transition progress
    const color1 = interpolateColor(
      previousColors.color1,
      currentColors.color1,
      easeTransition,
      easing.colorEase
    );

    const color2 = interpolateColor(
      previousColors.color2,
      currentColors.color2,
      easeTransition,
      easing.easeOutQuint
    );

    const color3 = interpolateColor(
      previousColors.color3,
      currentColors.color3,
      easeTransition,
      easing.colorEase
    );

    // Generate shader URL with explicit HEX formatting
    return `https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.3&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23${color1}&color2=%23${color2}&color3=%23${color3}&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.5&uFrequency=0&uSpeed=0.2&uStrength=1.5&uTime=8&wireframe=false`;
  }, [activeSection, prevSection, isTransitioning, transitionProgress, colorSchemes]);

  // Handle transition animation
  useEffect(() => {
    if (!isTransitioning) return;

    transitionStartTimeRef.current = Date.now();

    const animateTransition = () => {
      const elapsed = Date.now() - transitionStartTimeRef.current;
      const newProgress = Math.min(1, elapsed / TRANSITION_DURATION);

      setTransitionProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        setIsTransitioning(false);
      }
    };

    const animationId = requestAnimationFrame(animateTransition);

    return () => cancelAnimationFrame(animationId);
  }, [isTransitioning, setTransitionProgress, setIsTransitioning]);

  // Update shader URL when transition state changes
  useEffect(() => {
    setShaderUrl(buildShaderUrl());
  }, [buildShaderUrl]);

  return { shaderUrl };
}
