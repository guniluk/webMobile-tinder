# ⚡ Socket.IO 실시간 통신 완벽 가이드 (Backend, Web, Mobile)

> **Socket.IO**를 활용하여 **Node.js 백엔드**, **React 웹 프론트엔드**, **React Native (Expo) 모바일 앱** 간에 실시간 양방향 통신을 구현하는 종합 개발 가이드입니다.  
> 초보자도 쉽게 따라할 수 있도록 각 플랫폼별 **설치 ➔ 클라이언트 설정 ➔ 상태 관리(Zustand) 연동 ➔ UI 렌더링**의 단계별 절차와 실제 코드를 상세히 정리했습니다.

---

## 📌 목차
1. [🌟 3자(Backend ↔ Web ↔ Mobile) 실시간 아키텍처](#1-3자backend--web--mobile-실시간-아키텍처)
2. [⚙️ 1단계: 백엔드(Backend) 구현 절차 및 방법](#2-1단계-백엔드backend-구현-절차-및-방법)
   - [Step 1: Socket.IO 패키지 설치](#step-1-socketio-패키지-설치)
   - [Step 2: HTTP 서버와 소켓 서버 바인딩 (`server.js`)](#step-2-http-서버와-소켓-서버-바인딩-serverjs)
   - [Step 3: 유저 매핑 및 접속 수명주기 관리 (`socket.server.js`)](#step-3-유저-매핑-및-접속-수명주기-관리-socketserverjs)
   - [Step 4: 컨트롤러에서 실시간 이벤트 발송 (`controllers/`)](#step-4-컨트롤러에서-실시간-이벤트-발송-controllers)
3. [🖥️ 2단계: 프론트엔드(Web) 구현 절차 및 방법](#3-2단계-프론트엔드web-구현-절차-및-방법)
   - [Step 1: Socket.IO Client 설치](#step-1-socketio-client-설치)
   - [Step 2: 소켓 싱글톤 클라이언트 생성 (`socket.client.js`)](#step-2-소켓-싱글톤-클라이언트-생성-socketclientjs)
   - [Step 3: Zustand 스토어와 소켓 연결 (`useAuthStore.js`)](#step-3-zustand-스토어와-소켓-연결-useauthstorejs)
   - [Step 4: 실시간 메시지 & 안 읽은 비행기(✈️) 뱃지 구현](#step-4-실시간-메시지--안-읽은-비행기-뱃지-구현)
4. [📱 3단계: 모바일(Expo / Mobile) 구현 절차 및 방법](#4-3단계-모바일expo--mobile-구현-절차-및-방법)
   - [Step 1: 모바일 클라이언트 패키지 설치](#step-1-모바일-클라이언트-패키지-설치)
   - [Step 2: LAN IP 자동 감지형 소켓 클라이언트 (`lib/socket.js`)](#step-2-lan-ip-자동-감지형-소켓-클라이언트-libsocketjs)
   - [Step 3: 모바일 인증 스토어와 소켓 라이프사이클 (`store/useAuthStore.js`)](#step-3-모바일-인증-스토어와-소켓-라이프사이클-storeuseauthstorejs)
   - [Step 4: 전역 탭 레이아웃에서 소켓 구독 (`(tabs)/_layout.jsx`)](#step-4-전역-탭-레이아웃에서-소켓-구독-tabs_layoutjsx)
   - [Step 5: 모바일 4대 실시간 컴포넌트 구현 (모달, 토스트, 뱃지, 대화방)](#step-5-모바일-4대-실시간-컴포넌트-구현-모달-토스트-뱃지-대화방)
5. [🌐 Web ↔ Mobile 크로스 플랫폼 실전 동작 시나리오](#5-web--mobile-크로스-플랫폼-실전-동작-시나리오)
6. [🔧 트러블슈팅 및 필수 주의사항](#6-트러블슈팅-및-필수-주의사항)

---

## 1. 🌟 3자(Backend ↔ Web ↔ Mobile) 실시간 아키텍처

하나의 Socket.IO 서버가 웹과 모바일의 접속을 모두 수용하며, 클라이언트의 플랫폼에 상관없이 `userId`를 기반으로 타겟팅 전송 및 전체 브로드캐스트를 수행합니다.

```
                         ┌──────────────────────────────┐
                         │   Node.js Socket.IO Server   │
                         │ userSocketMap: { userId: id }│
                         └──────────────┬───────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             │ io.emit("getOnlineUsers")                           │
             │ io.to(targetSocketId).emit("newMessage")            │
             │ io.to(targetSocketId).emit("newMatch")              │
             │ io.emit("newUserRegistered")                        │
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│     🖥️ Web Frontend     │ ◀─── Cross-Platform ───▶ │      📱 Mobile App      │
│  (React 19 + Zustand)   │      Realtime Chat    │   (Expo SDK 57 + Zustand│
│  • 초록색 온라인 점     │                       │  • 상단 실시간 접속자 수│
│  • 비행기(✈️) 읽지않음  │                       │  • 상단 인앱 토스트 알림│
│  • 실시간 매치 팝업     │                       │  • 전신 매칭 축하 모달  │
└─────────────────────────┘                               └─────────────────────────┘
```

---

## 2. ⚙️ 1단계: 백엔드(Backend) 구현 절차 및 방법

---

### Step 1: Socket.IO 패키지 설치
백엔드 디렉토리(`backend/`)에서 `socket.io` 패키지를 설치합니다.

```bash
cd backend
npm install socket.io
```

---

### Step 2: HTTP 서버와 소켓 서버 바인딩 (`backend/src/server.js`)
Express 앱과 Node.js 기본 `httpServer`를 결합하여 동일한 포트(예: 3000)에서 REST API와 WebSocket 프로토콜을 동시에 수신합니다.

```javascript
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initializeSocket } from "./socket/socket.server.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Node.js HTTP 서버 생성 및 Socket.IO 바인딩
const httpServer = createServer(app);
initializeSocket(httpServer);

// 2. CORS 설정 (웹 브라우저 및 모바일 접속 허용)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || true
        : ["http://localhost:5173", "http://localhost:3000", process.env.DEVELOPMENT_URL].filter(Boolean),
    credentials: true,
  }),
);

// 3. 반드시 app.listen() 대신 httpServer.listen()을 사용해야 소켓 요청을 받습니다!
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

### Step 3: 유저 매핑 및 접속 수명주기 관리 (`backend/src/socket/socket.server.js`)
어떤 사용자가 어떤 소켓 ID로 연결되어 있는지 기록하는 `userSocketMap`을 관리합니다.

```javascript
import { Server } from "socket.io";

let io;

// 유저 ID ➔ 소켓 ID 매핑 객체 { "65f123...": "socket_abc123" }
const userSocketMap = {};

// 특정 유저의 socket.id를 찾는 헬퍼 함수
export const getReceiverSocketId = (userId) => userSocketMap[userId];

export const getIO = () => {
  if (!io) throw new Error("Socket.IO is not initialized!");
  return io;
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL || true
          : ["http://localhost:5173", "http://localhost:3000", process.env.DEVELOPMENT_URL].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // 1. 클라이언트가 연결할 때 쿼리로 전달한 userId 추출
    const userId = socket.handshake.query.userId;
    console.log(`⚡ Socket connected: ${socket.id} (User: ${userId || "Anonymous"})`);

    // 2. 유효한 유저인 경우 맵에 등록
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // 3. 현재 접속 중인 전체 유저 ID 목록을 모든 클라이언트에 브로드캐스트
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // 4. 연결 종료 시 매핑에서 제거하고 온라인 목록 다시 브로드캐스트
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};
```

---

### Step 4: 컨트롤러에서 실시간 이벤트 발송 (`controllers/`)

#### ① 메시지 전송 시 (`message.controller.js`)
```javascript
import { getReceiverSocketId, getIO } from "../socket/socket.server.js";

export const sendMessage = async (req, res) => {
  const { content, receiverId } = req.body;
  const senderId = req.user._id;

  // DB에 메시지 저장
  const newMessage = await Message.create({ senderId, receiverId, content, conversationId });

  // 수신자가 현재 온라인이면 실시간으로 메시지 전송!
  try {
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  } catch (socketError) {
    console.log("Socket emit error:", socketError.message);
  }

  res.status(201).json({ success: true, newMessage });
};
```

#### ② 상호 매칭 성사 시 (`match.controller.js`)
```javascript
import { getReceiverSocketId, getIO } from "../socket/socket.server.js";

// 양방향 좋아요가 성사되었을 때
if (likedUser.likes.includes(currentUser._id)) {
  currentUser.matches.push(likedUserId);
  likedUser.matches.push(currentUser._id);
  await Promise.all([currentUser.save(), likedUser.save()]);

  // 상대방에게 즉시 newMatch 이벤트 전송
  try {
    const receiverSocketId = getReceiverSocketId(likedUserId.toString());
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit("newMatch", {
        _id: currentUser._id,
        name: currentUser.name,
        image: currentUser.image,
      });
    }
  } catch (err) {
    console.log("Socket match emit error:", err.message);
  }
}
```

#### ③ 신규 회원가입 시 (`auth.controller.js`)
```javascript
// 새로운 유저가 가입하면 모든 클라이언트의 디스커버 스택 실시간 갱신
try {
  const io = getIO();
  io.emit("newUserRegistered", {
    _id: newUser._id,
    name: newUser.name,
    gender: newUser.gender,
  });
} catch (err) {}
```

---

## 3. 🖥️ 2단계: 프론트엔드(Web) 구현 절차 및 방법

---

### Step 1: Socket.IO Client 설치
웹 디렉토리(`frontend/`)에서 클라이언트 라이브러리를 설치합니다.

```bash
cd frontend
npm install socket.io-client
```

---

### Step 2: 소켓 싱글톤 클라이언트 생성 (`frontend/src/socket/socket.client.js`)
중복 연결을 방지하고 한 번 연결된 소켓 인스턴스를 전역에서 재사용할 수 있도록 관리합니다.

```javascript
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:3000" : "/");

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

### Step 3: Zustand 스토어와 소켓 연결 (`frontend/src/store/useAuthStore.js`)
로그인하거나 세션이 확인(`checkAuth`)되면 자동으로 소켓을 연결하고, `getOnlineUsers`를 구독합니다.

```javascript
import { create } from "zustand";
import { initializeSocket, disconnectSocket } from "../socket/socket.client";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { user } = get();
    if (!user?._id) return;

    const socket = initializeSocket(user._id);
    set({ socket });

    // 실시간 온라인 접속자 목록 갱신
    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    disconnectSocket();
    set({ socket: null, onlineUsers: [] });
  },

  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    set({ user: res.data, isAuthenticated: true });
    get().connectSocket(); // 로그인 즉시 소켓 연결!
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    get().disconnectSocket(); // 로그아웃 시 소켓 정리!
    set({ user: null, isAuthenticated: false });
  },
}));
```

---

### Step 4: 실시간 메시지 & 안 읽은 비행기(✈️) 뱃지 구현 (`useMessageStore.js`)
```javascript
export const useMessageStore = create((set, get) => ({
  messages: [],
  unreadSenders: [],       // 안 읽은 메시지가 도착한 유저 ID 목록
  activeChatUserId: null,  // 현재 대화방에서 바라보고 있는 상대방 ID

  setActiveChatUserId: (userId) => {
    set({ activeChatUserId: userId });
    if (userId) get().markAsRead(userId); // 대화방 입장 시 뱃지 제거
  },

  markAsRead: (userId) => {
    set((state) => ({
      unreadSenders: state.unreadSenders.filter((id) => id !== userId),
    }));
  },

  subscribeToGlobalMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const senderId = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;
      const { activeChatUserId, unreadSenders } = get();

      // 현재 그 유저와의 채팅방을 보고 있는 중이면 말풍선 추가
      if (activeChatUserId === senderId) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      } else {
        // 다른 페이지나 다른 대화방에 있으면 사이드바에 비행기(✈️) 뱃지 추가!
        if (!unreadSenders.includes(senderId)) {
          set({ unreadSenders: [...unreadSenders, senderId] });
        }
      }
    });
  },
}));
```

---

## 4. 📱 3단계: 모바일(Expo / Mobile) 구현 절차 및 방법

모바일 앱은 스마트폰 실물 기기의 Wi-Fi 환경과 AsyncStorage를 고려하여 구성합니다.

---

### Step 1: 모바일 클라이언트 패키지 설치
모바일 디렉토리(`mobile/`)에서 `socket.io-client`를 설치합니다.

```bash
cd mobile
npm install socket.io-client
```

---

### Step 2: LAN IP 자동 감지형 소켓 클라이언트 (`mobile/src/lib/socket.js`)
스마트폰이 개발자 PC의 백엔드 주소를 스스로 찾아 연결하도록 `theme.js`의 자동 주소 해석기를 결합합니다.

```javascript
import { io } from "socket.io-client";
import { getSocketUrl } from "../constants/theme";

let socket = null;

export const initializeSocket = (userId, token) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  // 🌐 자동으로 PC의 LAN IP (예: http://192.168.0.15:3000)를 감지하여 연결!
  const socketUrl = getSocketUrl();
  console.log("⚡ [Tinder Mobile] Connecting Socket to:", socketUrl);

  socket = io(socketUrl, {
    query: { userId, token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

### Step 3: 모바일 인증 스토어와 소켓 라이프사이클 (`store/useAuthStore.js`)
`AsyncStorage`에서 토큰을 불러올 때 소켓을 함께 연결합니다.

```javascript
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSocket, disconnectSocket } from "../lib/socket";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  onlineUsers: [],

  connectSocket: (userId, token) => {
    if (!userId) return;
    const socket = initializeSocket(userId, token);

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  checkAuth: async () => {
    const token = await AsyncStorage.getItem("tinder_jwt_token");
    if (!token) return;
    
    const res = await api.get("/auth/me");
    set({ user: res.data.user, token, isAuthenticated: true });
    get().connectSocket(res.data.user._id, token);
  },

  logout: async () => {
    await AsyncStorage.removeItem("tinder_jwt_token");
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, onlineUsers: [] });
  },
}));
```

---

### Step 4: 전역 탭 레이아웃에서 소켓 구독 (`mobile/src/app/(tabs)/_layout.jsx`)
사용자가 로그인되어 메인 탭바에 진입하면 전역 소켓 리스너를 한 번만 마운트합니다.

```jsx
export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { unreadSenders, subscribeToGlobalMessages, unsubscribeFromGlobalMessages } = useMessageStore();
  const { subscribeToNewMatches, unsubscribeFromNewMatches } = useMatchStore();

  const unreadCount = unreadSenders.length;

  useEffect(() => {
    if (isAuthenticated) {
      subscribeToNewMatches();        // 💖 실시간 매치 구독
      subscribeToGlobalMessages();   // 💬 실시간 메시지 구독
    }

    return () => {
      unsubscribeFromNewMatches();
      unsubscribeFromGlobalMessages();
    };
  }, [isAuthenticated]);

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "디스커버" }} />
        <Tabs.Screen
          name="matches"
          options={{
            title: "매치 & 채팅",
            tabBarIcon: ({ color, size }) => (
              <View>
                <MessageCircleHeart size={size} color={color} />
                {/* 🔴 실시간 안 읽은 메시지 숫자 배지 */}
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

      {/* 🌟 전역 실시간 매치 축하 모달 & 메시지 토스트 */}
      <MatchModal />
      <MessageToast />
    </>
  );
}
```

---

### Step 5: 모바일 4대 실시간 컴포넌트 구현 (모달, 토스트, 뱃지, 대화방)

#### 1) 💖 전신 매치 축하 모달 (`components/MatchModal.jsx`)
```jsx
// useMatchStore에서 newMatch 이벤트를 받아 modalUser에 저장
export const MatchModal = () => {
  const { newMatchModalUser, clearNewMatchModalUser } = useMatchStore();
  if (!newMatchModalUser) return null;

  return (
    <Modal transparent animationType="fade" visible={Boolean(newMatchModalUser)}>
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <Text className="text-4xl font-black text-rose-400 italic mb-2">IT'S A MATCH!</Text>
        <Text className="text-white text-base mb-8">{newMatchModalUser.name}님과 서로 매칭되었습니다!</Text>
        <TouchableOpacity 
          onPress={() => {
            clearNewMatchModalUser();
            router.push(`/chat/${newMatchModalUser._id}`);
          }}
          className="w-full py-4 bg-rose-500 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-base">메시지 보내기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

#### 2) ✈️ 상단 인앱 메시지 알림 토스트 (`components/MessageToast.jsx`)
```jsx
// 다른 화면에 있을 때 새 메시지가 오면 상단에서 스프링 애니메이션으로 하강
export const MessageToast = () => {
  const { newMessageAlert, clearNewMessageAlert } = useMessageStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (newMessageAlert) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      const timer = setTimeout(() => handleDismiss(), 4000);
      return () => clearTimeout(timer);
    }
  }, [newMessageAlert]);

  if (!newMessageAlert) return null;

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], position: "absolute", top: 50, left: 16, right: 16, zIndex: 9999 }}>
      <TouchableOpacity 
        onPress={() => {
          handleDismiss();
          router.push(`/chat/${newMessageAlert.senderId}`);
        }}
        className="bg-gray-900/95 p-3.5 rounded-2xl flex-row items-center border border-gray-700 shadow-2xl"
      >
        <View className="flex-1 ml-2">
          <Text className="text-white font-bold text-sm">{newMessageAlert.senderId?.name || "새 메시지"}</Text>
          <Text numberOfLines={1} className="text-gray-300 text-xs">{newMessageAlert.content}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

#### 3) 🔄 신규 가입자 실시간 디스커버 스택 추가 (`useMatchStore.js`)
```javascript
subscribeToNewMatches: () => {
  const socket = getSocket();
  if (!socket) return;

  // 신규 가입자 등록 소켓 수신 시 새로고침 없이 추천 카드에 즉시 추가!
  socket.on("newUserRegistered", (newRegisteredUser) => {
    const { userProfiles } = get();
    const isAlreadyInList = userProfiles.some((u) => u._id === newRegisteredUser._id);
    if (!isAlreadyInList) {
      set({ userProfiles: [...userProfiles, newRegisteredUser] });
    }
  });
}
```

---

## 5. 🌐 Web ↔ Mobile 크로스 플랫폼 실전 동작 시나리오

```
[Web 사용자 (철수)]                             [Mobile 사용자 (영희)]
      │                                                │
      │ 1. 웹 브라우저에서 영희 프로필 스와이프 (Like)    │
      ├───────────────────────▶                        │
      │ (영희도 이미 철수를 Like한 상태)                 │
      │                                                │
      │ 2. 백엔드에서 newMatch 이벤트 양방향 발송       │
      │ ◀────────────────────────────────────────────▶ │
      │ [웹: 토스트 팝업 🎉]                           │ [모바일: IT'S A MATCH 전신 모달!]
      │                                                │
      │ 3. 웹에서 영희에게 "안녕 모바일!" 전송           │
      ├───────────────────────────────────────────────▶│
      │                                                │ 4. 모바일 화면 상단에
      │                                                │    "MessageToast" 알림 하강 ✈️
      │                                                │ 5. 하단 탭바에 빨간색 "1" 뱃지 표시
      │                                                │ 6. 토스트 터치 시 1:1 대화방 즉시 진입
      │                                                │ 7. 영희가 답장하면 웹 대화창에 0초 즉각 렌더링!
```

---

## 6. 🔧 트러블슈팅 및 필수 주의사항

### 1. 모바일 Wi-Fi 연결 불가 (Network Error)
- **원인**: 컴퓨터와 스마트폰이 서로 다른 Wi-Fi에 연결되어 있거나, 공유기가 내부 IP 통신을 차단하는 경우입니다.
- **해결**: 스마트폰과 컴퓨터를 **동일한 Wi-Fi**에 연결하거나, 스마트폰의 **개인용 핫스팟**을 켜서 컴퓨터를 연결하세요.

### 2. 중복 리스너 등록으로 인한 메시지 2번 수신 방지
- **원인**: 컴포넌트가 리렌더링될 때 `socket.on("newMessage")`가 계속 중복 등록되는 현상입니다.
- **해결**: 항상 리스너를 등록하기 전에 `socket.off("eventName")`을 호출하여 이전 리스너를 초기화하세요.
  ```javascript
  socket.off("newMessage");
  socket.on("newMessage", handleNewMessage);
  ```

### 3. 대화방 입장 시 안 읽은 메시지(✈️) 즉시 해제
- 사용자가 특정 유저와의 대화방에 진입하면 `activeChatUserId`를 상대방의 `_id`로 설정하고, `markAsRead(userId)`를 호출하여 전역 `unreadSenders` 목록에서 제거합니다.

---

## 📄 요약
- **백엔드**: `httpServer`에 `socket.io`를 바인딩하고, `userSocketMap`에 유저 ID와 소켓 ID를 보관합니다.
- **웹 프론트엔드**: React 19 + Zustand에서 `socket.client.js`를 연결하여 온라인 상태와 비행기(✈️) 뱃지를 제어합니다.
- **모바일 앱**: Expo SDK 57에서 `lib/socket.js`를 통해 PC의 LAN IP로 자동 접속하며, 전역 `MatchModal`과 `MessageToast`로 푸시 알림 수준의 실시간 UX를 제공합니다.

---

✅ 본 가이드를 통해 백엔드, 웹, 모바일 3개 플랫폼의 모든 실시간 통신을 완벽하게 구축할 수 있습니다.
