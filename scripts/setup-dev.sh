#!/bin/bash

# SwarmNode Protocol - Development Setup Script
# This script sets up a complete development environment

set -e

echo "🚀 Setting up SwarmNode Protocol Development Environment"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 16
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Found: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
}

# Check if git is installed
check_git() {
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_error "Git not found. Please install Git."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
            print_warning "Please edit .env file with your configuration"
        else
            print_warning ".env.example not found, creating basic .env file"
            cat > .env << EOF
# SwarmNode Protocol Environment Configuration
PRIVATE_KEY=your_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SWARMNODE_API_KEY=your_swarmnode_api_key_here
NETWORK=fuji
EOF
            print_success "Created basic .env file"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Setup git hooks
setup_git_hooks() {
    print_status "Setting up git hooks..."
    
    # Create pre-commit hook
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# SwarmNode Protocol pre-commit hook

echo "🔍 Running pre-commit checks..."

# Run linting
echo "📝 Checking code style..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the errors and try again."
    exit 1
fi

# Run type checking
echo "🔍 Type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix the errors and try again."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the failing tests and try again."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    print_success "Git pre-commit hook installed"
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    npm run test
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed. Check the output above."
    fi
}

# Create sample configuration
create_sample_config() {
    print_status "Creating sample configuration files..."
    
    # Create sample agent configuration
    mkdir -p examples/configs
    
    cat > examples/configs/sample-agent.json << 'EOF'
{
  "name": "Sample DeFi Trading Agent",
  "description": "A sample agent for DeFi trading operations",
  "capabilities": [
    "trading",
    "arbitrage",
    "analytics",
    "risk_assessment"
  ],
  "autonomyLevel": 800,
  "rewardThreshold": "100",
  "metadata": {
    "version": "1.0.0",
    "author": "SwarmNode Team",
    "exchanges": ["traderjoe", "pangolin"],
    "supportedTokens": ["AVAX", "USDC", "JOE"]
  }
}
EOF

    cat > examples/configs/sample-task.json << 'EOF'
{
  "description": "Monitor arbitrage opportunities between Trader Joe and Pangolin",
  "requiredCapabilities": [
    "arbitrage",
    "price_monitoring",
    "analytics"
  ],
  "reward": "50",
  "metadata": {
    "priority": "high",
    "exchanges": ["traderjoe", "pangolin"],
    "pairs": ["AVAX/USDC", "JOE/AVAX"],
    "minProfitMargin": 0.5,
    "maxSlippage": 0.1
  }
}
EOF

    print_success "Sample configuration files created in examples/configs/"
}

# Setup development database (if using local development)
setup_dev_database() {
    print_status "Setting up development environment..."
    
    # Create local directories for development
    mkdir -p logs
    mkdir -p temp
    mkdir -p deployments
    
    # Create a simple deployment log
    cat > deployments/deployment-log.md << 'EOF'
# Deployment Log

## Development Deployments

This file tracks deployment history for development and testing.

### Local Network
- No deployments yet

### Fuji Testnet  
- No deployments yet

### Mainnet
- No deployments yet
EOF

    print_success "Development directories created"
}

# Main execution
main() {
    print_status "Starting SwarmNode Protocol setup..."
    
    # Check prerequisites
    check_nodejs
    check_npm
    check_git
    
    # Setup project
    install_dependencies
    setup_environment
    setup_git_hooks
    
    # Build and test
    build_project
    run_tests
    
    # Additional setup
    create_sample_config
    setup_dev_database
    
    # Final instructions
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Edit the .env file with your configuration"
    echo "2. Run 'npm run dev' to start development"
    echo "3. Run 'npm run example' to test the SDK"
    echo "4. Check the documentation in docs/ folder"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "- npm run build          # Build the project"
    echo "- npm run test           # Run tests"
    echo "- npm run lint           # Check code style"
    echo "- npm run deploy:testnet # Deploy to Fuji testnet"
    echo "- npm run example        # Run example usage"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Run main function
main "$@"
