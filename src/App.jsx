
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTransition, animated } from '@react-spring/web';
import Navbar from './components/Navbar';
import Home from './pages/Home';
// import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

function App() {
  const location = useLocation();
  const transitions = useTransition(location, {
    from: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(-100%)' },
    config: { tension: 200, friction: 20 },
  });

  return (
    <>
      <Navbar />
      <div style={{ position: 'relative', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {transitions((props, item) => (
          <animated.div style={{ ...props, position: 'absolute', width: '100%' }}>
            <Routes location={item}>
              <Route path="/" element={<Home />} />
              {/* <Route path="/about" element={<About />} /> */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </animated.div>
        ))}
      </div>
    </>
  );
}

export default App;
