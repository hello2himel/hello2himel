#!/bin/bash
set -euo pipefail
# Clean previous output so failed builds never leave stale files
rm -rf public
mkdir -p public

# Copy portfolio files to public
cp -r css js res *.html public/
cp -f robots.txt sitemap.xml public/ 2>/dev/null || true

# Build Hugo blog and copy output into public/blog
cd blog
hugo --minify
cd ..
cp -r blog/public public/blog
