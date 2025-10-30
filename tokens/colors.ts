// tokens/colors.ts
export const colors = {
  dark: {
    background: '#000000',    // Black
    surface: '#1a1a1a',        // Dark Grey
    surfaceLighter: 'rgba(45, 45, 45, 0.5)', 
    surfaceHighlight: '#2a2a2a', // Light Grey
    border: '#3a3a3a',          // Medium Grey
    borderLight: 'rgba(58, 58, 58, 0.5)',
    text: {
      primary: '#ffffff',       // White
      secondary: '#b3b3b3',     // Light Grey
      tertiary: '#808080',      // Medium Grey
    },
    accent: {
      primary: '#007bff',           // Blue
      primaryHover: '#0056b3',     // Darker Blue
      primaryMuted: 'rgba(0, 123, 255, 0.2)',
      secondary: '#17a2b8',         // Cyan
      indigo: '#6610f2',            // Indigo
      indigoHover: '#480ca8',      // Darker Indigo
    },
    status: {
      success: '#28a745',     // Green
      error: '#dc3545',       // Red
      warning: '#ffc107',     // Yellow
      errorMuted: 'rgba(220, 53, 69, 0.1)',
      successMuted: 'rgba(40, 167, 69, 0.1)',
    },
  },
  // A light theme could be defined here in the future
};
