# 🌪️ Expo (React Native) 환경에 NativeWind v4 설치 및 완벽 가이드

> **NativeWind**는 웹에서 널리 사용되는 **Tailwind CSS**의 유틸리티 클래스 문법을 **React Native (Expo)** 네이티브 컴포넌트에서 그대로 사용할 수 있게 해주는 모던 스타일링 라이브러리입니다.  
> 본 문서는 최신 **Expo SDK 52~57 (New Architecture)** 환경에서 **NativeWind v4**를 설치하고 프로젝트에 완벽하게 적용하는 전 과정을 단계별로 알기 쉽게 정리한 가이드입니다.

---

## 📌 목차
1. [🌟 NativeWind v4의 특징과 장점](#1-nativewind-v4의-특징과-장점)
2. [🚀 단계별 설치 및 설정 순서 (Step-by-Step)](#2-단계별-설치-및-설정-순서-step-by-step)
   - [Step 1: 필수 패키지 설치](#step-1-필수-패키지-설치)
   - [Step 2: Tailwind 설정 (`tailwind.config.js`)](#step-2-tailwind-설정-tailwindconfigjs)
   - [Step 3: Metro 번들러 연동 (`metro.config.js`)](#step-3-metro-번들러-연동-metroconfigjs)
   - [Step 4: Babel 트랜스파일러 설정 (`babel.config.js`)](#step-4-babel-트랜스파일러-설정-babelconfigjs)
   - [Step 5: 전역 CSS 파일 생성 (`global.css`)](#step-5-전역-css-파일-생성-globalcss)
   - [Step 6: 루트 레이아웃에 CSS 임포트 (`_layout.jsx`)](#step-6-루트-레이아웃에-css-임포트-_layoutjsx)
   - [Step 7: (선택) TypeScript 타입 선언 (`nativewind-env.d.ts`)](#step-7-선택-typescript-타입-선언-nativewind-envdts)
3. [💻 실제 코드 사용 예시 (기본 문법 & 실전 패턴)](#3-실제-코드-사용-예시-기본-문법--실전-패턴)
4. [⚠️ 실전 개발 시 주의사항 및 최적화 팁](#4-실전-개발-시-주의사항-및-최적화-팁)
5. [🔧 트러블슈팅 FAQ](#5-트러블슈팅-faq)

---

## 1. 🌟 NativeWind v4의 특징과 장점

- **웹과 모바일의 스타일 코드 통일**: React(Web)에서 사용하던 `flex`, `bg-rose-500`, `rounded-2xl`, `p-4` 등의 클래스를 모바일 앱에서도 100% 동일하게 사용합니다.
- **네이티브 런타임 최적화**: `react-native-css-interop` 컴파일러를 통해 빌드 타임에 모바일 네이티브 스타일시트로 사전 변환되므로 런타임 오버헤드가 거의 없습니다.
- **Expo Router & React 19 호환**: Expo SDK 최신 버전의 파일 기반 라우팅 및 New Architecture(Fabric)와 매끄럽게 연동됩니다.

---

## 2. 🚀 단계별 설치 및 설정 순서 (Step-by-Step)

### Step 1: 필수 패키지 설치
모바일 프로젝트 루트 디렉토리(`mobile/`)에서 아래 명령어를 실행하여 NativeWind와 Tailwind CSS, 관련 의존성을 설치합니다.

```bash
cd mobile

# 1. NativeWind 및 CSS Interop 설치
npm install nativewind@^4.1.23 react-native-css-interop@0.2.7

# 2. Tailwind CSS (개발 의존성) 설치
npm install -D tailwindcss@^3.4.17
```

> 💡 **참고**: `react-native-reanimated`와 `react-native-safe-area-context`가 이미 설치되어 있어야 레이아웃과 애니메이션이 안정적으로 작동합니다. (Expo 프로젝트 기본 포함)

---

### Step 2: Tailwind 설정 (`tailwind.config.js`)
프로젝트 루트(`mobile/tailwind.config.js`)에 Tailwind 설정 파일을 생성하고, `content` 경로와 `presets`를 지정합니다.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind 클래스를 적용할 모든 소스 파일 경로를 지정합니다.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  // NativeWind v4 전용 프리셋을 반드시 등록합니다.
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 프로젝트 맞춤 커스텀 색상 등록 예시
        tinder: {
          pink: "#FF4458",
          rose: "#FF6036",
          dark: "#111418",
          gray: "#F0F2F5",
        },
      },
    },
  },
  plugins: [],
};
```

---

### Step 3: Metro 번들러 연동 (`metro.config.js`)
React Native의 Metro 번들러가 `.css` 파일을 인식하고 변환할 수 있도록 `metro.config.js`를 작성합니다.

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// global.css를 입력 파일로 전달하여 Metro 번들러에 통합합니다.
module.exports = withNativeWind(config, { input: "./global.css" });
```

---

### Step 4: Babel 트랜스파일러 설정 (`babel.config.js`)
JSX 코드가 빌드될 때 `className` 속성을 네이티브 `style` 객체로 변환하도록 Babel 설정을 수정합니다.

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // 1. jsxImportSource를 nativewind로 지정
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // 2. nativewind 바벨 플러그인 추가
      "nativewind/babel",
    ],
  };
};
```

---

### Step 5: 전역 CSS 파일 생성 (`global.css`)
프로젝트 루트(`mobile/global.css`)에 Tailwind의 기본 유틸리티 지시문을 포함하는 CSS 파일을 생성합니다.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Step 6: 루트 레이아웃에 CSS 임포트 (`_layout.jsx`)
앱이 구동될 때 가장 먼저 실행되는 최상위 레이아웃(Expo Router의 경우 `src/app/_layout.jsx`, 일반 React Native의 경우 `App.jsx`)의 최상단에서 `global.css`를 불러옵니다.

```jsx
// mobile/src/app/_layout.jsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 🌟 전역 CSS를 반드시 최상단에서 임포트합니다!
import "../../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" />
      </Stack>
    </SafeAreaProvider>
  );
}
```

---

### Step 7: (선택) TypeScript 타입 선언 (`nativewind-env.d.ts`)
TypeScript를 사용하는 프로젝트인 경우, `className` 속성에 대한 타입 에러를 방지하기 위해 프로젝트 루트에 `nativewind-env.d.ts` 파일을 생성합니다.

```typescript
/// <reference types="nativewind/types" />
```

---

## 3. 💻 실제 코드 사용 예시 (기본 문법 & 실전 패턴)

### 1) 기본 뷰와 텍스트 스타일링
```jsx
import { View, Text, TouchableOpacity } from "react-native";
import { Flame } from "lucide-react-native";

export default function SampleCard() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      {/* 카드 박스 */}
      <View className="w-full bg-white rounded-3xl p-5 shadow-lg border border-gray-100 items-center">
        <View className="w-16 h-16 rounded-2xl bg-rose-50 items-center justify-center mb-3">
          <Flame size={32} color="#FF4458" />
        </View>
        
        <Text className="text-xl font-black text-gray-900 tracking-tight">
          틴더 클론 시작하기
        </Text>
        <Text className="text-xs text-gray-500 mt-1 text-center font-medium">
          새로운 인연과의 설레는 만남을 모바일에서 경험해보세요.
        </Text>

        {/* 액션 버튼 */}
        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full mt-5 py-3.5 bg-rose-500 rounded-2xl items-center justify-center shadow-md shadow-rose-500/30"
        >
          <Text className="text-white font-bold text-sm">지금 둘러보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 2) 조건부 스타일링 (Conditional Styling)
```jsx
<Text className={`text-sm font-bold ${isActive ? "text-rose-600" : "text-gray-400"}`}>
  {label}
</Text>
```

---

## 4. ⚠️ 실전 개발 시 주의사항 및 최적화 팁

### 🔴 1. 텍스트 입력창(`TextInput`)의 동적 클래스 컴파일 충돌 방지
- **이슈**: NativeWind v4 환경에서 `TextInput`에 글자를 입력할 때마다 `className={input.trim() ? "bg-rose-500 shadow-md" : "bg-gray-200"}`처럼 복잡한 삼항 연산자와 `shadow-*` 클래스가 동적으로 재계산되면, CSS Interop 파서가 렌더링 도중 레이스 컨디션을 일으켜 React Navigation의 컨텍스트를 유실시키는 에러(`Couldn't find a navigation context`)가 발생할 수 있습니다.
- **해결책**: 실시간으로 상태가 변경되는 텍스트 입력창이나 전송 버튼의 배경색/크기는 **순수 React Native 인라인 `style` 객체**를 사용하는 것이 가장 안정적이고 빠릅니다.

```jsx
// ❌ 위험: 글자 타이핑 시마다 CSS 동적 재컴파일 부하 발생
<TouchableOpacity className={`w-11 h-11 rounded-full ${input.trim() ? "bg-rose-500 shadow-md" : "bg-gray-200"}`} />

// ✅ 안전: 순수 인라인 스타일로 0ms 즉각 반응 보장
<TouchableOpacity
  style={{
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: input.trim() ? "#FF4458" : "#E5E7EB",
  }}
/>
```

### 🟡 2. 미지원 웹 전용 Tailwind 클래스 주의
- 모바일(iOS/Android) 렌더링 엔진은 브라우저의 모든 CSS를 지원하지 않습니다.
  - 지원 안 됨: `grid`, `float`, 복잡한 가상 요소 (`::before`, `::after`)
  - 대체 방법: Flexbox(`flex-row`, `flex-col`, `items-center`, `justify-between`, `gap-2` 등)를 적극 활용하세요.

---

## 5. 🔧 트러블슈팅 FAQ

### Q1. 스타일이 전혀 적용되지 않고 흰 화면이나 기본 스타일로 나옵니다.
- **원인**: Metro 번들러나 Babel의 캐시가 이전 설정을 잡고 있는 경우입니다.
- **해결**: 캐시를 완전히 비우고 다시 실행합니다:
  ```bash
  cd mobile
  npx expo start -c
  ```

### Q2. `Package subpath './src/lib/TerminalReporter' is not defined` 에러가 발생합니다.
- **원인**: Expo SDK 버전과 설치된 `metro` 패키지 버전 간의 불일치입니다.
- **해결**: `mobile/package.json`에서 호환되는 Expo 공식 모듈(`expo@~57.0.x`, `expo-router@~57.0.x`)로 정렬한 뒤 `node_modules`를 삭제하고 재설치합니다.

### Q3. React 19 / Expo SDK 57 업그레이드 후 JSX 에러가 납니다.
- `babel.config.js`의 `presets` 첫 번째 항목에 반드시 `["babel-preset-expo", { jsxImportSource: "nativewind" }]`가 명시되어 있는지 확인하세요.

---

## 📄 요약 체크리스트 (Summary Checklist)
1. `npm install nativewind@^4.1.23 react-native-css-interop@0.2.7 tailwindcss@^3.4.17`
2. `tailwind.config.js`에 `presets: [require("nativewind/preset")]` 등록
3. `metro.config.js`에 `withNativeWind(config, { input: "./global.css" })` 적용
4. `babel.config.js`에 `jsxImportSource: "nativewind"` 및 `"nativewind/babel"` 추가
5. `global.css` 생성 후 최상위 `_layout.jsx`에서 `import "../../global.css"`
6. `npx expo start -c`로 캐시 비우고 산뜻하게 시작! 🚀
