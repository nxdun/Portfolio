// main homepage component

import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { ThemeContext } from "../components/ThemeContext";
import { useTheme } from "@mui/material/styles";
import tealmodeSvgInverse from "../assets/waveInversedHomepage.svg";
import tealmodeSvgInverse2 from "../assets/waveInversedHomepage2.svg";
import tealmodeSvgInverse3 from "../assets/waveInversedHomepage3.svg";

import { Box, Typography } from "@mui/material";
import { useSpring, animated, useTransition } from "@react-spring/web";

const professions = [
  "Software Developer",
  "Software Engineer",
  "Software Designer",
  "Fullstack Developer",
];

const Home = () => {
  const { mode } = useContext(ThemeContext);
  const theme = useTheme();

  const [professionIndex, setProfessionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProfessionIndex((prevIndex) => (prevIndex + 1) % professions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const circleAnimations = useSpring({
    loop: true,
    from: { transform: "scale(1)", background: theme.palette.primary.main },
    to: [
      { transform: "scale(1.2)", background: theme.palette.secondary.main },
      { transform: "scale(1)", background: theme.palette.primary.main },
    ],
    config: { duration: 4000 },
  });

  const textAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { duration: 1000 },
  });

  const professionTransitions = useTransition(professions[professionIndex], {
    from: { opacity: 0, position: "absolute", transform: "translateY(20px)" },
    enter: { opacity: 1, position: "absolute", transform: "translateY(0)" },
    leave: { opacity: 0, position: "absolute", transform: "translateY(-20px)" },
    config: { duration: 500 },
  });

  const Background = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse});
    background-position: center;
    background-size: cover;
    margin-top: -10px;
  `;

  const Background2 = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse2});
    background-position: center;
    background-size: cover;
    margin-top: -10px;
  `;

  const Background3 = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse3});
    background-position: center;
    background-size: cover;
    margin-top: -220px;
  `;

  return (
    <Box>
      <Background mode={mode} />
      <Box
        sx={{
          height: "10vh",
          backgroundColor: "#2c7b5b",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            marginRight: 2,
          }}
        >
          <animated.div
            style={{
              ...circleAnimations,
              width: 150,
              height: 150,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" color="primary">
              N.L
            </Typography>
          </animated.div>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            position: "relative",
            height: "3em",
            marginTop: { xs: 2, md: 0 },
          }}
        >
          <animated.div style={textAnimation}>
            <Typography variant="h4" color={theme.palette.text.primary}>
              Hii...👋
            </Typography>
            <Typography variant="h5" color={theme.palette.text.primary}>
              I am Nadun Lakshan
            </Typography>
            {professionTransitions((style, item) => (
              <animated.div key={item} style={style}>
                <Typography variant="h6" color={theme.palette.text.primary}>
                  {item}
                </Typography>
              </animated.div>
            ))}
          </animated.div>
        </Box>
      </Box>
      <Background2 mode={mode} />

      <Background3 mode={mode} />
      
    </Box>
  );
};

export default Home;
