# Human MCP Design System v1 — Entrepreneurial Advisor

원본 구현: `site/assets/site.css`의 `:root` 토큰. 이 문서와 CSS가 다르면 CSS를 기준으로 고치고 이 문서를 갱신한다.

## 0. 기준 원본
- Genspark 디자인 인계 패키지: `docs/design/README.md` (토큰·화면 사양). 이 문서의 토큰과 대부분 일치하며, 차이가 있으면 인계 패키지를 기준으로 맞추되 `docs/REQUIREMENTS.md`의 미심의·사실 확인 규칙이 우선한다.

## 1. 방향
- **D안 Entrepreneurial Advisor**: Root·Define Financial의 사람 중심 신뢰와 콘텐츠(35%) + J.P. Morgan의 기업·오너 통합자문(30%) + FP Alpha·RightCapital의 진단 경험(20%) + 휴먼MCP 고유의 사업경험·연결·Intelligence(15%).
- 프라이빗뱅킹형(A안)은 향후 기업 오너·승계·Exit 전용 페이지에서 변형으로 쓸 수 있다(토큰 동일, 여백·사진 비중만 조정).
- 핵심 메시지: **사람의 삶과 기업의 성장을 함께 설계합니다.**
- 브랜드 성격: 인간적인 신뢰 · 전문성 · 지적 호기심 · 실행력 · 연결 · 지속적인 성장.

## 2. 색상 토큰 (WCAG 2.2 AA 계산값)
| 토큰 | 값 | 용도 | 대비 |
|---|---|---|---|
| `--forest` | #143D30 | 주색: 버튼, 제목, 어두운 섹션 | ivory 위 10.9:1 |
| `--forest-2` | #1F5643 | hover, 보조 강조 | ivory 위 7.7:1 |
| `--ivory` | #F6F3EC | 기본 배경 톤 | — |
| `--ivory-2` | #EEE8DC | 알림·칩 배경 | — |
| `--charcoal` | #252C2B | 본문 | ivory 위 12.9:1 |
| `--muted` | #5A615F | 보조 글자 | ivory 위 5.7:1 |
| `--brass` | #AC8B46 | **장식 전용**(선·아이콘·마크) | ivory 위 2.9:1 → 글자 금지 |
| `--brass-text` | #7D6229 | 작은 강조 글자(eyebrow 등) | ivory 5.2 / ivory-2 4.7 |
| `--brass-light` | #D4B676 | 어두운 배경 위 강조 글자 | forest 위 6.2:1 |
| `--blue` | #527487 | 데이터·도구 영역 장식 | ivory 4.5 (큰 글자만) |
| `--blue-text` | #41657A | 링크 | ivory 5.6 / white 6.2 |
| `--on-dark` | #C9D6CF | 어두운 배경 위 보조 글자 | forest 위 8.1:1 |

규칙: Brass Gold 원색(#AC8B46)은 글자색으로 쓰지 않는다. 포커스 표시는 brass 3px 테두리(비텍스트 3:1 충족).

## 3. 타이포그래피
- 서체: 제목(h1·h2) **Noto Serif KR 700**(@fontsource 5.3.1, jsDelivr, 필요한 글자 구간만 내려받음), 본문 **Pretendard Variable**. CDN 차단 시 시스템 서체로 대체되어도 레이아웃 유지.
- h1 clamp(2rem→3.2rem), h2 clamp(1.5rem→2.2rem), h3 1.15rem, 본문 16px·행간 1.7, `word-break: keep-all`.
- 강조: h1 안의 `<em>`은 형광펜형 brass 밑줄(굵기·색으로만 강조, 기울임 없음).
- eyebrow: 대문자 영문 소제목 + 앞쪽 brass 선 22px.

## 4. 간격·형태
- 간격 토큰 `--space-1`(4px) ~ `--space-9`(88px), 섹션 상하 80px(모바일 동일, 좌우 20px).
- 모서리: 카드 14px, 큰 카드 20px, 버튼·칩은 완전 둥근(999px).
- 그림자: 떠 있는 카드에만 `--shadow`. 일반 카드는 1px 선.

## 5. 브랜드 마크
- `site/assets/mark.svg`, 파비콘 `site/favicon.svg`.
- 의미: 위의 원(사람) · 왼쪽 아래 사각형(기업) · 오른쪽 아래 링(전문가·자본·기술 네트워크)을 brass 선으로 연결 = **MCP(연결)**.
- 최소 크기 24px, 주변 여백은 마크 높이의 25% 이상. 배경은 forest 고정.
- 정식 CI(로고 파일·사용 규정)는 디자이너 검토 후 확정한다. 이 마크는 v1 임시안이다.

## 5-1. 아이콘
- **Lucide** (lucide-static 1.77.0, ISC 라이선스, `assets-src/icons/LICENSE-lucide`). 선 굵기 1.5px, 24px 격자, 색은 `currentColor`(기본 Forest, 강조 Brass).
- 사용법: 페이지에 `<span class="ico" data-icon="이름"></span>`을 쓰고 `npm run layout` → SVG가 인라인으로 들어간다(외부 요청 없음). 새 아이콘은 lucide-static에서 `assets-src/icons/`로 복사한다.
- 생성형 AI로 만든 아이콘은 섞지 않는다(굵기·격자 불일치).

## 5-2. 인물 사진
- 홈 히어로: `hero-480/720.webp` (사용자 제공, 사무실 배경 상반신). 소개·작성자: `profile-480/720.webp` (사용자 제공 정장 프로필).
- 공유 이미지: `og-1200x630.webp` (Genspark 디자인 인계 패키지의 AI 생성 자연 배경, 인물 없음).
- 다른 사람이 함께 나오는 상담 장면 이미지는 실제 고객 상담으로 오해될 수 있어 쓰지 않는다(실제 촬영·동의분만).
- 다른 인물·고객 사진은 실제 촬영본과 초상권 동의가 있을 때만 추가한다.

## 6. 구성 요소 (구현 현황)
| 요소 | 상태 | 클래스 |
|---|---|---|
| Header/Navigation(모바일 메뉴) | 구현 | `.site-header`, `.nav`, `.menu-btn` |
| Footer(공식 채널 포함) | 구현 | `.site-footer`, `.channels` |
| Button(주/테두리/밝은/작은) | 구현 | `.btn`, `.ghost`, `.light`, `.small` |
| Card / 진입 카드 / 상황 카드 | 구현 | `.card`, `.audience`, `.situation` |
| 진입 경로(읽기→점검→상담) | 구현 | `.paths` |
| 여정(가로/세로 단계) | 구현 | `.journey`, `.steps`, `.journey-card` |
| FAQ(아코디언) | 구현 | `.faq details` |
| Form 요소(선택·서술) | 구현(전송 없음) | `.q`, `.opts`, `textarea` |
| Alert/Notice | 구현 | `.notice`, `.notice.calm` |
| Status 메시지 | 구현 | `.status[role=status]` |
| 신뢰 띠 / 서비스+도구 카드 / 7개 영역 바 / 자기점검 띠 / 4단계 여정 | 구현 | `.trust`, `.services`, `.tools`, `.domains`, `.check-band`, `.journey.four` |
| 상태 배지(이용 가능/준비 중) | 구현 | `.badge.live`, `.badge.soon` |
| Modal, Table, Chart, Loading, Empty, Error(폼) | **미구현** | 진단센터·예약 기능 도입 시 추가 |

## 7. 사진·이미지 원칙
- 실제 강의·기업미팅·사업활동 사진만 쓴다. 생성 이미지·스톡 인물로 경력이나 고객을 암시하지 않는다.
- 사진이 확보되기 전에는 텍스트·도식으로 구성한다(현재 상태).

## 8. 쓰지 않는 표현
`docs/REQUIREMENTS.md`의 미심의 표현 규칙을 따른다. 디자인 시안에 있는 수치·날짜·보안 기능(암호화·자동삭제 등)·후기는 검증 전까지 사용하지 않는다.
