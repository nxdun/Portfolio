import { Box, Skeleton } from "@mui/material";
import BgImg from "../../assets/main-bg.jpg";
const HomeIntro = () => {

  return (
    <Box
      sx={{
        height: "130vh",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
     <Skeleton variant="rectangular" width={"100%"} height={"100vh"} style={{ backgroundColor: "grey" }} />
    </Box>
  );
};

export default HomeIntro;
