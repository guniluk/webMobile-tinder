import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { MessageCircle, X } from "lucide-react-native";
import { useMessageStore } from "../store/useMessageStore";

export const MessageToast = () => {
  const { newMessageAlert, clearNewMessageAlert } = useMessageStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (newMessageAlert) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [newMessageAlert]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      clearNewMessageAlert();
    });
  };

  const handlePress = () => {
    if (!newMessageAlert) return;
    const senderId =
      typeof newMessageAlert.senderId === "object"
        ? newMessageAlert.senderId._id
        : newMessageAlert.senderId;
    handleDismiss();
    router.push(`/chat/${senderId}`);
  };

  if (!newMessageAlert) return null;

  const sender =
    typeof newMessageAlert.senderId === "object"
      ? newMessageAlert.senderId
      : { name: "새 메시지" };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="bg-gray-900/95 p-3.5 rounded-2xl flex-row items-center gap-3 border border-gray-700 shadow-2xl"
      >
        <View className="w-10 h-10 rounded-full overflow-hidden bg-rose-500 items-center justify-center">
          {sender.image ? (
            <Image
              source={{ uri: sender.image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <MessageCircle size={20} color="#FFFFFF" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-white font-bold text-sm">{sender.name}</Text>
          <Text
            numberOfLines={1}
            className="text-gray-300 text-xs mt-0.5"
          >
            {newMessageAlert.content}
          </Text>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            handleDismiss();
          }}
          className="p-1"
        >
          <X size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MessageToast;
