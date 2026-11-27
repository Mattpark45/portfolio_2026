"""partials/header.html, partials/footer.html 을 모든 페이지의 표시 구간에 복사한다.
사용: python3 scripts/sync_layout.py   (페이지 본문은 각 index.html 에서 직접 수정)"""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
parts = {k: (root / 'partials' / f'{k}.html').read_text(encoding='utf-8').strip() for k in ('header', 'footer')}
pages = [p for p in (root / 'public').rglob('index.html') if 'portfolio' not in p.parts and 'node_modules' not in p.parts]
changed = 0
for p in pages:
    s = p.read_text(encoding='utf-8')
    new = s
    for k, v in parts.items():
        new = re.sub(rf'(<!-- layout:{k} -->).*?(<!-- /layout:{k} -->)', lambda m: f'{m.group(1)}\n{v}\n{m.group(2)}', new, flags=re.S)
    if new != s:
        p.write_text(new, encoding='utf-8'); changed += 1
print(f'{len(pages)} pages, {changed} updated')
sys.exit(0)
