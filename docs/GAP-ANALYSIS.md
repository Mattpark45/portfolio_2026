# 제품 Gap 분석 — Engineering Instruction v2.0 기준 (2026-11-28)

기준: Notion LLM START HERE(2026-11-28 갱신), P01·P08 Project Guide, 2026-11-27 제품 코드·보안 감사.
상태 표기: PASS / FAIL / BLOCKED(원본·권한 없음) / NOT RUN / HOLD(Release Gate 미통과).

## 0. P0 — 다른 일보다 먼저

| 항목 | 상태 | 증거 (2026-11-28) | 조치 주체 |
|---|---|---|---|
| 재무X레이 Scout `/api/*` 무인증 공개 | **FAIL (지속)** | `/api/companies` 200 · 157KB, `/api/diagnosis-leads` 200 (내용 미열람, 상태코드만 확인) | 사용자: Cloudflare Access 적용. 원본 소스 확보 전까지 고객 데이터 입력 금지 |
| ai-cardnews-maker 공개 저장소 API 키 | FAIL (11-27 기준, 재확인 안 함) | `.streamlit/secrets.toml` | 사용자: 키 폐기·재발급 |

## 1. 제품별 Gap

| 제품 | 업무요구 (v2.0) | 현재 구현 | Gap | 상태 |
|---|---|---|---|---|
| 사업자주치의AI | ICM 18대 진단, 산업별 심화, Risk·Benefit·Growth, 대안 비교, 전문가 Routing, 유료진단 전환 | Genspark 배포 단일 HTML, 샘플 데이터, 기능 API 404 | 원본 소스 없음. **18대 진단 항목 정의가 Notion에서 확인되지 않음**(P01은 명칭만 언급) | BLOCKED |
| 재무X레이 (법인 Scout) | 법인 재무·운전자본·위험·복지·퇴직연금·대표재무, 가정/실제 구분 | Cloudflare Pages + D1 추정, 170개 기업 데이터 | API 무인증(P0), 원본 소스 미확보, 계산식 근거 대조 불가 | HOLD |
| 개인 재무X레이 | 개인 현금흐름·위험·투자·은퇴·부동산·세금·상속·부채 | Novita 샌드박스 502 | 소스 유실 위험 | BLOCKED |
| Corporate Signal Engine | Evidence→Signal→…→Mandate→Outcome, 신호를 확정수요로 처리 금지 | Notion DB·예약작업, 코드 없음 | 코드 제품 아님. Build Freeze 원칙상 신규 구축 보류가 맞음 | 해당 없음 |
| Digital Branch | 유입→SHIP→적격문의→예약→동의→승인된 경로→서비스→소개, **세 사업 경로 구분** | human-mcp.pages.dev, CMS·예약·테스트 | 아래 2장 | 일부 해소 |

## 2. Digital Branch 세부

| 단계 | 현재 | Gap → 이번 변경 |
|---|---|---|
| 채널 유입 | Intelligence CMS, RSS, sitemap, llms.txt, 채널 초안(UTM) | 유입 측정 없음 (Cloudflare Web Analytics는 처리방침 개정 승인 필요) |
| 적격문의 | 3분 점검, 4단계 요청 | 트랙 구분 없음 → **트랙 태그(기업자문/개인·법인 재무/인재 채용/협업)를 요청 메일 제목에 부착** |
| 상담예약 | Google 캘린더 iframe | 트랙별 캘린더 없음 (단일 "커피챗") |
| 동의 | 연락처 이용 동의 체크 | 이용 목적이 트랙별로 다름 → 트랙별 진행 안내 문구 추가 |
| 승인된 계약 경로 | 금융: "소속 회사 승인 업무환경" 문구 | 인재 채용 경로 없음 → **`/talent` 페이지 신설, "별도 채용 의뢰 계약", 후보자 정보 사이트 수집 금지 명시** |
| 서비스·소개 | 없음 (사이트 범위 밖, CRM·ATS·금융전산이 원본) | 범위 밖 유지 |

### 이번 변경의 제외 범위
- 사이트에 고객·후보자 개인정보를 저장하는 서버·DB를 만들지 않음 (메일 앱 전달만)
- 서치펌·GA 회사명 공개 표기는 하지 않음 (공개 동의·계약 확인 전)
- 18대 진단 항목을 추정해 만들지 않음

## 3. 미해결 (사용자 확인 필요)
1. ICM 18대 기업진단 항목 원문 위치
2. 인재 채용 자문의 계약 주체·수수료 구조 공개 범위, 회사명 표기 여부
3. 트랙별 캘린더를 나눌지 (현재 단일)
4. Scout 원본 소스 연결 방식 (Cloudflare Pages → Settings)
