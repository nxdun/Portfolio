import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopBanner() {
  // ephemeral close: banner will re-appear on page refresh
  const [closed, setClosed] = useState(false);
  const handleClose = () => setClosed(true);

  return (
    <AnimatePresence>
      {!closed && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-x-4 top-6 z-50 flex items-center justify-center pointer-events-auto sm:inset-x-6"
        >
          <div className="w-full max-w-3xl rounded-lg px-3 py-2 shadow-md backdrop-blur-sm bg-black/35 border border-white/6 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="28" stroke-dashoffset="28" d="M12 10l4 7h-8Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 10l4 7h-8Z" opacity="0"><animate attributeName="d" begin="0.4s" dur="0.8s" keyTimes="0;0.25;1" repeatCount="indefinite" values="M12 10l4 7h-8Z;M12 4l9.25 16h-18.5Z;M12 4l9.25 16h-18.5Z"/><animate attributeName="opacity" begin="0.4s" dur="0.8s" keyTimes="0;0.1;0.75;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></svg>
              <p className="text-sm font-medium">
                This site retires on Feb 16. See what I'm building next at my new prototype.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://prototype.nadzu.me/"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold px-3 py-1 rounded bg-white/6 hover:bg-white/10"
              >
                Open
              </a>
              <button
                onClick={handleClose}
                aria-label="Close banner"
                className="p-1 rounded hover:bg-white/6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
