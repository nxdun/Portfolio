import styled from "styled-components";
import HomeIntro from "../components/home/HomeIntro";
import tealmodeSvgInverse from "../assets/waveInversedHomepage.svg";
import tealmodeSvgInverse2 from "../assets/waveInversedHomepage2.svg";
import tealmodeSvgInverse3 from "../assets/waveInversedHomepage3.svg";
import Container from "@mui/material/Container";

const Home = () => {
  //for now green bg svg are commented out

  const Background = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse});
    background-position: center;
    background-size: cover;
    margin-top: -10px;
    z-index: -1;
  `;

  const Background2 = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse2});
    background-position: center;
    background-size: cover;
    margin-top: -10px;
  `;

  const Background3 = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse3});
    background-position: center;
    background-size: cover;
    margin-top: -220px;
  `;

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
      {/* <Background /> */}
      <HomeIntro />
      {/* <Background2 /> */}
      {/* <Background3 /> */}
    </ContainerWrapper>
  );
};

export default Home;
