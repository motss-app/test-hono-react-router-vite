type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface LegacyMediaQueryList extends MediaQueryList {
  addListener(listener: (event: MediaQueryListEvent) => void): void;
}

const themeBootstrapFlag = '__themeBootstrapInitialized';
const themeMediaQuery = '(prefers-color-scheme: dark)';
const themeStorageKey = 'theme';

interface ThemeBootstrapGlobal {
  __themeBootstrapInitialized?: boolean;
}

function getSavedTheme(): ThemePreference | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${themeStorageKey}=(light|dark|system)(?:;|$)`)
    );

    return match ? (match[1] as ThemePreference) : null;
  } catch {
    return null;
  }
}

function getSystemTheme(mediaQueryList: MediaQueryList): Theme {
  return mediaQueryList.matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function registerSystemThemeListener(mediaQueryList: MediaQueryList): void {
  const handleThemeChange = (event: MediaQueryListEvent): void => {
    const preference = getSavedTheme();
    if (preference !== null && preference !== 'system') {
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

  applyTheme(
    savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : getSystemTheme(mediaQueryList)
  );
  registerSystemThemeListener(mediaQueryList);
}
