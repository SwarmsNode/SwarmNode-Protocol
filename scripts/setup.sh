#!/bin/bash

# SwarmNode Protocol Development Setup
# Professional development environment initialization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}  SwarmNode Protocol Setup${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "System requirements satisfied"
}

install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

setup_environment() {
    print_status "Setting up development environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# SwarmNode Protocol Environment Configuration
NODE_ENV=development
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
REPORT_GAS=false
EOF
        print_warning "Created .env file. Please update with your configuration."
    fi
    
    print_success "Environment configuration ready"
}

compile_contracts() {
    print_status "Compiling smart contracts..."
    
    npm run compile
    
    print_success "Smart contracts compiled successfully"
}

run_tests() {
    print_status "Running test suite..."
    
    npm test
    
    print_success "All tests passed"
}

setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    # Create pre-commit hook
    mkdir -p .git/hooks
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# SwarmNode Protocol pre-commit hook

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix errors before committing."
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix errors before committing."
    exit 1
fi

echo "Pre-commit checks passed ✓"
EOF
    
    chmod +x .git/hooks/pre-commit
    
    print_success "Git hooks configured"
}

show_next_steps() {
    print_header
    print_success "Setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "  1. Update .env file with your configuration"
    echo "  2. Run 'npm run dev' to start local blockchain"
    echo "  3. Run 'npm run deploy:testnet' to deploy contracts"
    echo "  4. Check out the documentation in /docs"
    echo
    print_status "Available commands:"
    echo "  npm run build         - Build the project"
    echo "  npm run test          - Run tests"
    echo "  npm run lint          - Run code linting"
    echo "  npm run format        - Format code"
    echo "  npm run dev           - Start development node"
    echo
    print_status "Documentation:"
    echo "  docs/api.md          - API documentation"
    echo "  docs/agent-guide.md  - Agent development guide"
    echo "  docs/contracts.md    - Smart contract documentation"
    echo
}

main() {
    print_header
    
    check_requirements
    install_dependencies
    setup_environment
    compile_contracts
    run_tests
    setup_git_hooks
    
    show_next_steps
}

# Run main function
main "$@"
