#!/bin/bash

# This script helps deploy the backend to Railway

echo "Deploying SyntaxSucks Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
railway login

# Initialize Railway project (if needed)
if [ ! -f ".railway" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "Deployment complete! Use 'railway open' to view your application." 