import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, Send, User, Sparkles } from "lucide-react-native";
import { useMessageStore } from "../../store/useMessageStore";
import { useMatchStore } from "../../store/useMatchStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function ChatDetailScreen() {
  const { id: targetUserId } = useGlobalSearchParams();

  const {
    messages,
    isLoadingMessages,
    isSendingMessage,
    getMessages,
    sendMessage,
    setActiveChatUserId,
  } = useMessageStore();

  const { matches, getMyMatches } = useMatchStore();
  const { user: authUser, onlineUsers } = useAuthStore();

  const [inputContent, setInputContent] = useState("");
  const flatListRef = useRef(null);

  const matchUser = matches.find((m) => m._id === targetUserId);
  const isOnline = onlineUsers.includes(targetUserId);

  useEffect(() => {
    if (matches.length === 0) {
      getMyMatches();
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      setActiveChatUserId(targetUserId);
      getMessages(targetUserId);
    }

    return () => {
      setActiveChatUserId(null);
    };
  }, [targetUserId]);

  const handleSend = async () => {
    if (!inputContent.trim() || isSendingMessage) return;
    const text = inputContent.trim();
    setInputContent("");
    await sendMessage(targetUserId, text);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${minutes}`;
  };

  const renderMessageItem = ({ item }) => {
    const senderId =
      typeof item.senderId === "object" ? item.senderId._id : item.senderId;
    const isMe = senderId === authUser?._id;

    return (
      <View
        className={`flex-row my-1.5 px-4 ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {!isMe && (
          <View className="self-end w-8 h-8 mb-1 mr-2 overflow-hidden bg-gray-200 rounded-full">
            {matchUser?.image ? (
              <Image
                source={{ uri: matchUser.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center justify-center w-full h-full bg-rose-400">
                <User size={14} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        <View className="max-w-[75%]">
          <View
            className={`px-4 py-3 rounded-2xl ${
              isMe
                ? "bg-rose-500 rounded-br-none"
                : "bg-gray-100 rounded-bl-none"
            }`}
          >
            <Text
              className={`text-sm ${
                isMe ? "text-white font-medium" : "text-gray-900"
              }`}
            >
              {item.content}
            </Text>
          </View>
          <Text
            className={`text-[10px] text-gray-400 mt-1 ${
              isMe ? "text-right mr-1" : "text-left ml-1"
            }`}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Top Chat Header */}
      <View className="px-4 py-2.5 border-b border-gray-100 flex-row items-center justify-between bg-white">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/matches");
              }
            }}
            className="p-1.5 -ml-2 rounded-full"
          >
            <ChevronLeft size={26} color="#374151" />
          </TouchableOpacity>

          <View className="relative">
            <View className="w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
              {matchUser?.image ? (
                <Image
                  source={{ uri: matchUser.image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center justify-center w-full h-full bg-rose-400">
                  <User size={18} color="#FFFFFF" />
                </View>
              )}
            </View>
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500" />
            )}
          </View>

          <View>
            <Text className="text-base font-bold text-gray-900">
              {matchUser?.name || "상대방"}
            </Text>
            <Text className="text-[11px] font-medium text-gray-400">
              {isOnline ? "현재 활동 중" : "오프라인"}
            </Text>
          </View>
        </View>

        <View className="items-center justify-center w-8 h-8 rounded-full bg-pink-50">
          <Sparkles size={16} color="#FF4458" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        className="flex-1"
      >
        {/* Messages List */}
        {isLoadingMessages ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="small" color="#FF4458" />
          </View>
        ) : messages.length === 0 ? (
          <View className="items-center justify-center flex-1 p-6">
            <View className="items-center justify-center w-16 h-16 mb-3 rounded-full bg-rose-50">
              <Sparkles size={32} color="#FF4458" />
            </View>
            <Text className="text-base font-bold text-gray-800">
              {matchUser?.name}님과 매치되었습니다!
            </Text>
            <Text className="mt-1 text-xs text-center text-gray-400">
              첫 메시지를 보내서 반갑게 인사를 건네보세요 👋
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || String(index)}
            renderItem={renderMessageItem}
            contentContainerStyle={{ paddingVertical: 12 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Bottom Input Area */}
        <View
          style={{
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
            }}
          >
            <TextInput
              value={inputContent}
              onChangeText={setInputContent}
              placeholder="메시지 보내기..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              style={{
                flex: 1,
                fontSize: 14,
                color: "#111827",
                maxHeight: 96,
                paddingVertical: 4,
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={!inputContent.trim() || isSendingMessage}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: inputContent.trim() ? "#FF4458" : "#E5E7EB",
            }}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send
                size={18}
                color={inputContent.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
