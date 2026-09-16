import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
  messages: [],
  isLoadingMessages: false,
  isSendingMessage: false,
  unreadSenders: [],
  activeChatUserId: null,

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
      const res = await axiosInstance.get(`/messages/conversation/${userId}`);
      set({ messages: res.data.messages || [] });
      get().markAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("메시지를 불러오는데 실패했습니다.");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    if (!content.trim()) return;
    try {
      set({ isSendingMessage: true });
      const res = await axiosInstance.post("/messages/send", {
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
      toast.error("메시지 전송에 실패했습니다.");
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

      // If user is currently in the conversation with this sender
      if (activeChatUserId && activeChatUserId === senderId) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        // Mark as unread with paperplane indicator
        if (!unreadSenders.includes(senderId)) {
          set({ unreadSenders: [...unreadSenders, senderId] });
        }
        toast("✈️ 새로운 메시지가 도착했습니다!", {
          id: `new-msg-${senderId}`,
          duration: 3000,
        });
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
