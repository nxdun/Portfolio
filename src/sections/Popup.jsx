
import { motion } from "framer-motion";
import PropTypes from "prop-types";

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

const Popup = ({ project, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
    >
      <motion.div
        className="w-full max-w-lg rounded-lg bg-gray-800 bg-opacity-30 p-6 shadow-lg backdrop-blur-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold text-white">
          {project.project_name}
        </h2>
        <p className="mb-4 text-gray-300">{project.full_desc}</p>
        <div className="mb-4 flex flex-wrap">
          {project.tags.map((tag, index) => (
            <motion.span
              key={index}
              className="mb-2 mr-2 rounded bg-indigo-600 px-2 py-1 text-white"
              whileHover={{ scale: 1.2, color: "#ffeb3b" }}
            >
              #{tag}
            </motion.span>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap">
          {project.photos.map((photo, index) => (
            <motion.img
              key={index}
              src={photo}
              alt={`Project ${index}`}
              className="mb-2 mr-2 h-24 w-1/3 rounded object-cover"
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
        <div>
          <a href={project.github_url} className="text-indigo-400">
            View on GitHub
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

Popup.propTypes = {
  project: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Popup;
