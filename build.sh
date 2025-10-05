#!/bin/bash
set -e

echo "🏗️  Starting build..."

# Build Hugo FIRST (it outputs /en/ and /bn/ at root)
echo "📝 Building Hugo blog..."
hugo --source blog

# Create final public structure
mkdir -p public

# Copy portfolio to public root
echo "📁 Copying portfolio files..."
cp -r css js res *.html public/

# Move Hugo's output INTO public/blog/
echo "🔀 Moving blog to /blog/ path..."
mkdir -p public/blog
mv blog/public/en public/blog/
mv blog/public/bn public/blog/

# Verify
if [ ! -f public/blog/en/index.html ]; then
    echo "❌ ERROR: Build failed"
    exit 1
fi

echo "✅ Build complete!"
echo "   https://hello2himel.netlify.app/ → Portfolio"
echo "   https://hello2himel.netlify.app/blog/en/ → English Blog"
echo "   https://hello2himel.netlify.app/blog/bn/ → Bengali Blog"