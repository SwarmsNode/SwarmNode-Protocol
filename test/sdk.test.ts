import { SwarmNodeSDK } from '../src/sdk';
import { AgentCapability, AgentStatus, TaskStatus } from '../src/types';

// Mock ethers pour les tests
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 43113, name: 'fuji' }),
        getGasPrice: jest.fn().mockResolvedValue('20000000000'),
        estimateGas: jest.fn().mockResolvedValue('100000')
      }))
    },
    Wallet: jest.fn().mockImplementation(() => ({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      signMessage: jest.fn().mockResolvedValue('0x...')
    })),
    Contract: jest.fn().mockImplementation(() => ({
      deployAgent: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xabc123...',
          events: [{ event: 'AgentDeployed', args: { agentId: { toNumber: () => 1 } } }],
          gasUsed: { toString: () => '85000' }
        })
      }),
      getAgent: jest.fn().mockResolvedValue({
        owner: '0x1234567890123456789012345678901234567890',
        name: 'Test Agent',
        description: 'Test Description',
        capabilities: ['trading', 'analytics'],
        autonomyLevel: 800,
        rewardThreshold: '100000000000000000000',
        totalRewards: '0',
        deploymentTime: 1686650400,
        status: 0,
        metadataURI: ''
      }),
      estimateGas: {
        deployAgent: jest.fn().mockResolvedValue('100000')
      }
    })),
    utils: {
      parseEther: jest.fn().mockImplementation((value) => `${value}000000000000000000`),
      formatEther: jest.fn().mockImplementation((value) => value.toString().replace(/000000000000000000$/, '')),
      formatBytes32String: jest.fn().mockImplementation((value) => `0x${value}`)
    }
  }
}));

// Mock fetch pour les tests API
global.fetch = jest.fn();

describe('SwarmNodeSDK', () => {
  let sdk: SwarmNodeSDK;
  const mockPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';

  beforeEach(() => {
    sdk = new SwarmNodeSDK({
      network: 'fuji',
      privateKey: mockPrivateKey,
      apiKey: 'test-api-key'
    });

    // Reset mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(sdk).toBeDefined();
    });

    it('should connect to the network', async () => {
      const isConnected = await sdk.isConnected();
      expect(isConnected).toBe(true);
    });

    it('should get current account address', async () => {
      const account = await sdk.getCurrentAccount();
      expect(account).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('Agent Management', () => {
    const testAgentConfig = {
      name: 'Test Trading Agent',
      description: 'A test trading agent',
      capabilities: [AgentCapability.TRADING, AgentCapability.ANALYTICS],
      autonomyLevel: 800,
      rewardThreshold: '100'
    };

    it('should deploy an agent successfully', async () => {
      const result = await sdk.deployAgent(testAgentConfig);

      expect(result).toEqual({
        agentId: 1,
        transactionHash: '0xabc123...',
        deploymentFee: expect.any(String),
        estimatedGas: expect.any(String)
      });
    });

    it('should validate agent configuration', async () => {
      const invalidConfig = {
        name: '',
        capabilities: [],
        autonomyLevel: -1,
        rewardThreshold: '-100'
      };

      await expect(sdk.deployAgent(invalidConfig as any)).rejects.toThrow();
    });

    it('should get agent details', async () => {
      const agent = await sdk.getAgent(1);

      expect(agent).toEqual({
        id: 1,
        owner: '0x1234567890123456789012345678901234567890',
        name: 'Test Agent',
        description: 'Test Description',
        capabilities: ['trading', 'analytics'],
        autonomyLevel: 800,
        rewardThreshold: '100',
        totalRewards: '0',
        deploymentTime: expect.any(String),
        status: AgentStatus.ACTIVE,
        metadataURI: '',
        performanceMetrics: expect.any(Object)
      });
    });

    it('should estimate gas for agent deployment', async () => {
      const gasEstimate = await sdk.estimateGasForAgent(testAgentConfig);

      expect(gasEstimate).toEqual({
        gasLimit: '100000',
        gasPrice: '20000000000',
        estimatedCost: expect.any(String)
      });
    });

    it('should update agent status', async () => {
      // Mock the contract call
      const mockUpdateStatus = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xdef456...'
        })
      });

      // Mock the contract instance
      (sdk as any).contracts = {
        agentRegistry: {
          updateAgentStatus: mockUpdateStatus
        }
      };
      (sdk as any).contractsInitialized = true;

      const txHash = await sdk.updateAgentStatus(1, AgentStatus.SUSPENDED);
      expect(txHash).toBe('0xdef456...');
    });
  });

  describe('Task Management', () => {
    const testTaskConfig = {
      description: 'Analyze market trends for AVAX/USDC pair',
      requiredCapabilities: [AgentCapability.ANALYTICS],
      reward: '50',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    it('should create a task successfully', async () => {
      // Mock contract call
      const mockCreateTask = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xtask123...',
          events: [{ event: 'TaskCreated', args: { taskId: { toNumber: () => 1 } } }],
          gasUsed: { toString: () => '75000' }
        })
      });

      (sdk as any).contracts = {
        taskManager: {
          createTask: mockCreateTask
        }
      };
      (sdk as any).contractsInitialized = true;

      const result = await sdk.createTask(testTaskConfig);

      expect(result).toEqual({
        taskId: 1,
        transactionHash: '0xtask123...',
        escrowAmount: '50',
        estimatedGas: '75000'
      });
    });

    it('should assign task to agent', async () => {
      const mockAssignTask = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xassign123...'
        })
      });

      (sdk as any).contracts = {
        taskManager: {
          assignTask: mockAssignTask
        }
      };
      (sdk as any).contractsInitialized = true;

      const txHash = await sdk.assignTask(1, 1);
      expect(txHash).toBe('0xassign123...');
    });

    it('should submit task result', async () => {
      const mockSubmitResult = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xresult123...'
        })
      });

      (sdk as any).contracts = {
        taskManager: {
          submitTaskResult: mockSubmitResult
        }
      };
      (sdk as any).contractsInitialized = true;

      const result = JSON.stringify({
        analysis: 'Market shows bullish trend',
        confidence: 0.85
      });

      const txHash = await sdk.submitTaskResult(1, result);
      expect(txHash).toBe('0xresult123...');
    });

    it('should get tasks with pagination', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [
            {
              id: 1,
              description: 'Test task',
              status: TaskStatus.OPEN
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
          }
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const tasks = await sdk.getTasks({ page: 1, limit: 10 });

      expect(tasks.data).toHaveLength(1);
      expect(tasks.pagination.total).toBe(1);
    });
  });

  describe('Cross-Subnet Operations', () => {
    it('should send cross-subnet message', async () => {
      const mockSendMessage = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xmessage123...',
          events: [{ 
            event: 'CrossSubnetMessageSent', 
            args: { messageId: '0xmsg123...' } 
          }]
        })
      });

      (sdk as any).contracts = {
        crossSubnetBridge: {
          sendCrossSubnetMessage: mockSendMessage
        }
      };
      (sdk as any).contractsInitialized = true;

      const messageId = await sdk.sendCrossSubnetMessage(
        'subnet-123',
        '0x1234567890123456789012345678901234567890',
        '0xdata123...'
      );

      expect(messageId).toBe('0xmsg123...');
    });

    it('should deploy agent to subnet', async () => {
      const mockDeployToSubnet = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xsubnet123...'
        })
      });

      (sdk as any).contracts = {
        crossSubnetBridge: {
          deployAgentToSubnet: mockDeployToSubnet
        }
      };
      (sdk as any).contractsInitialized = true;

      const txHash = await sdk.deployAgentToSubnet(1, 'subnet-123');
      expect(txHash).toBe('0xsubnet123...');
    });

    it('should get subnet info', async () => {
      const mockGetSubnetInfo = jest.fn().mockResolvedValue({
        name: 'Test Subnet',
        bridgeAddress: '0xbridge123...',
        active: true,
        registrationTime: 1686650400
      });

      (sdk as any).contracts = {
        crossSubnetBridge: {
          getSubnetInfo: mockGetSubnetInfo
        }
      };
      (sdk as any).contractsInitialized = true;

      const subnetInfo = await sdk.getSubnetInfo('subnet-123');

      expect(subnetInfo).toEqual({
        id: 'subnet-123',
        name: 'Test Subnet',
        bridgeAddress: '0xbridge123...',
        isActive: true,
        registrationTime: expect.any(String),
        totalAgents: 0,
        supportedCapabilities: []
      });
    });
  });

  describe('Network Statistics', () => {
    it('should get network stats', async () => {
      const mockStats = {
        totalAgents: 247,
        activeAgents: 189,
        totalTasks: 1523,
        completedTasks: 1456,
        networkUptime: 0.997,
        averageTaskReward: '25.5',
        topCapabilities: [],
        networkActivity: {
          tasksCreatedToday: 23,
          agentsDeployedToday: 5,
          totalRewardsDistributed: '12847.50'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockStats
        })
      });

      const stats = await sdk.getNetworkStats();
      expect(stats).toEqual(mockStats);
    });

    it('should fallback to default stats if API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const stats = await sdk.getNetworkStats();
      expect(stats.totalAgents).toBe(247);
      expect(stats.activeAgents).toBe(189);
    });
  });

  describe('Token Operations', () => {
    it('should get SWARM balance', async () => {
      const mockBalanceOf = jest.fn().mockResolvedValue('100000000000000000000');

      (sdk as any).contracts = {
        swarmToken: {
          balanceOf: mockBalanceOf
        }
      };
      (sdk as any).contractsInitialized = true;

      const balance = await sdk.getSwarmBalance();
      expect(balance).toBe('100');
    });

    it('should get reward history', async () => {
      const mockRewards = [
        {
          agentId: 1,
          amount: '50',
          timestamp: '2023-06-10T10:00:00Z',
          transactionHash: '0xreward123...',
          reason: 'Task completion'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockRewards
        })
      });

      const rewards = await sdk.getRewardHistory(1);
      expect(rewards).toEqual(mockRewards);
    });

    it('should return empty array if reward history fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const rewards = await sdk.getRewardHistory(1);
      expect(rewards).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw SwarmNodeError for missing signer', async () => {
      const sdkWithoutSigner = new SwarmNodeSDK({
        network: 'fuji'
      });

      await expect(sdkWithoutSigner.getCurrentAccount()).rejects.toThrow('No signer configured');
    });

    it('should handle contract errors gracefully', async () => {
      const mockContract = jest.fn().mockRejectedValue(new Error('Contract Error'));

      (sdk as any).contracts = {
        agentRegistry: {
          deployAgent: mockContract
        }
      };
      (sdk as any).contractsInitialized = true;

      await expect(sdk.deployAgent({
        name: 'Test',
        capabilities: [AgentCapability.TRADING],
        autonomyLevel: 500,
        rewardThreshold: '100'
      })).rejects.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          message: 'Internal Server Error'
        })
      });

      await expect(sdk.getTasks()).rejects.toThrow();
    });
  });

  describe('Utility Functions', () => {
    it('should check connection status', async () => {
      const isConnected = await sdk.isConnected();
      expect(isConnected).toBe(true);
    });

    it('should handle disconnected state', async () => {
      // Mock network error
      const mockProvider = {
        getNetwork: jest.fn().mockRejectedValue(new Error('Network Error'))
      };

      (sdk as any).provider = mockProvider;

      const isConnected = await sdk.isConnected();
      expect(isConnected).toBe(false);
    });
  });
});
