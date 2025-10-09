/**
 * Generates a base64 encoded SVG for a modern, minimalist checkmark logo.
 * @returns {string} A base64 encoded SVG data string.
 */
export const generateMockLogoBase64 = (): string => {
  const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" ry="12" fill="url(#grad1)"/>
      <path d="M18 32 L28 42 L46 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `.trim();
  // btoa is available in web worker/browser environments.
  return btoa(svg);
};

/**
 * Generates a base64 encoded SVG for a simple, clear favicon.
 * @returns {string} A base64 encoded SVG data string.
 */
export const generateMockFaviconBase64 = (): string => {
  const svg = `
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="3" ry="3" fill="#38bdf8"/>
      <path d="M4 8 L7 11 L12 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `.trim();
  return btoa(svg);
};
