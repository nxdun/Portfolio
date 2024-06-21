import styled from "styled-components";
import HomeIntro from "../components/home/HomeIntro";
import tealmodeSvgInverse from "../assets/waveInversedHomepage.svg";
import tealmodeSvgInverse2 from "../assets/waveInversedHomepage2.svg";
import tealmodeSvgInverse3 from "../assets/waveInversedHomepage3.svg";

const Home = () => {
  const Background = styled.div`
    width: 100%;
    height: 38vh;
    background-image: url(${tealmodeSvgInverse});
    background-position: center;
    background-size: cover;
    margin-top: -10px;
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

  return (
    <div>
      <Background />
      <HomeIntro />
      <Background2 />
      <Background3 />
      <HomeIntro />

    </div>
  );
};

export default Home;
