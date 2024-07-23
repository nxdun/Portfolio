export const Contact = () => (
    <section className="text-gray-400 body-font relative" id="contact">
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