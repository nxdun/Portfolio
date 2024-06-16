import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

function Home() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
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
      </Box>
    </Container>
  );
}

export default Home;
