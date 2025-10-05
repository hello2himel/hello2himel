#!/bin/bash
# Create public directory
mkdir -p public

# Copy portfolio files to public root
cp -r css js res *.html public/

# Build Hugo blog into public/blog (with language subdirs)
hugo --source blog --destination "$(pwd)/public/blog"

# Ensure blog index exists
if [ ! -d public/blog/en ]; then
    echo "ERROR: Blog build failed - no en/ directory found"
    exit 1
fi