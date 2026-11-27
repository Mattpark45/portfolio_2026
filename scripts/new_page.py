"""페이지 골격 생성 도우미 (최초 생성용). 이미 있는 파일은 덮어쓰지 않는다.
사용: python3 scripts/new_page.py <경로> <제목> <설명> < body.html"""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent / 'site'
path, title, desc = sys.argv[1], sys.argv[2], sys.argv[3]
body = sys.stdin.read()
noindex = '<meta name="robots" content="noindex">\n' if '--noindex' in sys.argv else ''
extra = sys.argv[sys.argv.index('--head') + 1] if '--head' in sys.argv else ''
target = root / path / 'index.html' if path else root / 'index.html'
if target.exists():
    sys.exit(f'exists: {target}')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{noindex}<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="ko_KR">
<meta name="theme-color" content="#143D30">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-kr@5.3.1/700.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.2.7/500.css">
<link rel="stylesheet" href="/assets/site.css">
{extra}</head>
<body>
<!-- layout:header -->
<!-- /layout:header -->

<main id="main">
{body.strip()}
</main>

<!-- layout:footer -->
<!-- /layout:footer -->
</body>
</html>
''', encoding='utf-8')
print('created', target.relative_to(root.parent))
