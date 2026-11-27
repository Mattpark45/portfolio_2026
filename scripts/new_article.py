"""새 Intelligence 글 초안을 content/insights.py 끝에 추가 (status='draft', 공개 안 됨).
사용: python3 scripts/new_article.py <slug> <category> "<제목>"
카테고리: personal business policy capital global ax journal
"""
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'content' / 'insights.py'
if len(sys.argv) != 4:
    sys.exit(__doc__)
slug, cat, title = sys.argv[1:]
if not re.fullmatch(r'[a-z0-9-]+', slug):
    sys.exit('slug 는 영문 소문자·숫자·하이픈만')
s = SRC.read_text(encoding='utf-8')
if f"'slug': '{slug}'" in s:
    sys.exit('이미 있는 slug')
today = datetime.date.today().isoformat()
entry = f'''    {{
        'slug': {slug!r},
        'status': 'draft',  # 검토 끝나면 'published' 로 바꾸고 npm test → npm run deploy
        'priority': 1,
        'title': {title!r},
        'dek': '',          # 검색 결과·카드에 쓰이는 한두 문장 (15~160자)
        'category': {cat!r},
        'published': {today!r}, 'reviewed': {today!r}, 'basis': {today!r},  # basis = 자료 기준일
        'reviewer': '작성자 자체 검토 (전문가 검토 전)',
        'ad_review': '해당 없음 — 일반 정보 (금융상품 언급 시 게시 보류)',
        'minutes': 4,
        'service': ('/corporate', '기업 경영자문'),
        'topic': '',        # 상담 요청 화면에 미리 채울 주제
        'limits': '',       # 적용 한계 (비우면 기본 문구)
        'summary': ['', '', ''],
        'sections': [
            {{'h': '', 'html': '<p></p><div class="fi"><div class="fact"><span class="lbl">사실</span><br>…<sup><a href="#r1">[1]</a></sup></div><div class="interp"><span class="lbl">해석</span><br>…</div></div>'}},
        ],
        'sources': [
            {{'label': '[1] 기관명, 「자료명」, YYYY-MM-DD', 'url': ''}},
        ],
    }},
'''
i = s.rstrip().rfind(']')
SRC.write_text(s[:i] + entry + s[i:], encoding='utf-8')
print(f'추가됨: {slug} (draft). content/insights.py 에서 내용을 채우세요.')
