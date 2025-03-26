// * Project Details Popup Component
// ! Requires proper image loading handling
// ? Consider adding image preloading

import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useSwipeable } from 'react-swipeable';

// * Animation Configuration
// 💡 Could be moved to a separate config file
const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

// * Tag Color Generator
// note: Generates consistent colors for tags
const getColorFromTag = (tag) => {
  const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `hsl(${hash}, 70%, 65%)`;
};

// * Main Popup Component
// work: Ongoing improvements for accessibility
const Popup = ({ project, onClose }) => {
  // * State Management
  // ? Consider using useReducer for complex state
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Debounced close handler to prevent double-tap issues
  const handleClose = () => {
    if (!isClosing) {
      setIsClosing(true);
      onClose();
      setTimeout(() => setIsClosing(false), 500);
    }
  };

  // Replace progress state with proper image loading
  useEffect(() => {
    setIsLoading(true);
  }, [currentImage]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % project.photos.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + project.photos.length) % project.photos.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const toggleZoom = () => setIsZoomed(!isZoomed);

  return (
    <motion.div
      // * Backdrop Configuration
      // note: Click outside to close
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gradient-to-br from-gray-900/95 to-black/95 px-4 py-16 backdrop-blur-md sm:py-24"
      onClick={handleClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      {/* Background ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl"
          animate={{ 
            x: [0, 10, 0], 
            y: [0, -10, 0], 
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
          animate={{ 
            x: [0, -10, 0], 
            y: [0, 10, 0], 
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* More visible cancel button positioned at the top center */}
      <motion.button
        onClick={handleClose}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex h-12 px-5 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:top-6"
        aria-label="Close popup"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="font-medium">Close</span>
      </motion.button>

      {/* * Main Content Container */}
      <motion.div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 p-6 shadow-[0_0_40px_rgba(79,70,229,0.15)] backdrop-blur-xl sm:mx-6 md:mx-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Enhanced inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.12),transparent_50%)] pointer-events-none" />
        
        {/* Close button in the corner (secondary option) */}
        <motion.button
          onClick={handleClose}
          className="absolute -right-3 -top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 md:h-12 md:w-12"
          aria-label="Close popup"
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        {/* Mobile-friendly close hint */}
        <div className="mb-4 text-center text-sm font-light tracking-wide text-indigo-300/80 sm:hidden">
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-indigo-200">Tap outside or press ESC to close</span>
            <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.span>
        </div>

        {/* Reverted Image Carousel with enhanced mobile experience */}
        <div 
          className="relative mb-8 h-[400px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-black shadow-[0_0_25px_rgba(79,70,229,0.15)]"
          {...handlers}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

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
                className={`h-full w-full object-cover shadow-[0_10px_50px_rgba(0,0,0,0.5)] ${
                  isZoomed 
                    ? 'cursor-zoom-out scale-150 transition-all duration-500' 
                    : 'cursor-zoom-in hover:scale-105 transition-all duration-500'
                }`}
                initial={{ filter: "blur(10px)" }}
                animate={{ filter: isLoading ? "blur(10px)" : "blur(0px)" }}
                transition={{ duration: 0.5 }}
                onClick={toggleZoom}
                onLoad={() => setIsLoading(false)}
                whileHover={!isZoomed ? { scale: 1.05 } : {}}
              />
              
              {/* Cinematic letterboxing overlay */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-[5%] bg-gradient-to-b from-black to-transparent opacity-70"></div>
                <div className="absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-black to-transparent opacity-70"></div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Loading overlay */}
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <svg className="h-16 w-16 animate-spin" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium tracking-wider text-white">LOADING</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced image thumbnails for navigation */}
          <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
            {project.photos.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  currentImage === index 
                    ? 'w-8 bg-indigo-500' 
                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.3 + index * 0.05 } 
                }}
              />
            ))}
          </div>

          {/* Enhanced image navigation controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-4">
            <motion.button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-indigo-500/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous image"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-indigo-600/50 to-purple-600/50 opacity-0 group-hover:opacity-100"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <svg className="h-5 w-5 transform text-white transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Image counter */}
            <motion.div 
              className="rounded-full bg-black/30 px-4 py-1.5 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-medium tracking-widest text-white">
                <span className="text-indigo-300">{currentImage + 1}</span>
                <span className="mx-1.5 text-gray-400">/</span>
                <span>{project.photos.length}</span>
              </span>
            </motion.div>

            <motion.button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-indigo-500/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next image"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-indigo-600/50 to-purple-600/50 opacity-0 group-hover:opacity-100"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <svg className="h-5 w-5 transform text-white transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
          
          {/* Zoom control */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-indigo-500/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            <span className="absolute -bottom-8 whitespace-nowrap rounded bg-black/75 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {isZoomed ? "Zoom Out" : "Zoom In"}
            </span>
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isZoomed 
                   ? "M21 21l-6-6m-2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" 
                   : "M21 21l-6-6m-2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"} 
              />
            </svg>
          </motion.button>

          {/* Mobile swipe hint */}
          <motion.div 
            className="pointer-events-none absolute inset-x-0 top-4 flex justify-center sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              <span className="flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Swipe to navigate</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Project Information Section with enhanced typography */}
        <motion.h2 
          id="popup-title" 
          className="mb-5 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {project.project_name}
        </motion.h2>

        <motion.p 
          className="mb-8 text-center text-lg leading-relaxed text-gray-300/90"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {project.full_desc}
        </motion.p>

        {/* Enhanced Tags Section with animated entrance */}
        <motion.div 
          className="mb-8 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {project.tags.map((tag, index) => (
            <motion.span
              key={index}
              className="rounded-full px-4 py-1.5 text-white shadow-lg backdrop-blur-sm font-medium"
              style={{ backgroundColor: getColorFromTag(tag) }}
              whileHover={{ scale: 1.1, y: -3 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                transition: { delay: 0.5 + index * 0.05 }
              }}
            >
              #{tag}
            </motion.span>
          ))}
        </motion.div>

        {/* Enhanced GitHub Button with dynamic glow effect */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button 
            onClick={() => window.open(project.github_url, "_blank")} 
            className="group flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-3 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 blur-xl transition-opacity group-hover:opacity-70"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            
            <span className="font-medium">Star on GitHub</span>
            
            <div className="ml-2 flex items-center gap-1">
              <svg className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-sm font-semibold">11</span>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Subtle corner decorative elements */}
      <div className="pointer-events-none fixed top-10 right-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl"></div>
      <div class="pointer-events-none fixed bottom-10 left-10 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl"></div>
    </motion.div>
  );
};

// * PropTypes Validation
// ! Required for type checking
Popup.propTypes = {
  project: PropTypes.shape({
    project_name: PropTypes.string.isRequired,
    full_desc: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    github_url: PropTypes.string.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Popup;
