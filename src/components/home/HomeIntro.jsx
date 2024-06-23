import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Grid, Button, Link } from "@mui/material";
import { useSpring, animated, useTransition } from "@react-spring/web";
import CircleSvg from "../../assets/home-circle.svg";

const professions = [
  "Software Developer",
  "Software Engineer",
  "Software Designer",
  "Fullstack Developer",
];

const HomeIntro = () => {
  const theme = useTheme();

  const [professionIndex, setProfessionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProfessionIndex((prevIndex) => (prevIndex + 1) % professions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const StyledCircleSvg = styled.img`
    width: 200px; 
    height: 200px; 
    transition: transform 0.3s, box-shadow 0.3s;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  `;

  const StyledButton = styled(Button)`
    border-radius: 16px;
    background: ${theme.palette.background.paper};
    box-shadow: inset 9px 9px 16px #bebebe, inset -9px -9px 16px #ffffff;
    color: ${theme.palette.text.primary};
    transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
    &:hover {
      transform: scale(1.05);
      box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
      background-color: ${theme.palette.primary.light};
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
          <StyledCircleSvg src={CircleSvg} alt="Circle Graphic" />
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
        <StyledButton
          variant="contained"
          component={Link}
          href="https://github.com"
          target="_blank"
        >
          GitHub
        </StyledButton>
        <StyledButton
          variant="contained"
          component={Link}
          href="https://www.linkedin.com"
          target="_blank"
        >
          LinkedIn
        </StyledButton>
        <StyledButton
          variant="contained"
          component={Link}
          href="https://www.instagram.com"
          target="_blank"
        >
          Instagram
        </StyledButton>
        <StyledButton
          variant="contained"
          component={Link}
          href="/path/to/cv.pdf"
          download
        >
          Download CV
        </StyledButton>
      </Grid>
    </Box>
  );
};

export default HomeIntro;
