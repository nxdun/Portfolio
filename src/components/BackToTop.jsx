import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <AnimatePresence>
            {showButton && (
                <motion.button
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="z-20 fixed bottom-7 right-32 text-white p-1 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-300"
                >
                    <svg fill="#000000" version="1.1" id="arrowUP" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                        width="50px" height="50px" viewBox="0 0 416.979 416.979"
                        xmlSpace="preserve">
                        <g>
                            <path d="M208.489,416.979c115.146,0,208.49-93.344,208.49-208.489C416.979,93.344,323.635,0,208.489,0S0,93.343,0,208.489
                                C0,323.635,93.343,416.979,208.489,416.979z M127.24,219.452l68.259-118.21c2.68-4.641,7.632-7.499,12.99-7.499
                                s10.31,2.858,12.99,7.499l68.258,118.21c2.682,4.642,2.682,10.359,0.002,15c-2.68,4.642-7.631,7.501-12.99,7.501h-33.26v66.282
                                c0,8.284-6.715,15-15,15h-40c-8.284,0-15-6.716-15-15v-66.282H140.23c-5.359,0-10.312-2.859-12.991-7.501
                                C124.56,229.812,124.56,224.094,127.24,219.452z"/>
                        </g>
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
