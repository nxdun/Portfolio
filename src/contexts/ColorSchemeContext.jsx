import { createContext, useContext, useState } from "react";

// Default color schemes for different sections
const defaultColorSchemes = {
  navbar: {
    color1: "1B263B",
    color2: "415A77",
    color3: "0B1421",
    name: "Midnight Navy",
  },
  hero: {
    color1: "274690",
    color2: "829CBC",
    color3: "1C2F52",
    name: "Coastal Sky",
  },
  projects: {
    color1: "5F0F40",
    color2: "9A031E",
    color3: "2E081C",
    name: "Crimson Noir",
  },
  contact: {
    color1: "233D4D",
    color2: "59C9A5",
    color3: "101C23",
    name: "Ocean Mint",
  },
  footer: {
    color1: "606C38",
    color2: "283618",
    color3: "1E2812",
    name: "Olive Grove",
  },
};

// Alternative color schemes that can be switched to
export const alternativeColorSchemes = {
  serene: {
    navbar: {
      color1: "EDF6F9",
      color2: "90E0EF",
      color3: "CFE5EA",
      name: "Calm Sea",
    },
    hero: {
      color1: "ADE8F4",
      color2: "CAF0F8",
      color3: "90CCA7",
      name: "Crystal Blue",
    },
    projects: {
      color1: "E4EFE7",
      color2: "ACCAB8",
      color3: "C2D4CB",
      name: "Soft Mint",
    },
    contact: {
      color1: "BDE0FE",
      color2: "A2D2FF",
      color3: "7FB0EB",
      name: "Gentle Sky",
    },
    footer: {
      color1: "DFF7F3",
      color2: "BCEBE0",
      color3: "94CCC0",
      name: "Spa Green",
    },
  },
  vibrant: {
    navbar: {
      color1: "FA824C",
      color2: "FC9E4F",
      color3: "D15A28",
      name: "Fiery Orange",
    },
    hero: {
      color1: "FF4F79",
      color2: "FF7EB9",
      color3: "C50046",
      name: "Candy Pink",
    },
    projects: {
      color1: "EEF622",
      color2: "FEFF9C",
      color3: "C7C90A",
      name: "Lemon Zest",
    },
    contact: {
      color1: "3A1772",
      color2: "643A71",
      color3: "1B0B35",
      name: "Purple Pop",
    },
    footer: {
      color1: "298BFF",
      color2: "70C6FF",
      color3: "1866BF",
      name: "Sky Vibe",
    },
  },
  monochrome: {
    navbar: {
      color1: "2B2B2B",
      color2: "757575",
      color3: "1A1A1A",
      name: "Dark Stone",
    },
    hero: {
      color1: "343434",
      color2: "4F4F4F",
      color3: "1E1E1E",
      name: "Charcoal Edge",
    },
    projects: {
      color1: "4A4A4A",
      color2: "A1A1A1",
      color3: "2D2D2D",
      name: "Muted Steel",
    },
    contact: {
      color1: "5C5C5C",
      color2: "B5B5B5",
      color3: "343434",
      name: "Soft Graphite",
    },
    footer: {
      color1: "1E1E1E",
      color2: "616161",
      color3: "0D0D0D",
      name: "Onyx Shade",
    },
  },
};

export const ColorSchemeContext = createContext({
  activeSection: "hero",
  prevSection: "hero",
  isTransitioning: false,
  transitionProgress: 1,
  colorSchemes: defaultColorSchemes,
  setActiveSection: () => {},
  startSectionTransition: () => {},
});

export function ColorSchemeProvider({ children }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [prevSection, setPrevSection] = useState("hero");
  const [colorSchemes, setColorSchemes] = useState(defaultColorSchemes);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(1);
  
  // Start transition between sections
  const startSectionTransition = (newSection) => {
    if (newSection !== activeSection) {
      setPrevSection(activeSection);
      setActiveSection(newSection);
      setIsTransitioning(true);
      setTransitionProgress(0);
    }
  };
  
  // Change theme by replacing all color schemes
  const changeTheme = (themeName) => {
    if (alternativeColorSchemes[themeName]) {
      setColorSchemes(alternativeColorSchemes[themeName]);
    } else {
      setColorSchemes(defaultColorSchemes);
    }
  };

  const value = {
    activeSection,
    prevSection,
    isTransitioning,
    transitionProgress,
    colorSchemes,
    setActiveSection,
    startSectionTransition,
    changeTheme,
    setTransitionProgress,
    setIsTransitioning,
  };

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export const useColorScheme = () => useContext(ColorSchemeContext);