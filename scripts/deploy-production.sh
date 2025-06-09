#!/bin/bash

# SwarmNode Protocol - Production Deployment Script
# This script deploys the full SwarmNode Protocol to Avalanche networks

set -e

echo "🚀 SwarmNode Protocol Deployment Script"
echo "========================================"

# Configuration
NETWORK=${1:-fuji}
DEPLOY_ENV=${2:-testnet}

if [ "$NETWORK" = "avalanche" ] && [ "$DEPLOY_ENV" = "mainnet" ]; then
    echo "⚠️  MAINNET DEPLOYMENT DETECTED"
    echo "This will deploy to Avalanche C-Chain mainnet."
    echo "Are you sure? (yes/no)"
    read -r confirmation
    if [ "$confirmation" != "yes" ]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

echo "📋 Deployment Configuration:"
echo "Network: $NETWORK"
echo "Environment: $DEPLOY_ENV"
echo ""

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run lint
npm run test
npm run typecheck

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

# Deploy contracts
echo "🌐 Deploying to $NETWORK..."

# Deploy SwarmToken first
echo "  📝 Deploying SwarmToken..."
SWARM_TOKEN=$(npx hardhat run scripts/deploy.ts --network $NETWORK | grep "SwarmToken deployed to:" | cut -d' ' -f4)
echo "  ✅ SwarmToken: $SWARM_TOKEN"

# Deploy AgentRegistry
echo "  📝 Deploying AgentRegistry..."
AGENT_REGISTRY=$(npx hardhat run scripts/deploy-agent-registry.ts --network $NETWORK | grep "AgentRegistry deployed to:" | cut -d' ' -f4)
echo "  ✅ AgentRegistry: $AGENT_REGISTRY"

# Deploy TaskManager
echo "  📝 Deploying TaskManager..."
TASK_MANAGER=$(npx hardhat run scripts/deploy-task-manager.ts --network $NETWORK | grep "TaskManager deployed to:" | cut -d' ' -f4)
echo "  ✅ TaskManager: $TASK_MANAGER"

# Deploy Cross-subnet components
if [ "$NETWORK" = "avalanche" ] || [ "$NETWORK" = "fuji" ]; then
    echo "  📝 Deploying Cross-subnet components..."
    CROSS_SUBNET_BRIDGE=$(npx hardhat run scripts/deploy-cross-subnet.ts --network $NETWORK | grep "CrossSubnetBridge deployed to:" | cut -d' ' -f4)
    echo "  ✅ CrossSubnetBridge: $CROSS_SUBNET_BRIDGE"
fi

# Verify contracts on Snowtrace
if [ "$NETWORK" = "avalanche" ] || [ "$NETWORK" = "fuji" ]; then
    echo "🔍 Verifying contracts on Snowtrace..."
    npx hardhat verify --network $NETWORK $SWARM_TOKEN
    npx hardhat verify --network $NETWORK $AGENT_REGISTRY $SWARM_TOKEN
    npx hardhat verify --network $NETWORK $TASK_MANAGER $AGENT_REGISTRY $SWARM_TOKEN
    
    if [ -n "$CROSS_SUBNET_BRIDGE" ]; then
        npx hardhat verify --network $NETWORK $CROSS_SUBNET_BRIDGE
    fi
fi

# Configure initial parameters
echo "⚙️  Configuring initial parameters..."
npx hardhat run scripts/configure-initial-params.ts --network $NETWORK

# Deploy demo agents
echo "🤖 Deploying demo agents..."
npx hardhat run scripts/deploy-demo-agents.ts --network $NETWORK

# Update deployment file
echo "📄 Updating deployment records..."
cat > deployments/$NETWORK-deployment.json << EOF
{
  "network": "$NETWORK",
  "environment": "$DEPLOY_ENV",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "SwarmToken": "$SWARM_TOKEN",
    "AgentRegistry": "$AGENT_REGISTRY",
    "TaskManager": "$TASK_MANAGER",
    "CrossSubnetBridge": "$CROSS_SUBNET_BRIDGE"
  },
  "verification": {
    "snowtrace": true,
    "sourcify": false
  }
}
EOF

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "Network: $NETWORK"
echo "SwarmToken: $SWARM_TOKEN"
echo "AgentRegistry: $AGENT_REGISTRY"
echo "TaskManager: $TASK_MANAGER"
if [ -n "$CROSS_SUBNET_BRIDGE" ]; then
    echo "CrossSubnetBridge: $CROSS_SUBNET_BRIDGE"
fi
echo ""
echo "🔗 Useful Links:"
if [ "$NETWORK" = "avalanche" ]; then
    echo "Snowtrace: https://snowtrace.io/address/$SWARM_TOKEN"
elif [ "$NETWORK" = "fuji" ]; then
    echo "Snowtrace Testnet: https://testnet.snowtrace.io/address/$SWARM_TOKEN"
fi
echo ""
echo "Next steps:"
echo "1. Update frontend configuration with new addresses"
echo "2. Run integration tests: npm run test:integration"
echo "3. Deploy monitoring dashboard"
echo "4. Announce deployment to community"
