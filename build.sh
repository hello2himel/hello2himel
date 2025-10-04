#!/bin/bash
# Create public directory
mkdir -p public

# Copy portfolio files to public
cp -r css js res *.html public/

# Build Hugo blog into public/blog
hugo --source blog --destination public/blog