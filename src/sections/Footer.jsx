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