export const Projects = () => (
    <section className="text-gray-400 bg-gray-900 body-font" id="projects">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-white">My Projects</h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">A selection of projects showcasing my skills and experience. Click on the images to learn more.</p>
        </div>
        <div className="flex flex-wrap -m-4">
          {/* Example Project 1 */}
          <div className="lg:w-1/3 sm:w-1/2 p-4">
            <div className="flex relative">
              <img alt="project" className="absolute inset-0 w-full h-full object-cover object-center" src="https://dummyimage.com/600x360" />
              <div className="px-8 py-10 relative z-10 w-full border-4 border-gray-800 bg-gray-900 opacity-0 hover:opacity-100">
                <h2 className="tracking-widest text-sm title-font font-medium text-indigo-400 mb-1">PROJECT TITLE</h2>
                <h1 className="title-font text-lg font-medium text-white mb-3">Project Name</h1>
                <p className="leading-relaxed">Brief description of the project. Technologies used, challenges faced, and the impact.</p>
              </div>
            </div>
          </div>
          {/* Repeat for more projects */}
        </div>
      </div>
    </section>
  );