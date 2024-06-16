import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

function Projects() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Projects
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Typography variant="h6" gutterBottom>
              Project 1
            </Typography>
            <Typography variant="body1" gutterBottom>
              Description of project 1...
            </Typography>
            <Skeleton variant="text" width="80%" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Typography variant="h6" gutterBottom>
              Project 2
            </Typography>
            <Typography variant="body1" gutterBottom>
              Description of project 2...
            </Typography>
            <Skeleton variant="text" width="80%" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Typography variant="h6" gutterBottom>
              Project 3
            </Typography>
            <Typography variant="body1" gutterBottom>
              Description of project 3...
            </Typography>
            <Skeleton variant="text" width="80%" />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Projects;
