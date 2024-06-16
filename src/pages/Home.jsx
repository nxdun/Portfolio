import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useSpring, animated } from '@react-spring/web';

function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const backgroundAnimation = useSpring({
    backgroundColor: loaded ? '#090302' : '#C8BFC7',
    color: loaded ? '#C8BFC7' : '#090302',
    from: { backgroundColor: '#C8BFC7', color: '#090302' },
    config: { duration: 500 }
  });

  return (
    <animated.div style={{ ...backgroundAnimation, minHeight: '100vh' }}>
      <Container>
        <Box sx={{ my: 4 }}>
          {!loaded ? (
            <>
              <Typography variant="h3" component="h1" gutterBottom>
                Welcome to My Portfolio
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Hi, Im John Doe
              </Typography>
              <Skeleton variant="rectangular" width="100%" height={300} />
              <Typography variant="body1" gutterBottom>
                I am a software developer specializing in web and mobile application development.
              </Typography>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="60%" />
            </>
          ) : (
            <>
              <Typography variant="h3" component="h1" gutterBottom>
                Welcome to My Portfolio
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Hi, Im John Doe
              </Typography>
              <Typography variant="body1" gutterBottom>
                I am a software developer specializing in web and mobile application development.
              </Typography>
            </>
          )}
        </Box>
      </Container>
    </animated.div>
  );
}

export default Home;
