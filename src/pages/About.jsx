import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

function About() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About Me
        </Typography>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Typography variant="body1" gutterBottom>
          I have been working in the software industry for over 10 years...
        </Typography>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="60%" />
      </Box>
    </Container>
  );
}

export default About;
