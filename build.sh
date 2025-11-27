#!/bin/bash
# Render Build Script for Backend

echo "Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

echo "Building backend..."
npm run build

echo "Build complete!"
