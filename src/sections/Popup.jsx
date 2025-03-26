// * Project Details Popup Component
// Redesigned for better mobile and desktop experience

import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import { useSwipeable } from 'react-swipeable';

// * Animation Configuration
const popupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.1 },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },
};

// * Tag Color Generator
const getColorFromTag = (tag) => {
  const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `hsl(${hash}, 70%, 65%)`;
};

// * Main Popup Component
const Popup = ({ project, onClose }) => {
  // * State Management
  const [currentImage, setCurrentImage] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (fullScreenMode) {
          setFullScreenMode(false);
        } else {
          handleClose();
        }
      }
    };
    
    // Lock body scroll when popup is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [fullScreenMode]);

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentImage]);

  // Debounced close handler
  const handleClose = useCallback(() => {
    if (!isClosing) {
      setIsClosing(true);
      
      if (fullScreenMode) {
        setFullScreenMode(false);
        setTimeout(() => onClose(), 300);
      } else {
        onClose();
      }
      
      setTimeout(() => setIsClosing(false), 500);
    }
  }, [fullScreenMode, isClosing, onClose]);

  // Image navigation functions
  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % project.photos.length);
  }, [project.photos.length]);

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + project.photos.length) % project.photos.length);
  }, [project.photos.length]);

  // Swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    onSwipedDown: () => {
      if (fullScreenMode) {
        setFullScreenMode(false);
      } else {
        handleClose();
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setFullScreenMode(!fullScreenMode);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        onClick={handleClose}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={popupVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        {/* Fullscreen Image View Mode */}
        <AnimatePresence>
          {fullScreenMode && (
            <motion.div
              className="fixed inset-0 z-60 bg-black flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenMode(false);
              }}
            >
              <div 
                className="w-full h-full relative" 
                {...handlers}
              >
                {/* Fullscreen image */}
                <motion.img
                  src={project.photos[currentImage]}
                  alt={`Project preview ${currentImage + 1}`}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onLoad={() => setIsLoading(false)}
                />
                
                {/* Fullscreen navigation controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-8 px-4">
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-indigo-600/80 transition-colors"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  
                  <div className="bg-black/50 px-4 py-2 rounded-full">
                    <span className="text-white">
                      {currentImage + 1} / {project.photos.length}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-indigo-600/80 transition-colors"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
                
                {/* Exit fullscreen button */}
                <motion.button
                  className="absolute top-4 right-4 z-70 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-600 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setFullScreenMode(false); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Exit fullscreen"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
                
                {/* Mobile swipe indicators (only shown on small screens) */}
                <div className="absolute inset-x-0 top-4 flex justify-center sm:hidden">
                  <div className="bg-black/70 rounded-full px-3 py-2 text-white text-sm">
                    <span>Swipe for more · Swipe down to exit</span>
                  </div>
                </div>
              </div>
              
              {/* Fullscreen loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content (Only visible when not in fullscreen mode) */}
        {!fullScreenMode && (
          <motion.div
            className="relative w-full max-w-xs sm:max-w-3xl md:max-w-5xl mx-auto overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-lg sm:mx-6"
            onClick={(e) => e.stopPropagation()}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Single close button - positioned for both mobile and desktop */}
            <motion.button
              onClick={handleClose}
              className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-red-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close popup"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Enhanced Layout - Side-by-side on larger screens */}
            <div className="flex flex-col lg:flex-row">
              {/* Image carousel - optimized for touch */}
              <div 
                className="relative w-full lg:w-3/5 overflow-hidden bg-black aspect-video max-h-[40vh] sm:max-h-[50vh] lg:max-h-none lg:aspect-auto lg:min-h-[500px]"
                {...handlers}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    className="h-full w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={project.photos[currentImage]}
                      alt={`Project preview ${currentImage + 1}`}
                      className="h-full w-full object-contain lg:object-cover"
                      initial={{ filter: "blur(8px)" }}
                      animate={{ filter: isLoading ? "blur(8px)" : "blur(0px)" }}
                      transition={{ duration: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullScreen();
                      }}
                      onLoad={() => setIsLoading(false)}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                )}

                {/* Navigation controls overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/70"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/70"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Fullscreen button */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                  className="absolute right-3 bottom-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-indigo-600/70"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="View fullscreen"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                </motion.button>
                
                {/* Image pagination indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 rounded-full px-3 py-1">
                  <span className="text-white text-sm">
                    {currentImage + 1} / {project.photos.length}
                  </span>
                </div>
                
                {/* Mobile tap to view fullscreen hint */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/40 rounded-full px-3 py-1 sm:hidden">
                  <span className="text-white text-xs">
                    Tap image for fullscreen
                  </span>
                </div>
              </div>

              {/* Content area - Enhanced for desktop */}
              <div className="p-5 sm:p-6 lg:w-2/5 lg:py-8 lg:px-8 lg:flex lg:flex-col lg:justify-between">
                {/* Project title */}
                <div>
                  <h2 
                    id="popup-title" 
                    className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center lg:text-left lg:mb-6"
                  >
                    {project.project_name}
                  </h2>

                  {/* Project description */}
                  <p className="text-gray-300 mb-6 text-sm sm:text-base lg:leading-relaxed">
                    {project.full_desc}
                  </p>

                  {/* Tags */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white shadow-sm shadow-black/10"
                        style={{ backgroundColor: getColorFromTag(tag) }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

               
                <div className="mt-auto flex justify-center">
                  <motion.a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[80%] group inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-lg transition-all shadow-sm overflow-hidden"
                    whileHover={{ boxShadow: "0 0 15px 2px rgba(79, 70, 229, 0.3)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604 -2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221 -.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176 .77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921 .43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="font-medium">GitHub Repository</span>
                    {/* Subtle glow effect on hover */}
                  </motion.a>
                </div>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Project time period (from ProjectData.json) */}
                <div className="mt-6 text-center lg:text-left text-sm text-gray-400">
                  <p>Timeline: {project.time_period || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Desktop thumbnail navigation */}
            <div className="hidden lg:flex gap-2 p-4 bg-black/40">
              {project.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative h-16 w-16 rounded overflow-hidden flex-shrink-0 transition-all
                    ${currentImage === index ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-black' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img 
                    src={photo} 
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// PropTypes validation - only including fields from ProjectData.json
Popup.propTypes = {
  project: PropTypes.shape({
    project_name: PropTypes.string.isRequired,
    short_desc: PropTypes.string,
    full_desc: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    github_url: PropTypes.string.isRequired,
    time_period: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Popup;
