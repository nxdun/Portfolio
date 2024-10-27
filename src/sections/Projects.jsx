/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
const projectData = [
  {
    project_name: "NASA - Spacia",
    short_desc: "Full Stack MERN Application Using Official NASA API",
    full_desc:
      "Frontend: Developed with React, including unit and integration testing; deployed on Netlify. Backend: Built with Express, featuring robust security capabilities; deployed on Heroku.",
    tags: ["React", "Express", "Netlify", "Heroku"],
    github_url: "https://github.com/nxdun/NASA-Spacia",
    time_period: "April 2024 - May 2024",
    photos: [
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-spacia-1.jpg",
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-spacia-1.jpg",
    ],
  },
  {
    project_name: "Study-Forge Learning System",
    short_desc:
      "Microservice: UI and Backend Services with Containerization and Orchestration",
    full_desc:
      "Backend Services: Built and maintained high-performance and secure backend services using Express, Flask, and Spring Boot. Containerization and Orchestration: Utilized Docker and Kubernetes for efficient container orchestration.",
    tags: ["React", "Express", "Flask", "Spring Boot", "Docker", "Kubernetes"],
    github_url: "https://github.com/nxdun/lms-microservice",
    time_period: "March 2024 - May 2024",
    photos: [
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-studyforge-1.png",
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-studyforge-2.png",
    ],
  },
  {
    project_name: "Chatte - P2P and Global Messenger",
    short_desc:
      "Implemented Client-Server and OSGi Architecture with User Authentication.",
    full_desc:
      "Technologies Used: Developed using Java and Apache Felix, incorporating socket programming. Development Environment: Utilized Eclipse IDE for production.",
    tags: ["Java", "Apache Felix", "Socket Programming", "Eclipse IDE"],
    github_url: "https://github.com/nxdun/OSGI.chatte",
    time_period: "February 2024 - March 2024",
    photos: [
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-osgi-1.jpg",
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-osgi-2.jpg",
    ],
  },
  {
    project_name: "Movie Theatre Management System",
    short_desc: "Role: Lead Developer",
    full_desc:
      "Responsibilities: Leadership in development, Figma for wireframes, MongoDB design, RESTful API creation, and responsive UI/UX with React.js.",
    tags: ["React.js", "MongoDB", "RESTful API", "Figma"],
    github_url: "https://github.com/nxdun/Movie-theatre-management-system",
    time_period: "July 2023 - October 2023",
    photos: [
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-mov-2.bak.jpg",
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-mov-1.bak.jpg",
    ],
  },
  {
    project_name: "Garment And Textile Management System",
    short_desc: "Garment and Textile Management System",
    full_desc:
      "Technologies Used: Developed using JSP Servlets, SQL, PHP, and Apache Tomcat. Collaboration and Version Control: Utilized GitHub for collaboration and version control. Design Patterns: Applied design patterns to enhance system architecture and maintainability.",
    tags: ["JSP Servlets", "SQL", "PHP", "Apache Tomcat"],
    github_url: "https://github.com/nxdun",
    time_period: "January 2023 - March 2023",
    photos: [
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-hms-1.png",
      "https://raw.githubusercontent.com/nxdun/BlaBla/main/port-hms-1.png",
    ],
  },
  {
    project_name: "Smart Healthcare System for Urban Hospitals",
    short_desc: "Health Wizard",
    full_desc:
      "JWT Authentication, Design Patterns, Higher Order Components, Advanced File Organization, Event Emitter, IIFE Functions, Discriminators, Requirement Analysis, XP Methodology, and Agile Development.",
    tags: ["Express", "Redux", "MongoDB", "React.js"],
    github_url: "https://github.com/nxdun/HealthWizard",
    time_period: "April 2024 - July 2024",
    photos: [
      "https://ik.imagekit.io/cq1p7u6vo/HealthWizard/appointment%20booking.jpg?updatedAt=1729425369292",
      "https://ik.imagekit.io/cq1p7u6vo/HealthWizard/Admin%20Configuration%20Management.jpeg?updatedAt=1729425369398",
    ],
  },
  {
    project_name: "CodeWizard Microservice Project",
    short_desc: "Automated Code Analysis and Project Management",
    full_desc:
      "Microservices Architecture, Task Management, Real-Time Feedback, Graphical Code Visualization, Issue Tracking, and Code Quality Optimization for multi-language projects. Developed with Agile methodology and optimized for efficient project management.",
    tags: [
      "Microservices",
      "Code Analysis",
      "Project Management",
      "React.js",
      "MongoDB",
      "ExpressJS",
    ],
    github_url: "https://github.com/nxdun/CodeWizard",
    time_period: "July 2024 - Octomber 2024",
    photos: [
      "https://ik.imagekit.io/nuu/Screenshot%202024-09-14%20112456.png?updatedAt=1730009713252",
      "https://ik.imagekit.io/nuu/Screenshot%202024-10-27%20114658.png?updatedAt=1730009865478",
    ],
  },
];
const cardVariants = {
  offscreen: {
    y: -20,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

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
        <p className="mb-4 text-gray-300">
          {project.full_desc.split(" ").map((word, index) =>
            word.startsWith("#") ? (
              <span key={index} className="hashtag">
                {word}{" "}
              </span>
            ) : (
              word + " "
            ),
          )}
        </p>
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

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section className="body-font py-24 text-gray-400" id="projects">
      <div className="container mx-auto px-5">
        <div className="mb-20 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-3xl font-medium text-white sm:text-5xl">
            My Projects
          </h1>
          <p className="mx-auto text-base leading-relaxed text-gray-300 lg:w-2/3">
            A selection of projects showcasing my skills and experience. Click
            on the images to learn more.
          </p>
        </div>
        <div className="-m-4 flex flex-wrap">
          {projectData.map((project, index) => (
            <motion.div
              key={index}
              className="cursor-pointer p-4 sm:w-1/2 lg:w-1/3"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.8 }}
              variants={cardVariants}
              onClick={() => setSelectedProject(project)}
            >
              <div className="h-full overflow-hidden rounded-lg border-2 border-gray-800 bg-opacity-30 backdrop-blur-lg">
                <div className="relative cursor-pointer overflow-hidden rounded-xl text-2xl font-bold md:h-36 lg:h-48">
                  <div className="peer absolute z-10 h-full w-full"></div>
                  <div className="absolute -left-16 -top-32 h-44 w-32 rounded-full bg-purple-300 transition-all duration-500 peer-hover:-left-16 peer-hover:-top-20 peer-hover:h-[140%] peer-hover:w-[140%]"></div>
                  <div className="absolute -bottom-32 -right-16 flex h-44 w-36 items-end justify-end rounded-full bg-purple-300 text-center text-xl transition-all duration-500 peer-hover:bottom-0 peer-hover:right-0 peer-hover:h-full peer-hover:w-full peer-hover:items-center peer-hover:justify-center peer-hover:rounded-b-none">
                    <motion.img
                      alt="project"
                      className="w-full object-cover object-center md:h-36 lg:h-48"
                      src={project.photos[0]}
                      whileHover={{ scale: 1.1 }}
                    />
                  </div>
                  <div className="flex h-full w-full items-center justify-center uppercase">
                    <motion.img
                      alt="project"
                      className="w-full object-cover object-center md:h-36 lg:h-48"
                      src={project.photos[1]}
                      whileHover={{ scale: 1.1 }}
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="title-font mb-1 text-xs font-medium tracking-widest text-indigo-400">
                    {project.project_name}
                  </h2>
                  <h1 className="title-font mb-3 text-lg font-medium text-white">
                    {project.short_desc}
                  </h1>
                  <p className="mb-3 leading-relaxed">{project.full_desc}</p>
                  <div className="flex flex-wrap items-center">
                    <a
                      href={project.github_url}
                      target="_blank"
                      className="ring-offset-background focus-visible:ring-ring group inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-gray-900 px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-gray-950 hover:ring-2 hover:ring-gray-900 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                      View on GitHub
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="ml-2 h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </a>
                    <span className="ml-auto text-sm text-gray-500">
                      {project.time_period}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedProject && (
          <Popup
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

//props validation
Projects.propTypes = {
  projectData: PropTypes.array,
};
