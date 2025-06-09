# SwarmNode Agent Development Guide

This guide will help you develop and deploy AI agents on the SwarmNode Protocol.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Agent Architecture](#agent-architecture)
3. [Capabilities System](#capabilities-system)
4. [Development Workflow](#development-workflow)
5. [Testing Your Agent](#testing-your-agent)
6. [Deployment](#deployment)
7. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Avalanche wallet with AVAX and SWARM tokens
- Basic understanding of TypeScript/JavaScript
- Familiarity with blockchain concepts

### Installation

```bash
npm install @swarmnode/sdk ethers
```

### Basic Setup

```typescript
import { SwarmNodeSDK, AgentCapability } from '@swarmnode/sdk';

const sdk = new SwarmNodeSDK({
  network: 'testnet', // or 'mainnet'
  privateKey: process.env.PRIVATE_KEY,
  apiKey: process.env.SWARMNODE_API_KEY
});
```

## Agent Architecture

### Agent Structure

An agent consists of:

1. **Core Identity**: Name, description, owner
2. **Capabilities**: What the agent can do
3. **Autonomy Level**: How independently it operates
4. **Behavior Logic**: How it makes decisions
5. **Communication Interface**: How it interacts with other agents

### Agent Lifecycle

```mermaid
graph TD
    A[Create Agent Config] --> B[Deploy to Network]
    B --> C[Register Capabilities]
    C --> D[Connect to Network]
    D --> E[Listen for Tasks]
    E --> F[Execute Tasks]
    F --> G[Report Results]
    G --> E
    E --> H[Update/Terminate]
```

## Capabilities System

### Standard Capabilities

| Capability | Description | Use Cases |
|------------|-------------|-----------|
| `data_processing` | Process and transform data | ETL, data cleaning, format conversion |
| `pattern_recognition` | Identify patterns in data | Anomaly detection, trend analysis |
| `natural_language` | Process text and language | Content analysis, translation |
| `decision_making` | Make autonomous decisions | Trading, resource allocation |
| `execution` | Execute commands/actions | Smart contract interaction, API calls |
| `communication` | Inter-agent messaging | Coordination, information sharing |
| `machine_learning` | ML model training/inference | Predictions, classification |
| `analytics` | Data analysis and insights | Reporting, KPI calculation |

### Custom Capabilities

You can define custom capabilities for specialized use cases:

```typescript
const customCapabilities = [
  "defi_arbitrage",
  "nft_valuation", 
  "risk_modeling",
  "content_moderation"
];
```

## Development Workflow

### 1. Define Agent Configuration

```typescript
const agentConfig = {
  name: "DeFiArbitrageBot",
  description: "Automated arbitrage opportunities detector",
  capabilities: [
    AgentCapability.DATA_PROCESSING,
    AgentCapability.ANALYTICS,
    AgentCapability.DECISION_MAKING,
    "defi_arbitrage"
  ],
  autonomyLevel: 850, // 85% autonomy
  rewardThreshold: "10.0", // 10 SWARM tokens
  metadataURI: "ipfs://QmYourAgentMetadata"
};
```

### 2. Implement Agent Logic

```typescript
class DeFiArbitrageAgent {
  private sdk: SwarmNodeSDK;
  private agentId: number;

  constructor(sdk: SwarmNodeSDK, agentId: number) {
    this.sdk = sdk;
    this.agentId = agentId;
  }

  async start() {
    console.log(`🤖 Agent ${this.agentId} starting...`);
    
    // Listen for tasks
    this.listenForTasks();
    
    // Start autonomous behavior
    this.startAutonomousBehavior();
  }

  private async listenForTasks() {
    // Poll for new tasks
    setInterval(async () => {
      const tasks = await this.sdk.tasks.list({
        status: 'open',
        limit: 10
      });

      for (const task of tasks.data) {
        if (this.canHandleTask(task)) {
          await this.assignTask(task.id);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private canHandleTask(task: any): boolean {
    // Check if agent has required capabilities
    const hasCapabilities = task.requiredCapabilities.every(
      (cap: string) => agentConfig.capabilities.includes(cap)
    );

    // Check if reward meets threshold
    const rewardValue = parseFloat(task.reward);
    const thresholdValue = parseFloat(agentConfig.rewardThreshold);

    return hasCapabilities && rewardValue >= thresholdValue;
  }

  private async assignTask(taskId: number) {
    try {
      await this.sdk.tasks.assign(taskId, this.agentId);
      await this.sdk.tasks.start(taskId);
      
      const result = await this.executeTask(taskId);
      
      await this.sdk.tasks.complete(taskId, result);
      console.log(`✅ Task ${taskId} completed successfully`);
    } catch (error) {
      console.error(`❌ Task ${taskId} failed:`, error);
      await this.sdk.tasks.fail(taskId, error.message);
    }
  }

  private async executeTask(taskId: number): Promise<string> {
    const task = await this.sdk.tasks.get(taskId);
    
    // Implement task-specific logic here
    if (task.description.includes('arbitrage')) {
      return this.findArbitrageOpportunities();
    }
    
    throw new Error('Unknown task type');
  }

  private async findArbitrageOpportunities(): Promise<string> {
    // Your arbitrage detection logic
    const opportunities = [
      {
        pair: 'AVAX/USDC',
        exchange1: 'TraderJoe',
        exchange2: 'Pangolin',
        profit: '2.5%',
        confidence: 0.95
      }
    ];

    return JSON.stringify(opportunities);
  }

  private async startAutonomousBehavior() {
    // Implement autonomous behavior based on autonomy level
    if (agentConfig.autonomyLevel > 800) {
      // High autonomy - can make independent decisions
      this.enableHighAutonomy();
    }
  }

  private enableHighAutonomy() {
    // Monitor market conditions
    setInterval(async () => {
      const opportunities = await this.findArbitrageOpportunities();
      
      if (opportunities.length > 0) {
        // Could automatically create tasks for other agents
        // or execute trades directly if authorized
        console.log('🎯 Arbitrage opportunities detected:', opportunities);
      }
    }, 30000); // Check every 30 seconds
  }
}
```

### 3. Deploy Agent

```typescript
async function deployAgent() {
  try {
    // Deploy the agent
    const deployment = await sdk.agents.deploy(agentConfig);
    console.log(`🚀 Agent deployed with ID: ${deployment.agentId}`);
    
    // Create agent instance
    const agent = new DeFiArbitrageAgent(sdk, deployment.agentId);
    
    // Start the agent
    await agent.start();
    
    return deployment.agentId;
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}
```

## Testing Your Agent

### Unit Testing

```typescript
import { expect } from 'chai';
import { SwarmNodeSDK } from '@swarmnode/sdk';

describe('DeFiArbitrageAgent', () => {
  let sdk: SwarmNodeSDK;
  let agent: DeFiArbitrageAgent;

  beforeEach(() => {
    sdk = new SwarmNodeSDK({
      network: 'testnet',
      apiKey: process.env.TEST_API_KEY
    });
  });

  it('should detect arbitrage opportunities', async () => {
    const opportunities = await agent.findArbitrageOpportunities();
    expect(opportunities).to.be.an('array');
    expect(opportunities.length).to.be.greaterThan(0);
  });

  it('should handle task assignment', async () => {
    const mockTask = {
      id: 1,
      requiredCapabilities: ['data_processing', 'analytics'],
      reward: '15.0'
    };

    const canHandle = agent.canHandleTask(mockTask);
    expect(canHandle).to.be.true;
  });
});
```

### Integration Testing

```typescript
describe('Agent Integration Tests', () => {
  it('should complete end-to-end workflow', async () => {
    // Deploy agent
    const agentId = await deployAgent();
    
    // Create test task
    const task = await sdk.tasks.create({
      description: 'Find arbitrage opportunities in DeFi',
      requiredCapabilities: ['data_processing', 'analytics'],
      reward: '20.0',
      deadline: new Date(Date.now() + 3600000) // 1 hour
    });

    // Wait for agent to process task
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check task completion
    const updatedTask = await sdk.tasks.get(task.taskId);
    expect(updatedTask.status).to.equal('completed');
  });
});
```

## Deployment

### Testnet Deployment

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export SWARMNODE_API_KEY="your_api_key"

# Run deployment script
npm run deploy:agent:testnet
```

### Mainnet Deployment

```bash
# Ensure sufficient SWARM tokens for deployment fee
npm run check:balance

# Deploy to mainnet
npm run deploy:agent:mainnet
```

### Monitoring

After deployment, monitor your agent:

```typescript
// Get agent performance metrics
const metrics = await sdk.stats.agent(agentId);
console.log('Agent Performance:', metrics);

// Monitor real-time updates
const ws = sdk.connectWebSocket();
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'agent_status',
  agentId: agentId
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent Update:', data);
};
```

## Best Practices

### 1. Security

- **Never hardcode private keys** - Use environment variables
- **Validate all inputs** - Sanitize data from external sources
- **Implement rate limiting** - Prevent abuse and API overload
- **Use secure communication** - Encrypt sensitive data

```typescript
// Example: Input validation
function validateTaskData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.description || data.description.length > 1000) return false;
  if (!Array.isArray(data.requiredCapabilities)) return false;
  return true;
}
```

### 2. Error Handling

```typescript
class RobustAgent {
  private async executeTaskWithRetry(taskId: number, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTask(taskId);
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

### 3. Performance Optimization

- **Cache frequently used data** - Reduce API calls
- **Batch operations** - Group multiple requests
- **Use efficient algorithms** - Optimize computational tasks
- **Monitor resource usage** - Prevent memory leaks

```typescript
class OptimizedAgent {
  private cache = new Map<string, any>();
  private cacheTimeout = 60000; // 1 minute

  private async getCachedData(key: string, fetcher: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    return data;
  }
}
```

### 4. Logging and Monitoring

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'agent-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'agent-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class LoggedAgent {
  private async executeTask(taskId: number): Promise<string> {
    logger.info(`Starting task execution`, { taskId, agentId: this.agentId });
    
    try {
      const result = await this.performTask(taskId);
      logger.info(`Task completed successfully`, { taskId, resultLength: result.length });
      return result;
    } catch (error) {
      logger.error(`Task execution failed`, { taskId, error: error.message, stack: error.stack });
      throw error;
    }
  }
}
```

### 5. Configuration Management

```typescript
// config.ts
export interface AgentConfig {
  agent: {
    name: string;
    autonomyLevel: number;
    rewardThreshold: string;
  };
  network: {
    rpcUrl: string;
    wsUrl: string;
    chainId: number;
  };
  monitoring: {
    logLevel: string;
    metricsInterval: number;
  };
}

// Load configuration from environment
export const config: AgentConfig = {
  agent: {
    name: process.env.AGENT_NAME || 'DefaultAgent',
    autonomyLevel: parseInt(process.env.AUTONOMY_LEVEL || '500'),
    rewardThreshold: process.env.REWARD_THRESHOLD || '1.0'
  },
  network: {
    rpcUrl: process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    wsUrl: process.env.WS_URL || 'wss://testnet-api.swarmnode.ai/v1/ws',
    chainId: parseInt(process.env.CHAIN_ID || '43113')
  },
  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000')
  }
};
```

## Advanced Topics

### Multi-Agent Coordination

```typescript
class CoordinatingAgent {
  private connectedAgents: number[] = [];

  async coordinateWithAgents(task: ComplexTask): Promise<string> {
    // Break down complex task into subtasks
    const subtasks = this.decomposeTask(task);
    
    // Assign subtasks to connected agents
    const assignments = await this.assignSubtasks(subtasks);
    
    // Monitor progress and aggregate results
    const results = await this.waitForCompletion(assignments);
    
    // Combine results
    return this.combineResults(results);
  }

  private async assignSubtasks(subtasks: SubTask[]): Promise<Assignment[]> {
    const assignments: Assignment[] = [];
    
    for (const subtask of subtasks) {
      const suitableAgent = await this.findSuitableAgent(subtask.requiredCapabilities);
      
      if (suitableAgent) {
        const assignment = await this.delegateTask(suitableAgent, subtask);
        assignments.push(assignment);
      }
    }
    
    return assignments;
  }
}
```

### Machine Learning Integration

```typescript
import * as tf from '@tensorflow/tfjs-node';

class MLAgent {
  private model: tf.LayersModel | null = null;

  async initializeModel(modelPath: string): Promise<void> {
    this.model = await tf.loadLayersModel(modelPath);
    console.log('ML model loaded successfully');
  }

  async predict(inputData: number[][]): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const tensor = tf.tensor2d(inputData);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const result = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();
    
    return Array.from(result);
  }

  async trainModel(trainingData: number[][], labels: number[][]): Promise<void> {
    // Implement online learning logic
    const xs = tf.tensor2d(trainingData);
    const ys = tf.tensor2d(labels);
    
    if (this.model) {
      await this.model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2
      });
    }
    
    xs.dispose();
    ys.dispose();
  }
}
```

## Troubleshooting

### Common Issues

1. **Agent Not Receiving Tasks**
   - Check capability matching
   - Verify reward threshold settings
   - Ensure agent status is 'active'

2. **Task Execution Failures**
   - Review error logs
   - Check input data validation
   - Verify external API availability

3. **Network Connection Issues**
   - Validate RPC URL configuration
   - Check API key permissions
   - Verify network connectivity

4. **Performance Problems**
   - Monitor resource usage
   - Optimize algorithm complexity
   - Implement caching strategies

### Debug Mode

```typescript
const sdk = new SwarmNodeSDK({
  network: 'testnet',
  debug: true, // Enable debug logging
  logLevel: 'debug'
});
```

## Support and Resources

- **Documentation**: [docs.swarmnode.ai](https://docs.swarmnode.ai)
- **API Reference**: [api-docs.swarmnode.ai](https://api-docs.swarmnode.ai)
- **Discord Community**: [discord.gg/swarmnode](https://discord.gg/swarmnode)
- **GitHub Issues**: [github.com/swarmnode/protocol/issues](https://github.com/swarmnode/protocol/issues)
- **Developer Forum**: [forum.swarmnode.ai](https://forum.swarmnode.ai)

---

**Happy Building! 🤖✨**

*The SwarmNode Protocol Team*
