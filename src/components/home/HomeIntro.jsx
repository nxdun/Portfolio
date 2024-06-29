import { Box, Typography } from "@mui/material";
import BgImg from "../../assets/main-bg.jpg";
const HomeIntro = () => {

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

      }}
    >
      <Typography variant="h2" sx={{ color: "white", textAlign: "center", paddingTop: "50vh" }}>
        Welcome to my Portfolio
      </Typography>
    
    </Box>
  );
};

export default HomeIntro;
