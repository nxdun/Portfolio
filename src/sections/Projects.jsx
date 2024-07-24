import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { annotate } from 'rough-notation';
const projectData = [
  {
    project_name: "NASA - Spacia",
    short_desc: "Full Stack MERN Application Using Official NASA API",
    full_desc: "Frontend: Developed with React, including unit and integration testing; deployed on Netlify. Backend: Built with Express, featuring robust security capabilities; deployed on Heroku.",
    tags: ["React", "Express", "Netlify", "Heroku"],
    github_url: "https://github.com/nxdun/NASA-Spacia",
    time_period: "April 2024 - May 2024",
    photos: ["https://dummyimage.com/600x360/000/fff", "https://dummyimage.com/600x360/111/fff"]
  },
  {
    project_name: "Study-Forge Learning System",
    short_desc: "User Interface: Designed and implemented a fully responsive and attractive user interface using React.",
    full_desc: "Backend Services: Built and maintained high-performance and secure backend services using Express, Flask, and Spring Boot. Containerization and Orchestration: Utilized Docker and Kubernetes for efficient container orchestration.",
    tags: ["React", "Express", "Flask", "Spring Boot", "Docker", "Kubernetes"],
    github_url: "https://github.com/nxdun/lms-microservice",
    time_period: "March 2024 - May 2024",
    photos: ["https://dummyimage.com/600x360/222/fff", "https://dummyimage.com/600x360/333/fff"]
  },
  {
    project_name: "Chatte - P2P and Global Messenger",
    short_desc: "Implemented Client-Server and OSGi Architecture with User Authentication.",
    full_desc: "Technologies Used: Developed using Java and Apache Felix, incorporating socket programming. Development Environment: Utilized Eclipse IDE for production.",
    tags: ["Java", "Apache Felix", "Socket Programming", "Eclipse IDE"],
    github_url: "https://github.com/nxdun/OSGI.chatte",
    time_period: "February 2024 - March 2024",
    photos: ["https://dummyimage.com/600x360/444/fff", "https://dummyimage.com/600x360/555/fff"]
  },
  {
    project_name: "Movie Theatre Management System",
    short_desc: "Role: Lead Developer",
    full_desc: "Responsibilities: Leadership in development, Figma for wireframes, MongoDB design, RESTful API creation, and responsive UI/UX with React.js.",
    tags: ["React.js", "MongoDB", "RESTful API", "Figma"],
    github_url: "https://github.com/nxdun/Movie-theatre-management-system",
    time_period: "July 2023 - October 2023",
    photos: ["https://dummyimage.com/600x360/666/fff", "https://dummyimage.com/600x360/777/fff"]
  },
  {
    project_name: "Garment And Textile Management System",
    short_desc: "Garment and Textile Management System",
    full_desc: "Technologies Used: Developed using JSP Servlets, SQL, PHP, and Apache Tomcat. Collaboration and Version Control: Utilized GitHub for collaboration and version control. Design Patterns: Applied design patterns to enhance system architecture and maintainability.",
    tags: ["JSP Servlets", "SQL", "PHP", "Apache Tomcat"],
    github_url: "https://github.com/nxdun",
    time_period: "January 2023 - March 2023",
    photos: ["https://dummyimage.com/600x360/888/fff", "https://dummyimage.com/600x360/999/fff"]
  }
];
const cardVariants = {
  offscreen: {
    y: -20,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.4, ease: "easeInOut" } }
};

const Popup = ({ project, onClose }) => {
  useEffect(() => {
    const hashtagElements = document.querySelectorAll('.hashtag');
    hashtagElements.forEach(el => annotate(el, { type: 'highlight', color: 'yellow', multiline: true }).show());
  }, [project]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-75"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
    >
      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full backdrop-blur-lg bg-opacity-30"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{project.project_name}</h2>
        <p className="mb-4 text-gray-300">{project.full_desc.split(' ').map((word, index) => (
          word.startsWith('#') ? <span key={index} className="hashtag">{word} </span> : word + ' '
        ))}</p>
        <div className="flex flex-wrap mb-4">
          {project.tags.map((tag, index) => (
            <motion.span
              key={index}
              className="bg-indigo-600 text-white px-2 py-1 rounded mr-2 mb-2"
              whileHover={{ scale: 1.2, color: '#ffeb3b' }}
            >
              #{tag}
            </motion.span>
          ))}
        </div>
        <div className="flex flex-wrap mb-4">
          {project.photos.map((photo, index) => (
            <motion.img
              key={index}
              src={photo}
              alt={`Project ${index}`}
              className="w-1/3 h-24 object-cover rounded mr-2 mb-2"
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
        <div>
          <a href={project.github_url} className="text-indigo-400">View on GitHub</a>
        </div>
        <button onClick={onClose} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Close</button>
      </motion.div>
    </motion.div>
  );
};

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section className="text-gray-400 body-font py-24" id="projects">
      <div className="container px-5 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-5xl text-3xl font-medium title-font mb-4 text-white">My Projects</h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-gray-300">A selection of projects showcasing my skills and experience. Click on the images to learn more.</p>
        </div>
        <div className="flex flex-wrap -m-4">
          {projectData.map((project, index) => (
            <motion.div
              key={index}
              className="lg:w-1/3 sm:w-1/2 p-4 cursor-pointer"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.8 }}
              variants={cardVariants}
              onClick={() => setSelectedProject(project)}
            >
              <div className="h-full border-2 border-gray-800 rounded-lg overflow-hidden bg-opacity-30 backdrop-blur-lg">
              <div className="relative lg:h-48 md:h-36 cursor-pointer overflow-hidden rounded-xl text-2xl font-bold">
                  <div className="peer absolute z-10 h-full w-full"></div>
                  <div className="absolute -left-16 -top-32 h-44 w-32 rounded-full bg-purple-300 transition-all duration-500 peer-hover:-left-16 peer-hover:-top-20 peer-hover:h-[140%] peer-hover:w-[140%]"></div>
                  <div className="absolute -bottom-32 -right-16 flex h-44 w-36 items-end justify-end rounded-full bg-purple-300 text-center text-xl transition-all duration-500 peer-hover:bottom-0 peer-hover:right-0 peer-hover:h-full peer-hover:w-full peer-hover:items-center peer-hover:justify-center peer-hover:rounded-b-none">
                  <motion.img 
                alt="project" 
                className="lg:h-48 md:h-36 w-full object-cover object-center"
                src="https://dummyimage.com/600x360"
                whileHover={{ scale: 1.1 }}
              />
                  </div>
                  <div className="flex h-full w-full items-center justify-center uppercase">
                  <motion.img 
                alt="project" 
                className="lg:h-48 md:h-36 w-full object-cover object-center"
                src="https://dummyimage.com/600x360"
                whileHover={{ scale: 1.1 }}
              />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="tracking-widest text-xs title-font font-medium text-indigo-400 mb-1">{project.project_name}</h2>
                  <h1 className="title-font text-lg font-medium text-white mb-3">{project.short_desc}</h1>
                  <p className="leading-relaxed mb-3">{project.full_desc}</p>
                  <div className="flex items-center flex-wrap">
                    <a href={project.github_url} target = "_blank" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 group bg-gray-900 hover:bg-gray-950 transition-all duration-200 ease-in-out hover:ring-2 hover:ring-offset-2 hover:ring-gray-900">View on GitHub
                      <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </a>
                    <span className="text-gray-500 text-sm ml-auto">{project.time_period}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedProject && <Popup project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </section>
  );
};