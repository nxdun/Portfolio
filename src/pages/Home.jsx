import styled from "styled-components";
import HomeIntro from "../components/home/HomeIntro";
import Container from "@mui/material/Container";
import ProjectHighlight from "../components/home/ProjectHighlight.jsx";
const Home = () => {
  //for now green bg svg are commented out



  const ContainerWrapper = styled(Container)`
    && {
      width: 100vw; /* Full viewport width */
      max-width: 100vw; /* Full viewport width */
      padding: 0 !important;
      margin: 0 !important;
      height: 100vh;
      overflow-y: auto;
    }

    /* Hide scrollbar but allow scrolling */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari */
    }
  `;

  return (
    <ContainerWrapper>
      <HomeIntro />
      <ProjectHighlight/>
    </ContainerWrapper>
  );
};

export default Home;