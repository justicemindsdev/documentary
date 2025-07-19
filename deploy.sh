#!/bin/bash

# BBC Documentary System - Automated Vercel Deployment
# This script automates the Vercel CLI deployment process

echo "🎬 BBC Documentary System - Automated Deployment"
echo "================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set deployment configuration
export VERCEL_PROJECT_NAME="bbc-documentary-system"
export VERCEL_ORG_ID="justiceminds"

# Create .vercelignore file to exclude sensitive files
cat > .vercelignore << EOF
.env
.env.local
.env.production
node_modules/
.git/
*.log
.DS_Store
EOF

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Set environment variables for production
echo "🔧 Setting up environment variables..."

# Initialize Supabase project if not already done
if [ ! -f "supabase/config.toml" ]; then
    echo "🗄️  Initializing Supabase project..."
    supabase init --with-vscode-workspace
fi

# Read .env file and set variables in both Vercel and Supabase
if [ -f ".env" ]; then
    echo "📝 Applying environment variables to Vercel and Supabase..."
    
    # Create environment files for different platforms
    cat > .env.production << EOF
# Production Environment Variables for BBC Documentary System
EOF
    
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
            continue
        fi
        
        # Remove quotes from value
        value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
        
        echo "Setting $key in Vercel..."
        vercel env add "$key" production <<< "$value"
        
        # Add to production env file
        echo "$key=$value" >> .env.production
        
        # Set Supabase secrets for database-related variables
        if [[ $key == SUPABASE_* ]] || [[ $key == DATABASE_* ]]; then
            echo "Setting $key in Supabase..."
            supabase secrets set "$key=$value" 2>/dev/null || echo "Note: Supabase secret setting requires authentication"
        fi
        
    done < .env
    
    # Apply Supabase configuration
    echo "🗄️  Configuring Supabase project..."
    
    # Create Supabase environment config
    cat > supabase/.env << EOF
SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d'=' -f2)
SUPABASE_ANON_KEY=$(grep "SUPABASE_KEY=" .env | cut -d'=' -f2)
SUPABASE_SERVICE_ROLE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)
EOF

    # Create database schema for documentary projects if it doesn't exist
    cat > supabase/migrations/001_documentary_projects.sql << EOF
-- Create documentary_projects table
CREATE TABLE IF NOT EXISTS documentary_projects (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    clips_data JSONB,
    broll_data JSONB,
    music_data JSONB,
    media_analysis JSONB,
    total_clips INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documentary_projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public access" ON documentary_projects
    FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_documentary_projects_created_at ON documentary_projects(created_at DESC);
EOF

    # Apply migrations
    echo "🗄️  Applying database migrations..."
    supabase db push || echo "Note: Database push requires authentication"
    
else
    echo "⚠️  No .env file found. Creating template..."
    cat > .env.template << EOF
# BBC Documentary System Environment Variables
API_KEY=your_openrouter_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
DEEPSEEK_API_URL=https://openrouter.ai/api/v1/chat/completions
DATABASE_URL=your_database_url
DIRECT_DATABASE_URL=your_direct_database_url
EOF
    echo "Please fill in the .env.template file and rename it to .env"
    exit 1
fi

# Deploy to Vercel with automation
echo "🚀 Deploying to Vercel..."

# Use Vercel CLI with non-interactive flags
vercel deploy \
    --prod \
    --name="$VERCEL_PROJECT_NAME" \
    --yes \
    --confirm

echo "✅ Deployment complete!"
echo "🌐 Your BBC Documentary System is now live!"

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls --scope="$VERCEL_ORG_ID" | grep "$VERCEL_PROJECT_NAME" | awk '{print $2}' | head -1)

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo "📱 URL: https://$DEPLOYMENT_URL"
    
    # Open in browser (macOS)
    if command -v open &> /dev/null; then
        echo "🌐 Opening in browser..."
        open "https://$DEPLOYMENT_URL"
    fi
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Test the documentary creation system"
echo "2. Upload video content"
echo "3. Generate AI-powered documentary clips"
echo "4. Share your BBC-style documentaries!"
