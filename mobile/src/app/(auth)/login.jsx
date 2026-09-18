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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Link } from "expo-router";
import { Flame, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginScreen() {
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setErrorMessage("");
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(error.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6 py-8"
        >
          {/* Logo & Header */}
          <View className="items-center justify-center my-8">
            <View className="w-20 h-20 rounded-3xl bg-rose-50 items-center justify-center mb-4 shadow-sm">
              <Flame size={48} color="#FF4458" />
            </View>
            <Text className="text-3xl font-black text-gray-900 tracking-tight">
              Tinder
            </Text>
            <Text className="text-sm text-gray-500 mt-1 font-medium">
              새로운 인연과의 설레는 만남
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 flex-1 justify-center">
            {errorMessage ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-2">
                <Text className="text-rose-600 text-xs font-semibold text-center">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                이메일
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:border-rose-500">
                <Mail size={20} color="#9CA3AF" />
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

            {/* Password Field */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                비밀번호
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호 입력"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-sm text-gray-900"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-rose-500 rounded-2xl items-center justify-center shadow-lg shadow-rose-500/30 mt-2"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">로그인</Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-sm text-gray-500">계정이 없으신가요? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-bold text-rose-500">
                    회원가입
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
