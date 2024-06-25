import { Box, Skeleton } from "@mui/material";

const ProjectHighlight = () => {

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
     <Skeleton variant="rectangular" width={"100%"} height={"100vh"} style={{ backgroundColor: "blue" }} />
    </Box>
  );
};

export default ProjectHighlight;
