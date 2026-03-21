type Theme = 'light' | 'dark';

interface LegacyMediaQueryList extends MediaQueryList {
  addListener(listener: (event: MediaQueryListEvent) => void): void;
}

const themeBootstrapFlag = '__themeBootstrapInitialized';
const themeMediaQuery = '(prefers-color-scheme: dark)';
const themeStorageKey = 'theme';

interface ThemeBootstrapGlobal {
  __themeBootstrapInitialized?: boolean;
}

function getSavedTheme(): Theme | null {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);

    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  } catch {
    return null;
  }
}

function getSystemTheme(mediaQueryList: MediaQueryList): Theme {
  return mediaQueryList.matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // localStorage may be unavailable
  }
}

function registerSystemThemeListener(mediaQueryList: MediaQueryList): void {
  const handleThemeChange = (event: MediaQueryListEvent): void => {
    if (getSavedTheme() !== null) {
      return;
    }

    applyTheme(event.matches ? 'dark' : 'light');
  };

  if ('addEventListener' in mediaQueryList) {
    mediaQueryList.addEventListener('change', handleThemeChange);

    return;
  }

  (mediaQueryList as LegacyMediaQueryList).addListener(handleThemeChange);
}

const themeBootstrapGlobal = globalThis as typeof globalThis & ThemeBootstrapGlobal;

if (!themeBootstrapGlobal[themeBootstrapFlag]) {
  themeBootstrapGlobal[themeBootstrapFlag] = true;

  const mediaQueryList = globalThis.matchMedia(themeMediaQuery);
  const savedTheme = getSavedTheme();

  applyTheme(savedTheme ?? getSystemTheme(mediaQueryList));
  registerSystemThemeListener(mediaQueryList);
}
