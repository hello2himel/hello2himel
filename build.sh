#!/bin/bash
set -e  # Exit on error

# Create public directory
mkdir -p public

# Copy portfolio files to public root
echo "Copying portfolio files..."
cp -r css js res *.html public/

# Build Hugo with correct settings
echo "Building Hugo blog..."
cd blog
hugo --baseURL "https://hello2himel.netlify.app/blog/" --destination ../public/blog
cd ..

# Verify build
if [ ! -d public/blog/en ]; then
    echo "ERROR: Blog build failed - no en/ directory found"
    exit 1
fi

echo "✅ Build complete!"
echo "Portfolio: public/"
echo "Blog EN: public/blog/en/"
echo "Blog BN: public/blog/bn/"