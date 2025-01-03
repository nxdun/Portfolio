/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import LoadingSpinner from "../components/LoadingSpinner";
import projectData from "../data/ProjectData.json";
import Popup from "./Popup";

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

const SearchBar = ({ onSearch, query, setQuery }) => {
  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }

    if (e.key === "Escape") {
      setQuery("");
      onSearch("");
    }
  };

  return (
    <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-2 rounded-lg bg-gray-800 bg-opacity-30 px-4 py-2 shadow-lg backdrop-blur-lg">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-sm text-white focus:outline-none sm:text-base"
      />
      <button
        onClick={handleSearch}
        className=" outline-1 outline-dashed text-nowrap text-sm rounded bg-grey-600 px-3 py-1 text-grey hover:bg-indigo-700"
      >
       ENTER 
      </button>
    </div>
  );
};

const SortDropdown = ({ onSort }) => {
  const [selectedTag, setSelectedTag] = useState("");

  const handleSort = (e) => {
    const tag = e.target.value;
    setSelectedTag(tag);
    onSort(tag);
  };

  const uniqueTags = Array.from(
    new Set(projectData.flatMap((project) => project.tags))
  );

  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={selectedTag}
        onChange={handleSort}
        className="w-full appearance-none rounded-lg border border-gray-700 bg-black bg-opacity-50 px-4 py-3 pl-4 pr-10 text-white shadow-lg backdrop-blur-lg transition duration-300 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Sort by Tags</option>
        {uniqueTags.map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
        </svg>
      </div>
    </div>
  );
};

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState(projectData);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const projectsPerPage = 6;

  const handleSearch = (searchQuery) => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = projectData.filter((project) =>
        [project.project_name, project.short_desc, project.full_desc, ...project.tags]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 500);
  };

  const handleSort = (tag) => {
    if (tag) {
      const sorted = projectData.filter((project) =>
        project.tags.includes(tag)
      );
      setFilteredProjects(sorted);
    } else {
      setFilteredProjects(projectData);
    }
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetSearch = () => {
    setFilteredProjects(projectData);
    setCurrentPage(1);
    setQuery("");
  };

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SortDropdown onSort={handleSort} />
          <SearchBar onSearch={handleSearch} query={query} setQuery={setQuery} />
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="-m-4 flex flex-wrap">
              {currentProjects.length > 0 ? (
                currentProjects.map((project, index) => (
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
                      <motion.img
                        alt="project"
                        className="w-full object-cover object-center md:h-36 lg:h-48"
                        src={project.photos[0]}
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="p-6">
                        <h2 className="title-font mb-1 text-xs font-medium tracking-widest text-indigo-400">
                          {project.project_name}
                        </h2>
                        <h1 className="title-font mb-3 text-lg font-medium text-white">
                          {project.short_desc}
                        </h1>
                        <div className="flex flex-wrap items-center">
                          <a
                            href={project.github_url}
                            target="_blank"
                            className="inline-flex items-center text-indigo-400 hover:text-indigo-600"
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
                ))
              ) : (
                <div className="w-full mt-7 text-center text-white">
                  Nothing Here ;/
                  <br />
                  <br />
                  <span className=" text-sm text-gray-400">
                    Go Back
                  </span><br />
                  <button
                    onClick={resetSearch}
                    className=""
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultValue className="sr-only peer" />
      <div className="peer ring-0 bg-transperant rounded-full outline-none duration-300 after:duration-500 w-12 h-12 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-10 after:w-10 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0">
      </div>
    </label>
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerPage) }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-3 py-1 text-sm rounded ${
                    currentPage === number
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          </>
        )}
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

Projects.propTypes = {
  projectData: PropTypes.array,
};
