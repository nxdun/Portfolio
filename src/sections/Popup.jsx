import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

const getColorFromTag = (tag) => {
  const hash = tag.charCodeAt(0) % 360;
  return `hsl(${hash}, 70%, 50%)`;
};

const Popup = ({ project, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 10) % 100); // Simulate loading progress
      if (progress === 90) {
        setCurrentImage((prev) => (prev + 1) % project.photos.length);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [progress, project.photos.length]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 overflow-auto"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
    >
      <motion.div
        className="relative w-full max-w-4xl rounded-lg bg-gray-800 bg-opacity-30 p-6 shadow-lg backdrop-blur-lg sm:mx-6 md:mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-transparent outline-none duration-300 shadow-md hover:bg-red-600 flex items-center justify-center text-white"
        >
          ✖️
        </button>

        <div className="relative mb-6 w-full h-56 overflow-hidden rounded">
          <motion.img
            src={project.photos[currentImage]}
            alt="Project Preview"
            className="w-full h-full object-cover transform transition-all duration-1000 ease-in-out"
            initial={{ opacity: 0, transform: "scale(1.2)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 1 }}
          />
          <div className="absolute bottom-0 w-full bg-gray-600 h-1">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-white text-center">
          {project.project_name}
        </h2>

        <p className="mb-6 text-gray-300 text-lg text-center">
          {project.full_desc}
        </p>

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {project.tags.map((tag, index) => (
            <motion.span
              key={index}
              className="px-3 py-1 rounded shadow-md text-white"
              style={{ backgroundColor: getColorFromTag(tag) }}
              whileHover={{ scale: 1.2, opacity: 0.8 }}
            >
              #{tag}
            </motion.span>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href={project.github_url}
            className="flex items-center text-sm font-medium text-white bg-black shadow-md hover:bg-black/90 h-9 px-4 py-2 rounded-md transition-all duration-300 ease-out"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="w-4 h-4 fill-current mr-2"
              viewBox="0 0 438.549 438.549"
            >
              <path d="M409.132 114.573c-19.608-33.596-46.205-60.194..." />
            </svg>
            Star on GitHub
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
