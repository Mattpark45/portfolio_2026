# Human MCP 디지털 영업지점 (human-mcp-web)

기업 경영상담과 개인·가족 재무상담의 온라인 접점(Digital Advisory Branch)입니다. 자기소개 포트폴리오(`main` 브랜치, GitHub Pages)와는 별개의 사이트입니다.

- 공개 파일: `site/` (빌드 없음)
- 설계·로드맵: `docs/ARCHITECTURE.md` · 운영 규칙: `docs/REQUIREMENTS.md` · 디자인: `docs/DESIGN-SYSTEM.md`

## 자주 하는 일
- 예약 연결: `site/assets/site.js`의 `BOOKING_URL`에 Google 캘린더 예약 페이지 주소 입력
- 머리글·바닥글: `partials/` 수정 후 `npm run layout`
- 새 페이지: `python3 scripts/new_page.py <경로> <제목> <설명> < 본문.html` 후 `npm run layout`
- 시험: `npm test`
- Preview 배포: `CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… npx wrangler@3 pages deploy site --project-name human-mcp --branch preview` → https://preview.human-mcp.pages.dev
- Production 배포(승인 후): `… npm run deploy` → https://human-mcp.pages.dev

## 롤백
Cloudflare 대시보드 → Pages → human-mcp → Deployments에서 이전 배포를 "Rollback"으로 되돌립니다.
