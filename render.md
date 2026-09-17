# 🚀 Render.com 풀스택(Backend + Frontend) 원클릭 배포 가이드

본 문서는 **Backend(Node.js/Express)와 Frontend(React/Vite)**가 하나로 통합된 본 프로젝트를 **Render.com** 무료 웹 서비스에 성공적으로 배포하고 운영하기 위한 단계별 상세 가이드입니다.

---

## 📌 목차
1. [전체 구조 및 동작 원리](#1-전체-구조-및-동작-원리)
2. [배포 전 준비 사항](#2-배포-전-준비-사항)
3. [Render.com 회원가입 및 GitHub 연동](#3-rendercom-회원가입-및-github-연동)
4. [Web Service 생성 및 설정 단계 (핵심)](#4-web-service-생성-및-설정-단계-핵심)
5. [환경 변수(Environment Variables) 설정](#5-환경-변수environment-variables-설정)
6. [배포 시작 및 로그 확인](#6-배포-시작-및-로그-확인)
7. [배포 완료 후 동작 검증](#7-배포-완료-후-동작-검증)
8. [14분 주기 Keep-Alive Cron 기능 안내](#8-14분-주기-keep-alive-cron-기능-안내)
9. [자주 묻는 질문 및 문제 해결 (Troubleshooting)](#9-자주-묻는-질문-및-문제-해결-troubleshooting)

---

## 1. 전체 구조 및 동작 원리

이 프로젝트는 **단 하나의 Render Web Service**에서 백엔드와 프론트엔드가 모두 동작하도록 설계되어 있습니다.

```
[클라이언트(브라우저)]
       │
       ▼ (HTTPS 요청)
[Render.com Express 백엔드 서버]
  ├── /api/*        ───▶ Express 라우터 및 컨트롤러 (API 처리)
  ├── /socket.io    ───▶ Socket.IO 실시간 통신 (채팅, 매칭 알림)
  └── 그 외 모든 경로 ──▶ 프론트엔드 정적 파일 서빙 (frontend/dist/index.html)
```

- **빌드 과정**: Render가 `npm run build`를 실행하여 백엔드/프론트엔드 패키지를 각각 설치하고, 프론트엔드를 빌드하여 `frontend/dist` 폴더를 생성합니다.
- **실행 과정**: `npm start`를 실행하여 백엔드 서버가 켜지며, 프로덕션 환경(`NODE_ENV=production`)에서는 생성된 `frontend/dist` 파일을 Express가 직접 서빙합니다.

---

## 2. 배포 전 준비 사항

배포를 진행하기 전에 다음 항목들이 준비되어 있는지 확인해주세요:

1. **GitHub 저장소**
   - 본 프로젝트의 최신 코드가 본인의 GitHub 저장소(예: `webMobile-tinder`)의 `main` (또는 `master`) 브랜치에 푸시되어 있어야 합니다.
2. **MongoDB Atlas 계정 및 연결 주소 (MONGO_URI)**
   - MongoDB Atlas 클러스터의 Connection String (예: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/tinder_db?retryWrites=true&w=majority`)
   - ⚠️ **중요**: MongoDB Atlas의 **Network Access**에서 `0.0.0.0/0` (Allow Access from Anywhere)이 허용되어 있어야 Render 서버에서 DB에 접속할 수 있습니다.
3. **Cloudinary 계정 정보 (프로필 이미지 업로드용)**
   - Cloudinary 대시보드에서 다음 3가지 값을 확인합니다:
     - `Cloud Name`
     - `API Key`
     - `API Secret`
4. **JWT 비밀키 (JWT_SECRET)**
   - 임의의 안전한 난수 문자열 (예: `my_super_secret_jwt_key_2026_tinder!@#`)

---

## 3. Render.com 회원가입 및 GitHub 연동

1. [Render.com](https://render.com/) 공식 웹사이트에 접속합니다.
2. 우측 상단의 **[Sign Up]** 또는 **[Get Started]**를 클릭합니다.
3. **GitHub 계정으로 로그인(Sign in with GitHub)**을 선택하여 가입 및 연동을 진행합니다.

---

## 4. Web Service 생성 및 설정 단계 (핵심)

1. Render 대시보드 우측 상단의 **[+ New]** 버튼을 클릭하고 **[Web Service]**를 선택합니다.
2. **"Build and deploy from a Git repository"**를 선택하고 **[Next]**를 클릭합니다.
3. GitHub 저장소 목록에서 `webMobile-tinder` (본인 저장소)를 찾아 **[Connect]** 버튼을 클릭합니다.
   - *(만약 저장소가 보이지 않는다면, 하단의 "Configure GitHub App"을 클릭하여 해당 저장소 접근 권한을 부여하세요.)*

4. 서비스 설정 입력 폼이 나타나면 아래 표와 **정확히 동일하게 입력**합니다:

| 항목 (Field) | 설정 값 (Value) | 설명 |
|---|---|---|
| **Name** | `webmobile-tinder` | 서비스 이름 (원하는 이름으로 입력 가능, URL에 사용됨) |
| **Region** | `Singapore (Southeast Asia)` | 대한민국과 가장 가까운 아시아 리전 권장 |
| **Branch** | `main` (또는 `master`) | 배포할 Git 브랜치 |
| **Root Directory** | *(비워둠 - 빈칸 유지)* | 프로젝트 최상위 루트에서 빌드하므로 반드시 비워둡니다. |
| **Runtime** | `Node` | Node.js 환경 선택 |
| **Build Command** | `npm run build` | 백엔드/프론트엔드 설치 및 프론트엔드 정적 빌드 실행 |
| **Start Command** | `npm start` | 백엔드 서버 구동 |
| **Instance Type** | `Free` (0$/month) | 무료 플랜 선택 |

---

## 5. 환경 변수(Environment Variables) 설정

페이지 하단의 **"Environment Variables"** 섹션에서 **[Add Environment Variable]**을 클릭하여 아래 환경 변수들을 하나씩 등록합니다:

| Key (환경변수 이름) | Value (설정 값 예시) | 필수 여부 및 설명 |
|---|---|:---:|
| `NODE_ENV` | `production` | **[필수]** 프로덕션 모드 활성화 |
| `PORT` | `3000` | **[필수]** 서버 포트 |
| `MONGO_URI` | `mongodb+srv://<username>:<password>@your-cluster.mongodb.net/tinder?retryWrites=true&w=majority` | **[필수]** MongoDB Atlas 연결 문자열 |
| `JWT_SECRET` | `your_custom_jwt_secret_token_key_here` | **[필수]** 로그인 인증 토큰 암호화 키 |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_cloud_name` | **[필수]** Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` | **[필수]** Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` | **[필수]** Cloudinary API Secret |
| `CLIENT_URL` | `https://your-app-name.onrender.com` | *(선택)* 생성될 본인 Render 서비스 URL |


> 💡 **안내**: `RENDER_EXTERNAL_URL` 환경 변수는 Render.com에서 배포 시 서비스 URL(예: `https://webmobile-tinder.onrender.com`)을 자동으로 주입해주므로 사용자가 직접 추가하지 않아도 됩니다.

---

## 6. 배포 시작 및 로그 확인

1. 모든 설정과 환경 변수 입력이 끝났으면 페이지 맨 아래의 **[Deploy Web Service]** (또는 **[Create Web Service]**) 버튼을 클릭합니다.
2. 배포가 시작되면 실시간 **Logs (배포 로그)** 창이 표시됩니다:
   - `npm install --prefix backend` 진행
   - `npm install --prefix frontend` 진행
   - `vite build` 실행 -> `dist/` 빌드 생성
   - `Server is running on port 3000` 및 DB 연결 성공 메시지 출력
3. 로그 창에 **"==> Your service is live 🎉"** 메시지가 나타나면 배포가 성공한 것입니다!
4. 페이지 좌측 상단에 표시된 고유 URL (예: `https://webmobile-tinder.onrender.com`)을 클릭하여 접속합니다.

---

## 7. 배포 완료 후 동작 검증

배포된 웹 사이트에 접속하여 다음 기능들이 잘 동작하는지 확인합니다:

- [ ] **회원가입 & 로그인**: 계정 생성 후 자동 로그인 및 메인 페이지 이동 확인
- [ ] **프로필 수정 & 사진 업로드**: 우측 상단 메뉴 -> [프로필 변경]에서 새 소개 사진 등록 (Cloudinary 업로드 확인)
- [ ] **홈 화면 스와이프**: 다른 사용자 카드 좋아요(Like) / 넘기기(Nope) 스와이프 동작 확인
- [ ] **실시간 매칭 및 알림**: 상호 좋아요 시 축하 토스트 팝업 및 Matches 목록 갱신 확인
- [ ] **실시간 채팅**: 매치된 사용자와 1:1 대화방 입장 후 메시지 및 빠른 이모지 전송/수신 확인
- [ ] **헬스체크 확인**: 브라우저에서 `https://본인앱주소.onrender.com/api/health` 접속 시 `{"status":"ok"}` JSON 응답 확인

---

## 8. 14분 주기 Keep-Alive Cron 기능 안내

### ❓ 왜 14분 Cron이 필요한가요?
Render.com의 무료 플랜은 **15분 동안 외부 요청이 없으면 서버가 절전(Sleep/Spin-down) 모드**로 전환되어, 다음 첫 접속 시 최대 1분 가까이 로딩 지연(Cold Start)이 발생합니다.

### ⚙️ 동작 방식:
- 본 프로젝트 백엔드(`backend/src/utils/cron.js`)에는 **14분마다(`*/14 * * * *`)** 자동으로 자기 자신의 `/api/health` 엔드포인트에 HTTP Ping을 보내는 크론 작업이 내장되어 있습니다.
- 이 기능 덕분에 **무료 플랜에서도 서버가 24시간 잠들지 않고 언제나 즉각적인 응답 속도를 유지**합니다.
- 💡 **로컬 개발 환경 안전장치**: `NODE_ENV !== "production"`인 로컬 개발 환경에서는 크론 작업이 자동으로 비활성화되어 불필요한 요청이 발생하지 않습니다.

---

## 9. 자주 묻는 질문 및 문제 해결 (Troubleshooting)

### Q1. 배포 중 `Database connection failed` 에러가 발생합니다.
- **원인**: MongoDB Atlas의 IP 화이트리스트 접근이 차단되었거나 `MONGO_URI` 문자열의 비밀번호가 틀렸을 때 발생합니다.
- **해결책**:
  1. [MongoDB Atlas](https://cloud.mongodb.com/) 접속 -> **Network Access** 메뉴로 이동합니다.
  2. **[+ Add IP Address]** 클릭 -> **"Allow Access from Anywhere (`0.0.0.0/0`)"**를 선택하고 저장합니다.
  3. Render 대시보드의 **Environment Variables**에서 `MONGO_URI`의 비밀번호에 특수문자가 있다면 URL 인코딩이 올바르게 되었는지 확인합니다.

### Q2. 이미지를 업로드할 때 에러가 발생합니다.
- **원인**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` 환경 변수 중 오타가 있거나 누락된 경우입니다.
- **해결책**: Render 환경 변수 탭에서 Cloudinary 관련 키 값이 정확히 입력되었는지 다시 확인하고 저장(Save changes)합니다.

### Q3. 코드를 수정하고 새로 배포하려면 어떻게 하나요?
- 코드를 수정 후 GitHub 저장소의 `main` 브랜치에 `git push`를 진행하면, **Render가 이를 자동으로 감지하여 새로운 버전으로 무중단 자동 재배포**를 진행합니다.
- 수동으로 재배포하고 싶을 때는 Render 대시보드 우측 상단의 **[Manual Deploy]** -> **[Deploy latest commit]**을 클릭하면 됩니다.

---

## 💻 로컬 개발 환경 실행 방법 (참고)

로컬 컴퓨터에서 개발 및 테스트를 진행할 때는 아래 명령어를 사용합니다:

```bash
# 1. 백엔드 개발 서버 실행 (포트 3000)
npm run dev:backend

# 2. 프론트엔드 개발 서버 실행 (Vite, 포트 5173)
npm run dev:frontend
```
