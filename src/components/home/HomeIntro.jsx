import {
  //  useContext,
    useState, useEffect } from "react";
import styled from "styled-components";
// import { ThemeContext } from "../ThemeContext";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Grid, Button, Link } from "@mui/material";
import { useSpring, animated, useTransition } from "@react-spring/web";

const professions = [
  "Software Developer",
  "Software Engineer",
  "Software Designer",
  "Fullstack Developer",
];

const HomeIntro = () => {
  // const { mode } = useContext(ThemeContext);
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

  const Circle = styled(animated.div)`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${theme.palette.background.paper};
    box-shadow: inset 9px 9px 16px #bebebe, inset -9px -9px 16px #ffffff;
    transition: transform 0.3s, box-shadow 0.3s;
    &:hover {
      transform: scale(1.05);
      box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
    }
  `;

  const NeumorphismButton = styled(Button)`
    border-radius: 16px;
    background: ${theme.palette.background.paper};
    box-shadow: inset 9px 9px 16px #bebebe, inset -9px -9px 16px #ffffff;
    color: ${theme.palette.text.primary};
    transition: transform 0.3s, box-shadow 0.3s;
    &:hover {
      transform: scale(1.05);
      box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
    }
  `;

  return (
    <Box
      sx={{
        height: "auto",
        backgroundColor: "#2c7b5b",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          gap: 4,
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Circle style={circleAnimations}>
            <Typography variant="h6" color="primary">
              N.L
            </Typography>
          </Circle>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            position: "relative",
            marginTop: { xs: 2, md: 0 },
          }}
        >
          <animated.div style={textAnimation}>
            <Typography
              variant="h4"
              color={theme.palette.text.primary}
              sx={{ fontFamily: "Roboto", fontWeight: 500, letterSpacing: 1 }}
            >
              Hii...👋
            </Typography>
            <Typography
              variant="h5"
              color={theme.palette.text.primary}
              sx={{ fontFamily: "Roboto", fontWeight: 700, letterSpacing: 1 }}
            >
              I am Nadun Lakshan
            </Typography>
            {professionTransitions((style, item) => (
              <animated.div key={item} style={style}>
                <Typography
                  variant="h6"
                  color={theme.palette.text.primary}
                  sx={{ fontFamily: "Roboto", letterSpacing: 0.5 }}
                >
                  {item}
                </Typography>
              </animated.div>
            ))}
          </animated.div>
        </Box>
      </Box>

      <Grid
        container
        sx={{
          marginTop: 4,
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NeumorphismButton
          variant="contained"
          component={Link}
          href="https://github.com"
          target="_blank"
        >
          GitHub
        </NeumorphismButton>
        <NeumorphismButton
          variant="contained"
          component={Link}
          href="https://www.linkedin.com"
          target="_blank"
        >
          LinkedIn
        </NeumorphismButton>
        <NeumorphismButton
          variant="contained"
          component={Link}
          href="https://www.instagram.com"
          target="_blank"
        >
          Instagram
        </NeumorphismButton>
        <NeumorphismButton
          variant="contained"
          component={Link}
          href="/path/to/cv.pdf"
          download
        >
          Download CV
        </NeumorphismButton>
      </Grid>
    </Box>
  );
};

export default HomeIntro;
