import { Box, Skeleton } from "@mui/material";

const HomeIntro = () => {

  return (
    <Box
      sx={{
        height: "100vh",
        // backgroundColor: "#2c7b5b",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
     <Skeleton variant="text" width={200} height={500} />
     <Skeleton variant="text" width={200} height={500} />
    </Box>
  );
};

export default HomeIntro;
