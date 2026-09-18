import { create } from "zustand";
import api from "../lib/api";
import { useAuthStore } from "./useAuthStore";

export const useUserStore = create((set) => ({
  loading: false,

  updateProfile: async (profileData) => {
    try {
      set({ loading: true });
      const res = await api.put("/users/update", profileData);
      const updatedUser = res.data.user;
      if (updatedUser) {
        useAuthStore.getState().setUser(updatedUser);
      }
      return updatedUser;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "프로필 수정에 실패했습니다.";
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },
}));
