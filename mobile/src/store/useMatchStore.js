import { create } from "zustand";
import api from "../lib/api";
import { getSocket } from "../lib/socket";

export const useMatchStore = create((set, get) => ({
  matches: [],
  userProfiles: [],
  isLoadingMatches: false,
  isLoadingProfiles: false,
  swipeFeedback: null,
  newMatchModalUser: null,

  setNewMatchModalUser: (user) => set({ newMatchModalUser: user }),
  clearNewMatchModalUser: () => set({ newMatchModalUser: null }),

  subscribeToNewMatches: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("newMatch");
    socket.on("newMatch", (newMatchUser) => {
      set({ newMatchModalUser: newMatchUser });
      get().getMyMatches();
    });

    // Real-time listener for new user registration
    socket.off("newUserRegistered");
    socket.on("newUserRegistered", () => {
      get().getUserProfiles();
    });
  },

  unsubscribeFromNewMatches: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("newMatch");
      socket.off("newUserRegistered");
    }
  },

  getMyMatches: async () => {
    try {
      set({ isLoadingMatches: true });
      const res = await api.get("/matches");
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
      const res = await api.get("/matches/user-profiles");
      set({ userProfiles: res.data.users || [] });
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: "dislike" });
      await api.post(`/matches/swipe-left/${user._id}`);
      set((state) => ({
        userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
      }));
    } catch (error) {
      console.error("Swipe left error:", error);
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 300);
    }
  },

  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: "like" });
      const res = await api.post(`/matches/swipe-right/${user._id}`);

      const userMatches = res.data.user?.matches || [];
      const isMatch = userMatches.some(
        (id) =>
          (typeof id === "object" ? id._id : id).toString() ===
          user._id.toString(),
      );

      if (isMatch) {
        set({ newMatchModalUser: user });
        get().getMyMatches();
      }

      set((state) => ({
        userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
      }));
    } catch (error) {
      console.error("Swipe right error:", error);
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 300);
    }
  },
}));
