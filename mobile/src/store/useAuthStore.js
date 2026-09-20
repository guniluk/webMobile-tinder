import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { initializeSocket, disconnectSocket } from '../lib/socket';

const TOKEN_KEY = 'tinder_jwt_token';
const USER_KEY = 'tinder_auth_user';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { user } = get();
    if (!user?._id) return;

    const socket = initializeSocket(user._id);
    set({ socket });

    socket.off('getOnlineUsers');
    socket.on('getOnlineUsers', (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    disconnectSocket();
    set({ socket: null, onlineUsers: [] });
  },

  signup: async (signupData) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/signup', signupData);
      const data = response.data;
      const user = data.user || data;
      const token = data.token;

      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      get().connectSocket();
      return user;
    } catch (error) {
      set({ loading: false });
      const msg =
        error.response?.data?.message ||
        error.message ||
        '회원가입에 실패했습니다.';
      throw new Error(msg);
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      const user = data.user || data;
      const token = data.token;

      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      get().connectSocket();
      return user;
    } catch (error) {
      set({ loading: false });
      const msg =
        error.response?.data?.message ||
        error.message ||
        '로그인에 실패했습니다.';
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      get().disconnectSocket();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const savedUserStr = await AsyncStorage.getItem(USER_KEY);

      if (!savedToken) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
        return;
      }

      let parsedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (parsedUser) {
        set({ user: parsedUser, token: savedToken, isAuthenticated: true });
      }

      // Verify with backend
      const response = await api.get('/auth/me');
      const user = response.data?.user || response.data;

      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        set({
          user,
          token: savedToken,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
        get().connectSocket();
      } else {
        throw new Error('Invalid user');
      }
    } catch (error) {
      console.log('Auth verification check failed:', error.message);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      get().disconnectSocket();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },

  setUser: (user) => {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({ user });
  },
}));
