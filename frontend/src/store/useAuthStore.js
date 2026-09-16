import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { initializeSocket, disconnectSocket } from "../socket/socket.client";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { user } = get();
    if (!user?._id) return;

    const socket = initializeSocket(user._id);
    set({ socket });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("newMatch", (match) => {
      console.log("🎉 New Match!:", match);
    });
  },

  disconnectSocket: () => {
    disconnectSocket();
    set({ socket: null, onlineUsers: [] });
  },

  signup: async (signupData) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/signup", signupData);
      const user = response.data?.user || response.data;
      set({ user, isAuthenticated: true, loading: false });
      get().connectSocket();
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw new Error(
        error.response?.data?.message || "Failed to create account",
        { cause: error },
      );
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const user = response.data?.user || response.data;
      set({ user, isAuthenticated: true, loading: false });
      get().connectSocket();
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw new Error(error.response?.data?.message || "Failed to sign in", {
        cause: error,
      });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout error:", error);
      get().disconnectSocket();
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      const user = response.data?.user || response.data;
      set({ user, isAuthenticated: true });
      get().connectSocket();
    } catch {
      get().disconnectSocket();
      set({ user: null, isAuthenticated: false });
    }
  },
}));
