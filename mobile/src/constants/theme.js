import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Normalize and resolve API and Socket URLs for Render.com and Localhost environments
const resolveServerUrls = () => {
  let rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  let rawSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();

  // 1. If user provided a remote backend URL (e.g. Render.com: https://xxx.onrender.com)
  if (rawApiUrl) {
    // Remove trailing slash
    rawApiUrl = rawApiUrl.replace(/\/+$/, '');

    // Ensure /api suffix for REST API
    const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

    // Derive root URL for Socket.IO (remove /api if present)
    const socketUrl = rawSocketUrl
      ? rawSocketUrl.replace(/\/+$/, '')
      : rawApiUrl.replace(/\/api$/, '');

    return { apiUrl, socketUrl };
  }

  // 2. Automatic Local IP resolution for Expo Go / Real Device / Emulators
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost;

  let localHost = 'localhost';
  if (hostUri) {
    localHost = hostUri.split(':')[0];
  } else if (Platform.OS === 'android') {
    localHost = '10.0.2.2';
  }

  const apiUrl = `http://${localHost}:3000/api`;
  const socketUrl = `http://${localHost}:3000`;

  return { apiUrl, socketUrl };
};

const { apiUrl, socketUrl } = resolveServerUrls();

export const API_BASE_URL = apiUrl;
export const SOCKET_BASE_URL = socketUrl;

console.log(`🌐 [Tinder Mobile] API Endpoint: ${API_BASE_URL}`);
console.log(`⚡ [Tinder Mobile] Socket Server: ${SOCKET_BASE_URL}`);

export const COLORS = {
  primary: '#FF4458',
  primaryGradient: ['#FF4458', '#FF6036'],
  secondary: '#FD267D',
  dark: '#111418',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  emerald: '#10B981',
  rose: '#F43F5E',
  white: '#FFFFFF',
  black: '#000000',
};
