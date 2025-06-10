# SwarmNode Protocol SDK

Complete and modern SDK for interacting with SwarmNode protocol on Avalanche. This SDK allows you to deploy autonomous AI agents, manage cross-subnet tasks, and integrate external AI services in a decentralized manner.

## 🚀 Installation

```bash
npm install @swarmnode/protocol
# or
yarn add @swarmnode/protocol
```

## 📋 Prerequisites

- Node.js >= 16
- An Avalanche wallet with AVAX for gas fees
- SwarmNode API key (optional, for advanced features)

## 🔧 Quick Setup

```typescript
import { SwarmNodeSDK, createSwarmNodeSDK } from '@swarmnode/protocol';

// Simple configuration
const sdk = createSwarmNodeSDK({
  network: 'fuji', // 'mainnet', 'fuji', 'localhost'
  privateKey: process.env.PRIVATE_KEY,
  apiKey: process.env.SWARMNODE_API_KEY // optional
});

// Advanced configuration
const advancedSdk = new SwarmNodeSDK({
  network: 'fuji',
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  apiKey: process.env.SWARMNODE_API_KEY,
  contractAddresses: {
    swarmToken: '0x742d35Cc693C79a83D8CE7E1d2F1e2E5a29E2dD4',
    agentRegistry: '0x1234567890123456789012345678901234567890',
    taskManager: '0x2345678901234567890123456789012345678901'
  }
});
```

## 🤖 Agent Management

### Deploy an agent

```typescript
import { AgentCapability } from '@swarmnode/protocol';

const agentResult = await sdk.deployAgent({
  name: "DeFi Trading Bot",
  description: "Automated trading agent for DeFi protocols",
  capabilities: [
    AgentCapability.TRADING,
    AgentCapability.ANALYTICS,
    AgentCapability.RISK_ASSESSMENT
  ],
  autonomyLevel: 800, // 80% autonomy
  rewardThreshold: "100" // 100 SWARM tokens minimum
});

console.log('Agent deployed:', {
  id: agentResult.agentId,
  hash: agentResult.transactionHash,
  fee: agentResult.deploymentFee
});
```

### Get an agent

```typescript
const agent = await sdk.getAgent(agentResult.agentId);
console.log('Agent:', {
  name: agent.name,
  status: agent.status,
  totalRewards: agent.totalRewards,
  capabilities: agent.capabilities
});
```

### List your agents

```typescript
const myAgents = await sdk.getOwnerAgents();
console.log(`You have ${myAgents.length} agents deployed`);

myAgents.forEach(agent => {
  console.log(`- ${agent.name} (ID: ${agent.id}) - Status: ${agent.status}`);
});
```

### Update agent status

```typescript
import { AgentStatus } from '@swarmnode/protocol';

// Suspend an agent
await sdk.updateAgentStatus(agentResult.agentId, AgentStatus.SUSPENDED);

// Reactivate an agent
await sdk.updateAgentStatus(agentResult.agentId, AgentStatus.ACTIVE);
```

## 📋 Task Management

### Create a task

```typescript
import { AgentCapability } from '@swarmnode/protocol';

const taskResult = await sdk.createTask({
  description: "Analyze arbitrage opportunities between Trader Joe and Pangolin",
  requiredCapabilities: [
    AgentCapability.TRADING,
    AgentCapability.ARBITRAGE,
    AgentCapability.ANALYTICS
  ],
  reward: "50", // 50 SWARM tokens
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  metadata: {
    priority: 'high',
    exchanges: ['traderjoe', 'pangolin'],
    pairs: ['AVAX/USDC', 'JOE/AVAX']
  }
});

console.log('Task created:', taskResult.taskId);
```

### Assign a task to an agent

```typescript
await sdk.assignTask(taskResult.taskId, agentResult.agentId);
console.log('Task assigned to agent');
```

### Submit task result

```typescript
const result = {
  arbitrageOpportunities: [
    {
      pair: 'AVAX/USDC',
      exchange1: 'traderjoe',
      price1: 25.42,
      exchange2: 'pangolin',
      price2: 25.58,
      profitPotential: 0.63,
      riskLevel: 'low'
    }
  ],
  analysisTimestamp: Date.now(),
  confidence: 0.89
};

await sdk.submitTaskResult(taskResult.taskId, JSON.stringify(result));
```

### List tasks

```typescript
// All tasks with pagination
const tasksPage = await sdk.getTasks({
  page: 1,
  limit: 10,
  status: TaskStatus.OPEN
});

console.log(`${tasksPage.data.length} tasks found out of ${tasksPage.pagination.total}`);

// Tasks by capability
const tradingTasks = await sdk.getTasks({
  capability: AgentCapability.TRADING
});
```

## 🌐 Cross-Subnet Operations

### Send cross-subnet message

```typescript
const messageId = await sdk.sendCrossSubnetMessage(
  'subnet-123', // Destination subnet ID
  '0x1234...', // Destination address
  '0x...' // Data to send
);

console.log('Cross-subnet message sent:', messageId);
```

### Deploy agent to subnet

```typescript
const deploymentHash = await sdk.deployAgentToSubnet(
  agentResult.agentId,
  'gaming-subnet-456'
);

console.log('Agent deployed to subnet:', deploymentHash);
```

### Get subnet information

```typescript
const subnetInfo = await sdk.getSubnetInfo('gaming-subnet-456');
console.log('Subnet:', {
  name: subnetInfo.name,
  isActive: subnetInfo.isActive,
  totalAgents: subnetInfo.totalAgents
});
```

## 📊 Statistics and Metrics

### Network statistics

```typescript
const networkStats = await sdk.getNetworkStats();
console.log('SwarmNode Network:', {
  totalAgents: networkStats.totalAgents,
  activeAgents: networkStats.activeAgents,
  completedTasks: networkStats.completedTasks,
  networkUptime: `${(networkStats.networkUptime * 100).toFixed(2)}%`
});
```

### Agent metrics

```typescript
const metrics = await sdk.getAgentPerformanceMetrics(agentResult.agentId);
console.log('Agent performance:', {
  tasksCompleted: metrics.tasksCompleted,
  successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
  averageResponseTime: `${metrics.averageResponseTime}ms`,
  totalRewards: metrics.totalRewards
});
```

## 💰 Token and Reward Management

### Check SWARM balance

```typescript
const balance = await sdk.getSwarmBalance();
console.log(`Balance: ${balance} SWARM tokens`);

// Balance of another address
const otherBalance = await sdk.getSwarmBalance('0x1234...');
```

### Reward history

```typescript
const rewardHistory = await sdk.getRewardHistory(agentResult.agentId);
rewardHistory.forEach(reward => {
  console.log(`Reward: ${reward.amount} SWARM - ${reward.reason}`);
});
```

## 🔧 Gas Estimation and Utilities

### Estimate gas for deployment

```typescript
const gasEstimate = await sdk.estimateGasForAgent({
  name: "Test Agent",
  capabilities: [AgentCapability.DATA_PROCESSING],
  autonomyLevel: 500,
  rewardThreshold: "10"
});

console.log('Gas estimate:', {
  gasLimit: gasEstimate.gasLimit,
  gasPrice: gasEstimate.gasPrice,
  estimatedCost: `${ethers.utils.formatEther(gasEstimate.estimatedCost)} AVAX`
});
```

### Check connection

```typescript
const isConnected = await sdk.isConnected();
console.log('SDK connected:', isConnected);

if (isConnected) {
  const account = await sdk.getCurrentAccount();
  console.log('Current account:', account);
}
```

## 🚨 Error Handling

```typescript
import { SwarmNodeError, ContractError, ApiError, ValidationError } from '@swarmnode/protocol';

try {
  await sdk.deployAgent(invalidConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message, 'Field:', error.field);
  } else if (error instanceof ContractError) {
    console.error('Contract error:', error.message, 'Address:', error.contractAddress);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message, 'Code:', error.statusCode);
  } else if (error instanceof SwarmNodeError) {
    console.error('SwarmNode error:', error.message, 'Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 🌍 Network Configuration

```typescript
import { NETWORK_CONFIGS } from '@swarmnode/protocol';

// Predefined configurations
console.log('Fuji Network:', NETWORK_CONFIGS.fuji);
console.log('Mainnet Network:', NETWORK_CONFIGS.mainnet);

// Usage with custom provider
const customSdk = new SwarmNodeSDK({
  network: 'fuji',
  rpcUrl: NETWORK_CONFIGS.fuji.rpcUrl,
  privateKey: process.env.PRIVATE_KEY
});
```

## 📱 Complete Example: DeFi Trading Agent

```typescript
import { SwarmNodeSDK, AgentCapability, AgentStatus } from '@swarmnode/protocol';

async function createDeFiTradingAgent() {
  const sdk = createSwarmNodeSDK({
    network: 'fuji',
    privateKey: process.env.PRIVATE_KEY,
    apiKey: process.env.SWARMNODE_API_KEY
  });

  try {
    // 1. Deploy the agent
    console.log('🚀 Deploying trading agent...');
    const agent = await sdk.deployAgent({
      name: "Alpha DeFi Trader",
      description: "High-frequency trading agent for Avalanche DeFi ecosystem",
      capabilities: [
        AgentCapability.TRADING,
        AgentCapability.ARBITRAGE,
        AgentCapability.YIELD_FARMING,
        AgentCapability.RISK_ASSESSMENT,
        AgentCapability.ANALYTICS
      ],
      autonomyLevel: 850,
      rewardThreshold: "100"
    });

    console.log(`✅ Agent deployed with ID: ${agent.agentId}`);

    // 2. Create market analysis task
    console.log('📋 Creating analysis task...');
    const task = await sdk.createTask({
      description: "Analyze yield farming opportunities on AAVE and Benqi",
      requiredCapabilities: [
        AgentCapability.YIELD_FARMING,
        AgentCapability.ANALYTICS,
        AgentCapability.RISK_ASSESSMENT
      ],
      reward: "75",
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12h
    });

    // 3. Assign the task
    await sdk.assignTask(task.taskId, agent.agentId);
    console.log('✅ Task assigned to agent');

    // 4. Monitor performance
    setInterval(async () => {
      const metrics = await sdk.getAgentPerformanceMetrics(agent.agentId);
      console.log('📊 Metrics:', {
        tasks: metrics.tasksCompleted,
        success: `${(metrics.successRate * 100).toFixed(1)}%`,
        rewards: metrics.totalRewards
      });
    }, 60000); // Every minute

    return { agent, task };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run the example
createDeFiTradingAgent()
  .then(({ agent, task }) => {
    console.log(`🎉 Agent ${agent.agentId} operational with task ${task.taskId}`);
  })
  .catch(console.error);
```

## 📚 Additional Resources

- [API Documentation](https://docs.swarmnode.io/api)
- [Examples on GitHub](https://github.com/swarmnode/examples)
- [Discord Community](https://discord.gg/swarmnode)
- [Smart Contracts](https://github.com/swarmnode/protocol-contracts)

## 🔐 Security

- Never expose your private keys in code
- Use environment variables for sensitive data
- Always validate parameters before transactions
- Monitor your agents and tasks regularly

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
