import React from 'react';

export const Navbar = () => (
  <header className="text-gray-400 backdrop-blur-md body-font ml-5 mr-5 mt-5 relative p-4 m-2 rounded-lg ring-2 ring-[#0a0a0a]">
    <div className="container mx-auto flex flex-wrap items-center justify-between">
      <a className="flex title-font font-medium items-center text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <span className="ml-3 text-xl hidden md:inline">Nadun Lakshan</span>
      </a>
      <nav className="flex items-center justify-center">
        <a href="#home" className="mr-5 hover:text-grey flex items-center">
          <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 12l9-9 9 9M4 10h16v12H4z"></path>
          </svg>
          <span className="hidden md:inline">Home</span>
        </a>
        <a href="#projects" className="mr-5 hover:text-white flex items-center">
          <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="hidden md:inline">Projects</span>
        </a>
        <a href="#contact" className="mr-5 hover:text-white flex items-center">
          <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c3.866 0 7 2.686 7 6H5c0-3.314 3.134-6 7-6zM12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"></path>

          </svg>
          <span className="hidden md:inline">Contact</span>
        </a>
      </nav>
    </div>
  </header>
);

