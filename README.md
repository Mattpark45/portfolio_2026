# Human MCP 디지털 영업지점 (human-mcp-web)

기업 경영상담과 개인·가족 재무상담의 온라인 접점입니다. 빌드 과정이 없는 정적 사이트이며(공개 파일은 `public/`만), Cloudflare Pages 무료 플랜에 그대로 배포합니다.

| 경로 | 내용 |
|---|---|
| `/` | 첫 화면: 개인·기업 두 진입 동선, 상담 흐름 |
| `/personal/` | 개인·가족 재무상담 안내 |
| `/business/` | 기업·경영자 경영상담 안내 |
| `/about/` | 소개·경력·마케팅 실무 사례 |
| `/contact/` | 상담 일정 요청 (Google 캘린더 예약 / 전화·이메일) |
| `/privacy/` | 개인정보 처리 안내 (초안) |
| `/portfolio/` | 2026.06 해커톤 제출용 이전 포트폴리오 (보존) |

## 자주 하는 일
- **예약 페이지 연결**: `assets/site.js`의 `BOOKING_URL`에 Google 캘린더 예약 페이지 주소를 넣으면 모든 "상담 일정 요청" 버튼이 그 주소로 바뀝니다. 비어 있으면 연락처 페이지로 안내합니다.
- **머리글·바닥글 수정**: `partials/`를 고친 뒤 `npm run layout`
- **시험**: `npm test` (정적 검사 + 브라우저 E2E. E2E는 Playwright 필요)

## 배포 (Cloudflare Pages, 무료)
1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git → `Mattpark45/portfolio_2026`
2. Production branch `main`, Framework preset `None`, Build command 비움, Output directory `public`
3. 프로젝트 이름이 주소가 됩니다. 예: `human-mcp` → `https://human-mcp.pages.dev`
4. 이후 `main`에 병합할 때마다 자동 배포되고, PR마다 미리보기 주소가 생깁니다.

## 운영 원칙
`docs/REQUIREMENTS.md`가 기준 원본입니다. 특히 금융광고 미심의 상태의 표현 규칙을 지켜야 합니다.
