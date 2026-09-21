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
      <View className="items-center justify-center flex-1 p-6 bg-black/80">
        {/* Close Button */}
        <TouchableOpacity
          onPress={clearNewMatchModalUser}
          className="absolute items-center justify-center w-10 h-10 rounded-full top-14 right-6 bg-white/20"
        >
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="mb-2 text-4xl italic font-black tracking-wider text-center text-rose-400">
          IT'S A MATCH!
        </Text>
        <Text className="mb-8 text-base font-medium text-center text-white">
          {newMatchModalUser.name}님과 서로를 마음에 들어합니다!
        </Text>

        {/* Matched Avatars */}
        <View className="flex-row items-center justify-center gap-4 mb-10">
          <View className="overflow-hidden border-4 border-white rounded-full shadow-2xl w-28 h-28">
            {authUser?.image ? (
              <Image
                source={{ uri: authUser.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center justify-center w-full h-full bg-rose-400">
                <Text className="text-2xl font-bold text-white">
                  {authUser?.name?.[0] || "Me"}
                </Text>
              </View>
            )}
          </View>

          <View className="z-10 items-center justify-center w-12 h-12 -mx-5 border-2 border-white rounded-full shadow-lg bg-rose-500">
            <Heart size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>

          <View className="overflow-hidden border-4 border-white rounded-full shadow-2xl w-28 h-28">
            {newMatchModalUser.image ? (
              <Image
                source={{ uri: newMatchModalUser.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center justify-center w-full h-full bg-pink-400">
                <Text className="text-2xl font-bold text-white">
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
            className="flex-row items-center justify-center w-full gap-2 py-4 shadow-lg bg-rose-500 rounded-2xl"
          >
            <MessageCircle size={20} color="#FFFFFF" />
            <Text className="text-base font-bold text-white">
              메시지 보내기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={clearNewMatchModalUser}
            className="items-center justify-center w-full py-4 border bg-white/10 rounded-2xl border-white/20"
          >
            <Text className="text-sm font-semibold text-white">
              계속 둘러보기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MatchModal;
