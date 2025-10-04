#!/bin/bash
# Create public directory
mkdir -p public

# Copy portfolio files to public
cp -r css js res *.html public/

# Build Hugo blog into public/blog (using absolute destination)
hugo --source blog --destination "$(pwd)/public/blog"