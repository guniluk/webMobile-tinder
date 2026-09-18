import { create } from "zustand";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
  messages: [],
  isLoadingMessages: false,
  isSendingMessage: false,
  unreadSenders: [],
  activeChatUserId: null,
  newMessageAlert: null,

  clearNewMessageAlert: () => set({ newMessageAlert: null }),

  setActiveChatUserId: (userId) => {
    set({ activeChatUserId: userId });
    if (userId) {
      get().markAsRead(userId);
    }
  },

  markAsRead: (userId) => {
    set((state) => ({
      unreadSenders: state.unreadSenders.filter((id) => id !== userId),
    }));
  },

  getMessages: async (userId) => {
    try {
      set({ isLoadingMessages: true });
      const res = await api.get(`/messages/conversation/${userId}`);
      set({ messages: res.data.messages || [] });
      get().markAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    if (!content.trim()) return;
    try {
      set({ isSendingMessage: true });
      const res = await api.post("/messages/send", {
        receiverId,
        content: content.trim(),
      });
      const { newMessage } = res.data;
      if (newMessage) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToGlobalMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const senderId =
        typeof newMessage.senderId === "object"
          ? newMessage.senderId._id
          : newMessage.senderId;

      const currentAuthUser = useAuthStore.getState().user;
      if (currentAuthUser && currentAuthUser._id === senderId) {
        return;
      }

      const { activeChatUserId, unreadSenders } = get();

      if (activeChatUserId && activeChatUserId === senderId) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        if (!unreadSenders.includes(senderId)) {
          set({
            unreadSenders: [...unreadSenders, senderId],
            newMessageAlert: newMessage,
          });
        }
      }
    });
  },

  unsubscribeFromGlobalMessages: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
