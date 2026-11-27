# Human MCP 디지털 영업지점 (human-mcp-web)

기업 경영상담과 개인·가족 재무상담의 온라인 접점입니다. 빌드 과정이 없는 정적 사이트입니다.

**공개 주소: https://mattpark45.github.io/portfolio_2026/** (GitHub Pages, `main` 브랜치 최상위 폴더)

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

## 배포
- **현재: GitHub Pages.** `main`에 병합하면 1~2분 뒤 자동 반영됩니다. 사이트는 `/portfolio_2026/` 하위 경로에서 열리므로 내부 링크는 모두 상대경로여야 합니다(`npm run layout`이 자동 변환, 시험이 검사).
- **나중에 Cloudflare Pages로 옮길 때:** Connect to Git → 이 저장소, Build command 비움, Output directory `/`. 상대경로라 그대로 동작합니다.
- **롤백:** 문제가 생기면 `main`에서 해당 병합 커밋을 revert 하면 이전 화면으로 돌아갑니다.
- 참고: 저장소가 공개이므로 `docs/`, `tests/` 등도 GitHub와 공개 주소에서 열람될 수 있습니다. 비밀값·고객정보는 절대 커밋하지 않습니다.

## 운영 원칙
`docs/REQUIREMENTS.md`가 기준 원본입니다. 특히 금융광고 미심의 상태의 표현 규칙을 지켜야 합니다.
