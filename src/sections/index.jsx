
// Navbar Component
export const Navbar = () => (
  <header className="text-gray-400 bg-gray-900 body-font">
    <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
      <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <span className="ml-3 text-xl">Nadun Lakshan</span>
      </a>
      <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
        <a href="#home" className="mr-5 hover:text-white">Home</a>
        <a href="#projects" className="mr-5 hover:text-white">Projects</a>
        <a href="#contact" className="mr-5 hover:text-white">Contact</a>
      </nav>
      <button className="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0">Apply Now
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </header>
);

// Hero Component
export const Hero = () => (
  <section className="text-gray-400 bg-gray-900 body-font">
    <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">Nadun Lakshan
          <br className="hidden lg:inline-block"/>Software Engineer Intern</h1>
        <p className="mb-8 leading-relaxed">Passionate software engineering student with hands-on experience in modern technologies. Seeking opportunities to contribute to impactful projects and gain industry experience.</p>
        <div className="flex justify-center">
          <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Contact Me</button>
          <button className="ml-4 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">My Resume</button>
        </div>
      </div>
      <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
        <img className="object-cover object-center rounded" alt="hero" src="https://dummyimage.com/720x600" />
      </div>
    </div>
  </section>
);

// Projects Component
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

// Contact Component
export const Contact = () => (
  <section className="text-gray-400 bg-gray-900 body-font relative" id="contact">
    <div className="container px-5 py-24 mx-auto">
      <div className="flex flex-col text-center w-full mb-12">
        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-white">Contact Me</h1>
        <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Feel free to reach out to me for any opportunities, collaborations, or questions.</p>
      </div>
      <div className="lg:w-1/2 md:w-2/3 mx-auto">
        <div className="flex flex-wrap -m-2">
          <div className="p-2 w-1/2">
            <div className="relative">
              <label htmlFor="name" className="leading-7 text-sm text-gray-400">Name</label>
              <input type="text" id="name" name="name" className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
          </div>
          <div className="p-2 w-1/2">
            <div className="relative">
              <label htmlFor="email" className="leading-7 text-sm text-gray-400">Email</label>
              <input type="email" id="email" name="email" className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
          </div>
          <div className="p-2 w-full">
            <div className="relative">
              <label htmlFor="message" className="leading-7 text-sm text-gray-400">Message</label>
              <textarea id="message" name="message" className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:border-indigo-500 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-900 h-32 text-base outline-none text-gray-100 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
            </div>
          </div>
          <div className="p-2 w-full">
            <button className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send Message</button>
          </div>
          <div className="p-2 w-full pt-8 mt-8 border-t border-gray-800 text-center">
            <a className="text-indigo-400">example@email.com</a>
            <p className="leading-normal my-5">49 Smith St.
              <br />Saint Cloud, MN 56301
            </p>
            <span className="inline-flex">
              <a className="text-gray-500">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v5h3v10h5V15h3l1-5h-4V7a2 2 0 012-2h2v5h4V2z"></path>
                </svg>
              </a>
              <a className="ml-4 text-gray-500">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14.86A4.54 4.54 0 0022.45 4a9.08 9.08 0 01-2.9 1.1A4.53 4.53 0 0016.57 4a4.56 4.56 0 00-4.56 4.56c0 .36.04.71.1 1.05A12.9 12.9 0 013 4.5a4.48 4.48 0 00-.62 2.29c0 1.58.81 2.97 2.03 3.8A4.53 4.53 0 012 9.91v.05a4.53 4.53 0 004.07 4.5A4.62 4.62 0 016 14a4.53 4.53 0 004.07-4.5v-.06a4.53 4.53 0 002.07-.57A4.56 4.56 0 0018 8a4.56 4.56 0 001.22-2.64A4.56 4.56 0 0023 3z"></path>
                </svg>
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Footer Component
export const Footer = () => (
  <footer className="text-gray-400 bg-gray-900 body-font">
    <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
      <a className="flex title-font font-medium items-center text-white md:justify-start justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <span className="ml-3 text-xl">Nadun Lakshan</span>
      </a>
      <p className="text-sm text-gray-500 sm:ml-6 sm:pl-6 sm:border-l border-gray-800 sm:py-2 sm:mt-0 mt-4">© 2024 Nadun Lakshan —
        <a href="https://twitter.com" className="text-gray-400 ml-1" target="_blank" rel="noopener noreferrer">@nadun</a>
      </p>
      <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
        <a className="text-gray-500" href="https://linkedin.com/in/nadunlakshan" target="_blank" rel="noopener noreferrer">
          <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 00-6 6v6H8V8h2v6h2V8h2v6h2V8h2z"></path>
          </svg>
        </a>
      </span>
    </div>
  </footer>
);
