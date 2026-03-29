#!/bin/bash

echo "🚀 NuruOS Frontend Deployment Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from project root."
    exit 1
fi

# Build the app
echo "📦 Building app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "Choose deployment option:"
echo "1) Vercel (Recommended - Auto HTTPS, Custom Domain)"
echo "2) Netlify (Easy, Great for teams)"
echo "3) Cloudflare Pages (Fast, Good CDN)"
echo "4) Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📥 Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "📥 Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "🚀 Deploying to Cloudflare Pages..."
        npx wrangler pages deploy dist --project-name=nuruos-field-intelligence
        ;;
    4)
        echo "👋 Deployment cancelled."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open the provided URL"
echo "2. Add VITE_GEMINI_API_KEY in platform dashboard"
echo "3. Redeploy to apply environment variables"
echo ""
echo "📚 For detailed instructions, see: DEPLOY_FRONTEND.md"
