# 박동혁 — 부산 창업 해커톤 [더 스퀘어] 포트폴리오 웹사이트

> 슬라이드 17장을 **세로 스크롤형 단일 웹페이지**로 변환. 해커톤 신청서의 "own site" 항목 제출용.

## 📦 구성

```
park-donghyuk-site/
├── index.html    # 단일 페이지 (18 섹션: 표지 → 외부 링크 → Contact)
├── style.css     # 부산창업 시그니처 톤 + 반응형 (데스크탑/태블릿/모바일)
└── README.md     # (이 파일)
```

## 🌐 어떻게 공개·배포하는가 (3가지 옵션, 권장순)

### [A] GitHub Pages — 가장 빠르고 무료 · URL 형식 깔끔 (권장)
1. GitHub에 새 public repo 생성 (예: `park-donghyuk-portfolio`)
2. `index.html` + `style.css` 두 파일을 repo 루트에 업로드
3. Settings → Pages → Source: "Deploy from a branch" → main 선택
4. 1~2분 후 `https://<github아이디>.github.io/park-donghyuk-portfolio/` URL 활성화
5. 신청서 "own site" 항목에 위 URL 입력

### [B] Vercel — 커스텀 도메인까지 원하는 경우
1. [vercel.com](https://vercel.com) 로그인 (GitHub 계정 연동)
2. "New Project" → 위 repo 임포트 → Deploy
3. `https://park-donghyuk-portfolio.vercel.app` 형식 URL 즉시 발급
4. 원한다면 `parkdonghyuk.kr` 같은 도메인 연결 가능

### [C] Netlify Drop — 가장 간단 (계정 불필요)
1. [app.netlify.com/drop](https://app.netlify.com/drop) 접속
2. `park-donghyuk-site/` 폴더 자체를 드래그앤드롭
3. `https://랜덤이름.netlify.app` URL 즉시 발급
4. 옵션: 무료 계정 생성 후 URL 이름 변경 가능

## ✏️ 제출 전 반드시 교체할 링크 (17번 섹션)

다음 항목들은 placeholder URL을 넣어두었습니다. **본인 계정 URL 확정 후 교체** 또는 신청서에 'X' 기입:

| 카드 | 현재 placeholder | 교체 방법 |
|---|---|---|
| 카카오 성공사례 | `business.kakao.com` | 정확한 케이스 페이지 URL이 있다면 교체 |
| 로켓펀치 | `rocketpunch.com` | 본인 프로필 URL로 교체 |
| Instagram | `instagram.com` | 본인 핸들 URL로 교체 |
| 한국AI기술협회 | `kaita.or.kr` | 협회 정확한 URL / 위원 소개 페이지 |
| 중기연 비즈니스지원단 | `#` | 정확한 URL 또는 'X' |
| 부산경제진흥원 | `bepa.kr` | 인증 페이지 URL이 있다면 교체 |
| TIPA 선정 | `tipa.or.kr` | 공고 페이지 URL이 있다면 교체 |

**확실히 동작하는 링크** (수정 불필요):
- ✅ 코멘토 강의 페이지 (실제 URL)
- ✅ 밀리의서재 운영 데이터 Google Sheets (실제 URL)
- ✅ 웨딩북 운영 데이터 Google Sheets (실제 URL)
- ✅ 이메일 (mailto:)
- ✅ 전화 (tel:)

## 🎨 디자인 시스템

슬라이드 17장과 100% 동일한 디자인 토큰을 사용:
- **컬러**: Deep Navy `#0A2540` · Coral `#FF5A36` · Cream `#F7F4EE`
- **타이포**: Pretendard (한글) + IBM Plex Mono (숫자)
- **레이아웃**: 좌측 고정 네비게이션 (데스크탑) / 햄버거 메뉴 (모바일)
- **반응형 브레이크포인트**: 1024px (태블릿) · 640px (모바일)

## 🔧 로컬에서 미리보기

```bash
# 방법 1: Python 기본 서버
cd park-donghyuk-site
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기

# 방법 2: VS Code Live Server 확장
# index.html 우클릭 → "Open with Live Server"
```

## 📝 사용 노트

- 모든 텍스트와 수치는 슬라이드 버전과 일치
- 외부 링크는 새 탭에서 열림 (`target="_blank" rel="noopener"`)
- 스크롤 위치에 따라 좌측 네비게이션에 현재 섹션이 코랄색으로 active 표시
- SEO 메타태그 + Open Graph 태그 포함 (카카오톡/슬랙 공유 시 미리보기 작동)
