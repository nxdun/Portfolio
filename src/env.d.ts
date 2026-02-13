interface Window {
  theme?: {
    themeValue: string;
    setPreference: () => void;
    reflectPreference: () => void;
    getTheme: () => string;
    setTheme: (val: string) => void;
  };
  LoaderManager?: new (element: HTMLElement) => {
    hide: () => Promise<void>;
    show: () => void;
    remove: () => void;
  };
}

interface HTMLElement {
  __loaderManager?: {
    hide: () => Promise<void>;
    show: () => void;
    remove: () => void;
  };
}
