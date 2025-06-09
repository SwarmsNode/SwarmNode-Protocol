#!/bin/bash

# SwarmNode Protocol - Production Cleanup Script
# Removes development artifacts and prepares for deployment

set -e

# Configuration
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to project root
cd "$(dirname "$0")/.."

log_info "Starting production cleanup for SwarmNode Protocol"

# Clean temporary files and caches
log_info "Removing temporary files and caches"
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-debug.log*" -type f -delete 2>/dev/null || true
find . -name "yarn-error.log*" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

log_success "Temporary files cleaned"

# Remove legacy development directories
log_info "Removing legacy development directories"
LEGACY_DIRS=(
    "benchmarks"
    "e2e" 
    "monitoring"
    "nginx"
    "docs-site"
    "mobile"
    "database"
    "community"
    "website"
    "frontend"
)

for dir in "${LEGACY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        log_warning "Removed legacy directory: $dir/"
    fi
done

# Remove sensitive configuration files
log_info "Removing sensitive configuration files"
SENSITIVE_FILES=(
    ".env.local"
    ".env.production"
    "docker-compose.production.yml"
    "secrets.json"
    "private-key.txt"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        log_warning "Removed sensitive file: $file"
    fi
done

# Validate essential project structure
log_info "Validating project structure"
ESSENTIAL_DIRS=(
    "contracts"
    "src" 
    "scripts"
    "docs"
    "examples"
    "test"
    "deployments"
)

for dir in "${ESSENTIAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        log_error "Missing essential directory: $dir/"
        exit 1
    fi
done

ESSENTIAL_FILES=(
    "README.md"
    "package.json"
    "LICENSE"
    "CONTRIBUTING.md"
    "SECURITY.md"
    "CHANGELOG.md"
    "hardhat.config.ts"
    "tsconfig.json"
    "Dockerfile"
    "docker-compose.yml"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Missing essential file: $file"
        exit 1
    fi
done

log_success "Project structure validated"

# Generate production .gitignore
log_info "Generating production .gitignore"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
/build
/dist
/.next/
/out/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Test coverage
.nyc_output

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Cache directories
.npm
.eslintcache
.parcel-cache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Vite build output
dist-ssr
*.local

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# VS Code test extensions
.vscode-test

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Blockchain & Smart Contracts
artifacts/
cache/
typechain/
typechain-types/

# Hardhat files
coverage
coverage.json

# Solidity compilation artifacts
/contracts/build/

# Avalanche CLI
avalanche-cli/

# Local development
.env.development
EOF

log_success "Production .gitignore created"

log_success "Production cleanup completed successfully"
log_info "Project is ready for production deployment"
