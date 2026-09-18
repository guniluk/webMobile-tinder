# Tinder Clone - Mobile App (Expo / React Native)

React Native와 Expo SDK 52, NativeWind(Tailwind CSS)를 활용하여 구축된 틴더 클론 모바일 애플리케이션입니다.

## 📱 주요 기능 & UI 화면

1. **디스커버 피드 (Swipe Discovery)**:
   - 부드러운 터치 제스처 드래그 & 스와이프 (`LIKE` / `NOPE` 스탬프 애니메이션)
   - 패스(X), 슈퍼라이크(Sparkles), 좋아요(Heart) 원터치 버튼
   - 추천 유저 실시간 프로필 카드 및 상세 소개 펼치기
2. **매치 & 대화 목록 (Matches & Messages)**:
   - 새로운 매치 상단 가로 아바타 스크롤
   - 실시간 온라인 접속 상태 표시등
   - 실시간 새 메시지 도착 시 미확인 뱃지 및 인디케이터
   - 매치 유저 이름 실시간 검색
3. **1:1 실시간 채팅 (Real-time Chat)**:
   - Socket.IO 기반 즉시 메시지 송수신
   - 키보드 회피(`KeyboardAvoidingView`) 및 자동 스크롤
   - 실시간 메시지 푸시/토스트 배너 알림
4. **프로필 조회 및 수정 (Profile Management)**:
   - `expo-image-picker`를 활용한 기기 갤러리 대표 사진 업로드
   - 이름, 나이, 자기소개, 성별 및 선호 성별 변경
   - 안전한 로그아웃
5. **인증 시스템 (Auth)**:
   - 회원가입 (이름, 이메일, 비밀번호, 나이, 성별, 관심 상대)
   - 로그인 및 세션 영구 저장 (`AsyncStorage` + Bearer JWT 토큰)

## 🛠️ 기술 스택

- **Framework**: Expo SDK 52 (React Native)
- **Routing**: Expo Router (파일 기반 라우팅)
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State Management**: Zustand + `@react-native-async-storage/async-storage`
- **Network / API**: Axios (JWT Bearer Interceptor)
- **Realtime**: Socket.IO Client
- **Icons**: `lucide-react-native`
- **Media**: `expo-image`, `expo-image-picker`

## 🚀 실행 방법

```bash
# 모바일 디렉토리 진입
cd mobile

# 의존성 패키지 설치
npm install

# Expo 개발 서버 시작
npx expo start
```

- iOS 시뮬레이터: 키보드 `i`
- Android 에뮬레이터: 키보드 `a`
- 모바일 실기기 (Expo Go 앱): QR 코드 스캔
