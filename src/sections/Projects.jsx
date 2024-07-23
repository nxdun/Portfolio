import React from 'react';
import { motion } from 'framer-motion';

const projectData = [
  {
    project_name: "NASA - Spacia",
    short_desc: "Full Stack MERN Application Using Official NASA API",
    full_desc: "Frontend: Developed with React, including unit and integration testing; deployed on Netlify. Backend: Built with Express, featuring robust security capabilities; deployed on Heroku.",
    tags: ["React", "Express", "Netlify", "Heroku"],
    github_url: "https://github.com/nxdun/NASA-Spacia",
    time_period: "April 2024 - May 2024"
  },
  {
    project_name: "Study-Forge Learning System",
    short_desc: "User Interface: Designed and implemented a fully responsive and attractive user interface using React.",
    full_desc: "Backend Services: Built and maintained high-performance and secure backend services using Express, Flask, and Spring Boot. Containerization and Orchestration: Utilized Docker and Kubernetes for efficient container orchestration.",
    tags: ["React", "Express", "Flask", "Spring Boot", "Docker", "Kubernetes"],
    github_url: "https://github.com/nxdun/lms-microservice",
    time_period: "March 2024 - May 2024"
  },
  {
    project_name: "Chatte - P2P and Global Messenger",
    short_desc: "Implemented Client-Server and OSGi Architecture with User Authentication.",
    full_desc: "Technologies Used: Developed using Java and Apache Felix, incorporating socket programming. Development Environment: Utilized Eclipse IDE for production.",
    tags: ["Java", "Apache Felix", "Socket Programming", "Eclipse IDE"],
    github_url: "https://github.com/nxdun/OSGI.chatte",
    time_period: "February 2024 - March 2024"
  },
  {
    project_name: "Movie Theatre Management System",
    short_desc: "Role: Lead Developer",
    full_desc: "Responsibilities: Leadership in development, Figma for wireframes, MongoDB design, RESTful API creation, and responsive UI/UX with React.js.",
    tags: ["React.js", "MongoDB", "RESTful API", "Figma"],
    github_url: "https://github.com/nxdun/Movie-theatre-management-system",
    time_period: "July 2023 - October 2023"
  },
  {
    project_name: "Garment And Textile Management System",
    short_desc: "Garment and Textile Management System",
    full_desc: "Technologies Used: Developed using JSP Servlets, SQL, PHP, and Apache Tomcat. Collaboration and Version Control: Utilized GitHub for collaboration and version control. Design Patterns: Applied design patterns to enhance system architecture and maintainability.",
    tags: ["JSP Servlets", "SQL", "PHP", "Apache Tomcat"],
    github_url: "https://github.com/nxdun",
    time_period: "January 2023 - March 2023"
  }
];

const cardVariants = {
  offscreen: {
    y: 60,
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

export const Projects = () => (
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
            className="lg:w-1/3 sm:w-1/2 p-4"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.8 }}
            variants={cardVariants}
          >
            <div className="h-full border-2 border-gray-800 rounded-lg overflow-hidden bg-opacity-30 backdrop-blur-lg">
              <motion.img 
                alt="project" 
                className="lg:h-48 md:h-36 w-full object-cover object-center"
                src="https://dummyimage.com/600x360"
                whileHover={{ scale: 1.1 }}
              />
              <div className="p-6">
                <h2 className="tracking-widest text-xs title-font font-medium text-indigo-400 mb-1">{project.project_name}</h2>
                <h1 className="title-font text-lg font-medium text-white mb-3">{project.short_desc}</h1>
                <p className="leading-relaxed mb-3">{project.full_desc}</p>
                <div className="flex items-center flex-wrap">
                  <a href={project.github_url} className="text-indigo-400 inline-flex items-center md:mb-2 lg:mb-0">View on GitHub
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
  </section>
);
