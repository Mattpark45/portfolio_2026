# Handoff: Human MCP — Digital Advisory Branch (1차 출시 디자인)

## Overview
휴먼MCP(Human MCP) 공식 디지털 영업지점 웹사이트의 디자인 인계 패키지입니다.
기업 경영자문 + 개인·법인 종합금융을 하나의 고객 접점으로 연결하고, **검색·SNS 유입 → 콘텐츠 → 자기발견(3분 점검) → 30분 첫 상담 예약**으로 이어지는 고객여정을 구현하는 것이 목표입니다.

확정 방향: **콘셉트 A(Entrepreneurial Advisor)를 뼈대로, C의 3분 점검 위젯과 B의 콘텐츠 구조를 결합**.

이번 패키지에 포함된 완성 화면: **Home / Intelligence 콘텐츠 상세 / 상담예약·온보딩** + 디자인 시스템.
아직 디자인되지 않은 화면: 기업 경영자문, 개인 종합금융, About, 대표·가족 통합자문, Growth & Capital, AI/AX, 전문가 협업, 진단센터, 콘텐츠 목록, 고객 포털.

## About the Design Files
`design/` 폴더의 파일은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 입니다. 의도한 모양과 동작을 보여 주는 것이며, **그대로 배포할 프로덕션 코드가 아닙니다.**
작업은 이 디자인을 **대상 저장소의 기존 환경(프레임워크·컴포넌트·패턴)으로 다시 구현**하는 것입니다. 저장소가 없다면 권장 스택은 **Next.js (App Router) + TypeScript + Tailwind CSS** (SEO·콘텐츠 상세 SSG/ISR에 적합)입니다.
기존 저장소를 덮어쓰지 마세요.

## Fidelity
**High-fidelity.** 색상, 타이포그래피, 간격, 상호작용이 최종안입니다. 픽셀 단위로 재현하되 기존 코드베이스의 라이브러리와 패턴을 사용하세요.
단, 화면 안의 `.sample` 배지(파란 모노 글씨 "예시", "확인 필요")는 **디자인 단계 표시**이므로 구현 시 제거하고, 해당 콘텐츠는 아래 "확인 필요 항목"이 확정될 때까지 CMS/설정값으로 분리하세요.

---

## Design Tokens
`design/css/hmcp.css`의 `:root`가 단일 원본입니다.

### Colors
| Token | Hex | 용도 |
|---|---|---|
| green | #143D30 | Primary 버튼, 제목 |
| green-900 | #0E2C23 | 어두운 섹션, 푸터 |
| green-700 | #1F5443 | Primary hover |
| green-100 | #DCE6E0 | 선택 상태 배경 |
| ivory | #F6F3EC | 기본 배경 |
| ivory-2 | #EFEAE0 | 보조 배경, 태그 |
| paper | #FBF9F5 | 카드, 콘텐츠 배경 |
| gold | #AC8B46 | **선·장식 전용** (ivory 위 2.9:1 → 글자 금지) |
| gold-ink | #7D622A | ivory 위 금색 글자 (5.2:1) |
| gold-light | #C9A862 | green 위 금색 글자/버튼 (5.3:1) |
| char | #252C2B | 본문 (12.9:1) |
| char-2 | #5E6563 | 보조 글자 (5.4:1) |
| blue | #527487 | 차트, 포커스 링 |
| blue-ink | #466577 | ivory 위 파란 글자 (5.6:1) |
| ok / warn / err | #2F6B4F / #8A5A12 / #A23B2E | 의미색 |
| line / line-strong | rgba(37,44,43,.14) / .28 | 구분선 |

### Typography
- Sans (본문·UI): **Pretendard Variable** (OFL 1.1) — CDN `orioncactus/pretendard@v1.3.9 dynamic-subset`, fallback Noto Sans KR
- Serif (제목): **Noto Serif KR** 600/700 (OFL 1.1)
- Mono (라벨·날짜): **IBM Plex Mono** 400/500 (OFL)
- 전역 `word-break: keep-all`, body 17px/1.7 (≤768px 16px)

| 역할 | 스타일 |
|---|---|
| Display (Hero H1) | serif 600, clamp(34px, 4.4vw, 60px) / 1.28, color green |
| H2 섹션 제목 | serif 600, clamp(28px, 3vw, 42px) / 1.32 |
| H3 | sans 600, 22px / 1.35 |
| H4 | sans 600, 18px / 1.4 |
| Lede | sans 400, 19px / 1.7 |
| Article body | 17.5px / 1.85 (mobile 16.5px) |
| Small | 14.5px / 1.6, char-2 |
| Eyebrow | sans 600, 12.5px, letter-spacing .16em, uppercase, gold-ink (어두운 배경 gold-light) |

### Spacing / Layout
- 4px 단위: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- 컨테이너 max 1240px, 좌우 패딩 40px (≤768px 20px)
- 섹션 패딩 112px (≤900px 72px)
- Breakpoints: 1100 (헤더 → 햄버거), 900 (대부분 1열), 768 (모바일 고정 CTA), 560 (소형 조정)

### Radius / Shadow
- r-s 4px (버튼·입력), r-m 8px (카드·알림), r-l 14px (모달·점검 위젯)
- shadow-1: `0 1px 2px rgba(20,61,48,.06), 0 8px 24px -12px rgba(20,61,48,.18)` — 떠 있는 요소에만
- 예외: Hero 인물 아치 프레임 `border-radius: 220px 220px 0 0` (모바일 160px)

---

## Screens / Views

### 1. Home (`design/site/Home.html`)
섹션 순서와 핵심 사양:

1. **Header** (sticky, 72px, ivory 92% + blur 8px, 하단 1px line) — 로고(HUMAN MCP / FINANCIAL & BUSINESS ADVISORY), 메뉴 6개(기업 경영자문 · 개인·법인 종합금융 · Growth & Capital · 디지털 진단 · Intelligence · About), Primary "30분 첫 상담 예약". ≤1100px: 메뉴 숨김 → 44px 햄버거 → 전체화면 Drawer(항목마다 한 줄 설명, Esc로 닫힘, body scroll lock).
2. **Hero** — 2열 (1.15fr / .85fr, gap 56). 왼쪽: eyebrow "Entrepreneurial Advisor · 박동혁", H1 "회사의 성장과 가족의 미래,<br>따로 고민하지 않도록.", lede, CTA 2개(Primary "기업 경영자문 알아보기 →", Secondary "개인·가족 재무상담"), micro "바로 상담하지 않으셔도 됩니다. 3분 점검부터 해보기". 오른쪽: 인물 사진 4:5 아치 프레임, `object-position: 50% 18%`, 좌하단 캡션 카드. ≤900px: 사진 위(1:1, max 440px), 텍스트 아래.
3. **Facts strip** — 4열: 16년 베트남 생활·사업 / 10년+ 퍼포먼스 마케팅 / 16개 분야 ICM 협업 / 기업 + 개인 통합자문. 숫자 serif 26px.
4. **고객별 진입** — 아이콘 카드 대신 **행(row) 목록**: 번호(mono) / 질문(sans 600 ~23px) / 이동 서비스(14px) / →. hover 시 배경 paper + 좌우 12px 패딩. 6개 문장(Home.html 참조).
5. **3분 점검 + 도구** (green-900 배경 + 자연 배경 이미지 14% opacity) — 왼쪽 설명 + 신뢰 문구 3줄, 오른쪽 **점검 위젯**(아래 Interactions 참조). 하단에 진단 도구 카드 4개 + 상태 배지(이용 가능 / 상담 시 제공 / 준비 중).
6. **자문 방식** — Risk / Benefit / Growth 3열(serif 44px 단어 + 한국어 소제목 + 설명), 아래 6단계 띠(이해·보호·최적화·성장·실현·지속).
7. **Human MCP 소개** (green 배경) — 스토리 2문단 + 역할 pill 5개, 오른쪽 네 가지 기반 2×2 (A 중소기업경영연구소 / B AFG / C 기업가적 실무경험 / D 자체 디지털 기술).
8. **서비스** — 3×2 그리드, 선으로 구분(카드 아님). 각 항목: 수행 방식 태그(직접 / 직접+협업 / 협업·연결), 제목(green 22px), 설명, "자세히 알아보기" 링크.
9. **전문가 협업** — 왼쪽 설명 + 직접/협업/소개 범례, 오른쪽 16개 분야 4열 그리드 + 출처 주석.
10. **프로세스** — 5단계(30분 첫 상담 → 진단과 정리 → 대안 비교 → 실행과 연결 → 정기 점검), 상단 2px 선.
11. **Intelligence** — 검색창 + 대표 글(16:9 이미지, serif 28px) + 목록 4개 + 카테고리 pill 8개.
12. **상담 안내** (green-900 + OG 이미지 22%) — 4개 상담 유형 링크 → `Booking?type=personal|corp|ax|partner`.
13. **Footer** (green-900) — 4열 + 금융·업무범위 고지 + 개인정보처리방침/이용약관/업무 범위 안내.
14. **모바일 고정 CTA** (≤768px) — "내 상황 점검"(Secondary) + "30분 첫 상담"(Primary).

### 2. Intelligence 콘텐츠 상세 (`design/site/Article.html`)
- Breadcrumb → 카테고리 → H1(serif clamp 28–46) → dek(19px) → 메타 바(작성자 사진 48px, 이름/직함, **최초 작성일·최근 검토일**, 검토자)
- 3열 그리드 `220px | minmax(0,680px) | 1fr`, gap 56: 왼쪽 sticky 목차(scroll-spy, 활성 항목 좌측 2px green), 가운데 본문, 오른쪽 sticky 레일(관련 서비스 → 관련 도구 → 상담 CTA 카드 1개)
- 본문 블록: **핵심 요약**(ivory, 상단 3px green), H2(serif 26), **사실/해석 2분할 박스**(라벨 색 구분), 표(가로선만, 모바일 가로 스크롤), 막대 차트 + 캡션, 주의 callout, **출처 각주**(`[1]` → #r1), 작성자 박스
- ≤1180px: 목차 → 본문 상단 접이식 `<details>`. ≤900px: 1열, 레일 static. **그리드 자식에 `min-width:0` 필수**(표 넘침 방지)
- 하단 "함께 읽으면 좋은 글" 3열
- SEO: `title`, `meta description`, OG 이미지, Article JSON-LD(author, datePublished, dateModified) 추가할 것

### 3. 상담예약 · 온보딩 (`design/site/Booking.html`)
- 2열 `1fr | 360px`, gap 64. 오른쪽 sticky 사이드(자문가 소개 + "첫 상담에서는" 4줄 + 대체 연락 수단)
- 상단 진행 바 4칸: 상담 종류 / 상담 목적 / 일정 / 연락처·동의
- **Step 0 상담 종류**: 2×2 라디오 카드(개인·가족 / 기업 / AI·AX / 협업·제휴). 선택 시 green-100 배경 + inset green 테두리
- **Step 1 상담 목적**: 유형별 주제 chip(다중 선택, 선택 안 해도 됨) + 메모 textarea("주민번호, 계좌, 건강정보, 보험 계약 내용은 적지 말아 주세요"). 3분 점검에서 왔으면 상단 파란 안내 배너 + 메모 자동 입력
- **Step 2 일정**: 평일 10일 날짜 버튼(5열) + 시간 슬롯 3열(마감은 취소선·disabled) + 방식 chip(화상/전화/방문). 상태: 날짜 미선택 안내, **로딩 스켈레톤**, **빈 일정**(이메일 대안 제시)
- **Step 3 연락처·동의**: 이름(필수), 휴대전화(필수, `/^01[0-9]-?\d{3,4}-?\d{4}$/`), 이메일(선택), 회사·기관명(기업/AX/제휴만, 선택). 동의: [필수] 개인정보 수집·이용, [필수] 업무 범위 안내 확인, [선택] 격주 브리핑. 필수 2개 미체크 시 버튼 disabled. 제출 중 스피너 "보내는 중…", **전송 실패 시 role=alert + 입력값 유지 + "다시 보내기"**
- **완료**: 체크 아이콘, "{이름}님, 감사합니다.", 예약 요약 dl, 상담 전 준비 3가지, 관련 글/홈 링크
- 모바일(≤560): 1열, 하단 sticky 이전/다음 바
- 디자인 전용: 좌하단 "상태 미리보기" 스위치 → **구현 시 제거**(Storybook 등으로 대체)

---

## Interactions & Behavior

### 3분 점검 위젯 (`design/js/dx.js`)
- 4단계: ① 대상(우리 회사 / 나와 가족) → ② 단계(단일 선택, 선택 즉시 다음) → ③ 관심사(다중, 1개 이상 필수) → ④ 최근 검토(다중, 선택 사항) → 결과
- 결과: **지킬 것(err 색 라벨) / 쓸 수 있는 것(ok) / 다음 기회(blue-ink)** 3줄 — 선택값 기반 규칙 매핑(RES 객체). 규칙과 문구는 **설정 파일/CMS로 분리**하고 준법 검토 후 확정
- 진행 바 너비 25%씩, `aria-live="polite"`
- "이 결과로 30분 상담 예약" 클릭 시 `sessionStorage.hmcp_dx = {type, ans[]}` 저장 → Booking에서 읽어 유형·메모 자동 채움. **서버 저장 없음**
- 이름·연락처 없이 결과 표시

### 공통
- 버튼 전환 `.2s` (background, color, border-color). 장식 애니메이션 없음
- 포커스: `:focus-visible { outline: 3px solid #527487; outline-offset: 2px }`
- 터치 영역 최소 44px, 버튼 최소 높이 48px
- 상담예약 진행 상태는 `sessionStorage.hmcp_booking`에 저장(새로고침 유지)

## State Management
- Booking: `{step, type, topics[], note, day, slot, mode, name, tel, email, company, c1, c2, c3}`
- Dx: `{type, i, ans[][]}`
- 서버 연동 필요(구현 단계 결정): 예약 가능 시간 조회 API(캘린더 연동, 예: Google Calendar / Cal.com), 예약 생성 API, 확인 문자 발송, 뉴스레터 구독
- 콘텐츠: CMS 또는 MDX (작성자, 최초작성일, 검토일, 검토자, 카테고리, 요약, 출처 필드 필수)

## 실제 기능 vs Mock
| 요소 | 디자인 상태 | 구현 |
|---|---|---|
| 3분 점검 | 규칙 기반 프로토타입 | 프론트 구현 가능, 규칙은 설정 분리 + 준법 검토 |
| 재무X레이 Scout / 사업자주치의AI | 링크만 | 기존 제품 URL 연결 (상태값 확인 필요) |
| 개인 재무X레이 | "상담 시 제공" | 공개 웹 구현 금지 (민감정보) |
| Corporate Signal Engine | "준비 중" | 출시 알림 신청만 |
| 예약 일정·슬롯 | 하드코딩 | 캘린더 API |
| 확인 문자 | 문구만 | 문자 발송 서비스 |
| 글 검색 | UI만 | 콘텐츠 검색 |
| 고객 포털 | 미디자인 | 향후 콘셉트, 1차 범위 아님 |

## 준법·보안 기준 (반드시 지킬 것)
- 공개 웹에서 주민등록번호, 건강정보, 보험계약 상세, 계좌, 인증정보를 수집하지 않음
- 보험 가입을 다른 서비스 이용 조건으로 두지 않음
- 직접 수행 / 협업 수행 / 소개·연결 업무를 구분 표기
- 확인되지 않은 실적·고객 수·후기·제휴를 표시하지 않음
- 푸터 고지 문구는 AFG 준법감시 검토 후 확정

## 확인 필요 항목 (구현 시 설정값으로 분리)
- 공식 직함(디렉터 / 전문위원), AFG 소속 표기
- 첫 상담 시간(30분 / 1시간), 무료 여부·상담료
- "상담 중 가입이나 계약을 권하지 않습니다" 문구 사용 가능 여부
- 진단 도구별 상태와 URL
- ICM 협력사 실명 게시 허락
- 브랜드 사진 5종(현재 얼굴 사진 1장으로 대체)

## Accessibility (WCAG 2.2 AA)
대비 기준은 토큰 표 참조. lang="ko", 모든 폼 라벨 노출 + autocomplete, 오류 메시지에 수정 방법 포함, 점검·예약 패널 aria-live, Drawer는 role=dialog aria-modal + Esc, `prefers-reduced-motion`에서 스켈레톤 애니메이션 중지(구현 시 추가).

## Assets
| 파일 | 크기 | 출처 / 용도 |
|---|---|---|
| `design/assets/portrait.webp` | 765×1024 | 사용자 제공 실제 얼굴 사진. Hero, 작성자, 예약 사이드 |
| `design/assets/humanmcp-hero-1920x800.webp` | 1920×800, 191KB | AI 생성 자연 배경(새벽 산·숲). 점검 섹션 배경 |
| `design/assets/humanmcp-og-1200x630.webp` | 1200×630, 146KB | AI 생성 SNS 공유 이미지. OG, 상담 섹션 배경 |
| 빗금 placeholder | — | 브랜드 사진·콘텐츠 이미지 자리(실제 이미지로 교체) |

## Files
```
design/
  site/Home.html        메인 홈
  site/Article.html     콘텐츠 상세 템플릿
  site/Booking.html     상담예약·온보딩 (상태 포함)
  Design System.html    토큰·컴포넌트·상태 명세
  css/hmcp.css          토큰 + 공통 컴포넌트
  js/chrome.js          헤더/드로어/푸터/모바일 CTA
  js/dx.js              3분 점검 위젯
  assets/               이미지 3종
docs/
  research-notes.md     ICM 전자책·litt.ly·벤치마킹 분석 메모
CLAUDE_CODE_PROMPT.md   Claude Code에 붙여 넣을 요청문
```
브라우저에서 `design/site/Home.html`을 열면 세 화면을 클릭하며 이동할 수 있습니다.
