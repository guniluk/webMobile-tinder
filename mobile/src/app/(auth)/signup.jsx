import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Link } from "expo-router";
import {
  Flame,
  User,
  Mail,
  Lock,
  Calendar,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";

export default function SignupScreen() {
  const { signup, loading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [genderPreference, setGenderPreference] = useState("both");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !age) {
      setErrorMessage("모든 필수 항목을 입력해주세요.");
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 18 || numAge > 100) {
      setErrorMessage("만 18세 이상 100세 이하만 가입 가능합니다.");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("비밀번호는 최소 4자리 이상이어야 합니다.");
      return;
    }

    try {
      setErrorMessage("");
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        age: numAge,
        gender,
        genderPreference,
      });
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(error.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Top Header */}
        <View className="px-4 py-2 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900">계정 만들기</Text>
          <View className="w-8" />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6 py-4"
        >
          {errorMessage ? (
            <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
              <Text className="text-rose-600 text-xs font-semibold text-center">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View className="mb-3.5">
            <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              이름
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <User size={18} color="#9CA3AF" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-sm text-gray-900"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-3.5">
            <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              이메일
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Mail size={18} color="#9CA3AF" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-3 text-sm text-gray-900"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-3.5">
            <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              비밀번호
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="4자 이상 입력"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-sm text-gray-900"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                {showPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Age */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              나이
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Calendar size={18} color="#9CA3AF" />
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="만 18세 이상"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={3}
                className="flex-1 ml-3 text-sm text-gray-900"
              />
            </View>
          </View>

          {/* Gender Selection */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              본인 성별
            </Text>
            <View className="flex-row gap-3">
              {[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.8}
                  onPress={() => setGender(item.value)}
                  className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                    gender === item.value
                      ? "bg-rose-50 border-rose-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      gender === item.value ? "text-rose-600" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interested In Selection */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              관심 있는 상대
            </Text>
            <View className="flex-row gap-2">
              {[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
                { label: "모두", value: "both" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.8}
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

          {/* Signup Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={loading}
            className="w-full py-4 bg-rose-500 rounded-2xl items-center justify-center shadow-lg shadow-rose-500/30"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">회원가입 완료</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="text-sm text-gray-500">이미 계정이 있으신가요? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-rose-500">
                  로그인
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
