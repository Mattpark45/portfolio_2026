# Claude Code 요청문 (복사해서 사용)

> 사용법: 이 폴더(`design_handoff_human_mcp/`)를 저장소 안 `docs/design/`에 넣은 뒤, Claude Code에서 아래 내용을 붙여 넣으세요.

---

`docs/design/` 폴더는 Genspark Design에서 확정한 휴먼MCP 디지털 영업지점의 **디자인 인계 패키지**입니다. 먼저 `docs/design/README.md`를 끝까지 읽고, `docs/design/design/site/*.html`을 브라우저 기준으로 분석해 주세요.

## 원칙
- HTML 파일은 **디자인 레퍼런스**입니다. 그대로 복사하지 말고 현재 저장소의 스택과 패턴으로 다시 구현합니다.
- 기존 저장소의 코드를 덮어쓰지 않습니다. 기존 Production Engineering Master Instruction과 Notion Master의 기준을 그대로 유지합니다.
- 저장소가 비어 있다면 Next.js(App Router) + TypeScript + Tailwind CSS를 제안하고, 시작 전에 확인을 받습니다.
- README의 "준법·보안 기준"과 "실제 기능 vs Mock" 표를 반드시 지킵니다. 공개 웹에서 민감정보를 수집하는 기능은 만들지 않습니다.
- `.sample` 배지와 Booking의 "상태 미리보기" 스위치는 디자인 전용이므로 구현하지 않습니다. 확인이 필요한 문구·직함·도구 상태는 설정 파일(또는 CMS)로 분리합니다.

## 1단계 — 계획만 먼저 (코드 작성 전)
다음을 정리해서 보여 주세요. 제가 승인하면 2단계로 넘어갑니다.
1. 디자인과 현재 저장소 비교: 그대로 구현 / 기존 컴포넌트 재사용 / 새로 개발 / 준법·보안 검토 필요 항목으로 구분
2. 디자인 토큰 적용 방식 (`hmcp.css :root` → Tailwind theme 또는 CSS 변수)
3. 공통 컴포넌트 목록: Header, MobileDrawer, Footer, MobileStickyCTA, Button(primary/secondary/gold/ghost-light/link), StatusBadge, SituationRow, ServiceRow, ToolCard, DxWidget, ArticleMeta, TOC, FactInterpretBox, Callout, SourceList, BookingStepper, ChoiceCard, Chip, DayPicker, SlotPicker, FormField, ConsentGroup, Alert, Skeleton, EmptyState
4. 라우트 구조: `/`, `/intelligence/[slug]`, `/booking` (+ 아직 디자인 안 된 페이지는 빈 라우트로만)
5. 페이지별 GitHub Issue 초안과 Acceptance Criteria (README와 Step 5-6 문서의 기준 사용)
6. Claude Code / Codex 작업 분리안

## 2단계 — 구현 순서
1. 디자인 토큰 + 폰트(Pretendard, Noto Serif KR, IBM Plex Mono) + 전역 스타일
2. 공통 컴포넌트 (Header/Drawer/Footer/Button/Form 요소)
3. Home — 섹션 순서와 문구는 Home.html 그대로
4. 3분 점검 위젯 — 규칙(RES)은 `config/dx-rules.ts` 등으로 분리, 결과→예약 연결은 sessionStorage
5. Article 템플릿 — MDX 또는 CMS 스키마(작성자, 작성일, 검토일, 검토자, 카테고리, 요약, 출처 필수), Article JSON-LD
6. Booking — 4단계 + 로딩/빈 일정/오류/완료 상태. 예약 API와 캘린더 연동은 인터페이스만 만들고 Mock 구현으로 시작

## 검증
- 1440 / 1280 / 768 / 390 / 360px에서 디자인과 비교 (가로 스크롤 없음)
- WCAG 2.2 AA: 대비, 키보드 조작, 포커스 링, 폼 라벨·오류, aria-live
- Lighthouse 성능·접근성·SEO
- E2E: 점검 → 결과 → 예약 → 완료, 전화번호 오류, 전송 실패 시 입력 유지

## 보고 형식
디자인 완성 / 기능 완성 / Production 배포 가능 여부 / 실제 영업성과 검증을 **구분해서** 보고해 주세요. 자동 생성 코드를 Production 수준으로 검증됐다고 표현하지 마세요.
