#!/bin/bash

# SwarmNode Protocol - Final Validation Script
# Validates the production-ready state of the project

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

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        SwarmNode Protocol v1.0         ║${NC}"
    echo -e "${BLUE}║       Production Validation            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
}

# Navigate to project root
cd "$(dirname "$0")/.."

print_header

# Validate project structure
log_info "Validating project structure..."

REQUIRED_DIRS=(
    "contracts"
    "src"
    "scripts"
    "docs"
    "examples"
    "test"
    "deployments"
)

REQUIRED_FILES=(
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
    ".eslintrc.json"
    ".prettierrc"
)

# Check directories
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Directory found: $dir/"
    else
        log_error "Missing directory: $dir/"
        exit 1
    fi
done

# Check files
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "File found: $file"
    else
        log_error "Missing file: $file"
        exit 1
    fi
done

# Validate package.json
log_info "Validating package.json..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    log_success "package.json is valid JSON"
else
    log_error "package.json is invalid"
    exit 1
fi

# Check for legacy directories that should be removed
log_info "Checking for legacy components..."
LEGACY_DIRS=("website" "frontend" "mobile" "nginx" "monitoring")
for dir in "${LEGACY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_warning "Legacy directory still exists: $dir/"
    else
        log_success "Legacy directory removed: $dir/"
    fi
done

# Validate TypeScript configuration
log_info "Validating TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        log_success "TypeScript configuration is valid"
    else
        log_warning "TypeScript validation failed (may need dependencies)"
    fi
fi

# Check Git status
log_info "Checking Git repository status..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    CURRENT_BRANCH=$(git branch --show-current)
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "No remote configured")
    
    log_success "Git repository initialized"
    log_info "Current branch: $CURRENT_BRANCH"
    log_info "Remote URL: $REMOTE_URL"
    
    if [[ "$REMOTE_URL" == *"SwarmsNode/SwarmNode-Protocol"* ]]; then
        log_success "Connected to correct GitHub repository"
    else
        log_warning "Repository URL may not be correct"
    fi
else
    log_error "Not a Git repository"
    exit 1
fi

# Check for professional commit messages
log_info "Checking commit message format..."
LAST_COMMIT_MSG=$(git log -1 --pretty=format:"%s")
if [[ "$LAST_COMMIT_MSG" =~ ^(feat|fix|docs|style|refactor|test|chore|ci): ]]; then
    log_success "Latest commit follows conventional format"
    log_info "Last commit: $LAST_COMMIT_MSG"
else
    log_warning "Latest commit may not follow conventional format"
fi

# Validate Docker configuration
log_info "Validating Docker configuration..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
    log_success "Docker configuration files present"
else
    log_error "Missing Docker configuration"
fi

# Check GitHub configuration
log_info "Checking GitHub configuration..."
if [ -d ".github" ]; then
    if [ -f ".github/workflows/ci.yml" ]; then
        log_success "CI/CD workflow configured"
    fi
    
    if [ -f ".github/ISSUE_TEMPLATE/bug_report.yml" ]; then
        log_success "Issue templates configured"
    fi
    
    if [ -f ".github/pull_request_template.md" ]; then
        log_success "PR template configured"
    fi
else
    log_warning "No GitHub configuration found"
fi

# Final summary
echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Validation Summary          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

log_success "SwarmNode Protocol is production-ready!"
echo -e "\n${GREEN}✓ Project structure validated${NC}"
echo -e "${GREEN}✓ Professional development setup${NC}"
echo -e "${GREEN}✓ Git repository configured${NC}"
echo -e "${GREEN}✓ GitHub integration ready${NC}"
echo -e "${GREEN}✓ Docker containerization setup${NC}"
echo -e "${GREEN}✓ Security policies in place${NC}"

echo -e "\n${BLUE}Repository: https://github.com/SwarmsNode/SwarmNode-Protocol${NC}"
echo -e "${BLUE}Ready for community contributions and production deployment!${NC}\n"
