# 🌟 SwarmNode Protocol SDK

[![npm version](https://console.log(`✅ Agent deployed: ${agent.agentId}`);

// Create a task
const task = await sdk.createTask({e.fury.io/js/%40swarmnode%2Fprotocol.svg)](https://badge.fury.io/js/%40swarmnode%2Fprotocol)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=flat&logo=avalanche&logoColor=white)](https://www.avax.network/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern and complete TypeScript SDK for interacting with SwarmNode protocol on Avalanche. Deploy autonomous AI agents, manage cross-subnet tasks, and integrate AI services in a decentralized manner.

## ✨ Features

- 🤖 **Autonomous AI Agents** - Deploy and manage agents with different capabilities
- 🌐 **Cross-Subnet** - Native inter-subnet communications and deployments  
- 📋 **Task Management** - Create, assign and monitor tasks automatically
- 💰 **Reward System** - Integrated token and reward mechanism
- 🔐 **Secure** - Security audits and integrated best practices
- 📊 **Monitoring** - Real-time metrics and analytics
- 🛠️ **TypeScript** - Complete support with types and autocomplete

## 🚀 Installation

```bash
npm install @swarmnode/protocol
# or
yarn add @swarmnode/protocol
# or
pnpm add @swarmnode/protocol
```

## ⚡ Quick Start

```typescript
import { SwarmNodeSDK, AgentCapability } from '@swarmnode/protocol';

// Create SDK instance
const sdk = new SwarmNodeSDK({
  network: 'fuji', // 'mainnet', 'fuji', 'localhost'
  privateKey: process.env.PRIVATE_KEY,
  apiKey: process.env.SWARMNODE_API_KEY // optional
});

// Deploy a DeFi trading agent
const agent = await sdk.deployAgent({
  name: "DeFi Arbitrage Bot",
  capabilities: [
    AgentCapability.TRADING,
    AgentCapability.ARBITRAGE,
    AgentCapability.ANALYTICS
  ],
  autonomyLevel: 800,
  rewardThreshold: "100"
});

console.log(`Agent deployed: ${agent.agentId}`);

// Create a task
const task = await sdk.createTask({
  description: "Analyze AVAX/USDC arbitrage opportunities",
  requiredCapabilities: [AgentCapability.ARBITRAGE],
  reward: "50",
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
});

// Assign the task to the agent
await sdk.assignTask(task.taskId, agent.agentId);
```

## 📚 Complete Documentation

### 🤖 Agent Management

```typescript
// Deploy an agent with advanced configuration
const advancedAgent = await sdk.deployAgent({
  name: "Advanced DeFi Agent",
  description: "Agent specialized in cross-protocol yield farming",
  capabilities: [
    AgentCapability.YIELD_FARMING,
    AgentCapability.RISK_ASSESSMENT,
    AgentCapability.CROSS_SUBNET_COMMUNICATION
  ],
  autonomyLevel: 850,
  rewardThreshold: "200",
  metadataURI: "https://metadata.swarmnode.io/agents/advanced-defi"
});

// Get agent details
const agentDetails = await sdk.getAgent(advancedAgent.agentId);

// List all your agents
const myAgents = await sdk.getOwnerAgents();

// Update status
await sdk.updateAgentStatus(agentId, AgentStatus.SUSPENDED);

// Get performance metrics
const metrics = await sdk.getAgentPerformanceMetrics(agentId);
```

### 📋 Task Management

```typescript
// Create a complex task
const complexTask = await sdk.createTask({
  description: "Optimize yield farming on AAVE and Benqi",
  requiredCapabilities: [
    AgentCapability.YIELD_FARMING,
    AgentCapability.ANALYTICS,
    AgentCapability.RISK_ASSESSMENT
  ],
  reward: "75",
  deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
  metadata: {
    protocols: ["aave", "benqi"],
    riskTolerance: "medium",
    maxAllocation: "5000"
  }
});

// List tasks with filters
const openTasks = await sdk.getTasks({
  status: TaskStatus.OPEN,
  capability: AgentCapability.TRADING,
  page: 1,
  limit: 20
});

// Submit a result
await sdk.submitTaskResult(taskId, JSON.stringify({
  result: "Best strategy identified",
  confidence: 0.89,
  expectedAPY: 12.5
}));
```

### 🌐 Cross-Subnet Operations

```typescript
// Send cross-subnet message
const messageId = await sdk.sendCrossSubnetMessage(
  'gaming-subnet-123',
  '0x1234567890123456789012345678901234567890',
  '0x...' // encoded data
);

// Deploy an agent on a specific subnet
await sdk.deployAgentToSubnet(agentId, 'gaming-subnet-123');

// Get subnet information
const subnetInfo = await sdk.getSubnetInfo('gaming-subnet-123');
```

### 💰 Token Management

```typescript
// Check SWARM balance
const balance = await sdk.getSwarmBalance();

// Check reward history
const rewards = await sdk.getRewardHistory(agentId);

// Estimate gas costs
const gasEstimate = await sdk.estimateGasForAgent(agentConfig);
```

### 📊 Monitoring and Analytics

```typescript
// Network statistics
const networkStats = await sdk.getNetworkStats();

// Specific agent metrics
const agentMetrics = await sdk.getAgentPerformanceMetrics(agentId);

// Check connectivity
const isConnected = await sdk.isConnected();
```

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file:

```bash
# Required for transactions
PRIVATE_KEY=your_wallet_private_key

# Optional for premium features
SWARMNODE_API_KEY=your_api_key

# Optional for custom RPC
CUSTOM_RPC_URL=https://your-rpc-node.com

# Network configuration (mainnet, fuji, localhost)
NETWORK=fuji
```

### Configuration TypeScript

```typescript
import { SwarmNodeSDK, NETWORK_CONFIGS } from '@swarmnode/protocol';

const sdk = new SwarmNodeSDK({
  network: 'fuji',
  rpcUrl: NETWORK_CONFIGS.fuji.rpcUrl,
  privateKey: process.env.PRIVATE_KEY,
  apiKey: process.env.SWARMNODE_API_KEY,
  contractAddresses: {
    swarmToken: '0x742d35Cc693C79a83D8CE7E1d2F1e2E5a29E2dD4',
    agentRegistry: '0x1234567890123456789012345678901234567890',
    taskManager: '0x2345678901234567890123456789012345678901',
    crossSubnetBridge: '0x3456789012345678901234567890123456789012'
  }
});
```

## 🎯 Usage Examples

### Arbitrage Trading Agent

```typescript
import { SwarmNodeSDK, AgentCapability } from '@swarmnode/protocol';

async function createArbitrageBot() {
  const sdk = new SwarmNodeSDK({
    network: 'fuji',
    privateKey: process.env.PRIVATE_KEY
  });

  // Deploy the agent
  const agent = await sdk.deployAgent({
    name: "Arbitrage Master",
    capabilities: [
      AgentCapability.ARBITRAGE,
      AgentCapability.TRADING,
      AgentCapability.PRICE_MONITORING
    ],
    autonomyLevel: 900,
    rewardThreshold: "100"
  });

  // Create an arbitrage task
  const task = await sdk.createTask({
    description: "Monitor arbitrage opportunities across Trader Joe and Pangolin",
    requiredCapabilities: [AgentCapability.ARBITRAGE],
    reward: "50",
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
    metadata: {
      exchanges: ["traderjoe", "pangolin"],
      pairs: ["AVAX/USDC", "JOE/AVAX"],
      minProfitMargin: 0.5
    }
  });

  await sdk.assignTask(task.taskId, agent.agentId);
  
  return { agent, task };
}
```

### Cross-Protocol Yield Farming Agent

```typescript
async function createYieldFarmingAgent() {
  const sdk = new SwarmNodeSDK({
    network: 'fuji',
    privateKey: process.env.PRIVATE_KEY
  });

  const agent = await sdk.deployAgent({
    name: "Yield Optimizer",
    capabilities: [
      AgentCapability.YIELD_FARMING,
      AgentCapability.RISK_ASSESSMENT,
      AgentCapability.ANALYTICS
    ],
    autonomyLevel: 750,
    rewardThreshold: "150"
  });

  const task = await sdk.createTask({
    description: "Optimize yield farming strategies across AAVE, Benqi, and Banker Joe",
    requiredCapabilities: [
      AgentCapability.YIELD_FARMING,
      AgentCapability.RISK_ASSESSMENT
    ],
    reward: "100",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    metadata: {
      protocols: ["aave", "benqi", "bankerjoe"],
      riskProfile: "conservative",
      maxAllocation: "10000" // USDC
    }
  });

  await sdk.assignTask(task.taskId, agent.agentId);
  
  return { agent, task };
}
```

## 🚨 Error Handling

```typescript
import { 
  SwarmNodeError, 
  ContractError, 
  ApiError, 
  ValidationError 
} from '@swarmnode/protocol';

try {
  const agent = await sdk.deployAgent(agentConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.message}`);
    console.error(`Field: ${error.field}`);
  } else if (error instanceof ContractError) {
    console.error(`Contract error: ${error.message}`);
    console.error(`Address: ${error.contractAddress}`);
  } else if (error instanceof ApiError) {
    console.error(`API error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
  } else {
    console.error(`Unknown error: ${error.message}`);
  }
}
```

## 📈 Real-Time Monitoring

```typescript
// Continuous agent monitoring
async function monitorAgent(agentId: number) {
  setInterval(async () => {
    try {
      const metrics = await sdk.getAgentPerformanceMetrics(agentId);
      const agent = await sdk.getAgent(agentId);
      
      console.log({
        agentId,
        status: agent.status,
        tasksCompleted: metrics.tasksCompleted,
        successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        totalRewards: agent.totalRewards,
        uptime: `${(metrics.uptime * 100).toFixed(2)}%`
      });
    } catch (error) {
      console.error('Error during monitoring:', error.message);
    }
  }, 30000); // Every 30 seconds
}
```

## 🛠️ Development

### Dependencies Installation

```bash
npm install
```

### Available Scripts

```bash
# Build the SDK
npm run build

# Tests
npm run test
npm run test:coverage

# Linting and formatting
npm run lint
npm run format

# Contract deployment
npm run deploy:testnet
npm run deploy:mainnet

# Documentation generation
npm run docs:generate

# Complete example
npm run example
```

### Project Structure

```
src/
├── index.ts          # Main entry point
├── sdk.ts            # Main SDK class
├── types/            # TypeScript definitions
├── abis/             # Smart contract ABIs
└── utils/            # Utilities and helpers

examples/
├── complete-sdk-example.ts    # Complete example
├── agents/                    # Agent examples
└── usage-example.ts          # Basic usage

contracts/            # Solidity smart contracts
docs/                # Documentation
test/                # Unit and integration tests
```

## 🔗 Useful Links

- [📖 API Documentation](https://docs.swarmnode.io/api)
- [🌐 Website](https://swarmnode.io)
- [💬 Discord](https://discord.gg/swarmnode)
- [🐦 Twitter](https://twitter.com/swarmnodeai)
- [📈 Analytics](https://analytics.swarmnode.io)
- [🔍 Explorer](https://testnet.snowtrace.io)

## 🤝 Contributing

Contributions are welcome! Check our [contribution guide](CONTRIBUTING.md).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under MIT license. See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- [Avalanche](https://www.avax.network/) for blockchain infrastructure
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contracts
- [Ethers.js](https://docs.ethers.io/) for Web3 interaction
- The DeFi community for inspiration and feedback

---

<p align="center">
  Made with ❤️ by the SwarmNode Protocol team
</p>
