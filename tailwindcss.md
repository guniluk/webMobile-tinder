# React + Vite 환경에서 Tailwind CSS (v4) 설치 및 설정 가이드

본 문서는 Vite 기반의 React 프로젝트에 최신 Tailwind CSS (v4)를 설치하고 설정하는 전체 절차와 사용 방법을 상세하게 정리한 문서입니다.

---

## 1. 개요 (Tailwind CSS v4 특징)

Tailwind CSS v4는 차세대 초고속 엔진(Oxide)을 기반으로 동작하며, 기존 v3 대비 설정이 대폭 간소화되었습니다.
- 별도의 `postcss.config.js` 및 `tailwind.config.js` 파일 없이 작동 가능합니다.
- Vite 전용 플러그인인 `@tailwindcss/vite`를 통해 별도 번들링 지연 없이 빠른 HMR(Hot Module Replacement)과 빌드를 지원합니다.
- CSS 파일에서 직접 `@import "tailwindcss";` 지시문 하나로 모든 스타일 시스템을 로드합니다.

---

## 2. 단계별 설치 및 설정 절차

### 1단계: 패키지 설치

`frontend` 디렉토리로 이동하여 `tailwindcss`와 Vite 전용 플러그인인 `@tailwindcss/vite`를 설치합니다.

```bash
cd frontend
npm install tailwindcss @tailwindcss/vite
```

---

### 2단계: Vite 설정에 Tailwind 플러그인 추가

`vite.config.js` (또는 `vite.config.ts`) 파일에 `@tailwindcss/vite`를 불러와 `plugins` 배열에 등록합니다.

**수정 대상 파일**: `frontend/vite.config.js`

```javascript
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS 플러그인 추가
  ],
})
```

---

### 3단계: CSS 엔트리 포인트에 Tailwind import

프로젝트의 메인 CSS 파일(`index.css` 또는 `App.css`)의 최상단에 `@import "tailwindcss";`를 선언합니다.

**수정 대상 파일**: `frontend/src/index.css`

```css
@import "tailwindcss";
```

> **참고**: `main.jsx`에서 해당 CSS 파일이 정상적으로 import되어 있는지 확인합니다.
> ```javascript
> // frontend/src/main.jsx
> import './index.css';
> ```

---

## 3. 사용 예시

React 컴포넌트 내부에서 Tailwind CSS의 유틸리티 클래스를 `className` 속성에 바로 사용할 수 있습니다.

**예시 파일**: `frontend/src/App.jsx`

```jsx
const App = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-2">
          Tailwind CSS 적용 완료!
        </h1>
        <p className="text-gray-600">
          React + Vite + Tailwind CSS v4 환경이 정상적으로 작동합니다.
        </p>
      </div>
    </div>
  );
};

export default App;
```

---

## 4. 실행 및 빌드 검증

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드 테스트
```bash
npm run build
```
빌드가 오류 없이 정상적으로 번들링되면 설정이 완료된 것입니다.

---

## 5. 요약 체크리스트

| 단계 | 작업 내용 | 대상 파일/명령어 |
| :--- | :--- | :--- |
| **1** | Tailwind 패키지 설치 | `npm install tailwindcss @tailwindcss/vite` |
| **2** | Vite 플러그인 등록 | `vite.config.js` (`plugins: [..., tailwindcss()]`) |
| **3** | CSS `@import` 선언 | `src/index.css` (`@import "tailwindcss";`) |
| **4** | 검증 및 빌드 | `npm run dev` 또는 `npm run build` |
