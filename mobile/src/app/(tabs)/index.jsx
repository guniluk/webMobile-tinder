import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Sparkles } from "lucide-react-native";
import { useMatchStore } from "../../store/useMatchStore";
import { useAuthStore } from "../../store/useAuthStore";
import SwipeCard from "../../components/SwipeCard";
import NoMoreProfiles from "../../components/NoMoreProfiles";

export default function DiscoverScreen() {
  const {
    userProfiles,
    isLoadingProfiles,
    getUserProfiles,
    getMyMatches,
  } = useMatchStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUserProfiles();
    getMyMatches();
  }, []);

  const currentProfile = userProfiles[0];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Top Header */}
      <View className="px-5 py-2.5 flex-row items-center justify-between border-b border-gray-100 bg-white shadow-xs">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-rose-50 items-center justify-center">
            <Flame size={20} color="#FF4458" />
          </View>
          <Text className="text-xl font-black text-gray-900 tracking-tight">
            Tinder
          </Text>
        </View>

        {/* Online Status Pill */}
        <View className="flex-row items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-emerald-700 text-xs font-semibold">
            {onlineUsers.length}명 접속 중
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 items-center justify-center p-2">
        {isLoadingProfiles ? (
          <View className="items-center justify-center gap-3">
            <View className="w-16 h-16 rounded-3xl bg-rose-50 items-center justify-center shadow-inner">
              <ActivityIndicator size="small" color="#FF4458" />
            </View>
            <Text className="text-sm font-medium text-gray-500">
              새로운 추천 상대를 찾고 있습니다...
            </Text>
          </View>
        ) : currentProfile ? (
          <SwipeCard key={currentProfile._id} user={currentProfile} />
        ) : (
          <NoMoreProfiles />
        )}
      </View>
    </SafeAreaView>
  );
}
