// tokens/colors.ts
export const colors = {
  dark: {
    background: '#0f172a',    // slate-900
    surface: '#1e293b',        // slate-800
    surfaceLighter: 'rgba(51, 65, 85, 0.5)', // slate-800/50
    surfaceHighlight: '#334155', // slate-700
    border: '#334155',          // slate-700
    borderLight: 'rgba(51, 65, 85, 0.5)', // slate-700/50
    text: {
      primary: '#e2e8f0',       // slate-200
      secondary: '#94a3b8',     // slate-400
      tertiary: '#64748b',      // slate-500
    },
    accent: {
      primary: '#38bdf8',           // sky-400
      primaryHover: '#0ea5e9',     // sky-500
      primaryMuted: 'rgba(56, 189, 248, 0.2)', // sky-400 with opacity
      secondary: '#2dd4bf',         // teal-400
      indigo: '#818cf8',            // indigo-400
      indigoHover: '#6366f1',      // indigo-500
    },
    status: {
      success: '#4ade80',     // green-400
      error: '#f87171',       // red-400
      warning: '#facc15',     // amber-400
      errorMuted: 'rgba(244, 63, 94, 0.1)', // for backgrounds
      successMuted: 'rgba(16, 185, 129, 0.1)', // for backgrounds
    },
  },
  // A light theme could be defined here in the future
};
