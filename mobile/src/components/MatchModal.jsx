import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Heart, MessageCircle, X } from "lucide-react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useMatchStore } from "../store/useMatchStore";

export const MatchModal = () => {
  const { user: authUser } = useAuthStore();
  const { newMatchModalUser, clearNewMatchModalUser } = useMatchStore();

  if (!newMatchModalUser) return null;

  const handleStartChat = () => {
    const targetUserId = newMatchModalUser._id;
    clearNewMatchModalUser();
    router.push(`/chat/${targetUserId}`);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(newMatchModalUser)}
      onRequestClose={clearNewMatchModalUser}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        {/* Close Button */}
        <TouchableOpacity
          onPress={clearNewMatchModalUser}
          className="absolute top-14 right-6 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        >
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-4xl font-black text-rose-400 italic mb-2 tracking-wider text-center">
          IT'S A MATCH!
        </Text>
        <Text className="text-white text-base font-medium mb-8 text-center">
          {newMatchModalUser.name}님과 서로를 마음에 들어합니다!
        </Text>

        {/* Matched Avatars */}
        <View className="flex-row items-center justify-center gap-4 mb-10">
          <View className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-2xl">
            {authUser?.image ? (
              <Image
                source={{ uri: authUser.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full bg-rose-400 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {authUser?.name?.[0] || "Me"}
                </Text>
              </View>
            )}
          </View>

          <View className="w-12 h-12 rounded-full bg-rose-500 items-center justify-center shadow-lg -mx-5 z-10 border-2 border-white">
            <Heart size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>

          <View className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-2xl">
            {newMatchModalUser.image ? (
              <Image
                source={{ uri: newMatchModalUser.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full bg-pink-400 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {newMatchModalUser.name?.[0] || "U"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Buttons */}
        <View className="w-full max-w-xs gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartChat}
            className="w-full py-4 bg-rose-500 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base">
              메시지 보내기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={clearNewMatchModalUser}
            className="w-full py-4 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
          >
            <Text className="text-white font-semibold text-sm">
              계속 둘러보기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MatchModal;
