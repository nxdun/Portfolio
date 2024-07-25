import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ProfilePopup = ({ isVisible }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 0, x: -50 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5, y: isVisible ? 0 : 0, x: isVisible ? 0 : -50 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg z-50"
    >
        <div className="w-96 h-64 duration-500 group overflow-hidden relative rounded bg-neutral-800 text-neutral-50 p-4 flex flex-col justify-evenly">
            <div className="absolute blur duration-500 group-hover:blur-none w-72 h-72 rounded-full group-hover:translate-x-12 group-hover:translate-y-12 bg-sky-900 right-1 -bottom-24"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-12 h-12 rounded-full group-hover:translate-x-12 group-hover:translate-y-2 bg-indigo-700 right-12 bottom-12"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-36 h-36 rounded-full group-hover:translate-x-12 group-hover:-translate-y-12 bg-indigo-800 right-1 -top-12"></div>
            <div className="absolute blur duration-500 group-hover:blur-none w-24 h-24 bg-sky-700 rounded-full group-hover:-translate-x-12"></div>
            <div className="z-10 flex flex-col justify-evenly w-full h-full">
                <span className="text-2xl font-bold">Text title</span>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat felis nec rutrum vulputate. Morbi ut lobortis enim. Nam nec elit nibh.
                </p>
                <button className="hover:bg-neutral-200 bg-neutral-50 rounded text-neutral-800 font-extrabold w-full p-3">
                    See more
                </button>
            </div>
        </div>
    </motion.div>
);

export const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        const smoothScroll = (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        };

        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach((link) => {
            link.addEventListener('click', smoothScroll);
        });

        return () => {
            links.forEach((link) => {
                link.removeEventListener('click', smoothScroll);
            });
        };
    }, []);

    const handleMouseEnter = () => {
        if (window.innerWidth >= 768) { // desktop
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth >= 768) { // desktop
            setIsHovered(false);
        }
    };

    const handleClick = () => {
        if (window.innerWidth < 768) { // mobile
            setIsClicked(!isClicked);
        }
    };

    return (
        <header className="text-gray-400 backdrop-blur-md body-font ml-5 mr-5 mt-5 relative p-4 m-2 rounded-lg ring-2 ring-[#0a0a0a]">
            <div className="container mx-auto flex flex-wrap items-center justify-between">
                <div
                    className="flex title-font font-medium items-center text-white relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
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
                    {(isHovered || isClicked) && <ProfilePopup isVisible={isHovered || isClicked} />}
                </div>
                <nav className="flex items-center justify-center">
                    <a href="#home" className="mr-5 hover:text-grey flex items-center">
                        <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 12l9-9 9 9M4 10h16v12H4z"></path>
                        </svg>
                        <span className="hidden md:inline">Home</span>
                    </a>
                    <a href="#projects" className="mr-5 hover:text-white flex items-center group">
                        <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="hidden md:inline relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-0.5 before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out after:absolute after:top-0 after:right-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-500 after:ease-in-out group-hover:before:w-full group-hover:after:w-full">Projects</span>
                    </a>
                    <a href="#contact" className="mr-5 hover:text-white flex items-center group">
                        <svg className="w-6 h-6 md:hidden" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c3.866 0 7 2.686 7 6H5c0-3.314 3.134-6 7-6zM12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"></path>
                        </svg>
                        <span className="hidden md:inline relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-0.5 before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out after:absolute after:top-0 after:right-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-500 after:ease-in-out group-hover:before:w-full group-hover:after:w-full">Contact</span>
                    </a>
                </nav>
            </div>
        </header>
    );
};
