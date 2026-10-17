import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fieldortho.app',
  appName: 'Field Orthopaedics Connect',
  webDir: 'build',
  ios: {
    contentInset: 'never',
    backgroundColor: '#FFFFFF'
  },
  android: {
    backgroundColor: '#FFFFFF'
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#001D45',
      launchAutoHide: true,
      androidScaleType: 'CENTER_INSIDE'
    }
  }
};

export default config;
