import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { X, Heart, Sparkles, User as UserIcon, Info } from "lucide-react-native";
import { useMatchStore } from "../store/useMatchStore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

export const SwipeCard = ({ user }) => {
  const { swipeRight, swipeLeft } = useMatchStore();
  const [showFullBio, setShowFullBio] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (direction === "right") {
        swipeRight(user);
      } else {
        swipeLeft(user);
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-25deg", "0deg", "25deg"],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [10, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -10],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  const cardHeight = Math.min(SCREEN_HEIGHT * 0.62, 540);

  return (
    <View className="w-full items-center justify-center px-4">
      {/* Draggable Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[cardStyle, { height: cardHeight }]}
        className="w-full rounded-3xl overflow-hidden bg-gray-900 shadow-2xl relative border border-gray-100/30"
      >
        {/* User Image */}
        {user.image ? (
          <Image
            source={{ uri: user.image }}
            contentFit="cover"
            transition={300}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-rose-500 p-6">
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-4">
              <UserIcon size={48} color="#FFFFFF" />
            </View>
            <Text className="text-white text-2xl font-bold">{user.name}</Text>
          </View>
        )}

        {/* LIKE Stamp (Right Swipe) */}
        <Animated.View
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 border-4 border-emerald-400 px-4 py-1.5 rounded-2xl -rotate-12 bg-black/20"
        >
          <Text className="text-emerald-400 font-black text-3xl tracking-widest uppercase">
            LIKE
          </Text>
        </Animated.View>

        {/* NOPE Stamp (Left Swipe) */}
        <Animated.View
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 border-4 border-rose-500 px-4 py-1.5 rounded-2xl rotate-12 bg-black/20"
        >
          <Text className="text-rose-500 font-black text-3xl tracking-widest uppercase">
            NOPE
          </Text>
        </Animated.View>

        {/* Bottom Details Overlay */}
        <View className="absolute inset-x-0 bottom-0 bg-black/75 pt-12 pb-5 px-5">
          <View className="flex-row items-baseline justify-between mb-1.5">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-white text-2xl font-black">
                {user.name}
              </Text>
              <Text className="text-gray-200 text-xl font-light">
                {user.age}
              </Text>
            </View>
            <View className="px-2.5 py-1 bg-white/20 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {user.gender === "male"
                  ? "남성"
                  : user.gender === "female"
                    ? "여성"
                    : user.gender}
              </Text>
            </View>
          </View>

          {/* User Bio */}
          {user.bio ? (
            <Pressable onPress={() => setShowFullBio(!showFullBio)}>
              <Text
                numberOfLines={showFullBio ? undefined : 2}
                className="text-gray-200 text-xs leading-relaxed"
              >
                {user.bio}
              </Text>
              {user.bio.length > 50 && (
                <View className="flex-row items-center gap-1 mt-1">
                  <Info size={12} color="#F472B6" />
                  <Text className="text-pink-400 text-xs font-medium">
                    {showFullBio ? "접기" : "더보기"}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Text className="text-gray-400 text-xs italic">
              작성된 소개글이 없습니다.
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-center gap-6 mt-6">
        {/* Pass Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => forceSwipe("left")}
          className="w-16 h-16 rounded-full bg-white shadow-lg items-center justify-center border border-rose-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <X size={28} color="#F43F5E" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Super Like Deco */}
        <View className="w-11 h-11 rounded-full bg-amber-400 items-center justify-center shadow-md">
          <Sparkles size={20} color="#FFFFFF" />
        </View>

        {/* Like Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => forceSwipe("right")}
          className="w-16 h-16 rounded-full bg-rose-500 shadow-lg items-center justify-center"
          style={{
            shadowColor: "#FF4458",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SwipeCard;
