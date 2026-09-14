import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  signup: async (signupData) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/signup", signupData);
      set({ user: response.data, isAuthenticated: true, loading: false });
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
      set({ user: response.data, isAuthenticated: true, loading: false });
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
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      set({ user: response.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
