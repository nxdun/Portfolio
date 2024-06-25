//merge with homepage
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import styled from "styled-components";
import tealmodeSvgInverse from "../assets/pinkwaveInversedHomepage.svg";
import tealmodeSvgInverse2 from "../assets/pinkwaveInversedHomepage2.svg";
import tealmodeSvgInverse3 from "../assets/pinkwaveInversedHomepage3.svg";

const Background = styled.div`
  width: 100%;
  height: 38vh;
  background-image: url(${tealmodeSvgInverse});
  background-position: center;
  background-size: cover;
  position: relative;
  z-index: -4;
`;

const Background2 = styled.div`
  width: 100%;
  height: 38vh;
  background-image: url(${tealmodeSvgInverse2});
  background-position: center;
  background-size: cover;
  position: relative;
  z-index: -4;
`;

const Background3 = styled.div`
  width: 100%;
  height: 38vh;
  background-image: url(${tealmodeSvgInverse3});
  background-position: center;
  background-size: cover;
  position: relative;
  z-index: -4;
`;
const ContainerWrapper = styled(Container)`
  && {
    width: 100vw; /* Full viewport width */
    max-width: 100vw; /* Full viewport width */
    padding: 0 !important;
    margin: 0 !important;
    height: 100vh;
    overflow-y: auto;
  }

  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;

// Project data
const projectsData = [
  {
    title: "Project 1",
    description: "Description of project 1..."
  },
  {
    title: "Project 2",
    description: "Description of project 2..."
  },
  {
    title: "Project 3",
    description: "Description of project 3..."
  },
  {
    title: "Project 4",
    description: "Description of project 4..."
  },
  {
    title: "Project 5",
    description: "Description of project 5..."
  },
  {
    title: "Project 6",
    description: "Description of project 6..."
  }
];

function Projects() {
  return (
    <ContainerWrapper>
      <Background />
      <Box sx={{ my: 4, height: "auto", backgroundColor: "#7b2c5b", padding: "7% !important", margin: "0 !important" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Projects
        </Typography>
        <Grid container spacing={4}>
          {projectsData.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Typography variant="h6" gutterBottom>
                {project.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {project.description}
              </Typography>
              <Skeleton variant="text" width="80%" />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Background2 />
      <Background3 />
    </ContainerWrapper>
  );
}

export default Projects;
