#!/bin/bash

# Production Enhancement Package Installation Script
# Run this script to install all required packages for production features

echo "🚀 Installing Production Enhancement Packages..."
echo ""

# Core production packages
echo "📦 Installing core packages..."
npm install nodemailer cloudinary multer-storage-cloudinary

# Security packages
echo "🔐 Installing security packages..."
npm install express-rate-limit helmet express-mongo-sanitize xss-clean hpp cors

# Token management
echo "🔑 Installing JWT packages..."
npm install jsonwebtoken

# Logging
echo "📝 Installing logging packages..."
npm install winston morgan

# Validation
echo "✅ Installing validation packages..."
npm install joi

# Development dependencies
echo "🛠️  Installing dev dependencies..."
npm install --save-dev @types/nodemailer @types/cors @types/jsonwebtoken @types/morgan @types/joi

echo ""
echo "✅ All packages installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the new variables (see .env.production.example)"
echo "2. Follow the PRODUCTION_ENHANCEMENT_GUIDE.md for integration steps"
echo "3. Test all features before deploying to production"
echo ""
