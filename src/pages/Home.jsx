
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSpring, animated } from '@react-spring/web';
import { useTheme } from '@mui/material/styles';

const Home = () => {
  const theme = useTheme();
  const backgroundAnimation = useSpring({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    from: { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary },
    config: { duration: 500 },
  });

  return (
    <animated.div style={{ ...backgroundAnimation, minHeight: '100vh', padding: '64px 0' }}>
      <Container>
        <Box sx={{ py: 8, px: { xs: 2, sm: 3, md: 5 }, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to My Portfolio
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Hi, Im John Doe
          </Typography>
          <Box sx={{ my: 4, mx: 'auto', maxWidth: 600 }}>
            <Typography variant="body1" gutterBottom>
              I am a software developer specializing in web and mobile application development.
            </Typography>
          </Box>
        </Box>
      </Container>
    </animated.div>
  );
};

export default Home;
