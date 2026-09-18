# 🔄 TanStack Query (React Query) 모바일 완벽 가이드

> **TanStack Query**(구 React Query)는 React 및 React Native(Expo) 환경에서 **서버 상태(Server State) 관리, 캐싱, 비동기 데이터 동기화**를 가장 우아하고 강력하게 처리해주는 라이브러리입니다.  
> 본 문서는 **모바일 앱(React Native / Expo)** 환경에서 TanStack Query를 처음 접하는 초보자도 쉽게 이해하고 실전에 바로 적용할 수 있도록 **개념, Zustand와의 완벽 비교, 설치 및 모바일 최적화 설정, 핵심 훅(Hook) 사용법, 실전 예시 코드**까지 단계별로 상세히 정리한 가이드입니다.

---

## 📌 목차
1. [🌟 TanStack Query란? (개념 & 필요성)](#1-tanstack-query란-개념--필요성)
2. [⚔️ TanStack Query vs Zustand 완벽 비교](#2-tanstack-query-vs-zustand-완벽-비교)
   - [공통점 (비슷한 점)](#공통점-비슷한-점)
   - [차이점 (핵심 비교표)](#차이점-핵심-비교표)
   - [언제 무엇을 써야 할까? (역할 분담 기준)](#언제-무엇을-써야-할까-역할-분담-기준)
3. [📱 모바일(Expo/RN) 초기 설정 및 설치 절차](#3-모바일exporn-초기-설정-및-설치-절차)
   - [Step 1: 패키지 설치](#step-1-패키지-설치)
   - [Step 2: 모바일 특화 설정 (네트워크 상태 & 포커스 매니저)](#step-2-모바일-특화-설정-네트워크-상태--포커스-매니저)
   - [Step 3: QueryClientProvider 래핑 (`_layout.jsx`)](#step-3-queryclientprovider-래핑-_layoutjsx)
4. [🚀 핵심 기능 & 실전 사용법 (Code Examples)](#4-핵심-기능--실전-사용법-code-examples)
   - [1) 데이터 조회 (`useQuery`) & Pull-to-Refresh](#1-데이터-조회-usequery--pull-to-refresh)
   - [2) 데이터 변경 (`useMutation`) & 캐시 갱신 (`invalidateQueries`)](#2-데이터-변경-usemutation--캐시-갱신-invalidatequeries)
   - [3) 낙관적 업데이트 (Optimistic Updates - 틴더 스와이프 예시)](#3-낙관적-업데이트-optimistic-updates---틴더-스와이프-예시)
   - [4) 무한 스크롤 (`useInfiniteQuery` + `FlatList`)](#4-무한-스크롤-useinfinitequery--flatlist)
5. [🤝 Zustand + TanStack Query 모바일 협업 아키텍처](#5-zustand--tanstack-query-모바일-협업-아키텍처)
6. [💡 모바일 성능 최적화 & 베스트 프랙티스](#6-모바일-성능-최적화--베스트-프랙티스)
7. [🔧 초보자가 자주 겪는 트러블슈팅 FAQ](#7-초보자가-자주-겪는-트러블슈팅-faq)

---

## 1. 🌟 TanStack Query란? (개념 & 필요성)

### 💡 왜 TanStack Query가 필요할까요?
전통적인 React Native 앱에서 백엔드 서버 API를 호출할 때는 다음과 같이 많은 보일러플레이트 코드가 필요했습니다:

```jsx
// ❌ 기존 방식 (매번 작성해야 하는 번거로운 코드)
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setIsError(err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

### ✨ TanStack Query를 쓰면 단 몇 줄로 해결됩니다!
```jsx
// ✅ TanStack Query 방식
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### 🎯 핵심 기능 요약
1. **자동 캐싱(Caching)**: 동일한 데이터를 다시 요청하지 않고 메모리 캐시에서 즉시 표시하여 앱 속도 극대화.
2. **백그라운드 동기화 (Stale-While-Revalidate)**: 사용자가 보는 데이터는 즉시 띄우고, 백그라운드에서 최신 데이터를 가져와 조용히 업데이트.
3. **로딩/에러 상태 자동 제공**: `isLoading`, `isPending`, `isError`, `error` 등을 기본 제공하여 `useState` 지옥 탈출.
4. **데이터 무효화 & 리페치 (Invalidation)**: 데이터를 추가/수정했을 때 관련된 화면의 데이터를 한 줄의 코드로 최신화.

---

## 2. ⚔️ TanStack Query vs Zustand 완벽 비교

초보자분들이 가장 많이 하는 질문:  
> **"Zustand도 전역 상태 관리 라이브러리인데, 왜 TanStack Query를 따로 써야 하나요?"**

핵심은 **클라이언트 상태(Client State)**와 **서버 상태(Server State)**의 명확한 구분입니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        📱 모바일 앱 상태(State) 구조                      │
├───────────────────────────────────┬────────────────────────────────────┤
│     🐻 Zustand (Client State)     │   🔄 TanStack Query (Server State) │
├───────────────────────────────────┼────────────────────────────────────┤
│ • 앱 내부에서만 살고 죽는 상태       │ • 원본(Source of Truth)이 서버(DB)  │
│ • 다크 모드 (Theme: Dark/Light)   │ • 사용자 프로필 정보 (`/api/users`)   │
│ • 바텀 시트/모달 열림/닫힘 여부      │ • 매칭된 사용자 목록 (`/api/matches`) │
│ • 폼(Form) 다단계 입력 임시값      │ • 채팅 메시지 목록 (`/api/messages`)  │
│ • 로그인 토큰/인증 여부             │ • 캐싱, 만료시간(TTL), 재시도 필요    │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

### 공통점 (비슷한 점)
1. **React Custom Hook 기반**: 컴포넌트 어디서든 `useStore()` 또는 `useQuery()` 훅 형태로 간결하게 사용합니다.
2. **전역적 접근성**: 어떤 컴포넌트에서든 특정 키(Key)나 스토어를 통해 상태를 공유할 수 있습니다.
3. **보일러플레이트 최소화**: Redux 대비 코드가 매우 간결하고 배우기 쉽습니다.

---

### 차이점 (핵심 비교표)

| 비교 항목 | 🐻 Zustand | 🔄 TanStack Query |
| :--- | :--- | :--- |
| **주요 목적** | 클라이언트 UI 및 전역 동기 상태 관리 | 서버 비동기 데이터 패칭, 캐싱, 동기화 |
| **데이터의 소유자** | **모바일 앱 클라이언트** (앱 내에서 생성) | **원격 백엔드 서버 / DB** |
| **캐시 만료 (staleTime)** | 없음 (직접 상태를 덮어쓰기 전까지 유지) | 지원 (`staleTime`, `gcTime` 등 캐시 수명 주기 관리) |
| **비동기 상태 (Loading/Error)**| `isLoading`, `error` 등을 수동으로 state 선언 | `isLoading`, `isError`, `isFetching` 자동 제공 |
| **자동 리페칭 / 재시도** | 없음 (수동 구현 필요) | 네트워크 재연결 시, 화면 복귀 시 자동 리페칭 & 재시도 |
| **낙관적 업데이트 (Optimistic)**| 수동으로 롤백 로직 직접 구현 | 내장 API (`onMutate`, `onError`, `context`) 제공 |
| **Provider 필요 여부** | **불필요** (단독 사용 가능) | **필요** (`<QueryClientProvider>` 최상단 래핑) |

---

### 언제 무엇을 써야 할까? (역할 분담 기준)

- 🐻 **Zustand를 써야 할 때:**
  - 화면 테마(Dark/Light mode), 현재 선택된 탭 인덱스
  - 로그인된 JWT Access Token 및 간이 유저 식별자
  - 바텀시트, 알림 모달 등의 오픈 여부 (`isOpen: true/false`)
  - 소켓(Socket.io) 인스턴스 전역 보관

- 🔄 **TanStack Query를 써야 할 때:**
  - 백엔드 REST API 또는 GraphQL로 가져오는 **모든 데이터**
  - Tinder 카드 스와이프할 유저 피드 목록 (`GET /api/users`)
  - 매칭 목록, 채팅 메시지 내역 불러오기
  - 프로필 수정, 메시지 전송, 좋아요 누르기 (`POST/PUT/DELETE`)

---

## 3. 📱 모바일(Expo/RN) 초기 설정 및 설치 절차

React Native / Expo 모바일 환경에서는 **앱이 백그라운드로 내려갔다 올라올 때(AppState)**와 **네트워크가 끊겼다 다시 연결될 때(NetInfo)**를 TanStack Query에 알려주어야 모바일 특화 자동 갱신이 완벽하게 동작합니다.

### Step 1: 패키지 설치
모바일 프로젝트 폴더(`mobile/`)에서 필요한 패키지를 설치합니다.

```bash
# 모바일 디렉토리로 이동 후 설치
cd mobile

# TanStack Query 코어 라이브러리 설치
npx expo install @tanstack/react-query

# (권장) 모바일 온라인/오프라인 감지용 패키지
npx expo install @react-native-community/netinfo
```

---

### Step 2: 모바일 특화 설정 (네트워크 상태 & 포커스 매니저)

웹 브라우저의 `window.addEventListener('online')`이나 `window.addEventListener('focus')` 대신, React Native 네이티브 이벤트를 TanStack Query의 `onlineManager` 및 `focusManager`에 연결해줍니다.

`mobile/src/lib/queryClient.js` (또는 `mobile/src/lib/queryClient.ts`) 파일을 생성합니다:

```javascript
// mobile/src/lib/queryClient.js
import { QueryClient, onlineManager, focusManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, Platform } from 'react-native';

// 1. 모바일 네트워크 상태(온라인/오프라인) 자동 감지 연결
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
});

// 2. 모바일 앱 활성화 상태(Foreground / Background) 자동 감지 연결
function onAppStateChange(status) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// AppState 이벤트 리스너 등록
const subscription = AppState.addEventListener('change', onAppStateChange);

// 3. QueryClient 인스턴스 생성 (모바일 기본 옵션 설정)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 신선하다고 간주할 시간 (5분 동안 재요청 없이 캐시 사용)
      staleTime: 1000 * 60 * 5,
      // 캐시가 메모리에 남아있는 시간 (30분)
      gcTime: 1000 * 60 * 30,
      // 모바일 데이터 절약을 위해 실패 시 재시도 횟수 제한 (기본 3 -> 1회)
      retry: 1,
      // 앱이 다시 켜졌을 때 오래된 데이터 자동 리페치
      refetchOnWindowFocus: true,
      // 네트워크 재연결 시 자동 리페치
      refetchOnReconnect: true,
    },
  },
});
```

---

### Step 3: QueryClientProvider 래핑 (`_layout.jsx`)

Expo Router의 루트 레이아웃(`mobile/src/app/_layout.jsx`) 또는 최상단 엔트리 파일에 `<QueryClientProvider>`를 감싸줍니다.

```jsx
// mobile/src/app/_layout.jsx
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

---

## 4. 🚀 핵심 기능 & 실전 사용법 (Code Examples)

### 1) 데이터 조회 (`useQuery`) & Pull-to-Refresh

서버에서 유저 프로필 목록을 가져오고, 사용자가 화면을 당겨서 새로고침(Pull-to-Refresh)하는 모바일 기본 패턴입니다.

```jsx
// mobile/src/app/(tabs)/index.jsx
import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGetProfiles } from '../../lib/api';

export default function DiscoverScreen() {
  // 1. useQuery로 서버 데이터 조회
  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['profiles'], // 캐시를 식별하는 고유 키 (배열 형태)
    queryFn: apiGetProfiles, // Promise를 반환하는 비동기 함수
  });

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-white mt-3 font-medium">프로필을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900 px-6">
        <Text className="text-red-400 text-lg font-bold">오류 발생!</Text>
        <Text className="text-slate-400 text-center mt-2">{error?.message || '데이터를 불러오지 못했습니다.'}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900 px-4 pt-12">
      <Text className="text-2xl font-bold text-white mb-4">🔥 오늘 추천 프로필</Text>
      
      <FlatList
        data={profiles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700">
            <Text className="text-lg font-bold text-white">{item.name}, {item.age}</Text>
            <Text className="text-slate-400 text-sm mt-1">{item.bio}</Text>
          </View>
        )}
        // 2. 모바일 당겨서 새로고침 (Pull-to-Refresh) 연동
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#EC4899" // iOS 로딩 인디케이터 색상
            colors={['#EC4899']} // Android 로딩 인디케이터 색상
          />
        }
      />
    </View>
  );
}
```

---

### 2) 데이터 변경 (`useMutation`) & 캐시 갱신 (`invalidateQueries`)

데이터를 생성(POST), 수정(PUT), 삭제(DELETE)할 때는 `useMutation`을 사용합니다.  
성공 후 `queryClient.invalidateQueries`를 호출하면 해당 키를 가진 쿼리가 즉시 최신화됩니다.

```jsx
// mobile/src/components/LikeButton.jsx
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSwipeRight } from '../lib/api';

export default function LikeButton({ targetUserId }) {
  const queryClient = useQueryClient();

  // 1. useMutation 선언
  const { mutate: swipeLike, isPending } = useMutation({
    mutationFn: (userId) => apiSwipeRight(userId),
    onSuccess: (data) => {
      if (data.isMatch) {
        Alert.alert('🎉 매치 성사!', `${data.matchedUser.name}님과 서로 매치되었습니다!`);
      }
      // 2. 관련 캐시 무효화 -> 매치 목록과 추천 프로필 목록이 자동으로 다시 호출됨
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      Alert.alert('오류', error.message || '좋아요 처리 중 문제가 발생했습니다.');
    },
  });

  return (
    <TouchableOpacity
      className="bg-pink-500 py-3 px-6 rounded-full items-center active:bg-pink-600"
      disabled={isPending}
      onPress={() => swipeLike(targetUserId)}
    >
      <Text className="text-white font-bold text-base">
        {isPending ? '처리 중...' : '💖 좋아요'}
      </Text>
    </TouchableOpacity>
  );
}
```

---

### 3) 낙관적 업데이트 (Optimistic Updates - 틴더 스와이프 예시)

모바일 앱의 반응성을 극대화하기 위해, **서버 응답을 기다리지 않고 UI를 즉시 업데이트**한 뒤, 만약 서버 요청이 실패하면 이전 상태로 롤백하는 기법입니다.

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSwipeUser } from '../lib/api';

export function useSwipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, direction }) => apiSwipeUser(userId, direction),

    // 1. mutate가 호출되자마자 실행 (서버 응답 전)
    onMutate: async ({ userId }) => {
      // 진행 중인 쿼리 취소 (경쟁 상태 방지)
      await queryClient.cancelQueries({ queryKey: ['profiles'] });

      // 이전 캐시 스냅샷 저장 (롤백용)
      const previousProfiles = queryClient.getQueryData(['profiles']);

      // 캐시를 즉시 수정: 스와이프된 유저를 목록에서 바로 제거
      queryClient.setQueryData(['profiles'], (old = []) =>
        old.filter((profile) => profile._id !== userId)
      );

      // 롤백을 위해 이전 데이터를 context로 반환
      return { previousProfiles };
    },

    // 2. 서버 요청이 실패했을 때 -> 이전 상태로 즉시 롤백
    onError: (err, variables, context) => {
      if (context?.previousProfiles) {
        queryClient.setQueryData(['profiles'], context.previousProfiles);
      }
      alert('네트워크 오류로 스와이프 처리에 실패하여 복구했습니다.');
    },

    // 3. 성공하든 실패하든 마지막에 백엔드와 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
```

---

### 4) 무한 스크롤 (`useInfiniteQuery` + `FlatList`)

모바일 피드나 탐색 화면에서 스크롤을 내릴 때마다 다음 페이지 데이터를 가져오는 표준 구현 방식입니다.

```jsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiGetFeed } from '../../lib/api';

export default function InfiniteFeedScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => apiGetFeed({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // 백엔드 응답에서 다음 페이지 번호 계산
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });

  // 다차원 배열 pages를 1차원 리스트로 펼치기
  const feedItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <FlatList
      data={feedItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-4 bg-slate-800 rounded-xl mb-3">
          <Text className="text-white font-bold">{item.title}</Text>
        </View>
      )}
      // 스크롤이 끝에 도달했을 때 다음 페이지 요청
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5} // 스크롤이 50% 남았을 때 미리 호출
      // 바닥 로딩 인디케이터
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#EC4899" className="py-4" />
        ) : null
      }
    />
  );
}
```

---

## 5. 🤝 Zustand + TanStack Query 모바일 협업 아키텍처

실제 모바일 풀스택 프로젝트에서 **Zustand**와 **TanStack Query**는 상호 보완적으로 함께 사용될 때 최상의 시너지를 발휘합니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        앱의 실제 데이터 흐름                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [Zustand] AuthStore                                                 │
│    • 로그인 후 JWT 토큰을 AsyncStorage에 영구 보관                      │
│    • `const token = useAuthStore.getState().token;`                    │
│                               ▼                                        │
│ 2. [Axios / Fetch API] Interceptor                                     │
│    • 요청 헤더에 Authorization: Bearer {token} 자동 주입               │
│                               ▼                                        │
│ 3. [TanStack Query] Server State                                       │
│    • `useQuery(['matches'], fetchMatches)` -> 캐싱 및 자동 갱신        │
│                               ▼                                        │
│ 4. [Zustand] UI Store                                                  │
│    • 매칭 알림 모달 열기: `useUIStore.getState().openMatchModal(user)`   │
└────────────────────────────────────────────────────────────────────────┘
```

### 💡 실전 조합 코드 예시

```javascript
// mobile/src/lib/api.js (Zustand의 토큰을 읽어 API 호출)
import { useAuthStore } from '../store/useAuthStore';

export async function apiGetMatches() {
  const token = useAuthStore.getState().token;
  const res = await fetch('https://api.example.com/matches', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('매칭 목록을 불러오지 못했습니다.');
  return res.json();
}
```

```jsx
// mobile/src/app/(tabs)/matches.jsx
import { useQuery } from '@tanstack/react-query';
import { apiGetMatches } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function MatchesScreen() {
  const { user } = useAuthStore(); // 클라이언트 인증 유저 (Zustand)
  
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', user?._id], // 유저 ID별 캐시 분리
    queryFn: apiGetMatches,
    enabled: !!user, // 유저가 로그인되어 있을 때만 쿼리 실행
  });

  return (/* UI 렌더링 */);
}
```

---

## 6. 💡 모바일 성능 최적화 & 베스트 프랙티스

### 1) `queryKey`를 체계적으로 관리하기 (배열 구조화)
`queryKey`는 단순 문자열보다 연관 데이터와 파라미터를 담아 배열로 구성해야 유연하게 무효화할 수 있습니다.
```javascript
// ✅ 추천: 쿼리 키 팩토리 패턴
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
};

// 사용 시:
useQuery({ queryKey: userKeys.detail(userId), queryFn: ... });
// 전체 유저 관련 캐시 일괄 무효화:
queryClient.invalidateQueries({ queryKey: userKeys.all });
```

### 2) `enabled` 옵션으로 불필요한 호출 방지
파라미터나 ID가 아직 준비되지 않았을 때 API가 실행되는 것을 방지합니다.
```javascript
const { data } = useQuery({
  queryKey: ['chat', recipientId],
  queryFn: () => fetchChat(recipientId),
  enabled: Boolean(recipientId), // recipientId가 있을 때만 호출!
});
```

### 3) `staleTime`을 적절히 늘려 모바일 배터리 및 데이터 절약
모바일 환경에서는 화면을 켤 때마다 불필요하게 API를 재호출하면 배터리와 데이터가 낭비됩니다.
- 자주 바뀌지 않는 프로필 데이터: `staleTime: 1000 * 60 * 10` (10분)
- 실시간성이 필요한 채팅/알림: `staleTime: 0` 또는 `refetchInterval` 설정

---

## 7. 🔧 초보자가 자주 겪는 트러블슈팅 FAQ

### Q1. `queryClient`를 찾을 수 없다는 에러가 발생합니다.
> **원인**: 컴포넌트가 `<QueryClientProvider>` 바깥에 위치해 있습니다.  
> **해결**: 최상위 루트 레이아웃(`_layout.jsx`)에서 모든 스택과 탭을 감싸도록 `<QueryClientProvider client={queryClient}>`를 배치하세요.

### Q2. `staleTime`과 `gcTime`(구 cacheTime)의 차이가 헷갈려요!
- **`staleTime` (신선도 유지 시간)**: 이 시간 동안에는 데이터가 "신선"하다고 판단하여 컴포넌트가 다시 마운트되어도 네트워크 요청을 보내지 않고 캐시를 그대로 반환합니다. (기본값: `0`)
- **`gcTime` (메모리 보관 시간, Garbage Collection Time)**: 사용되지 않는(비활성) 쿼리 데이터가 메모리에서 완전히 삭제되기 전까지 보관되는 시간입니다. (기본값: `5분`)

### Q3. 로그아웃할 때 캐시 데이터를 어떻게 지우나요?
> 로그아웃 시 이전 유저의 캐시가 남아있으면 보안 및 UI 이슈가 발생할 수 있습니다. `queryClient.clear()`를 호출하여 모든 쿼리 캐시를 초기화하세요.

```javascript
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/useAuthStore';

export function handleLogout() {
  useAuthStore.getState().logout(); // Zustand 토큰 제거
  queryClient.clear(); // TanStack Query 모든 서버 캐시 삭제
}
```

---

## 📝 최종 요약

| 구분 | 🐻 Zustand | 🔄 TanStack Query |
| :--- | :--- | :--- |
| **핵심 역할** | UI 전역 제어 (클라이언트 상태) | API 통신 & 캐싱 (서버 상태) |
| **다루는 대상** | 토큰, 모달, 테마, 임시 폼 | 프로필, 피드, 매칭 목록, 채팅 내역 |
| **최고의 조합** | Zustand로 앱 뼈대와 인증을 잡고, TanStack Query로 서버 데이터를 물 흐르듯 관리합니다. |

이제 모바일(React Native/Expo) 환경에서 더욱 빠르고 견고한 앱을 개발해보세요! 🚀
