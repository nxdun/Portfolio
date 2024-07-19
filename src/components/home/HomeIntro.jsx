import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useTheme, styled } from "@mui/material/styles";

import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";
import * as reactSpring from "@react-spring/three";
import * as drei from "@react-three/drei";
import * as fiber from "@react-three/fiber";
// import ParticlesComp from "../animated/Particles";gfdhi

const AnimatedButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: "transparent", // Remove button border
  position: "absolute",
  bottom: "30px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "10px 20px",
  fontSize: "1.2rem",
  fontWeight: "bold", // Make text bold
  transition: "transform 0.3s ease, color 0.3s ease", // Add transition for color change
  "&:hover": {
    transform: "translateX(-50%) scale(1.1)",
    color: theme.palette.highlight.main, // Change text color on hover
    textDecoration: "none", // Remove underline on hover
  },
  [theme.breakpoints.down("sm")]: {
    padding: "8px 16px",
    fontSize: "1rem",
  },
}));

const HomeIntro = () => {
  const alternateTexts = [
    "Software Engineer",
    "Software Developer",
    "Fullstack Developer",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % alternateTexts.length);
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(interval);
  }, [alternateTexts.length]);

  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", sm: "flex-start" }, // Center on small screens
        justifyContent: "center",
        color: theme.palette.text.primary,
        paddingLeft: { xs: 2, sm: 4 },
        paddingRight: { xs: 2, sm: 4 },
        position: "relative",
      }}
    >
      {/* <ParticlesComp /> */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline", // Align text along the baseline
          textAlign: { xs: "center", sm: "left" },
          marginLeft: { xs: "0", sm: "90px" },
          marginBottom: { xs: "0", sm: "-20px" },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          Hii
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.highlight.main,
            fontSize: { xs: "4rem", sm: "5rem", md: "6rem" },
            fontWeight: "bold",
          }}
        >
          N
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
            fontWeight: "bold",
          }}
        >
          adun
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline", // Align text along the baseline
          textAlign: { xs: "center", sm: "left" },
          marginLeft: { xs: "10", sm: "89px" },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.highlight.main,
            fontSize: { xs: "4rem", sm: "5rem", md: "6rem" },
            fontWeight: "bold",
          }}
        >
          L
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            fontWeight: "bold",
            marginLeft: { xs: "0", sm: "5px" }, // Adjust margin as needed
          }}
        >
          akshan
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: { xs: "10px", sm: "20px" },
          minHeight: { xs: "80px", sm: "100px" },
          marginLeft: { xs: "0", sm: "20px" },
          fontWeight: "bold",
          textAlign: { xs: "center", sm: "left" }, // Center on small screens
          perspective: "1000px", // Enable 3D perspective ;o]
          padding: "20px", // Add reasonable padding :]
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "250px", sm: "450px" },
            height: { xs: "80px", sm: "100px" },
            transformStyle: "preserve-3d",
            transform: `rotateX(${index * -90}deg)`,
            transition: "transform 2s",
            border: `none`,
            backgroundColor: "transparent",
            marginTop: "50px", // Adjust padding inside the 3D box
            boxSizing: "border-box",
          }}
        >
          {alternateTexts.map((text, i) => (
            <Box
              key={i}
              sx={{
                paddingLeft: "20px",
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotateX(${i * 90}deg) translateZ(40px)`,
                borderRadius: "30px",
                //transperant background blur
                backdropFilter: "blur(2px)",
                border: {
                  xs: `2px solid ${theme.palette.secondary.main}`,
                  sm: `4px solid ${theme.palette.secondary.main}`,
                }, // Add border to each text item
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: theme.palette.text.primary,
                  textAlign: "center", // Center the text
                  fontSize: { xs: "1.2rem", sm: "2rem" },
                  whiteSpace: "nowrap",
                  marginRight: "20px",
                }}
              >
                I am a {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <AnimatedButton variant="outlined" sx={{}}>
        Show My Work
        <Box
          component="span"
          sx={{ marginLeft: "10px", transform: "rotate(90deg)" }}
        >
          ➤
        </Box>
      </AnimatedButton>
      <Box
        sx={{
          border: "1px solid blue",
          width: "15vh",
          height: "15vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginLeft: "auto",
          position: "fixed",
        }}
      >Hi</Box>
    </Box>
  );
};

export default HomeIntro;
