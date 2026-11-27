# Intelligence 운영 (CMS · SEO/GEO/AIO · 뉴스레터)

원본은 `content/insights.py` 하나입니다. 화면·목록·피드는 모두 `python3 scripts/build.py` 가 만듭니다.

## 글 하나 발행하는 순서
1. `npm run new -- <slug> <category> "<제목>"` → `status: 'draft'` 로 추가 (공개 안 됨)
2. 내용 작성: 요약 3~4줄, 섹션, 사실/해석 구분(`fi`), 출처(원문 URL), 자료 기준일(`basis`), 적용 한계(`limits`)
3. 검토: 숫자·법령은 원문 대조. 세무·법률·노무 주제는 `reviewer` 에 실제 검토자 상태를 사실대로 적음
4. 금융상품·가입·수익·절세 표현이 들어가면 **게시 보류** (`ad_review` 기록, 심의 후에만)
5. `status: 'published'` → `npm test` (빌드 + 정적 검사 + 브라우저 E2E)
6. 커밋·푸시 → `npm run deploy` (토큰은 환경변수로만)
7. 배포 후 확인: 글 URL, `/intelligence`, `/rss.xml`, `/sitemap.xml`

| status | 의미 |
|---|---|
| `draft` | 작성 중. 공개 폴더에서 자동 제거 |
| `review` | 전문가·심의 대기. 공개 안 됨 |
| `published` (기본) | 공개. 필수 항목이 비면 빌드 실패 |

카테고리(7): personal 개인·가족 재무 · business 기업 경영 · policy 정책·규제 · capital 자본·거래 · global 성장·해외진출 · ax AI·AX · journal Human MCP Journal

## 빌드가 자동으로 하는 일
- 글 상세 `site/intelligence/<slug>.html` (Article·Breadcrumb JSON-LD, 작성·검토·자료 기준일, 출처, 관련 글)
- 허브 `/intelligence` 목록·카테고리 수, 홈 Intelligence 블록, 기업 페이지 관련 글
- `sitemap.xml`, `rss.xml`, `llms.txt`(AI 검색용 요약), 모든 페이지 canonical·og:url·절대 og:image
- 채널 파생 초안 `exports/channels/<slug>.md` (블로그·Threads·LinkedIn·뉴스레터, UTM 포함) — **사이트에 올라가지 않고, 사람이 검토 후 직접 게시**

## 갱신 주기 (권장)
- 정책·법령 글: 국회 의결·고시·시행일마다 `reviewed` 갱신, 본문의 '정부안' 표기 정리
- 모든 글: 분기 1회 출처 링크 점검
- 주 1편 발행 → 채널 초안 3종 수동 게시 → 월 1회 브리핑 메일

## 뉴스레터 (현재 단계)
- 사이트 구독 폼은 **서버 저장 없이** 신청 메일을 작성하게 합니다(동의 체크 필수). 서버 전송·수집 없음.
- 정식 발송 서비스(예: 스티비·메일리)를 정하면 폼 action 만 교체하고 처리방침에 수탁자를 추가합니다.
- RSS(`/rss.xml`)는 지금 바로 구독 가능.

## 하지 않는 것
비공식 API·자동 게시·DM 자동화, 확인되지 않은 성과·조회수 표시("많이 읽은 글" 등), 승인 전 금융 표현.
