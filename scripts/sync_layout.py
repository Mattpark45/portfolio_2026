"""공통 머리글·바닥글을 각 페이지에 복사하고, 내부 링크를 상대경로로 바꾼다.

사용: python3 scripts/sync_layout.py

- 작성 규칙: partials/와 페이지 본문에서는 내부 링크를 루트 기준("/about/", "/assets/site.css")으로 써도 된다.
- 이 스크립트가 페이지 깊이에 맞춰 "./", "../" 상대경로로 바꾼다.
  사이트가 하위 경로(예: GitHub Pages의 /portfolio_2026/)에서 열려도, 루트(Cloudflare Pages)에서 열려도 동작한다.
- portfolio/ (이전 포트폴리오)는 건드리지 않는다.
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
SKIP = set()
parts = {k: (root / 'partials' / f'{k}.html').read_text(encoding='utf-8').strip() for k in ('header', 'footer')}

# ── 아이콘: <span class="ico" data-icon="이름"></span> 안에 assets-src/icons/이름.svg 를 인라인으로 넣는다 ──
ICON_DIR = root / 'assets-src' / 'icons'


def icon_svg(name):
    f = ICON_DIR / f'{name}.svg'
    if not f.exists():
        raise SystemExit(f'아이콘 없음: {name} (assets-src/icons/ 에 lucide SVG를 추가하세요)')
    svg = re.sub(r'<!--.*?-->', '', f.read_text(encoding='utf-8'), flags=re.S).strip()
    svg = re.sub(r'\s+class="[^"]*"', '', svg)
    svg = re.sub(r'\s+(width|height)="24"', '', svg)
    svg = svg.replace('stroke-width="2"', 'stroke-width="1.5"')
    svg = svg.replace('<svg', '<svg aria-hidden="true" focusable="false"', 1)
    return re.sub(r'\s*\n\s*', ' ', svg)


def inline_icons(html):
    return re.sub(r'<span class="ico([^"]*)" data-icon="([a-z0-9-]+)"([^>]*)>.*?</span>',
                  lambda m: f'<span class="ico{m.group(1)}" data-icon="{m.group(2)}"{m.group(3)}>{icon_svg(m.group(2))}</span>',
                  html, flags=re.S)



def pages():
    for p in sorted((root / 'site').rglob('index.html')):
        rel = p.relative_to(root / 'site')
        if rel.parts and rel.parts[0] in SKIP:
            continue
        yield p, len(rel.parts) - 1  # 깊이: index.html=0, about/index.html=1


def relativize(html: str, depth: int) -> str:
    prefix = './' if depth == 0 else '../' * depth

    def fix(m):
        attr, path = m.group(1), m.group(2)
        return f'{attr}="{prefix}{path}"'

    # href="/..." , src="/..."  (단, "//host" 형태의 외부 주소는 제외)
    html = re.sub(r'\b(href|src)="/(?!/)([^"]*)"', fix, html)

    def fix_srcset(m):
        items = [(prefix + u[1:] if u.startswith('/') and not u.startswith('//') else u) + (' ' + d if d else '')
                 for u, _, d in (x.strip().partition(' ') for x in m.group(1).split(','))]
        return 'srcset="' + ', '.join(items) + '"'

    return re.sub(r'srcset="([^"]*)"', fix_srcset, html)


changed = 0
count = 0
for p, depth in pages():
    count += 1
    s = p.read_text(encoding='utf-8')
    new = s
    for k, v in parts.items():
        new = re.sub(rf'(<!-- layout:{k} -->).*?(<!-- /layout:{k} -->)',
                     lambda m: f'{m.group(1)}\n{v}\n{m.group(2)}', new, flags=re.S)
    new = inline_icons(new)
    new = relativize(new, depth)
    if new != s:
        p.write_text(new, encoding='utf-8')
        changed += 1
print(f'{count} pages, {changed} updated')
