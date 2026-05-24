import { THEMES } from './themeConfig.js';

export const getTheme = (theme) => {
  try {
    return THEMES[theme];
  } catch (e) {
    return {
      e: e.toString(),
      error: 'Theme is not supported.',
    };
  }
};
