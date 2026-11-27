"""Human MCP 사이트 빌드 (정적, 의존성 없음). 사용: python3 scripts/build.py

1) 공통 머리글·바닥글(partials/) 을 모든 페이지에 동기화하고 현재 메뉴 표시
2) 모든 페이지 head 에 canonical·og:url·절대경로 og:image·RSS 링크 보정
3) Intelligence CMS: content/insights.py → site/intelligence/<slug>.html, 허브 목록, 홈 블록
4) sitemap.xml · rss.xml · llms.txt 생성
5) 채널 파생 초안(비공개): exports/channels/<slug>.md  — 사이트에 올라가지 않음

공개 조건: status 가 'published'(기본값)인 글만 생성. 'draft'·'review' 는 공개 폴더에서 제거.
"""
import datetime
import glob
import html
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
BASE = 'https://human-mcp.pages.dev'
OG = BASE + '/static/assets/humanmcp-og-1200x630.webp'
AUTHOR = {
    '@type': 'Person', 'name': '박동혁', 'jobTitle': 'Entrepreneurial Advisor',
    'url': BASE + '/about', 'sameAs': ['https://mattpark45.github.io/portfolio_2026/'],
}

spec = importlib.util.spec_from_file_location('insights', ROOT / 'content' / 'insights.py')
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)
CATS = C.CATEGORIES
ALL = C.ARTICLES
PUB = [a for a in ALL if a.get('status', 'published') == 'published']
HIDDEN = [a for a in ALL if a not in PUB]

REQUIRED = ['slug', 'title', 'dek', 'category', 'published', 'reviewed', 'reviewer', 'minutes', 'summary', 'sections', 'sources']
for a in ALL:
    miss = [k for k in (REQUIRED if a in PUB else ['slug', 'category']) if not a.get(k)]
    if miss:
        sys.exit(f"{a.get('slug')}: 필수 항목 누락 {miss}")
    if a['category'] not in CATS:
        sys.exit(f"{a['slug']}: 알 수 없는 카테고리 {a['category']}")
    if not re.fullmatch(r'[a-z0-9-]+', a['slug']):
        sys.exit(f"{a['slug']}: slug 는 영문 소문자·숫자·하이픈만")

PUB.sort(key=lambda a: (a['published'], a.get('priority', 0)), reverse=True)


def esc(s):
    return html.escape(str(s), quote=True)


def dot(d):
    return d.replace('-', '.')


def read(p):
    return pathlib.Path(p).read_text(encoding='utf-8')


def write(p, s):
    p = pathlib.Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s, encoding='utf-8')


HEADER = read(ROOT / 'partials' / 'header.html')
FOOTER = read(ROOT / 'partials' / 'footer.html')


def route(path):
    """site/ 기준 파일 경로 → 공개 URL 경로."""
    r = '/' + path
    r = r[:-len('index.html')] if r.endswith('index.html') else r[:-len('.html')]
    return r


def chrome(page_html, url):
    """머리글·바닥글 교체 + 현재 메뉴 aria-current."""
    h = HEADER.replace(' aria-current="page"', '')
    section = '/' + url.strip('/').split('/')[0] if url != '/' else '/'
    if section != '/':
        h = h.replace(f'<a href="{section}">', f'<a href="{section}" aria-current="page">', 1)
    a = page_html.find('<a class="skip"')
    b = page_html.find('<main id="main">')
    if a < 0 or b < 0:
        sys.exit(f'{url}: 머리글 표식 없음')
    page_html = page_html[:a] + h + page_html[b:]
    c = page_html.find('</main>')
    d = page_html.find('<script src="/static/js/chrome.js"')
    if c < 0 or d < 0:
        sys.exit(f'{url}: 바닥글 표식 없음')
    return page_html[:c] + '</main>\n' + FOOTER + page_html[d:]


def seo_head(page_html, url):
    canon = BASE + url
    s = re.sub(r'\s*<link rel="canonical"[^>]*>', '', page_html)
    s = re.sub(r'\s*<meta property="og:url"[^>]*>', '', s)
    s = re.sub(r'\s*<link rel="alternate" type="application/rss\+xml"[^>]*>', '', s)
    s = re.sub(r'(<meta (?:property|name)="(?:og|twitter):image" content=")/', r'\1' + BASE + '/', s)
    add = (f'\n<link rel="canonical" href="{canon}">\n<meta property="og:url" content="{canon}">'
           f'\n<link rel="alternate" type="application/rss+xml" title="Human MCP Intelligence" href="{BASE}/rss.xml">')
    return s.replace('<meta name="viewport"', add.strip() + '\n<meta name="viewport"', 1)


# ---------- 글 상세 ----------

def section_html(raw):
    s = raw.replace('class="fact"', 'class="f"').replace('class="interp"', 'class="i"')
    s = re.sub(r'<table>', '<div class="scroll-x"><table class="cmp">', s)
    s = s.replace('</table>', '</table></div>')
    return s


def related(a):
    same = [x for x in PUB if x is not a and x['category'] == a['category']]
    other = [x for x in PUB if x is not a and x not in same]
    return (same + other)[:3]


def article_page(a):
    url = f"/intelligence/{a['slug']}"
    cat = CATS[a['category']]
    secs = a['sections']
    toc = ''.join(f'<li><a href="#s{i+1}">{esc(s["h"])}</a></li>' for i, s in enumerate(secs))
    toc += f'<li><a href="#s{len(secs)+1}">출처</a></li>'
    body = ''.join(f'\n<h2 id="s{i+1}">{esc(s["h"])}</h2>\n{section_html(s["html"])}' for i, s in enumerate(secs))
    srcs = ''.join(
        f'<li id="r{i+1}">{esc(s["label"])}' + (f' — <a href="{esc(s["url"])}" target="_blank" rel="noopener">원문</a>' if s.get('url') else '') + '</li>'
        for i, s in enumerate(a['sources']))
    basis = a.get('basis', a['reviewed'])
    limits = a.get('limits', '이 글은 일반적인 정보이며 개별 회사·가정의 판단을 대신하지 않습니다. 세무·법률·노무 판단은 자격 있는 전문가의 확인이 필요합니다.')
    svc_url, svc_name = a.get('service', ('/booking', '상담 예약'))
    rel = ''.join(f'<a href="/intelligence/{x["slug"]}"><span class="c">{esc(CATS[x["category"]])}</span><h3>{esc(x["title"])}</h3></a>' for x in related(a))
    ld = {
        '@context': 'https://schema.org', '@type': 'Article', 'headline': a['title'], 'description': a['dek'],
        'articleSection': cat, 'datePublished': a['published'], 'dateModified': a['reviewed'],
        'inLanguage': 'ko-KR', 'mainEntityOfPage': BASE + url, 'image': OG, 'author': AUTHOR,
        'publisher': {'@type': 'Organization', 'name': 'Human MCP', 'url': BASE + '/'},
        'citation': [s['url'] for s in a['sources'] if s.get('url')],
    }
    crumbs = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': '홈', 'item': BASE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Intelligence', 'item': BASE + '/intelligence'},
            {'@type': 'ListItem', 'position': 3, 'name': a['title'], 'item': BASE + url}]}
    topic = esc(a.get('topic', cat))
    title = f"{a['title']} | Human MCP Intelligence"
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(a['dek'])}">
<meta name="author" content="박동혁">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(a['dek'])}">
<meta property="og:image" content="{OG}">
<meta property="og:site_name" content="Human MCP">
<meta property="og:locale" content="ko_KR">
<meta property="article:published_time" content="{a['published']}">
<meta property="article:modified_time" content="{a['reviewed']}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{OG}">
<meta name="theme-color" content="#143D30">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/static/css/hmcp.css">
<link rel="stylesheet" href="/static/css/pages.css">
<link rel="stylesheet" href="/static/css/article.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">본문으로 바로 가기</a>
<main id="main">

<article>
  <div class="wrap">
    <nav class="ar-crumb" aria-label="현재 위치"><a href="/">홈</a> › <a href="/intelligence">Intelligence</a> › <a href="/intelligence?cat={esc(a['category'])}">{esc(cat)}</a></nav>
    <header class="ar-head">
      <span class="cat">{esc(cat)} · 읽는 데 {a['minutes']}분</span>
      <h1>{esc(a['title'])}</h1>
      <p class="dek">{esc(a['dek'])}</p>
    </header>
    <div class="ar-meta">
      <img src="/static/assets/portrait.webp" alt="" width="765" height="1024">
      <div class="ar-who"><b>박동혁</b><span>Human MCP · 중소기업경영연구소 전문위원</span></div>
      <div class="dates">작성 <b>{dot(a['published'])}</b> · 최근 검토 <b>{dot(a['reviewed'])}</b> · 자료 기준일 <b>{dot(basis)}</b><br>검토: {esc(a['reviewer'])}</div>
    </div>
  </div>

  <div class="wrap ar-grid">
    <nav class="toc" aria-label="목차"><b>목차</b><ol>{toc}</ol></nav>

    <div>
      <div class="m-toc"><details><summary>목차 보기</summary><ol>{toc}</ol></details></div>

      <div class="sum"><b>핵심 요약</b><ol>{''.join(f'<li>{esc(x)}</li>' for x in a['summary'])}</ol></div>

      <div class="prose">{body}

        <div class="callout"><b>읽기 전에</b><span>{esc(limits)}</span></div>

        <section class="src" id="s{len(secs)+1}"><h3>출처</h3><ol>{srcs}</ol></section>

        <div class="author-box"><img src="/static/assets/portrait.webp" alt="" width="765" height="1024"><div><b>박동혁 · Human MCP</b><p>무역, 퍼포먼스 마케팅, 사업기획·R&amp;D를 거쳐 중소기업경영연구소 전문위원, 씨오㈜ M&amp;A 파트너로 기업자문과 개인·가족 재무상담을 함께 합니다. 세무·법률·노무 판단은 자격 있는 협업 전문가의 검토를 거칩니다.</p><a class="link-arrow" href="/about" style="display:inline-block;margin-top:10px;font-size:14px">자문가 소개</a></div></div>
      </div>
    </div>

    <aside class="rail" aria-label="관련 서비스">
      <div class="box svc"><h4>관련 서비스</h4><b>{esc(svc_name)}</b><p>이 글의 주제를 우리 회사·우리 가족 상황에 맞춰 함께 정리합니다.</p><a class="link-arrow" href="{esc(svc_url)}">서비스 알아보기</a></div>
      <div class="box svc"><h4>새 글 받아보기</h4><b>Intelligence 브리핑</b><p>새 글과 정책 변화를 정리해 보내 드립니다. 영업 연락은 하지 않습니다.</p><a class="link-arrow" href="/intelligence#subscribe">구독 안내</a></div>
      <div class="box soft on-dark"><h4>우리 상황이 궁금하다면</h4><p>30분 동안 상황을 듣고 정리 방향을 말씀드립니다. 상담 후 계약을 권하지 않습니다.</p><a class="btn btn-gold" href="/booking?topic={topic}">30분 첫 상담 예약</a></div>
    </aside>
  </div>
</article>

<section class="rel"><div class="wrap">
  <h2>함께 읽으면 좋은 글</h2>
  <div class="rel-g">{rel}</div>
</div></section>

</main>
<script src="/static/js/chrome.js" defer></script>
<script src="/static/js/article.js" defer></script>
</body>
</html>
'''


# ---------- 허브·홈 ----------

def card(a):
    return (f'<a href="/intelligence/{a["slug"]}" data-cat="{a["category"]}" data-q="{esc(a["title"] + " " + a["dek"] + " " + CATS[a["category"]])}">'
            f'<div><div class="k"><span class="c">{esc(CATS[a["category"]])}</span><span class="d">검토 {dot(a["reviewed"])}</span></div>'
            f'<h3>{esc(a["title"])}</h3><p>{esc(a["dek"])}</p></div></a>')


def hub_block():
    feat = PUB[0]
    rest = PUB[1:]
    cats = '<button type="button" data-cat="all" aria-pressed="true">전체<span>' + str(len(PUB)) + '</span></button>'
    for k, v in CATS.items():
        n = sum(1 for a in PUB if a['category'] == k)
        if n:
            cats += f'<button type="button" data-cat="{k}" aria-pressed="false">{esc(v)}<span>{n}</span></button>'
    return f'''<!-- cms:hub -->
<div class="filters" aria-label="카테고리 필터"><div class="wrap" id="cats">{cats}</div></div>

<div class="wrap in-body">
  <div>
    <a class="feat" href="/intelligence/{feat['slug']}" id="feat" data-cat="{feat['category']}" data-q="{esc(feat['title'] + ' ' + feat['dek'] + ' ' + CATS[feat['category']])}">
      <img class="fimg" src="/static/assets/featured-desk-1024.webp" alt="짙은 초록 벽과 원목 책상 위에 놓인 서류와 황동 펜" width="1024" height="576" loading="eager" decoding="async">
      <div><div class="k"><span class="c">{esc(CATS[feat['category']])}</span><span class="d">검토 {dot(feat['reviewed'])}</span></div><h2>{esc(feat['title'])}</h2><p>{esc(feat['dek'])}</p></div>
    </a>
    <div class="list" id="list">{''.join(card(a) for a in rest)}</div>
    <div class="empty" id="empty"><b>찾는 글이 아직 없습니다</b><p>궁금한 내용을 알려 주시면 다음 글로 다루겠습니다.</p><a class="btn btn-secondary" href="mailto:dhp.cfo@gmail.com?subject=Intelligence%20주제%20제안">주제 제안하기</a></div>
  </div>
  <aside class="side">
    <div class="box"><div class="author"><img src="/static/assets/portrait.webp" alt="" width="765" height="1024"><div><b>박동혁</b><span>모든 글 작성 · 글마다 검토 상태 표기</span></div></div><a class="link-arrow" href="/about" style="display:inline-block;margin-top:14px;font-size:14px">자문가 소개</a></div>
    <div class="box"><h4>최근 검토한 글</h4><ol>{''.join(f'<li><a href="/intelligence/{a["slug"]}">{esc(a["title"])}</a></li>' for a in sorted(PUB, key=lambda x: x['reviewed'], reverse=True)[:4])}</ol></div>
    <div class="box sub on-dark" id="subscribe"><h4>Intelligence 브리핑</h4><p>새 글과 정책 변화를 정리해 이메일로 보내 드립니다. 영업 연락은 하지 않고, 언제든 해지할 수 있습니다.</p>
      <form id="subForm" novalidate>
        <input type="email" id="subEmail" placeholder="이메일 주소" aria-label="이메일 주소" required autocomplete="email">
        <label class="sub-agree"><input type="checkbox" id="subAgree" required><span>이메일 주소를 브리핑 발송 목적으로만 쓰는 데 동의합니다 (<a href="/legal/privacy">처리방침</a>)</span></label>
        <button class="btn btn-gold" type="submit">구독 신청 메일 보내기</button>
        <p class="sub-note" id="subNote" role="status">현재는 메일로 신청을 받습니다. 버튼을 누르면 메일 앱이 열리고, 보내기를 누르셔야 신청이 전달됩니다.</p>
      </form>
      <p class="sub-rss">메일 대신 <a href="/rss.xml">RSS</a>로 받아 보셔도 됩니다.</p>
    </div>
  </aside>
</div>
<!-- /cms:hub -->'''


def home_block():
    lead, rest = PUB[0], PUB[1:5]
    items = ''.join(
        f'<a href="/intelligence/{a["slug"]}"><div class="k"><span class="c">{esc(CATS[a["category"]])}</span><span class="d">{dot(a["reviewed"])}</span></div><h4>{esc(a["title"])}</h4></a>'
        for a in rest)
    cats = ''.join(f'<a href="/intelligence?cat={k}">{esc(v)}</a>' for k, v in CATS.items() if any(a['category'] == k for a in PUB))
    return f'''<!-- cms:home -->
    <div class="h-front">
      <a class="lead" href="/intelligence/{lead['slug']}">
        <img class="leimg" src="/static/assets/featured-desk-1024.webp" alt="짙은 초록 벽과 원목 책상 위에 놓인 서류와 황동 펜" width="1024" height="576" loading="lazy" decoding="async">
        <div class="k"><span class="c">{esc(CATS[lead['category']])}</span><span class="d">검토 {dot(lead['reviewed'])}</span></div>
        <h3>{esc(lead['title'])}</h3>
        <p>{esc(lead['dek'])}</p>
      </a>
      <div class="list">{items}</div>
    </div>
    <div class="a-cats" style="margin:36px 0 0">{cats}</div>
    <!-- /cms:home -->'''


def replace_block(s, name, block):
    a, b = f'<!-- cms:{name} -->', f'<!-- /cms:{name} -->'
    if a not in s or b not in s:
        sys.exit(f'cms:{name} 표식 없음')
    i, j = s.index(a), s.index(b) + len(b)
    return s[:i] + block + s[j:]


# ---------- 실행 ----------

def main():
    today = max(a['reviewed'] for a in PUB)  # 결정적 출력 (CI 재현성)
    out = SITE / 'intelligence'
    out.mkdir(exist_ok=True)
    keep = {a['slug'] for a in PUB}
    for f in out.glob('*.html'):
        if f.stem not in keep:
            f.unlink()  # 비공개·삭제 글 제거
    for a in PUB:
        write(out / f"{a['slug']}.html", article_page(a))

    hub = SITE / 'intelligence.html'
    s = read(hub)
    s = replace_block(s, 'hub', hub_block())
    s = re.sub(r'<script>window\.HMCP_POSTS.*?</script>\s*', '', s, flags=re.S)
    write(hub, s)

    home = SITE / 'index.html'
    s = read(home)
    s = replace_block(s, 'home', home_block())
    write(home, s)

    # 서비스 페이지의 관련 글 블록: <!-- cms:rel:cat1,cat2 --> ... <!-- /cms:rel -->
    for p in glob.glob(str(SITE / '*.html')):
        s = read(p)
        def rel_block(m):
            want = m.group(1).split(',')
            picks = [a for a in PUB if a['category'] in want][:3]
            links = ''.join(f'<a href="/intelligence/{a["slug"]}"><span class="c">{esc(CATS[a["category"]])}</span><h3>{esc(a["title"])}</h3></a>' for a in picks)
            return f'<!-- cms:rel:{m.group(1)} -->\n    <div class="rel3">{links}</div>\n    <!-- /cms:rel -->'
        n = re.sub(r'<!-- cms:rel:([a-z,]+) -->.*?<!-- /cms:rel -->', rel_block, s, flags=re.S)
        if n != s:
            write(p, n)

    pages = sorted(p for p in glob.glob(str(SITE / '**' / '*.html'), recursive=True))
    urls = []
    for p in pages:
        rel = str(pathlib.Path(p).relative_to(SITE))
        if rel == '404.html':
            url = '/404'
        else:
            url = route(rel)
        s = read(p)
        s = chrome(s, url)
        if rel != '404.html':
            s = seo_head(s, url)
        write(p, s)
        if rel != '404.html' and 'noindex' not in s:
            urls.append(url)

    dates = {f"/intelligence/{a['slug']}": a['reviewed'] for a in PUB}
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        sm.append(f'  <url><loc>{BASE}{u}</loc><lastmod>{dates.get(u, today)}</lastmod></url>')
    sm.append('</urlset>')
    write(SITE / 'sitemap.xml', '\n'.join(sm) + '\n')

    def rfc822(d):
        return datetime.datetime.fromisoformat(d).strftime('%a, %d %b %Y 09:00:00 +0900')
    items = ''.join(f'''
  <item>
    <title>{esc(a['title'])}</title>
    <link>{BASE}/intelligence/{a['slug']}</link>
    <guid isPermaLink="true">{BASE}/intelligence/{a['slug']}</guid>
    <category>{esc(CATS[a['category']])}</category>
    <pubDate>{rfc822(a['published'])}</pubDate>
    <description>{esc(a['dek'])}</description>
  </item>''' for a in PUB)
    write(SITE / 'rss.xml', f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Human MCP Intelligence</title>
  <link>{BASE}/intelligence</link>
  <atom:link href="{BASE}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>대표와 가족을 위한 경영·재무 브리핑. 작성일·검토일·출처를 함께 적습니다.</description>
  <language>ko-KR</language>
  <lastBuildDate>{rfc822(max(a['reviewed'] for a in PUB))}</lastBuildDate>{items}
</channel>
</rss>
''')

    llm = [
        '# Human MCP', '',
        '> 박동혁(Human MCP)이 운영하는 기업 경영자문·개인/가족 재무상담 사이트. 부산·울산·경남 기반, 전국 원격 상담. '
        '세무·법률·노무 등 자격이 필요한 업무는 협업 전문가가 수행하며, 금융 관련 업무는 소속 회사의 승인된 업무환경에서만 진행합니다.', '',
        '이 사이트의 글은 일반 정보이며 개별 상황의 판단이나 특정 금융상품 권유가 아닙니다. 인용 시 글마다 표시된 검토일·자료 기준일·출처를 함께 밝혀 주세요.', '',
        '## 주요 페이지',
        f'- [기업 경영자문]({BASE}/corporate): 세무·승계·자금·인력 등 기업 과제 자문',
        f'- [개인·가족 재무상담]({BASE}/personal): 생애 단계별 재무 점검',
        f'- [대표·가족 통합자문]({BASE}/owner): 회사와 대표 개인 재무를 구분해 함께 보기',
        f'- [Growth & Capital]({BASE}/growth): 고객획득·GTM·자본',
        f'- [AI/AX 및 교육]({BASE}/ax)',
        f'- [디지털 진단]({BASE}/diagnostics)',
        f'- [About]({BASE}/about): 자문가 소개 (경력 원문: https://mattpark45.github.io/portfolio_2026/)',
        f'- [업무 범위 안내]({BASE}/legal/scope)', '',
        '## Intelligence (최신순)',
    ] + [f"- [{a['title']}]({BASE}/intelligence/{a['slug']}): {a['dek']} (검토 {a['reviewed']}, {CATS[a['category']]})" for a in PUB] + [
        '', '## 피드', f'- RSS: {BASE}/rss.xml', f'- Sitemap: {BASE}/sitemap.xml', '']
    write(SITE / 'llms.txt', '\n'.join(llm))

    # 채널 파생 초안 (비공개) — 사람이 검토 후 직접 게시
    ex = ROOT / 'exports' / 'channels'
    ex.mkdir(parents=True, exist_ok=True)
    for f in ex.glob('*.md'):
        f.unlink()
    for a in PUB:
        def utm(src, med):
            return f"{BASE}/intelligence/{a['slug']}?utm_source={src}&utm_medium={med}&utm_campaign=intel_{a['slug']}"
        bullets = '\n'.join(f'- {x}' for x in a['summary'])
        write(ex / f"{a['slug']}.md", f'''# {a['title']} — 채널 파생 초안

> 자동 생성 초안입니다. 게시 전 사람이 검토합니다. 원문: {BASE}/intelligence/{a['slug']}
> 검토 상태: {a['reviewer']} · 광고심의: {a.get('ad_review', '해당 여부 미판단 — 금융상품 언급 시 게시 보류')}
> 금지: 상품명·가입 권유·수익/절세 약속·확인되지 않은 성과. 자동 게시·DM 자동화 사용 안 함.

## 네이버 블로그 / 브런치 (요약 + 원문 링크)
{a['dek']}

{bullets}

전체 글과 출처: {utm('naver_blog', 'referral')}

## Threads / Instagram 캡션 (300자 내외)
{a['summary'][0]}
{a['summary'][1] if len(a['summary']) > 1 else ''}
자세한 내용과 출처는 프로필 링크 → Intelligence

## LinkedIn
{a['title']}

{bullets}

{utm('linkedin', 'social')}

## 뉴스레터 단락
**{a['title']}** — {a['dek']} [읽기]({utm('newsletter', 'email')})
''')
    print(f'published {len(PUB)}, hidden {len(HIDDEN)}, pages {len(pages)}')


if __name__ == '__main__':
    main()
