//main homepage component

import { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../components/ThemeContext";
import tealmodeSvgInverse from "../assets/waveInversedHomepage.svg";
import tealmodeSvgInverse2 from "../assets/waveInversedHomepage2.svg";
import { Box } from "@mui/material";

const Home = () => {
  const { mode } = useContext(ThemeContext);

  const Background = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse});
    background-position: center;
    background-size: cover;
  `;

  const Background2 = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse2});
    background-position: center;
    background-size: cover;
    margin-top: -10px; /* Adjust this value to control the overlap or gap */
  `;

  return (
    <Box>
      <Background mode={mode} />
      <Background2 mode={mode} />
    </Box>
  );
};

export default Home;
