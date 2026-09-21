import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Search,
  MessageCircleHeart,
  User as UserIcon,
  Flame,
  Send,
} from "lucide-react-native";
import { useMatchStore } from "../../store/useMatchStore";
import { useMessageStore } from "../../store/useMessageStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function MatchesScreen() {
  const { matches, isLoadingMatches, getMyMatches } = useMatchStore();
  const { unreadSenders } = useMessageStore();
  const { onlineUsers } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getMyMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getMyMatches();
    setRefreshing(false);
  };

  const filteredMatches = matches.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
        <Text className="text-2xl font-black tracking-tight text-gray-900">
          매치 & 메시지
        </Text>
        <View className="px-2.5 py-1 bg-rose-50 rounded-full">
          <Text className="text-xs font-bold text-rose-600">
            {matches.length}개의 매치
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingMatches}
            onRefresh={onRefresh}
            tintColor="#FF4458"
          />
        }
        className="flex-1"
      >
        {/* Search Bar */}
        <View className="px-5 py-3">
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-2.5">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="매치된 상대 검색..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2.5 text-sm text-gray-900"
            />
          </View>
        </View>

        {/* Section 1: New Matches (Horizontal Avatar Scroll) */}
        <View className="py-2">
          <Text className="px-5 mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
            새로운 매치 ({matches.length})
          </Text>

          {matches.length === 0 ? (
            <View className="items-center justify-center px-5 py-6">
              <View className="items-center justify-center mb-2 w-14 h-14 rounded-2xl bg-pink-50">
                <Flame size={28} color="#FF4458" />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                아직 성사된 매치가 없습니다
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 text-center">
                디스커버 탭에서 더 많은 사람에게 좋아요를 보내보세요!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              className="flex-row"
            >
              {matches.map((matchUser) => {
                const isOnline = onlineUsers.includes(matchUser._id);
                const hasUnread = unreadSenders.includes(matchUser._id);

                return (
                  <TouchableOpacity
                    key={matchUser._id}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/chat/${matchUser._id}`)}
                    className="items-center w-16 mr-4"
                  >
                    <View className="relative">
                      <View className="w-16 h-16 rounded-full p-0.5 border-2 border-rose-500 overflow-hidden bg-gray-100 shadow-sm">
                        {matchUser.image ? (
                          <Image
                            source={{ uri: matchUser.image }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="items-center justify-center w-full h-full bg-rose-400">
                            <UserIcon size={24} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      {/* Online Indicator */}
                      {isOnline && (
                        <View className="absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full bg-emerald-500" />
                      )}

                      {/* Unread Indicator */}
                      {hasUnread && (
                        <View className="absolute top-0 right-0 items-center justify-center w-4 h-4 border-2 border-white rounded-full bg-rose-500">
                          <Send size={8} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      className="text-xs font-semibold text-gray-800 mt-1.5 text-center"
                    >
                      {matchUser.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Section 2: Messages / Conversations List */}
        <View className="px-5 py-4 mt-2 border-t border-gray-100">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
            대화 목록
          </Text>

          {filteredMatches.length === 0 ? (
            <View className="items-center justify-center py-8">
              <MessageCircleHeart size={36} color="#D1D5DB" />
              <Text className="mt-2 text-xs text-gray-400">
                {searchQuery ? "검색 결과가 없습니다" : "대화를 시작해보세요"}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {filteredMatches.map((matchUser) => {
                const isOnline = onlineUsers.includes(matchUser._id);
                const hasUnread = unreadSenders.includes(matchUser._id);

                return (
                  <TouchableOpacity
                    key={matchUser._id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/chat/${matchUser._id}`)}
                    className={`flex-row items-center p-3 rounded-2xl border transition-colors ${
                      hasUnread
                        ? "bg-rose-50/70 border-rose-200"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    {/* Avatar */}
                    <View className="relative">
                      <View className="overflow-hidden bg-gray-100 rounded-full shadow-sm w-14 h-14">
                        {matchUser.image ? (
                          <Image
                            source={{ uri: matchUser.image }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="items-center justify-center w-full h-full bg-rose-400">
                            <UserIcon size={24} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      {isOnline && (
                        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </View>

                    {/* Details */}
                    <View className="flex-1 ml-3.5 justify-center">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-gray-900">
                          {matchUser.name}
                        </Text>
                        {isOnline && (
                          <Text className="text-[11px] font-semibold text-emerald-600">
                            온라인
                          </Text>
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        className={`text-xs mt-0.5 ${
                          hasUnread
                            ? "text-rose-600 font-bold"
                            : "text-gray-500"
                        }`}
                      >
                        {hasUnread
                          ? "✈️ 새 메시지가 도착했습니다"
                          : "대화를 나누어 보세요!"}
                      </Text>
                    </View>

                    {/* Badge */}
                    {hasUnread && (
                      <View className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
