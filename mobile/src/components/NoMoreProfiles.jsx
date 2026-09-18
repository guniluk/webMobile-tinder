import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Flame, RefreshCw } from "lucide-react-native";
import { useMatchStore } from "../store/useMatchStore";

export const NoMoreProfiles = () => {
  const { getUserProfiles, isLoadingProfiles } = useMatchStore();

  return (
    <View className="items-center justify-center p-8 text-center max-w-sm">
      <View className="w-24 h-24 rounded-full bg-pink-50 items-center justify-center mb-6 shadow-inner">
        <Flame size={48} color="#FF4458" />
      </View>

      <Text className="text-2xl font-bold text-gray-900 mb-2">
        새로운 상대가 없습니다
      </Text>

      <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
        주변의 모든 추천 프로필을 확인하셨습니다. 나중에 다시 확인하거나 새로고침 해보세요.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => getUserProfiles()}
        disabled={isLoadingProfiles}
        className="flex-row items-center justify-center gap-2 px-6 py-3.5 bg-rose-500 rounded-full shadow-md"
        style={{
          shadowColor: "#FF4458",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <RefreshCw size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-sm">
          {isLoadingProfiles ? "불러오는 중..." : "다시 찾아보기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoMoreProfiles;
