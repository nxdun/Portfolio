import { Box, Typography, Button } from "@mui/material";
import { useTransition, animated } from '@react-spring/web';
import BgImg from "../assets/main-bg.jpg";
import { useState, useEffect } from 'react';

const HomeIntro = () => {
  const alternateTexts = ["Software Engineer", "Software Developer", "Fullstack Developer"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % alternateTexts.length);
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(interval);
  });

  const transitions = useTransition(index, {
    key: index,
    from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    leave: { opacity: 0, transform: 'translate3d(0, -20px, 0)' },
    config: { duration: 1000 },
  });

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}
    >
      <Typography variant="h2" sx={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
        <span style={{ color: "red", fontSize: "5rem" }}>N</span>adun
      </Typography>
      <Typography variant="h2" sx={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
        Lakshan
      </Typography>
      {transitions((style, item) => (
        <animated.div style={style}>
          <Typography variant="h5" sx={{ color: "white", textAlign: "center" }}>
            I am a {alternateTexts[item]}
          </Typography>
        </animated.div>
      ))}
      <Button
        variant="outlined"
        sx={{
          color: "white",
          borderColor: "white",
          marginTop: "50px",
          display: "flex",
          alignItems: "center"
        }}
      >
        Show My Work
        <Box component="span" sx={{ marginLeft: "10px", transform: "rotate(90deg)" }}>
          ➤
        </Box>
      </Button>
    </Box>
  );
};

export default HomeIntro;
