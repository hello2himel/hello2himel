#!/bin/bash
set -e

# Create temp directory
mkdir -p temp_blog

# Build Hugo first (outputs to temp with /en/ and /bn/)
echo "Building Hugo blog..."
hugo --source blog --destination temp_blog

# Create public directory structure
mkdir -p public/blog

# Copy portfolio files
echo "Copying portfolio files..."
cp -r css js res *.html public/

# Move Hugo output to correct location
echo "Moving blog files..."
cp -r temp_blog/* public/blog/

# Cleanup
rm -rf temp_blog

# Verify
if [ ! -d public/blog/en ]; then
    echo "ERROR: Blog build failed"
    exit 1
fi

echo "✅ Build complete!"