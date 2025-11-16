import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agenticai.appgenerator',
  appName: 'Agentic AI App Generator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
