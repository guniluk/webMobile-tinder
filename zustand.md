# 🐻 Zustand 상태 관리 완벽 가이드 (Frontend Web & Mobile Expo)

> **Zustand**(추스탄트)는 React 및 React Native 환경에서 가장 널리 쓰이는 초경량·고성능 **전역 상태 관리(Global State Management) 라이브러리**입니다.  
> 본 문서는 **웹 프론트엔드(React 19 + Vite)**와 **모바일 앱(Expo SDK 57 + React Native)** 각각에서 Zustand 스토어를 설계하고 구축하는 전 과정을 초보자도 쉽게 따라할 수 있도록 단계별로 정리한 가이드입니다.

---

## 📌 목차
1. [🌟 Zustand란? (개념 & 핵심 장점)](#1-zustand란-개념--핵심-장점)
2. [🖥️ 1단계: 웹 프론트엔드(Web) Zustand 구현 가이드](#2-1단계-웹-프론트엔드web-zustand-구현-가이드)
   - [Step 1: 패키지 설치](#step-1-패키지-설치-web)
   - [Step 2: 웹 4대 스토어 구현 (`src/store/`)](#step-2-웹-4대-스토어-구현-srcstore)
   - [Step 3: React 19 컴포넌트에서 상태 구독 및 액션 호출](#step-3-react-19-컴포넌트에서-상태-구독-및-액션-호출)
3. [📱 2단계: 모바일 앱(Expo / Mobile) Zustand 구현 가이드](#3-2단계-모바일-앱expo--mobile-zustand-구현-가이드)
   - [Step 1: 필수 패키지 설치 (Zustand + AsyncStorage)](#step-1-필수-패키지-설치-zustand--asyncstorage)
   - [Step 2: AsyncStorage 비동기 영구 저장 패턴](#step-2-asyncstorage-비동기-영구-저장-패턴)
   - [Step 3: 모바일 4대 스토어 구현 (`mobile/src/store/`)](#step-3-모바일-4대-스토어-구현-mobilesrcstore)
   - [Step 4: Expo Router & 네이티브 UI 연동 (뱃지, 모달, 토스트)](#step-4-expo-router--네이티브-ui-연동-뱃지-모달-토스트)
4. [🔄 Web vs Mobile Zustand 구현 차이점 비교](#4-web-vs-mobile-zustand-구현-차이점-비교)
5. [💡 Zustand 실전 성능 최적화 팁](#5-zustand-실전-성능-최적화-팁)
6. [🔧 트러블슈팅 FAQ](#6-트러블슈팅-faq)

---

## 1. 🌟 Zustand란? (개념 & 핵심 장점)

Zustand는 Redux나 Context API처럼 복잡한 설정(Boilerplate)이나 상위 `<Provider>` 래핑 없이, 자바스크립트 함수 하나로 전역 상태를 만들고 컴포넌트 어디서든 꺼내 쓰는 훅(Hook) 기반 라이브러리입니다.

```
┌───────────────────────────────────────────────────────────┐
│                    Zustand Global Store                   │
│  [ useAuthStore ]     [ useMatchStore ]   [ useMessageStore ]│
│  • user / token       • userProfiles      • messages      │
│  • login() / logout() • swipeRight()      • sendMessage() │
└─────────────────────────────┬─────────────────────────────┘
                              │ 훅(Hook)으로 즉각 구독
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│     🖥️ Web Components      │               │     📱 Mobile Components   │
│  • HomePage, ChatPage     │               │  • Discover, Matches      │
│  • Sidebar, Header        │               │  • MatchModal, ChatScreen │
└───────────────────────────┘               └───────────────────────────┘
```

### 💡 왜 Redux나 Context API 대신 Zustand인가?
- **Provider 불필요**: App 전체를 감싸는 `<Provider>`가 필요 없어 코드가 극도로 깔끔합니다.
- **불필요한 리렌더링 방지**: 필요한 상태 값만 선택(Selector)하여 구독하므로, 다른 값이 바뀌어도 내가 쓰는 컴포넌트는 리렌더링되지 않습니다.
- **초경량 크기 (~1KB)**: 모바일 앱 번들 크기에 부담을 주지 않습니다.

---

## 2. 🖥️ 1단계: 웹 프론트엔드(Web) Zustand 구현 가이드

---

### Step 1: 패키지 설치 (Web)
웹 프로젝트 폴더(`frontend/`)에서 Zustand를 설치합니다.

```bash
cd frontend
npm install zustand
```

---

### Step 2: 웹 4대 스토어 구현 (`src/store/`)

#### ① 인증 스토어 (`frontend/src/store/useAuthStore.js`)
로그인/회원가입/로그아웃 및 웹소켓 연결 수명주기를 관리합니다. (웹 브라우저의 `httpOnly` 쿠키 자동 동봉)

```javascript
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { initializeSocket, disconnectSocket } from "../socket/socket.client";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  onlineUsers: [],
  socket: null,

  // 소켓 연결 액션
  connectSocket: () => {
    const { user } = get();
    if (!user?._id) return;
    const socket = initializeSocket(user._id);
    set({ socket });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    disconnectSocket();
    set({ socket: null, onlineUsers: [] });
  },

  // 로그인 액션
  login: async (email, password) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/auth/login", { email, password });
      set({ user: res.data, isAuthenticated: true, loading: false });
      get().connectSocket(); // 로그인 성공 시 소켓 자동 연결
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 자동 세션 확인 (새로고침 시)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true });
      get().connectSocket();
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    get().disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },
}));
```

#### ② 매칭 스토어 (`frontend/src/store/useMatchStore.js`)
추천 프로필 탐색, 스와이프(좋아요/싫어요) 및 성사된 매치 목록을 관리합니다.

```javascript
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
  userProfiles: [],
  matches: [],
  isLoadingProfiles: false,

  getUserProfiles: async () => {
    set({ isLoadingProfiles: true });
    try {
      const res = await axiosInstance.get("/matches/user-profiles");
      set({ userProfiles: res.data.users || [] });
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  swipeRight: async (user) => {
    // 1. UI에서 즉시 카드 제거 (Optimistic UI)
    set((state) => ({
      userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
    }));
    // 2. 서버에 좋아요 요청
    await axiosInstance.post(`/matches/swipe-right/${user._id}`);
  },

  swipeLeft: async (user) => {
    set((state) => ({
      userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
    }));
    await axiosInstance.post(`/matches/swipe-left/${user._id}`);
  },

  getMyMatches: async () => {
    const res = await axiosInstance.get("/matches");
    set({ matches: res.data.matches || [] });
  },
}));
```

#### ③ 메시지 스토어 (`frontend/src/store/useMessageStore.js`)
대화 내역 조회, 메시지 발송, 실시간 수신 및 사이드바 비행기(✈️) 뱃지를 관리합니다.

```javascript
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../socket/socket.client";

export const useMessageStore = create((set, get) => ({
  messages: [],
  unreadSenders: [],       // 안 읽은 메시지가 도착한 유저 ID 목록
  activeChatUserId: null,  // 현재 열려있는 대화방 상대 ID

  setActiveChatUserId: (userId) => {
    set({ activeChatUserId: userId });
    if (userId) get().markAsRead(userId);
  },

  markAsRead: (userId) => {
    set((state) => ({
      unreadSenders: state.unreadSenders.filter((id) => id !== userId),
    }));
  },

  getMessages: async (userId) => {
    const res = await axiosInstance.get(`/messages/conversation/${userId}`);
    set({ messages: res.data.messages || [] });
    get().markAsRead(userId);
  },

  sendMessage: async (receiverId, content) => {
    const res = await axiosInstance.post("/messages/send", { receiverId, content });
    set((state) => ({ messages: [...state.messages, res.data.newMessage] }));
  },

  subscribeToGlobalMessages: () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const senderId = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;
      const { activeChatUserId, unreadSenders } = get();

      if (activeChatUserId === senderId) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      } else {
        if (!unreadSenders.includes(senderId)) {
          set({ unreadSenders: [...unreadSenders, senderId] });
        }
      }
    });
  },
}));
```

---

### Step 3: React 19 컴포넌트에서 상태 구독 및 액션 호출
```jsx
// frontend/src/components/Sidebar.jsx
import React, { useEffect } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send } from "lucide-react";

export default function Sidebar() {
  const { matches, getMyMatches } = useMatchStore();
  const { unreadSenders } = useMessageStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyMatches();
  }, []);

  return (
    <aside className="w-80 bg-white border-r p-4">
      <h2 className="font-bold text-lg mb-4">매치 목록 ({matches.length})</h2>
      {matches.map((match) => {
        const isOnline = onlineUsers.includes(match._id);
        const hasUnread = unreadSenders.includes(match._id);

        return (
          <div key={match._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
            {/* 아바타 & 실시간 온라인/비행기 뱃지 */}
            <div className="relative">
              <img src={match.image} className="w-12 h-12 rounded-full object-cover" />
              {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />}
              {hasUnread && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                  <Send size={10} className="text-white" />
                </div>
              )}
            </div>
            <span className="font-semibold text-gray-800">{match.name}</span>
          </div>
        );
      })}
    </aside>
  );
}
```

---

## 3. 📱 2단계: 모바일 앱(Expo / Mobile) Zustand 구현 가이드

모바일 앱에서는 브라우저의 쿠키를 사용할 수 없으므로, **AsyncStorage와 Zustand를 결합**하여 Bearer 토큰을 스마트폰에 영구 보존하고 자동 로그인 세션을 관리합니다.

---

### Step 1: 필수 패키지 설치 (Zustand + AsyncStorage)
모바일 디렉토리(`mobile/`)에서 패키지를 설치합니다.

```bash
cd mobile
npm install zustand @react-native-async-storage/async-storage
```

---

### Step 2: AsyncStorage 비동기 영구 저장 패턴
- 모바일 앱이 실행될 때 `AsyncStorage.getItem("tinder_jwt_token")`으로 저장된 토큰을 읽어옵니다.
- 로그인/회원가입 시 `AsyncStorage.setItem("tinder_jwt_token", token)`으로 토큰을 보관합니다.
- 로그아웃 시 `AsyncStorage.removeItem("tinder_jwt_token")`으로 토큰을 파기합니다.

---

### Step 3: 모바일 4대 스토어 구현 (`mobile/src/store/`)

#### ① 모바일 인증 스토어 (`mobile/src/store/useAuthStore.js`)
```javascript
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import { initializeSocket, disconnectSocket } from "../lib/socket";

const TOKEN_KEY = "tinder_jwt_token";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  loading: false,
  onlineUsers: [],

  connectSocket: (userId, token) => {
    if (!userId) return;
    const socket = initializeSocket(userId, token);
    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  // 1. 앱 시작 시 토큰 검증 및 자동 로그인
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
        return;
      }
      const res = await api.get("/auth/me");
      set({ user: res.data.user, token, isAuthenticated: true });
      get().connectSocket(res.data.user._id, token);
    } catch (error) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // 2. 로그인 (토큰을 AsyncStorage에 영구 저장)
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);

      set({ user, token, isAuthenticated: true, loading: false });
      get().connectSocket(user._id, token);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 3. 로그아웃 (저장된 토큰 파기 및 소켓 해제)
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, onlineUsers: [] });
  },
}));
```

#### ② 모바일 매칭 스토어 (`mobile/src/store/useMatchStore.js`)
신규 가입자 소켓 이벤트(`newUserRegistered`)와 전신 매치 축하 모달(`newMatchModalUser`)을 관리합니다.

```javascript
import { create } from "zustand";
import api from "../lib/api";
import { getSocket } from "../lib/socket";

export const useMatchStore = create((set, get) => ({
  userProfiles: [],
  matches: [],
  isLoadingProfiles: false,
  newMatchModalUser: null, // 상호 매칭 시 화면을 덮을 유저 객체

  clearNewMatchModalUser: () => set({ newMatchModalUser: null }),

  getUserProfiles: async () => {
    set({ isLoadingProfiles: true });
    try {
      const res = await api.get("/matches/user-profiles");
      set({ userProfiles: res.data.users || [] });
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  swipeRight: async (user) => {
    set((state) => ({
      userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
    }));
    const res = await api.post(`/matches/swipe-right/${user._id}`);
    // 상호 매치 성사 시 모달 즉시 표시
    if (res.data.isMatch) {
      set({ newMatchModalUser: user });
      get().getMyMatches();
    }
  },

  swipeLeft: async (user) => {
    set((state) => ({
      userProfiles: state.userProfiles.filter((p) => p._id !== user._id),
    }));
    await api.post(`/matches/swipe-left/${user._id}`);
  },

  getMyMatches: async () => {
    const res = await api.get("/matches");
    set({ matches: res.data.matches || [] });
  },

  // 실시간 매치 및 신규 가입자 소켓 구독
  subscribeToNewMatches: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("newMatch");
    socket.on("newMatch", (matchUser) => {
      set({ newMatchModalUser: matchUser });
      get().getMyMatches();
    });

    socket.off("newUserRegistered");
    socket.on("newUserRegistered", (newRegisteredUser) => {
      const { userProfiles } = get();
      if (!userProfiles.some((u) => u._id === newRegisteredUser._id)) {
        set({ userProfiles: [...userProfiles, newRegisteredUser] });
      }
    });
  },
}));
```

#### ③ 모바일 메시지 스토어 (`mobile/src/store/useMessageStore.js`)
실시간 메시지 수신 시 상단 인앱 토스트(`newMessageAlert`)와 탭바 안 읽은 뱃지(`unreadSenders`)를 제어합니다.

```javascript
import { create } from "zustand";
import api from "../lib/api";
import { getSocket } from "../lib/socket";

export const useMessageStore = create((set, get) => ({
  messages: [],
  unreadSenders: [],
  activeChatUserId: null,
  newMessageAlert: null, // 상단 토스트로 띄울 메시지 객체

  clearNewMessageAlert: () => set({ newMessageAlert: null }),

  setActiveChatUserId: (userId) => {
    set({ activeChatUserId: userId });
    if (userId) get().markAsRead(userId);
  },

  markAsRead: (userId) => {
    set((state) => ({
      unreadSenders: state.unreadSenders.filter((id) => id !== userId),
    }));
  },

  getMessages: async (userId) => {
    const res = await api.get(`/messages/conversation/${userId}`);
    set({ messages: res.data.messages || [] });
    get().markAsRead(userId);
  },

  sendMessage: async (receiverId, content) => {
    const res = await api.post("/messages/send", { receiverId, content });
    set((state) => ({ messages: [...state.messages, res.data.newMessage] }));
  },

  subscribeToGlobalMessages: () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const senderId = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;
      const { activeChatUserId, unreadSenders } = get();

      if (activeChatUserId === senderId) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      } else {
        if (!unreadSenders.includes(senderId)) {
          set({
            unreadSenders: [...unreadSenders, senderId],
            newMessageAlert: newMessage, // 토스트 팝업 트리거!
          });
        }
      }
    });
  },
}));
```

---

### Step 4: Expo Router & 네이티브 UI 연동 (뱃지, 모달, 토스트)

#### 1) 탭바 안 읽은 숫자 뱃지 (`mobile/src/app/(tabs)/_layout.jsx`)
```jsx
export default function TabLayout() {
  const { unreadSenders } = useMessageStore();
  const unreadCount = unreadSenders.length;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "디스커버" }} />
      <Tabs.Screen
        name="matches"
        options={{
          title: "매치 & 채팅",
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageCircleHeart size={size} color={color} />
              {/* 🔴 실시간 빨간색 뱃지 표시 */}
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "프로필" }} />
    </Tabs>
  );
}
```

---

## 4. 🔄 Web vs Mobile Zustand 구현 차이점 비교

| 비교 항목 | 🖥️ Frontend Web (React) | 📱 Mobile App (Expo / React Native) |
|---|---|---|
| **토큰 저장 방식** | `httpOnly` 쿠키 (브라우저 자동 관리) | `AsyncStorage` 플래시 메모리 (수동 읽기/쓰기) |
| **초기 인증 복원** | `axiosInstance.get("/auth/me")` | `AsyncStorage.getItem()` ➔ `api.get("/auth/me")` |
| **API 요청 헤더** | `withCredentials: true` | `Authorization: Bearer <token>` 인터셉터 주입 |
| **알림 UI 렌더링** | `react-hot-toast` (`toast()`) | 네이티브 애니메이션 토스트 (`MessageToast.jsx`) |
| **매칭 축하 팝업** | 팝업 토스트 / 웹 다이얼로그 | 전신 풀스크린 모달 (`MatchModal.jsx`) |
| **안 읽은 알림 표시** | 사이드바 비행기(✈️) 뱃지 | 하단 탭바 숫자 뱃지 (`9+`) |
| **라우팅 제어** | `useNavigate()` (React Router) | `router` 싱글톤 (Expo Router) |

---

## 5. 💡 Zustand 실전 성능 최적화 팁

### 1) 선택자(Selector)를 활용한 렌더링 최소화
스토어 전체를 가져오지 않고 필요한 필드만 가져오면 다른 상태가 변해도 리렌더링되지 않습니다.

```javascript
// ❌ 비효율: 스토어 내 다른 값(예: messages)이 바뀌어도 리렌더링됨
const { user } = useAuthStore();

// ✅ 최적화: 오직 user 객체가 변경될 때만 리렌더링됨
const user = useAuthStore((state) => state.user);
```

### 2) `set()`과 `get()`의 스마트한 비동기 활용
액션 함수 내부에서 현재 상태를 읽어올 때 `get()`을 사용하면 클로저 문제 없이 항상 최신 상태를 참조할 수 있습니다.

```javascript
swipeRight: async (user) => {
  // get()으로 항상 최신 userProfiles 배열을 참조
  const currentProfiles = get().userProfiles;
  set({ userProfiles: currentProfiles.filter((u) => u._id !== user._id) });
}
```

---

## 6. 🔧 트러블슈팅 FAQ

### Q1. 모바일에서 앱을 재시작하면 로그인이 풀립니다.
- **원인**: 토큰을 메모리(Zustand)에만 저장하고 `AsyncStorage`에 쓰지 않았거나, `checkAuth`가 앱 엔트리(`src/app/index.jsx`)에서 호출되지 않은 경우입니다.
- **해결**: 로그인 성공 시 `await AsyncStorage.setItem("tinder_jwt_token", token)`을 실행하고, `src/app/index.jsx`의 `useEffect`에서 `checkAuth()`를 반드시 호출하세요.

### Q2. 컴포넌트 렌더링 중 `Couldn't find a navigation context` 에러가 납니다.
- **원인**: 스토어 내부나 전역 모달에서 `useRouter()` 훅을 컴포넌트 렌더링 타이밍과 맞지 않게 호출한 경우입니다.
- **해결**: 훅 대신 Expo Router의 전역 싱글톤 객체인 `import { router } from "expo-router"`를 사용하세요.

---

## 📄 요약 체크리스트 (Summary Checklist)
1. **웹**: `npm install zustand` ➔ 쿠키 기반 세션 및 사이드바 뱃지 연동
2. **모바일**: `npm install zustand @react-native-async-storage/async-storage` ➔ Bearer 토큰 영구 저장 및 탭바 뱃지/모달 연동
3. **공통**: `create((set, get) => ({ state, actions }))` 패턴으로 백엔드 API 및 소켓과 100% 매끄럽게 연결! 🚀
