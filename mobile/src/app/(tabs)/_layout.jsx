import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Flame, MessageCircleHeart, User } from "lucide-react-native";
import { useMessageStore } from "../../store/useMessageStore";
import { useMatchStore } from "../../store/useMatchStore";
import { useAuthStore } from "../../store/useAuthStore";
import MatchModal from "../../components/MatchModal";
import MessageToast from "../../components/MessageToast";

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { unreadSenders, subscribeToGlobalMessages, unsubscribeFromGlobalMessages } =
    useMessageStore();
  const { subscribeToNewMatches, unsubscribeFromNewMatches } =
    useMatchStore();

  const unreadCount = unreadSenders.length;

  useEffect(() => {
    if (isAuthenticated) {
      subscribeToNewMatches();
      subscribeToGlobalMessages();
    }

    return () => {
      unsubscribeFromNewMatches();
      unsubscribeFromGlobalMessages();
    };
  }, [isAuthenticated]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FF4458",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#F3F4F6",
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "디스커버",
            tabBarIcon: ({ color, size }) => (
              <Flame size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: "매치 & 채팅",
            tabBarIcon: ({ color, size }) => (
              <View>
                <MessageCircleHeart size={size} color={color} />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 items-center justify-center border border-white">
                    <Text className="text-white text-[9px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "프로필",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <MatchModal />
      <MessageToast />
    </>
  );
}
