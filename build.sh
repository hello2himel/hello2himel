#!/bin/bash
# Create public directory
mkdir -p public

# Copy portfolio files to public
cp -r css js res *.html public/

# Build Hugo blog into public/blog
hugo --source blog --destination "$(pwd)/public/blog"

# Ensure blog index exists
if [ ! -f public/blog/index.html ]; then
    echo "ERROR: Blog build failed - no index.html found"
    exit 1
fi