import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import styled from "styled-components";
import TextField from "@mui/material/TextField";
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
  z-index: -1;
`;

const Background2 = styled.div`
  width: 100%;
  height: 38vh;
  background-image: url(${tealmodeSvgInverse2});
  background-position: center;
  background-size: cover;
  position: relative;
  z-index: -1;
`;

const Background3 = styled.div`
  width: 100%;
  height: 38vh;
  background-image: url(${tealmodeSvgInverse3});
  background-position: center;
  background-size: cover;
  position: relative;
  z-index: -1;
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



function Contact() {
  return (
    <ContainerWrapper>
      <Background />
      <Box  sx={{ my: 4, height: "auto", backgroundColor: "#7b2c5b", padding: "7% !important", margin: "0 !important" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Me
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField fullWidth label="Name" margin="normal" />
          <TextField fullWidth label="Email" margin="normal" />
          <TextField fullWidth label="Message" margin="normal" multiline rows={4} />
          <Button variant="contained" color="primary" sx={{ mt: 3 }}>
            Send
          </Button>
        </Box>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="60%" />
      </Box>
      <Background2 />
      <Background3 />
    </ContainerWrapper>

  );
}

export default Contact;
