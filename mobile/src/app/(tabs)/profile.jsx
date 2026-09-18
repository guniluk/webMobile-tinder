import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Heart,
  LogOut,
  User,
  Calendar,
  Sparkles,
  Check,
} from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useUserStore } from "../../store/useUserStore";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { updateProfile, loading } = useUserStore();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [bio, setBio] = useState(user?.bio || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [genderPreference, setGenderPreference] = useState(
    user?.genderPreference || "both",
  );
  const [image, setImage] = useState(user?.image || "");
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "사진을 업로드하기 위해 갤러리 접근 권한이 필요합니다.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Image = `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;
        setImage(base64Image);
        setIsImageChanged(true);
      }
    } catch (error) {
      Alert.alert("오류", "이미지를 불러오는 중 문제가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "이름을 입력해주세요." });
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 18 || numAge > 100) {
      setStatusMessage({
        type: "error",
        text: "나이는 만 18세 이상 100세 이하로 입력해주세요.",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      age: numAge,
      bio: bio.trim(),
      gender,
      genderPreference,
    };

    if (isImageChanged && image) {
      payload.image = image;
    }

    try {
      setStatusMessage({ type: "", text: "" });
      await updateProfile(payload);
      setStatusMessage({
        type: "success",
        text: "프로필이 성공적으로 저장되었습니다!",
      });
      setIsImageChanged(false);
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "프로필 저장에 실패했습니다.",
      });
    }
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-2xl font-black text-gray-900 tracking-tight">
          내 프로필
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full"
        >
          <LogOut size={14} color="#6B7280" />
          <Text className="text-xs font-semibold text-gray-600">로그아웃</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="px-5 py-4"
        >
          {statusMessage.text ? (
            <View
              className={`rounded-2xl p-3.5 mb-4 border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <Text
                className={`text-xs font-bold text-center ${
                  statusMessage.type === "success"
                    ? "text-emerald-700"
                    : "text-rose-600"
                }`}
              >
                {statusMessage.text}
              </Text>
            </View>
          ) : null}

          {/* Photo Section */}
          <View className="items-center my-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              className="relative"
            >
              <View className="w-36 h-36 rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-rose-300 shadow-md">
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-rose-50 items-center justify-center p-4">
                    <Camera size={32} color="#FF4458" />
                    <Text className="text-[11px] font-bold text-rose-500 mt-2 text-center">
                      소개 사진 추가
                    </Text>
                  </View>
                )}
              </View>

              {/* Edit Badge */}
              <View className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-rose-500 items-center justify-center border-2 border-white shadow-md">
                <Camera size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text className="text-xs text-gray-400 mt-3">
              터치하여 대표 소개 사진을 변경하세요
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mt-4 space-y-4">
            {/* Name */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                이름
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <User size={18} color="#9CA3AF" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="이름 입력"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-sm text-gray-900"
                />
              </View>
            </View>

            {/* Age */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                나이
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <Calendar size={18} color="#9CA3AF" />
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="나이 입력"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={3}
                  className="flex-1 ml-3 text-sm text-gray-900"
                />
              </View>
            </View>

            {/* Bio */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                자기소개
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="자신을 표현할 수 있는 멋진 한 줄을 적어보세요..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 h-24"
              />
            </View>

            {/* Gender */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                성별
              </Text>
              <View className="flex-row gap-3">
                {[
                  { label: "남성", value: "male" },
                  { label: "여성", value: "female" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setGender(item.value)}
                    className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                      gender === item.value
                        ? "bg-rose-50 border-rose-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        gender === item.value
                          ? "text-rose-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Gender Preference */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                관심 상대
              </Text>
              <View className="flex-row gap-2">
                {[
                  { label: "남성", value: "male" },
                  { label: "여성", value: "female" },
                  { label: "모두", value: "both" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setGenderPreference(item.value)}
                    className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                      genderPreference === item.value
                        ? "bg-rose-50 border-rose-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        genderPreference === item.value
                          ? "text-rose-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={loading}
              className="w-full py-4 bg-rose-500 rounded-2xl items-center justify-center shadow-lg shadow-rose-500/30 mb-8"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">
                  프로필 저장
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
