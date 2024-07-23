
export const Hero = () => {

  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center h-screen text-center">
      <div className="container mx-auto px-5 py-24 md:flex-row">
        <div className="mb-16 flex flex-col items-center text-center md:mb-0 md:w-1/2 md:items-start md:pr-16 md:text-left lg:flex-grow lg:pr-24">
          <h1 className="title-font mb-4 text-3xl font-medium text-white sm:text-4xl">
            Nadun Lakshan
            <br className="hidden lg:inline-block" />
            Software Engineer Intern
          </h1>
          <p className="mb-8 leading-relaxed text-gray-400">
            Passionate software engineering student with hands-on experience in
            modern technologies. Seeking opportunities to contribute to impactful
            projects and gain industry experience.
          </p>
          <div className="flex justify-center">
            <button className="inline-flex rounded border-0 bg-indigo-500 px-6 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none">
              Contact Me
            </button>
            <button className="ml-4 inline-flex rounded border-0 bg-gray-800 px-6 py-2 text-lg text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
              My Resume
            </button>
          </div>
        </div>
        <div className="w-5/6 md:w-1/2 lg:w-full lg:max-w-lg">
          {/* Placeholder for any additional content */}
        </div>
      </div>
    </section>
  );
};
