# Zustand 완전 정복 가이드 (개념, 목적, 설치 및 사용법)

본 문서는 React 및 React Native 환경에서 가장 대중적으로 사용되는 경량 상태 관리 라이브러리인 **Zustand**의 사용 목적, 핵심 장점, 설치 및 사용 절차를 초보자도 이해하기 쉽게 정리한 가이드입니다.

---

## 1. Zustand란 무엇인가요?

**Zustand**(독일어로 '상태'라는 뜻, 발음: *추스탄트*)는 React 애플리케이션을 위한 작고, 빠르고, 직관적인 **전역 상태 관리(Global State Management) 라이브러리**입니다.

### 💡 일상 비유로 이해하기
> 여러 방(컴포넌트)에서 공통으로 쓰는 물건(로그인 정보, 테마, 장바구니 등)이 있을 때, 매번 부모 방을 거쳐서 전달(Props Drilling)하지 않고 **거실의 공용 서랍장(Zustand Store)**에 넣어두고 누구든 필요할 때 바로 꺼내 쓰는 것과 같습니다.

---

## 2. Zustand를 사용하는 목적과 이유 (장점)

### ① Props Drilling(프롭스 드릴링) 해결
- 부모 컴포넌트에서 깊은 곳에 있는 자식 컴포넌트까지 데이터를 전달하기 위해 불필요하게 거치는 과정을 완전히 없앱니다.
- 어디서든 훅(Hook) 하나로 상태를 꺼내고 수정할 수 있습니다.

### ② React Context API & Redux 대비 압도적인 편리함
| 비교 항목 | Redux Toolkit | Context API | **Zustand** |
| :--- | :--- | :--- | :--- |
| **설정 복잡도 (보일러플레이트)** | 매우 복잡함 (액션, 리듀서 등) | 보통 (Provider 생성) | **매우 간단 (코드 몇 줄로 끝)** |
| **Provider 래핑 필요 여부** | 필요함 (`<Provider>`) | 필요함 (`<MyContext.Provider>`) | **불필요 (App을 감쌀 필요 없음)** |
| **불필요한 리렌더링 방지** | 우수함 | 취약함 (전체 하위 트리 리렌더) | **매우 우수함 (선택적 구독)** |
| **패키지 크기** | 무거움 | 내장 기능 | **초경량 (~1KB)** |

---

## 3. 설치 방법

프로젝트의 프론트엔드 폴더(`frontend`)에서 아래 명령어를 실행합니다.

```bash
npm install zustand
```

---

## 4. Zustand 사용 절차 (Step-by-Step)

### [Step 1] 스토어(Store) 파일 생성하기
상태(State)와 상태를 바꾸는 함수(Action)를 한곳에 정의합니다.

📁 **파일 위치 예시**: `src/store/useCounterStore.js`

```javascript
import { create } from "zustand";

// 1. create 함수를 이용해 스토어를 만듭니다.
export const useCounterStore = create((set) => ({
  // ① 상태(State) 정의
  count: 0,

  // ② 액션(Action/함수) 정의: set() 함수를 이용해 상태를 변경합니다.
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

---

### [Step 2] 컴포넌트에서 상태 및 액션 사용하기
별도의 Provider 설정 없이 필요한 컴포넌트에서 일반 훅(Hook)처럼 불러옵니다.

📁 **파일 위치 예시**: `src/components/Counter.jsx`

```jsx
import React from "react";
import { useCounterStore } from "../store/useCounterStore";

const Counter = () => {
  // 스토어에서 원하는 상태와 함수를 가져옵니다.
  const { count, increase, decrease, reset } = useCounterStore();

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">현재 카운트: {count}</h1>
      <div className="space-x-2">
        <button onClick={increase} className="px-4 py-2 bg-blue-500 text-white rounded">
          +1 증가
        </button>
        <button onClick={decrease} className="px-4 py-2 bg-red-500 text-white rounded">
          -1 감소
        </button>
        <button onClick={reset} className="px-4 py-2 bg-gray-500 text-white rounded">
          초기화
        </button>
      </div>
    </div>
  );
};

export default Counter;
```

---

## 5. 실전 응용: 비동기 통신(API) 및 인증 스토어 예제

실제 로그인/회원가입 등 API 호출과 로딩 상태를 관리할 때의 스토어 구조입니다.

📁 **파일 예시**: `src/store/useAuthStore.js`

```javascript
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,              // 유저 정보
  isAuthenticated: false,  // 로그인 여부
  loading: false,          // API 요청 로딩 여부

  // 로그인 액션 (비동기 처리)
  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/login", { email, password });
      
      // 성공 시 상태 업데이트
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw new Error(error.response?.data?.message || "로그인 실패");
    }
  },

  // 로그아웃 액션
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
```

---

## 6. 알아두면 좋은 핵심 팁

### 1) 렌더링 최적화 (Selector 사용)
컴포넌트가 특정 값만 필요할 때는 선택자(Selector)를 사용하면 다른 값이 바뀌어도 불필요한 리렌더링이 발생하지 않습니다.

```javascript
// user가 바뀌어도 count만 쓰는 컴포넌트는 리렌더링되지 않음!
const count = useCounterStore((state) => state.count);
```

### 2) 새로고침해도 상태 유지하기 (`persist` 미들웨어)
`localStorage`에 상태를 자동으로 저장하고 복원하고 싶다면 Zustand의 내장 미들웨어 `persist`를 사용합니다.

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage", // localStorage 키 이름
    }
  )
);
```

---

## 7. 핵심 요약

1. **설치**: `npm install zustand`
2. **생성**: `create((set) => ({ 상태, 액션 }))`
3. **사용**: `const { 상태, 액션 } = use스토어이름()`
4. **장점**: Provider 없음, 초간결한 문법, 뛰어난 성능 및 확장성
