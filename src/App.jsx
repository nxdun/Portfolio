import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
// import About from './pages/About';
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";


function App() {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: -100,
    },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 200,
    damping: 20,
  };

  return (
    <>
      
       <Navbar />
        <div
          style={{ position: "relative", height: "100vh", overflow: "hidden" }}
        >
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <Home />
                  </motion.div>
                }
              />
              {/* <Route
              path="/about"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{ position: 'absolute', width: '100%' }}
                >
                  <About />
                </motion.div>
              }
            /> */}
              <Route
                path="/projects"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <Projects />
                  </motion.div>
                }
              />
              <Route
                path="/contact"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <Contact />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
    </>
  );
}

export default App;
