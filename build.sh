#!/bin/bash
set -euo pipefail
# Clean previous output so failed builds never leave stale files
rm -rf public
mkdir -p public

# Copy portfolio files to public
cp -r css js res *.html public/
cp -f robots.txt sitemap.xml favicon.ico public/ 2>/dev/null || true

# Build Hugo blog and copy output into public/blog
cd blog
hugo --minify
cd ..
cp -r blog/public public/blog

# Regenerate a complete sitemap (all pages incl. blog posts) with lastmod
python3 - <<'PYEOF'
import os, re, subprocess, datetime

BASE = 'https://hello2himel.netlify.app'
PUB = 'public'

def git_date(path):
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cI', '--', path],
                             capture_output=True, text=True).stdout.strip()
        if out:
            return out.split('T')[0]
    except Exception:
        pass
    return None

def lastmod(public_path, url):
    cands = []
    rel = os.path.relpath(public_path, PUB)
    if rel in ('index.html', 'donate.html', 'cv.html', 'robots.txt'):
        cands.append(rel)
    m = re.match(r'blog/posts/([^/]+)/', rel)
    if m:
        slug = m.group(1)
        cands += [f'blog/content/posts/{slug}.bn.md',
                  f'blog/content/posts/{slug}.en.md']
    for c in cands:
        if os.path.exists(c):
            d = git_date(c)
            if d:
                return d
    ts = os.path.getmtime(public_path)
    return datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).date().isoformat()

urls = []
for root, _dirs, files in os.walk(PUB):
    for fn in files:
        if not fn.endswith('.html'):
            continue
        full = os.path.join(root, fn)
        rel = os.path.relpath(full, PUB).replace(os.sep, '/')
        if fn == '404.html':
            continue
        if rel.endswith('/index.html'):
            loc = BASE + '/' + rel[:-len('index.html')]
        else:
            loc = BASE + '/' + rel
        if loc.endswith('/blog/page/1/'):
            continue  # duplicate of section root
        urls.append((loc, lastmod(full, loc)))

urls.sort()
lines = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, lm in urls:
    lines += ['  <url>', f'    <loc>{loc}</loc>', f'    <lastmod>{lm}</lastmod>', '  </url>']
lines.append('</urlset>')
with open(os.path.join(PUB, 'sitemap.xml'), 'w') as f:
    f.write('\n'.join(lines) + '\n')
print(f'sitemap: {len(urls)} urls')
PYEOF
