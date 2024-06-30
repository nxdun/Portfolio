import { Box, Typography, Button } from "@mui/material";
import { useSpring, animated } from "react-spring";
import BgImg from "../../assets/main-bg.jpg";
import React from "React"

const HomeIntro = () => {
  // Animation for the "I am a Software Engineer" text
  const animationProps = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 2000 },
    loop: { reverse: true }
  });

  const alternateTexts = ["Software Developer", "Fullstack Developer"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % alternateTexts.length);
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(interval);
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
      <animated.div style={animationProps}>
        <Typography variant="h5" sx={{ color: "white", textAlign: "center" }}>
          I am a Software Engineer
        </Typography>
      </animated.div>
      <animated.div style={animationProps}>
        <Typography variant="h5" sx={{ color: "white", textAlign: "center", marginTop: "20px" }}>
          {alternateTexts[index]}
        </Typography>
      </animated.div>
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
