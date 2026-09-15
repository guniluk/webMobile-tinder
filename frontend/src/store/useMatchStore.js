import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMatchStore = create((set, get) => ({
  matches: [],
  userProfiles: [],
  isLoadingMatches: false,
  isLoadingProfiles: false,
  swipeFeedback: null,

  getMyMatches: async () => {
    try {
      set({ isLoadingMatches: true });
      const res = await axiosInstance.get("/matches");
      set({ matches: res.data.matches || [] });
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      set({ isLoadingMatches: false });
    }
  },

  getUserProfiles: async () => {
    try {
      set({ isLoadingProfiles: true });
      const res = await axiosInstance.get("/matches/user-profiles");
      set({ userProfiles: res.data.users || [] });
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      toast.error("추천 프로필을 불러오지 못했습니다.");
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: "dislike" });
      await axiosInstance.post(`/matches/swipe-left/${user._id}`);
      set((state) => ({
        userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
      }));
    } catch (error) {
      console.error("Swipe left error:", error);
      toast.error("요청 처리에 실패했습니다.");
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 300);
    }
  },

  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: "like" });
      const res = await axiosInstance.post(`/matches/swipe-right/${user._id}`);

      const isMatch = res.data.user?.matches?.includes(user._id);
      if (isMatch) {
        toast.success(`🎉 ${user.name}님과 매치되었습니다!`, {
          icon: "💖",
          duration: 4000,
        });
        get().getMyMatches();
      }

      set((state) => ({
        userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
      }));
    } catch (error) {
      console.error("Swipe right error:", error);
      toast.error("요청 처리에 실패했습니다.");
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 300);
    }
  },
}));
