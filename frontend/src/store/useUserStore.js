import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
  loading: false,

  updateProfile: async (profileData) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.put("/users/update", profileData);
      useAuthStore.setState({ user: res.data.user });
      toast.success("프로필이 성공적으로 업데이트되었습니다!");
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "프로필 수정에 실패했습니다.";
      toast.error(message);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
