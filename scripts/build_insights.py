"""Intelligence 글 생성기 (콘텐츠 원본 = content/insights.py).

사용: python3 scripts/build_insights.py && python3 scripts/sync_layout.py
- 글 상세 페이지: site/insights/<slug>/index.html
- 목록 페이지: site/insights/index.html
- 홈의 Intelligence 블록: site/index.html 의 <!-- insights:home --> 구간
모든 글은 작성일·검토일·검토자·출처가 필수다(없으면 실패).
"""
import html
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
BASE = 'https://human-mcp.pages.dev'

spec = importlib.util.spec_from_file_location('content', ROOT / 'content' / 'insights.py')
content = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content)
ARTICLES_ALL = content.ARTICLES
DRAFTS = [a for a in ARTICLES_ALL if a.get('draft')]
ARTICLES = [a for a in ARTICLES_ALL if not a.get('draft')]
import shutil
for d in DRAFTS:  # 비공개 글은 공개 폴더에서 제거
    shutil.rmtree(SITE / 'insights' / d['slug'], ignore_errors=True)
CATEGORIES = content.CATEGORIES

REQUIRED = ['slug', 'title', 'dek', 'category', 'published', 'reviewed', 'reviewer', 'minutes', 'summary', 'sections', 'sources']
for a in ARTICLES:
    missing = [k for k in REQUIRED if not a.get(k)]
    if missing:
        sys.exit(f"{a.get('slug')}: 필수 항목 누락 {missing}")
    if a['category'] not in CATEGORIES:
        sys.exit(f"{a['slug']}: 알 수 없는 카테고리 {a['category']}")

FONT_LINKS = '''<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-kr@5.3.1/700.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.2.7/500.css">
<link rel="stylesheet" href="/assets/site.css">'''


def esc(s):
    return html.escape(s, quote=True)


def dot(d):
    return d.replace('-', '.')


def head(title, desc, path, extra=''):
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:locale" content="ko_KR">
<link rel="canonical" href="{BASE}{path}">
<meta property="og:image" content="{BASE}/assets/img/og-1200x630.webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{BASE}{path}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#143D30">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
{FONT_LINKS}
{extra}</head>
<body>
<!-- layout:header -->
<!-- /layout:header -->
'''


TAIL = '''
<!-- layout:footer -->
<!-- /layout:footer -->
</body>
</html>
'''


def article_page(a, related):
    path = f"/insights/{a['slug']}/"
    ld = {
        '@context': 'https://schema.org', '@type': 'Article', 'headline': a['title'], 'description': a['dek'],
        'datePublished': a['published'], 'dateModified': a['reviewed'], 'inLanguage': 'ko',
        'author': {'@type': 'Person', 'name': '박동혁', 'url': f'{BASE}/about/'},
        'publisher': {'@type': 'Organization', 'name': 'Human MCP', 'logo': {'@type': 'ImageObject', 'url': f'{BASE}/favicon.svg'}},
        'image': f'{BASE}/assets/img/og-1200x630.webp', 'mainEntityOfPage': f'{BASE}{path}',
    }
    extra = '<script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False) + '\n</script>\n'
    toc = ''.join(f'<li><a href="#s{i+1}">{esc(s["h"])}</a></li>' for i, s in enumerate(a['sections']))
    body = ''.join(f'<h2 id="s{i+1}">{esc(s["h"])}</h2>\n{s["html"].strip()}\n' for i, s in enumerate(a['sections']))
    sources = ''.join(
        f'<li id="r{i+1}">{esc(s["label"])}' + (f' — <a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["url"])}</a>' if s.get('url') else '') + '</li>'
        for i, s in enumerate(a['sources']))
    summary = ''.join(f'<li>{esc(x)}</li>' for x in a['summary'])
    rel = ''.join(f'<li><a href="/insights/{r["slug"]}/"><b>{esc(r["title"])}</b><time>{esc(CATEGORIES[r["category"]])}</time></a></li>' for r in related)
    svc = a.get('service', ('/business/', '기업 경영자문'))
    return head(f"{a['title']} — Human MCP Intelligence", a['dek'], path, extra) + f'''
<main id="main">
<header class="article-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="현재 위치"><a href="/">홈</a> › <a href="/insights/">Intelligence</a> › {esc(CATEGORIES[a['category']])}</nav>
    <span class="cat">{esc(CATEGORIES[a['category']])} · {a['minutes']}분</span>
    <h1>{esc(a['title'])}</h1>
    <p class="dek">{esc(a['dek'])}</p>
    <div class="meta">
      <img src="/assets/img/profile-480.webp" alt="" width="48" height="48">
      <div class="who"><b>박동혁</b><span>Human MCP 대표 자문가</span></div>
      <div class="dates">최초 작성 {dot(a['published'])} · 최근 검토 {dot(a['reviewed'])}<br>검토: {esc(a['reviewer'])}</div>
    </div>
  </div>
</header>
<div class="wrap article-grid">
  <nav class="toc" aria-label="목차"><b>CONTENTS</b><ol>{toc}</ol></nav>
  <article class="prose">
    <details class="toc-mobile"><summary>목차</summary><ol>{toc}</ol></details>
    <div class="keypoints"><b>핵심 요약</b><ul>{summary}</ul></div>
{body}
    <h2 id="sources">출처</h2>
    <p class="muted" style="font-size:14.5px">기준일 {dot(a['reviewed'])}. 언론 보도는 2차 자료이며, 확정 내용은 공식 원문과 담당 기관 안내로 확인해야 합니다.</p>
    <ol class="sources">{sources}</ol>
    <div class="author-box"><img src="/assets/img/profile-480.webp" alt="" width="64" height="64"><div><b>박동혁 · Human MCP</b><p>기업 경영자문과 개인·가족 재무상담을 함께 하는 자문가. 이 글은 일반 정보이며 개별 상황에 대한 법률·세무 판단이나 상품 권유가 아닙니다.</p></div></div>
  </article>
  <aside class="rail" aria-label="관련 안내">
    <div class="box"><b>관련 서비스</b><a href="{svc[0]}">{esc(svc[1])} →</a></div>
    <div class="box"><b>관련 도구</b><a href="/prepare/">상담 준비 질문 (5분) →</a></div>
    <div class="box cta"><b>30분 첫 상담</b><p>이 글과 관련해 우리 회사·가족 상황에 맞는지 함께 확인해 보세요.</p><a class="btn" data-booking href="/contact/#request">상담 일정 요청</a></div>
  </aside>
</div>
<section class="block alt" style="padding-top:64px">
  <div class="wrap">
    <h2>함께 읽으면 좋은 글</h2>
    <ul class="post-list">{rel}</ul>
  </div>
</section>
</main>
''' + TAIL


def list_item(a):
    return f'<li><a href="/insights/{a["slug"]}/"><span class="cat">{esc(CATEGORIES[a["category"]])}</span><b>{esc(a["title"])}</b><time datetime="{a["reviewed"]}">검토 {dot(a["reviewed"])}</time></a></li>'


def index_page(arts):
    feat = arts[0]
    cats_used = [c for c in CATEGORIES if any(a['category'] == c for a in arts)]
    pills = ''.join(f'<li><a href="#cat-{c}">{esc(CATEGORIES[c])}</a></li>' for c in cats_used)
    groups = ''
    for c in cats_used:
        items = ''.join(list_item(a) for a in arts if a['category'] == c)
        groups += f'<h2 id="cat-{c}" style="font-size:24px;margin-top:48px;scroll-margin-top:96px">{esc(CATEGORIES[c])}</h2>\n<ul class="post-list">{items}</ul>\n'
    return head('Intelligence — Human MCP', '대표와 가족이 실제로 묻는 질문에 답합니다. 모든 글에 작성일·검토일·출처를 적고 사실과 해석을 나눠 씁니다.', '/insights/').replace('og:type" content="article"', 'og:type" content="website"') + f'''
<main id="main">
<section class="hero">
  <div class="wrap narrow">
    <span class="eyebrow">Intelligence</span>
    <h1>대표와 가족이 실제로 묻는 질문에 답합니다</h1>
    <p class="lead">정책·법령·산업 변화와 상담에서 자주 나오는 질문을 정리합니다. 모든 글에 작성일·검토일·출처를 적고, 사실과 해석을 나눠 씁니다. 특정 상품이나 결과를 권하지 않습니다.</p>
    <ul class="cats">{pills}</ul>
  </div>
</section>
<section class="block" style="padding-top:56px">
  <div class="wrap">
    <a class="feature" href="/insights/{feat['slug']}/"><span class="cat">{esc(CATEGORIES[feat['category']])} · 최근 검토 {dot(feat['reviewed'])}</span><h3>{esc(feat['title'])}</h3><p>{esc(feat['dek'])}</p></a>
{groups}  </div>
</section>
</main>
''' + TAIL


def home_block(arts):
    feat = arts[0]
    items = ''.join(list_item(a) for a in arts[1:5])
    cats = ''.join(f'<li><a href="/insights/#cat-{c}">{esc(v)}</a></li>' for c, v in CATEGORIES.items() if any(a['category'] == c for a in arts))
    return f'''<div class="intel">
      <a class="feature" href="/insights/{feat['slug']}/"><span class="cat">{esc(CATEGORIES[feat['category']])} · 최근 검토 {dot(feat['reviewed'])}</span><h3>{esc(feat['title'])}</h3><p>{esc(feat['dek'])}</p></a>
      <ul class="post-list">{items}</ul>
    </div>
    <ul class="cats">{cats}</ul>'''


arts = sorted(ARTICLES, key=lambda a: (a['reviewed'], a.get('priority', 0)), reverse=True)
for a in arts:
    others = [x for x in arts if x['slug'] != a['slug']]
    same = [x for x in others if x['category'] == a['category']]
    related = (same + [x for x in others if x not in same])[:3]
    out = SITE / 'insights' / a['slug'] / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(article_page(a, related), encoding='utf-8')
(SITE / 'insights' / 'index.html').write_text(index_page(arts), encoding='utf-8')

home = SITE / 'index.html'
h = home.read_text(encoding='utf-8')
if '<!-- insights:home -->' in h:
    h = re.sub(r'(<!-- insights:home -->).*?(<!-- /insights:home -->)', lambda m: f'{m.group(1)}\n    {home_block(arts)}\n    {m.group(2)}', h, flags=re.S)
    home.write_text(h, encoding='utf-8')

# sitemap 갱신 (noindex 제외)
urls = []
for p in sorted(SITE.rglob('index.html')):
    t = p.read_text(encoding='utf-8')
    if 'noindex' in t:
        continue
    rel = p.relative_to(SITE).parent.as_posix()
    urls.append('/' if rel == '.' else f'/{rel}/')
lastmod = max(a['reviewed'] for a in ARTICLES)
(SITE / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>{lastmod}</lastmod></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
print(f'{len(arts)} articles, {len(urls)} sitemap urls')
