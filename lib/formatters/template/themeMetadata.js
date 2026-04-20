/**
 * Theme metadata for all available themes.
 * Single source of truth for theme display information.
 */
export const THEME_METADATA = {
  elegant: {
    name: 'Elegant',
    description: 'Elegant and refined design with sophisticated typography',
    author: 'JSON Resume',
    tags: ['elegant', 'refined', 'classic'],
  },
  even: {
    name: 'Even',
    description: 'Balanced and clean theme with modern styling',
    author: 'JSON Resume',
    tags: ['modern', 'clean', 'balanced'],
  },
  jacrys: {
    name: 'Jacrys',
    description: 'Modern professional theme',
    author: 'Community',
    tags: ['modern', 'professional'],
  },
  kendall: {
    name: 'Kendall',
    description: 'Clean and readable resume theme',
    author: 'Community',
    tags: ['clean', 'readable'],
  },
  macchiato: {
    name: 'Macchiato',
    description: 'Warm, coffee-inspired design',
    author: 'Community',
    tags: ['warm', 'coffee', 'cozy'],
  },
  stackoverflow: {
    name: 'Stack Overflow',
    description: 'Developer-focused theme inspired by Stack Overflow',
    author: 'JSON Resume',
    tags: ['developer', 'stackoverflow', 'technical'],
  },
};

export const THEME_NAMES = Object.keys(THEME_METADATA);

/**
 * Get a random theme name from available themes
 * @returns {string} Random theme name
 */
export function getRandomTheme() {
  const randomIndex = Math.floor(Math.random() * THEME_NAMES.length);
  return THEME_NAMES[randomIndex];
}
