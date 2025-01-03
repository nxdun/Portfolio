// * Navbar Component
// ? Consider splitting into smaller components
// ! Requires proper profile image handling

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// * Profile Popup Component
// note: Displays user information on hover/click
const ProfilePopup = ({ isVisible }) => (
  <motion.div
    // * Animation Configuration
    // 💡 Could be moved to a separate config file
    initial={{ opacity: 0, scale: 0.5, y: 0, x: -50 }}
    animate={{
      opacity: isVisible ? 1 : 0,
      scale: isVisible ? 1 : 0.5,
      y: isVisible ? 0 : 0,
      x: isVisible ? 0 : -50,
    }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className="absolute left-1/2 top-14 z-50 -translate-x-1/2 transform rounded-lg bg-white shadow-lg"
  >
    {/* * Profile Card Container */}
    <div className="flex h-28 w-72 items-center rounded-md bg-white p-3 shadow-lg">
      {/* * Profile Image Section 
          ! Update profile image URL when needed */}
      <section className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F9C97C] to-[#A2E9C1] shadow-md duration-300 hover:scale-110 hover:cursor-pointer hover:from-[#C9A9E9] hover:to-[#7EE7FC]">
        <img
          src="https://github.com/nxdun.png?size=200"
          alt="Nadun Lakshan"
          className="h-12 w-12 rounded-full"
        />
      </section>
  
      {/* * Profile Info Section 
          todo: Add dynamic content loading */}
      <section className="m-3 block border-l border-gray-300 pl-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Nadun Lakshan</h3>
          <h3 className="bg-gradient-to-l from-[#005BC4] to-[#27272A] bg-clip-text text-lg font-bold text-transparent">
            Future DevOps Engineer 🚀
          </h3>
        </div>
        {/* * Social Icons Section 
            💡 Could be extracted into a separate component */}
        <div className="flex gap-3 pt-2">
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-4 fill-current text-gray-600 stroke-2 duration-200 hover:scale-125 hover:text-blue-500 hover:cursor-pointer"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-4 fill-current text-gray-600 stroke-2 duration-200 hover:scale-125 hover:text-blue-500 hover:cursor-pointer"
          >
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
          </svg>
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-4 fill-current text-gray-600 stroke-2 duration-200 hover:scale-125 hover:text-blue-500 hover:cursor-pointer"
          >
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-4 fill-current text-gray-600 stroke-2 duration-200 hover:scale-125 hover:text-blue-500 hover:cursor-pointer"
          >
            <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
          </svg>
        </div>
      </section>
    </div>
  </motion.div>
);

// * Main Navbar Component
// work: Ongoing improvements for mobile responsiveness
export const Navbar = () => {
  // * State Management
  // ? Consider using context for global state
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // * Smooth Scroll Effect
  // ✅ Implements smooth scrolling behavior
  useEffect(() => {
    const smoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute("href").slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", smoothScroll);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", smoothScroll);
      });
    };
  }, []);

  // * Event Handlers
  // note: Separate handlers for mobile and desktop
  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      // desktop
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      // desktop
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    if (window.innerWidth < 768) {
      // mobile
      setIsClicked(!isClicked);
    }
  };

  // * Component Render
  // hack: Using backdrop blur for glass effect
  return (
    <header className="body-font relative m-2 ml-5 mr-5 mt-5 rounded-lg p-4 text-gray-400 ring-2 ring-[#0a0a0a] backdrop-blur-md">
      {/* * Main Container */}
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* * Profile Section 
            ! Update hover behavior on mobile */}
        <div
          className="title-font relative flex items-center font-medium text-white"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <img
            src="https://github.com/nxdun.png?size=200"
            alt="Nadun Lakshan"
            className="h-10 w-10 rounded-full bg-indigo-500 p-2"
          />
          {(isHovered || isClicked) && (
            <ProfilePopup isVisible={isHovered || isClicked} />
          )}
        </div>

        {/* * Navigation Links 
            💡 Could be mapped from config */}
        <nav className="flex items-center justify-center">
          <a href="#home" className="hover:text-grey mr-5 flex items-center">
            <svg
              className="h-6 w-6 md:hidden"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 12l9-9 9 9M4 10h16v12H4z"></path>
            </svg>
            <span className="hidden md:inline">Home</span>
          </a>
          <a
            href="#projects"
            className="group mr-5 flex items-center hover:text-white"
          >
            <svg
              className="h-6 w-6 md:hidden"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="relative hidden before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out after:absolute after:right-0 after:top-0 after:h-0.5 after:w-0 after:bg-red-500 after:transition-all after:duration-500 after:ease-in-out group-hover:before:w-full group-hover:after:w-full md:inline">
              Projects
            </span>
          </a>
          <a
            href="#contact"
            className="group mr-5 flex items-center hover:text-white"
          >
            <svg
              className="h-6 w-6 md:hidden"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c3.866 0 7 2.686 7 6H5c0-3.314 3.134-6 7-6zM12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"></path>
            </svg>
            <span className="relative hidden before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out after:absolute after:right-0 after:top-0 after:h-0.5 after:w-0 after:bg-red-500 after:transition-all after:duration-500 after:ease-in-out group-hover:before:w-full group-hover:after:w-full md:inline">
              Contact
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
};
