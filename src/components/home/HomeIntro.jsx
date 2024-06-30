import { Box, Typography, Button, Fade } from "@mui/material";
import BgImg from "../../assets/main-bg.jpg";
import { useState, useEffect } from 'react';
import { useTheme, styled } from '@mui/material/styles';

const AnimatedButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: theme.palette.text.primary,
  position: "absolute",
  bottom: "30px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "10px 20px",
  fontSize: "1.2rem",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  '&:hover': {
    transform: "translateX(-50%) scale(1.1)",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.3)"
  },
  [theme.breakpoints.down('sm')]: {
    padding: "8px 16px",
    fontSize: "1rem",
  }
}));

const HomeIntro = () => {
  const alternateTexts = ["Software Engineer", "Software Developer", "Fullstack Developer"];
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
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        color: theme.palette.text.primary,
        paddingLeft: "20px",
        position: "relative"
      }}
    >
      <Typography variant="h2" sx={{ color: theme.palette.primary.main, textAlign: "left", marginBottom: "20px" }}>
        <span style={{ color: theme.palette.accent.main, fontSize: "5rem" }}>N</span>adun
      </Typography>
      <Typography variant="h2" sx={{ color: theme.palette.secondary.main, textAlign: "left", marginBottom: "20px" }}>
        Lakshan
      </Typography>
      <Box sx={{ marginBottom: "20px", minHeight: "60px" }}>
        {alternateTexts.map((text, i) => (
          <Fade in={i === index} timeout={1000} key={i}>
            <Box
              sx={{
                position: i === index ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: i === index ? 'block' : 'none',
              }}
            >
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, textAlign: "left" }}>
                I am a {text}
              </Typography>
            </Box>
          </Fade>
        ))}
      </Box>
      <AnimatedButton variant="outlined">
        Show My Work
        <Box component="span" sx={{ marginLeft: "10px", transform: "rotate(90deg)" }}>
          ➤
        </Box>
      </AnimatedButton>
    </Box>
  );
};

export default HomeIntro;
