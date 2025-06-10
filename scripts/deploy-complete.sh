#!/bin/bash

# SwarmNode Protocol - Complete Production Deployment Script
# This script handles the full deployment pipeline from development to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${1:-staging}"
VERSION="${2:-$(date +%Y%m%d-%H%M%S)}"

# Environment-specific configurations
case $DEPLOYMENT_ENV in
    "staging")
        DOMAIN="staging.swarmnode.io"
        NETWORK="fuji"
        ;;
    "production")
        DOMAIN="swarmnode.io"
        NETWORK="mainnet"
        ;;
    *)
        echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}🚀 SwarmNode Protocol Deployment Pipeline${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "Environment: ${GREEN}$DEPLOYMENT_ENV${NC}"
echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo -e "Network: ${GREEN}$NETWORK${NC}"
echo -e "Version: ${GREEN}$VERSION${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "${YELLOW}📋 Step $1: $2${NC}"
    echo "----------------------------------------"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "1" "Checking Prerequisites"
    
    # Check required environment variables
    local required_vars=(
        "PRIVATE_KEY"
        "SNOWTRACE_API_KEY"
        "MONGODB_URI"
        "REDIS_URL"
        "JWT_SECRET"
        "OPENAI_API_KEY"
        "SWARMNODE_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Missing required environment variable: $var${NC}"
            exit 1
        fi
    done
    
    # Check required tools
    local required_tools=("node" "npm" "docker" "docker-compose" "forge" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            echo -e "${RED}❌ Required tool not found: $tool${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ All prerequisites satisfied${NC}"
    echo ""
}

# Function to run tests
run_tests() {
    print_step "2" "Running Comprehensive Tests"
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Run linting
    echo "Running ESLint..."
    npm run lint
    
    # Run type checking
    echo "Running TypeScript checks..."
    npm run type-check
    
    # Run unit tests
    echo "Running unit tests..."
    npm test
    
    # Run integration tests
    echo "Running integration tests..."
    npm run test:integration
    
    # Test smart contracts
    echo "Testing smart contracts..."
    cd contracts
    forge test -vvv
    cd ..
    
    echo -e "${GREEN}✅ All tests passed${NC}"
    echo ""
}

# Function to build artifacts
build_artifacts() {
    print_step "3" "Building Deployment Artifacts"
    
    cd "$PROJECT_ROOT"
    
    # Build SDK
    echo "Building SDK..."
    npm run build
    
    # Build API
    echo "Building API..."
    cd api
    npm ci
    npm run build
    cd ..
    
    # Build smart contracts
    echo "Compiling smart contracts..."
    cd contracts
    forge build
    cd ..
    
    # Build Docker images
    echo "Building Docker images..."
    docker build -t swarmnode-api:$VERSION ./api
    
    echo -e "${GREEN}✅ All artifacts built successfully${NC}"
    echo ""
}

# Function to deploy smart contracts
deploy_contracts() {
    print_step "4" "Deploying Smart Contracts"
    
    cd "$PROJECT_ROOT/contracts"
    
    local rpc_url
    case $NETWORK in
        "fuji")
            rpc_url="https://api.avax-test.network/ext/bc/C/rpc"
            ;;
        "mainnet")
            rpc_url="https://api.avax.network/ext/bc/C/rpc"
            ;;
    esac
    
    echo "Deploying contracts to $NETWORK..."
    
    # Deploy contracts with verification
    local deployment_output
    deployment_output=$(forge script script/Deploy.s.sol:DeployScript \
        --rpc-url "$rpc_url" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        --verify \
        --etherscan-api-key "$SNOWTRACE_API_KEY" 2>&1)
    
    echo "$deployment_output"
    
    # Extract contract addresses
    local swarm_token
    local agent_registry
    local task_manager
    local cross_subnet_bridge
    
    swarm_token=$(echo "$deployment_output" | grep "SwarmToken deployed at:" | awk '{print $4}')
    agent_registry=$(echo "$deployment_output" | grep "AgentRegistry deployed at:" | awk '{print $4}')
    task_manager=$(echo "$deployment_output" | grep "TaskManager deployed at:" | awk '{print $4}')
    cross_subnet_bridge=$(echo "$deployment_output" | grep "CrossSubnetBridge deployed at:" | awk '{print $4}')
    
    # Save addresses to environment file
    cat > "../.env.$DEPLOYMENT_ENV" << EOF
SWARM_TOKEN_ADDRESS=$swarm_token
AGENT_REGISTRY_ADDRESS=$agent_registry
TASK_MANAGER_ADDRESS=$task_manager
CROSS_SUBNET_BRIDGE_ADDRESS=$cross_subnet_bridge
DEPLOYMENT_NETWORK=$NETWORK
DEPLOYMENT_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
DEPLOYMENT_VERSION=$VERSION
EOF
    
    echo -e "${GREEN}✅ Smart contracts deployed successfully${NC}"
    echo -e "SwarmToken: ${GREEN}$swarm_token${NC}"
    echo -e "AgentRegistry: ${GREEN}$agent_registry${NC}"
    echo -e "TaskManager: ${GREEN}$task_manager${NC}"
    echo -e "CrossSubnetBridge: ${GREEN}$cross_subnet_bridge${NC}"
    echo ""
    
    cd ..
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_step "5" "Deploying Infrastructure"
    
    cd "$PROJECT_ROOT"
    
    # Load contract addresses
    source ".env.$DEPLOYMENT_ENV"
    
    # Update docker-compose with environment variables
    export SWARM_TOKEN_ADDRESS
    export AGENT_REGISTRY_ADDRESS
    export TASK_MANAGER_ADDRESS
    export CROSS_SUBNET_BRIDGE_ADDRESS
    export DEPLOYMENT_VERSION=$VERSION
    
    # Deploy with docker-compose
    echo "Deploying infrastructure..."
    docker-compose -f docker-compose.yml -f "docker-compose.$DEPLOYMENT_ENV.yml" up -d
    
    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30
    
    # Health check
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:3000/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API service is healthy${NC}"
            break
        fi
        
        echo "Attempt $attempt/$max_attempts: API not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ API service failed to start${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
    echo ""
}

# Function to run smoke tests
run_smoke_tests() {
    print_step "6" "Running Smoke Tests"
    
    cd "$PROJECT_ROOT"
    
    # Load environment
    source ".env.$DEPLOYMENT_ENV"
    
    # Test API endpoints
    echo "Testing API health..."
    local api_url="http://localhost:3000"
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        api_url="https://api.$DOMAIN"
    fi
    
    # Health check
    if ! curl -f "$api_url/health"; then
        echo -e "${RED}❌ API health check failed${NC}"
        exit 1
    fi
    
    # Test contract interaction
    echo "Testing contract interaction..."
    node -e "
        const { SwarmNodeSDK } = require('./dist/sdk');
        const sdk = new SwarmNodeSDK({
            network: '$NETWORK',
            apiKey: process.env.SWARMNODE_API_KEY
        });
        
        sdk.getNetworkStats().then(stats => {
            console.log('Network stats:', stats);
            console.log('✅ Contract interaction successful');
        }).catch(err => {
            console.error('❌ Contract interaction failed:', err);
            process.exit(1);
        });
    "
    
    echo -e "${GREEN}✅ Smoke tests passed${NC}"
    echo ""
}

# Function to update monitoring
setup_monitoring() {
    print_step "7" "Setting Up Monitoring"
    
    # Update Grafana dashboards
    echo "Updating Grafana dashboards..."
    if [ -f "grafana/dashboards/swarmnode-dashboard.json" ]; then
        curl -X POST "https://grafana.$DOMAIN/api/dashboards/db" \
            -H "Authorization: Bearer $GRAFANA_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d @grafana/dashboards/swarmnode-dashboard.json || true
    fi
    
    # Set up uptime monitoring
    echo "Configuring uptime monitoring..."
    curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "api_key=$UPTIMEROBOT_API_KEY" \
        -d "format=json" \
        -d "type=1" \
        -d "url=https://api.$DOMAIN/health" \
        -d "friendly_name=SwarmNode API ($DEPLOYMENT_ENV)" || true
    
    echo -e "${GREEN}✅ Monitoring configured${NC}"
    echo ""
}

# Function to update documentation
update_documentation() {
    print_step "8" "Updating Documentation"
    
    cd "$PROJECT_ROOT"
    
    # Load contract addresses
    source ".env.$DEPLOYMENT_ENV"
    
    # Update deployments documentation
    cat > "DEPLOYMENTS_$DEPLOYMENT_ENV.md" << EOF
# SwarmNode Protocol - $DEPLOYMENT_ENV Deployment

## Deployment Information
- **Environment**: $DEPLOYMENT_ENV
- **Network**: $NETWORK
- **Version**: $VERSION
- **Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Contract Addresses
- **SwarmToken**: \`$SWARM_TOKEN_ADDRESS\`
- **AgentRegistry**: \`$AGENT_REGISTRY_ADDRESS\`
- **TaskManager**: \`$TASK_MANAGER_ADDRESS\`
- **CrossSubnetBridge**: \`$CROSS_SUBNET_BRIDGE_ADDRESS\`

## Service URLs
- **API**: https://api.$DOMAIN
- **Documentation**: https://docs.$DOMAIN
- **Monitoring**: https://monitoring.$DOMAIN

## Verification
All contracts are verified on Snowtrace:
- [SwarmToken](https://snowtrace.io/address/$SWARM_TOKEN_ADDRESS)
- [AgentRegistry](https://snowtrace.io/address/$AGENT_REGISTRY_ADDRESS)
- [TaskManager](https://snowtrace.io/address/$TASK_MANAGER_ADDRESS)
- [CrossSubnetBridge](https://snowtrace.io/address/$CROSS_SUBNET_BRIDGE_ADDRESS)

## Quick Start
\`\`\`bash
npm install @swarmnode/protocol

# Create SDK instance
const sdk = new SwarmNodeSDK({
    network: '$NETWORK',
    apiKey: 'your-api-key'
});
\`\`\`
EOF
    
    echo -e "${GREEN}✅ Documentation updated${NC}"
    echo ""
}

# Function to send notifications
send_notifications() {
    print_step "9" "Sending Notifications"
    
    # Discord notification
    if [ -n "$DISCORD_WEBHOOK" ]; then
        curl -X POST "$DISCORD_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"content\": \"🚀 SwarmNode Protocol deployed to **$DEPLOYMENT_ENV**\",
                \"embeds\": [{
                    \"title\": \"Deployment Successful\",
                    \"color\": 3066993,
                    \"fields\": [
                        {\"name\": \"Environment\", \"value\": \"$DEPLOYMENT_ENV\", \"inline\": true},
                        {\"name\": \"Version\", \"value\": \"$VERSION\", \"inline\": true},
                        {\"name\": \"Network\", \"value\": \"$NETWORK\", \"inline\": true}
                    ],
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
                }]
            }" || true
    fi
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"SwarmNode Protocol deployed to $DEPLOYMENT_ENV\",
                \"attachments\": [{
                    \"color\": \"good\",
                    \"fields\": [
                        {\"title\": \"Environment\", \"value\": \"$DEPLOYMENT_ENV\", \"short\": true},
                        {\"title\": \"Version\", \"value\": \"$VERSION\", \"short\": true},
                        {\"title\": \"Network\", \"value\": \"$NETWORK\", \"short\": true}
                    ]
                }]
            }" || true
    fi
    
    echo -e "${GREEN}✅ Notifications sent${NC}"
    echo ""
}

# Function to cleanup
cleanup() {
    print_step "10" "Cleanup and Finalization"
    
    # Clean up Docker images
    echo "Cleaning up old Docker images..."
    docker system prune -f || true
    
    # Clean up build artifacts
    echo "Cleaning up build artifacts..."
    rm -rf dist/ node_modules/.cache/ || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo ""
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting deployment pipeline...${NC}"
    echo ""
    
    # Run all deployment steps
    check_prerequisites
    run_tests
    build_artifacts
    deploy_contracts
    deploy_infrastructure
    run_smoke_tests
    setup_monitoring
    update_documentation
    send_notifications
    cleanup
    
    echo -e "${GREEN}🎉 SwarmNode Protocol deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Deployment Summary:${NC}"
    echo -e "Environment: ${GREEN}$DEPLOYMENT_ENV${NC}"
    echo -e "Version: ${GREEN}$VERSION${NC}"
    echo -e "API URL: ${GREEN}https://api.$DOMAIN${NC}"
    echo -e "Documentation: ${GREEN}https://docs.$DOMAIN${NC}"
    echo -e "Monitoring: ${GREEN}https://monitoring.$DOMAIN${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Monitor deployment in Grafana"
    echo "2. Test SDK integration with new contracts"
    echo "3. Update client applications with new addresses"
    echo "4. Notify community of new deployment"
    echo ""
}

# Handle script interruption
trap cleanup EXIT

# Validate arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment> [version]"
    echo "Environments: staging, production"
    exit 1
fi

# Run main deployment
main "$@"
