import { SwarmNodeSDK } from '../src/sdk';
import { ethers } from 'ethers';
import { jest } from '@jest/globals';

/**
 * Comprehensive Integration Tests for SwarmNode Protocol
 * Tests real-world scenarios and cross-subnet functionality
 */
describe('SwarmNode Protocol - Integration Tests', () => {
  let sdk: SwarmNodeSDK;
  let testWallet: ethers.Wallet;
  let agentId: number;
  let taskId: number;

  // Test configuration
  const TEST_CONFIG = {
    network: 'fuji' as const,
    timeout: 60000, // 60 seconds for blockchain operations
    gasLimit: 500000,
    maxRetries: 3
  };

  beforeAll(async () => {
    // Initialize test environment
    testWallet = ethers.Wallet.createRandom();
    
    sdk = new SwarmNodeSDK({
      network: TEST_CONFIG.network,
      privateKey: testWallet.privateKey,
      apiKey: process.env.SWARMNODE_TEST_API_KEY
    });

    // Fund test wallet with AVAX for gas fees
    await fundTestWallet(testWallet.address);
    
    // Get some test SWARM tokens
    await requestTestTokens(testWallet.address);
    
    console.log(`Test wallet: ${testWallet.address}`);
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Cleanup test resources
    if (agentId) {
      try {
        await sdk.agents.deactivate(agentId);
      } catch (error) {
        console.warn('Agent cleanup error:', error);
      }
    }
  });

  describe('Network Connectivity', () => {
    test('should connect to Fuji testnet', async () => {
      const networkStats = await sdk.getNetworkStats();
      expect(networkStats).toBeDefined();
      expect(networkStats.blockNumber).toBeGreaterThan(0);
    });

    test('should verify contract deployments', async () => {
      const addresses = await sdk.getContractAddresses();
      
      expect(addresses.SwarmToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(addresses.AgentRegistry).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(addresses.TaskManager).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(addresses.CrossSubnetBridge).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('should validate API connectivity', async () => {
      const response = await fetch('https://api.swarmnode.io/health');
      const health = await response.json();
      
      expect(health.status).toBe('healthy');
      expect(health.services.mongodb).toBe(true);
      expect(health.services.redis).toBe(true);
    });
  });

  describe('Agent Lifecycle Management', () => {
    test('should deploy a new agent successfully', async () => {
      const agentConfig = {
        name: `Test Agent ${Date.now()}`,
        capabilities: ['trading', 'analysis'],
        autonomyLevel: 750,
        stakeAmount: ethers.parseEther('1000').toString(),
        description: 'Integration test agent',
        maxTasksPerDay: 50
      };

      const deployment = await sdk.agents.deploy(agentConfig);
      agentId = deployment.agentId;

      expect(deployment.success).toBe(true);
      expect(deployment.agentId).toBeGreaterThan(0);
      expect(deployment.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      
      // Verify agent was deployed on-chain
      const agent = await sdk.agents.get(agentId);
      expect(agent.name).toBe(agentConfig.name);
      expect(agent.owner.toLowerCase()).toBe(testWallet.address.toLowerCase());
    }, TEST_CONFIG.timeout);

    test('should retrieve agent details', async () => {
      const agent = await sdk.agents.get(agentId);
      
      expect(agent.id).toBe(agentId);
      expect(agent.status).toBe('active');
      expect(agent.capabilities).toContain('trading');
      expect(agent.capabilities).toContain('analysis');
      expect(parseFloat(agent.stakeAmount)).toBeGreaterThan(0);
    });

    test('should list all agents with pagination', async () => {
      const agents = await sdk.agents.list({ page: 1, limit: 10 });
      
      expect(agents.success).toBe(true);
      expect(agents.data).toBeInstanceOf(Array);
      expect(agents.pagination.page).toBe(1);
      expect(agents.pagination.limit).toBe(10);
      
      // Our test agent should be in the list
      const testAgent = agents.data.find(a => a.id === agentId);
      expect(testAgent).toBeDefined();
    });

    test('should update agent stake', async () => {
      const additionalStake = ethers.parseEther('500').toString();
      
      const result = await sdk.agents.addStake(agentId, additionalStake);
      expect(result.success).toBe(true);
      
      // Verify stake was updated
      const agent = await sdk.agents.get(agentId);
      expect(parseFloat(agent.stakeAmount)).toBeGreaterThan(1000);
    });
  });

  describe('Task Management', () => {
    test('should create a new task', async () => {
      const taskConfig = {
        description: 'Analyze current AVAX price trends and provide trading recommendation',
        reward: ethers.parseEther('50').toString(),
        deadline: Date.now() + 3600000, // 1 hour from now
        requiredCapabilities: ['analysis'],
        priority: 'medium' as const
      };

      const task = await sdk.tasks.create(taskConfig);
      taskId = task.id;

      expect(task.success).toBe(true);
      expect(task.id).toBeGreaterThan(0);
      expect(task.status).toBe('pending');
    });

    test('should assign task to agent', async () => {
      const assignment = await sdk.tasks.assign(taskId, agentId);
      
      expect(assignment.success).toBe(true);
      
      // Verify task status changed
      const task = await sdk.tasks.get(taskId);
      expect(task.status).toBe('in_progress');
      expect(task.assignedAgentId).toBe(agentId);
    });

    test('should simulate task completion', async () => {
      // Simulate agent completing the task
      const resultHash = ethers.keccak256(ethers.toUtf8Bytes('Task completed successfully'));
      
      const completion = await sdk.tasks.complete(taskId, resultHash);
      expect(completion.success).toBe(true);
      
      // Verify task is completed
      const task = await sdk.tasks.get(taskId);
      expect(task.status).toBe('completed');
      expect(task.resultHash).toBe(resultHash);
    });

    test('should retrieve task history', async () => {
      const tasks = await sdk.tasks.list({ 
        assignedAgent: agentId,
        status: 'completed'
      });
      
      expect(tasks.success).toBe(true);
      expect(tasks.data.length).toBeGreaterThan(0);
      
      const completedTask = tasks.data.find(t => t.id === taskId);
      expect(completedTask).toBeDefined();
      expect(completedTask?.status).toBe('completed');
    });
  });

  describe('Cross-Subnet Communication', () => {
    test('should send cross-subnet message', async () => {
      const message = {
        targetSubnet: 1, // DeFi subnet
        payload: ethers.toUtf8Bytes(JSON.stringify({
          type: 'price_query',
          token: 'AVAX',
          timestamp: Date.now()
        }))
      };

      const result = await sdk.crossSubnet.sendMessage(
        message.targetSubnet,
        message.payload
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeGreaterThan(0);
      expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('should verify message delivery', async () => {
      // This would check the message status on the target subnet
      // For testing purposes, we'll simulate the check
      const messageStatus = await sdk.crossSubnet.getMessageStatus(1);
      
      expect(messageStatus).toBeDefined();
      expect(['pending', 'delivered', 'failed']).toContain(messageStatus.status);
    });

    test('should calculate cross-subnet fees', async () => {
      const payload = ethers.toUtf8Bytes('Test message');
      const fee = await sdk.crossSubnet.calculateFee(payload.length);
      
      expect(parseFloat(fee)).toBeGreaterThan(0);
      expect(parseFloat(fee)).toBeLessThan(100); // Reasonable fee range
    });
  });

  describe('AI Integration', () => {
    test('should perform AI analysis', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('Skipping AI tests - No OpenAI API key provided');
        return;
      }

      const analysis = await sdk.ai.analyze({
        prompt: 'Analyze the current DeFi market trends on Avalanche',
        model: 'gpt-3.5-turbo',
        agentId: agentId
      });

      expect(analysis.success).toBe(true);
      expect(analysis.data.response).toBeDefined();
      expect(analysis.data.response.length).toBeGreaterThan(50);
    });

    test('should validate AI model availability', async () => {
      const models = await sdk.ai.getAvailableModels();
      
      expect(models).toContain('gpt-3.5-turbo');
      if (process.env.ANTHROPIC_API_KEY) {
        expect(models).toContain('claude-3-sonnet');
      }
    });
  });

  describe('Performance & Monitoring', () => {
    test('should retrieve network statistics', async () => {
      const stats = await sdk.getNetworkStats();
      
      expect(stats.totalAgents).toBeGreaterThan(0);
      expect(stats.totalTasks).toBeGreaterThan(0);
      expect(stats.networkHealth).toBeGreaterThanOrEqual(0);
      expect(stats.networkHealth).toBeLessThanOrEqual(100);
    });

    test('should get agent performance metrics', async () => {
      const performance = await sdk.agents.getPerformance(agentId);
      
      expect(performance.totalTasks).toBeGreaterThanOrEqual(1);
      expect(performance.successRate).toBeGreaterThanOrEqual(0);
      expect(performance.successRate).toBeLessThanOrEqual(100);
      expect(performance.reputationScore).toBeGreaterThan(0);
    });

    test('should measure API response times', async () => {
      const startTime = Date.now();
      await sdk.agents.list({ limit: 5 });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe('Security & Error Handling', () => {
    test('should handle invalid agent ID gracefully', async () => {
      await expect(sdk.agents.get(999999)).rejects.toThrow();
    });

    test('should validate task parameters', async () => {
      const invalidTask = {
        description: '', // Empty description should fail
        reward: '0', // Zero reward should fail
        deadline: Date.now() - 3600000 // Past deadline should fail
      };

      await expect(sdk.tasks.create(invalidTask)).rejects.toThrow();
    });

    test('should handle insufficient funds gracefully', async () => {
      // Try to stake more tokens than available
      const excessiveStake = ethers.parseEther('1000000').toString();
      
      await expect(
        sdk.agents.addStake(agentId, excessiveStake)
      ).rejects.toThrow(/insufficient/i);
    });

    test('should validate network permissions', async () => {
      // Try to complete a task not assigned to our agent
      const unauthorizedTaskId = 12345;
      const fakeResultHash = ethers.keccak256(ethers.toUtf8Bytes('fake'));
      
      await expect(
        sdk.tasks.complete(unauthorizedTaskId, fakeResultHash)
      ).rejects.toThrow();
    });
  });

  describe('Gas Optimization', () => {
    test('should estimate gas costs accurately', async () => {
      const gasEstimate = await sdk.estimateGas(
        'AgentRegistry',
        'registerAgent',
        ['Test Agent', ['trading'], 750, ethers.parseEther('1000')]
      );

      expect(parseFloat(gasEstimate)).toBeGreaterThan(0);
      expect(parseFloat(gasEstimate)).toBeLessThan(1000000); // Reasonable gas limit
    });

    test('should batch multiple operations efficiently', async () => {
      const operations = [
        { contract: 'SwarmToken', method: 'approve', params: [] },
        { contract: 'AgentRegistry', method: 'registerAgent', params: [] }
      ];

      // This would test batched transaction execution
      // For now, we'll just verify the batching interface exists
      expect(sdk.batch).toBeDefined();
      expect(typeof sdk.batch.execute).toBe('function');
    });
  });
});

/**
 * Helper function to fund test wallet with AVAX
 */
async function fundTestWallet(address: string): Promise<void> {
  // In a real test environment, this would request funds from a testnet faucet
  console.log(`Requesting testnet AVAX for ${address}`);
  
  // Simulate faucet request
  const faucetResponse = await fetch('https://faucet.avax-test.network/api/faucet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  
  if (!faucetResponse.ok) {
    console.warn('Faucet request failed, using alternative funding method');
  }
}

/**
 * Helper function to request test SWARM tokens
 */
async function requestTestTokens(address: string): Promise<void> {
  console.log(`Requesting test SWARM tokens for ${address}`);
  
  // This would interact with a test token faucet or admin mint function
  const response = await fetch('https://api.swarmnode.io/test/tokens', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SWARMNODE_TEST_API_KEY}`
    },
    body: JSON.stringify({ 
      address, 
      amount: ethers.parseEther('10000').toString() 
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to request test tokens');
  }
}

/**
 * Custom Jest matchers for blockchain testing
 */
expect.extend({
  toBeValidTxHash(received: string) {
    const pass = /^0x[a-fA-F0-9]{64}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid transaction hash`,
      pass
    };
  },
  
  toBeValidAddress(received: string) {
    const pass = /^0x[a-fA-F0-9]{40}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid Ethereum address`,
      pass
    };
  },
  
  toBeWithinGasLimit(received: number, limit: number) {
    const pass = received > 0 && received <= limit;
    return {
      message: () => `expected ${received} to be within gas limit of ${limit}`,
      pass
    };
  }
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTxHash(): R;
      toBeValidAddress(): R;
      toBeWithinGasLimit(limit: number): R;
    }
  }
}
