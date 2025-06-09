#!/bin/bash

# SwarmNode Protocol Development Environment
# Starts all development services

set -e

# Colors
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
    echo -e "${BLUE}  SwarmNode Development Mode${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

check_dependencies() {
    print_status "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not found. Installing..."
        npm install
    fi
    
    print_success "Dependencies verified"
}

start_hardhat_node() {
    print_status "Starting Hardhat development node..."
    
    # Kill any existing hardhat process
    pkill -f "hardhat node" || true
    
    # Start hardhat node in background
    npm run dev &
    HARDHAT_PID=$!
    
    # Wait for node to start
    sleep 3
    
    if kill -0 $HARDHAT_PID 2>/dev/null; then
        print_success "Hardhat node started (PID: $HARDHAT_PID)"
    else
        print_error "Failed to start Hardhat node"
        exit 1
    fi
}

deploy_contracts() {
    print_status "Deploying contracts to local network..."
    
    # Wait a bit more for the node to be fully ready
    sleep 2
    
    npm run deploy:testnet || {
        print_warning "Contract deployment failed or skipped"
    }
}

show_status() {
    print_header
    print_success "Development environment is ready!"
    echo
    print_status "Services running:"
    echo "  - Hardhat Node: http://localhost:8545"
    echo "  - Chain ID: 31337"
    echo
    print_status "Useful commands:"
    echo "  npm run test          - Run tests"
    echo "  npm run compile       - Compile contracts"
    echo "  npm run lint          - Run linting"
    echo
    print_status "To stop all services:"
    echo "  pkill -f 'hardhat node'"
    echo
}

cleanup() {
    print_status "Cleaning up..."
    pkill -f "hardhat node" || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

main() {
    print_header
    
    check_dependencies
    start_hardhat_node
    deploy_contracts
    show_status
    
    # Keep script running
    print_status "Press Ctrl+C to stop all services"
    while true; do
        sleep 1
    done
}

main "$@"
