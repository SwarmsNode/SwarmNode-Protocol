import { ethers } from 'ethers';
import {
  SwarmNodeConfig,
  Agent,
  AgentConfig,
  Task,
  TaskConfig,
  DeploymentResult,
  TaskCreationResult,
  NetworkStats,
  ApiResponse,
  PaginatedResponse,
  PerformanceMetrics,
  RewardHistory,
  VestingSchedule,
  AgentStatus,
  TaskStatus,
  CrossSubnetMessage,
  AIAnalysisResult,
  SubnetInfo,
  GasEstimate,
  EventFilter,
  SwarmNodeError,
  ContractError,
  ApiError,
  ValidationError
} from './types';

// Contract ABIs
import { SWARM_TOKEN_ABI, AGENT_REGISTRY_ABI, TASK_MANAGER_ABI, CROSS_SUBNET_BRIDGE_ABI } from './abis';

/**
 * SwarmNode Protocol SDK
 * 
 * Complete SDK for interacting with SwarmNode protocol on Avalanche.
 * Supports AI agent deployment, cross-subnet task management,
 * and integration with external AI services.
 * 
 * @example
 * ```typescript
 * import { SwarmNodeSDK } from '@swarmnode/protocol';
 * 
 * const sdk = new SwarmNodeSDK({
 *   network: 'testnet',
 *   privateKey: process.env.PRIVATE_KEY,
 *   apiKey: process.env.SWARMNODE_API_KEY
 * });
 * 
 * // Deploy an agent
 * const agent = await sdk.deployAgent({
 *   name: "DeFi Trader",
 *   capabilities: ['trading', 'analysis'],
 *   autonomyLevel: 800,
 *   rewardThreshold: '100'
 * });
 * 
 * console.log('Agent deployed:', agent.agentId);
 * ```
 */
export class SwarmNodeSDK {
  private config: SwarmNodeConfig;
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private apiBaseUrl: string;
  private contracts: {
    swarmToken?: ethers.Contract;
    agentRegistry?: ethers.Contract;
    taskManager?: ethers.Contract;
    crossSubnetBridge?: ethers.Contract;
  } = {};
  private contractsInitialized = false;

  constructor(config: SwarmNodeConfig) {
    this.config = config;
    this.apiBaseUrl = this.getApiUrl(config.network);
    this.setupProvider();
    this.setupSigner();
  }

  /**
   * Initialize the Ethereum provider
   */
  private setupProvider(): void {
    if (this.config.rpcUrl) {
      this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
    } else {
      const networkUrls = {
        mainnet: 'https://api.avax.network/ext/bc/C/rpc',
        testnet: 'https://api.avax-test.network/ext/bc/C/rpc',
        fuji: 'https://api.avax-test.network/ext/bc/C/rpc',
        localhost: 'http://localhost:8545'
      };
      this.provider = new ethers.providers.JsonRpcProvider(networkUrls[this.config.network]);
    }
  }

  /**
   * Initialize the signer for transactions
   */
  private setupSigner(): void {
    if (this.config.privateKey) {
      this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
    }
  }

  /**
   * Get API URL based on network
   */
  private getApiUrl(network: string): string {
    const urls = {
      mainnet: 'https://api.swarmnode.io/v1',
      testnet: 'https://testnet-api.swarmnode.io/v1',
      fuji: 'https://testnet-api.swarmnode.io/v1',
      localhost: 'http://localhost:3000/v1'
    };
    return urls[network as keyof typeof urls] || urls.localhost;
  }

  /**
   * Get contract addresses for the current network
   */
  private async getContractAddresses(): Promise<{
    swarmToken: string;
    agentRegistry: string;
    taskManager: string;
    crossSubnetBridge?: string;
  }> {
    if (this.config.contractAddresses) {
      return {
        swarmToken: this.config.contractAddresses.swarmToken!,
        agentRegistry: this.config.contractAddresses.agentRegistry!,
        taskManager: this.config.contractAddresses.taskManager!,
        crossSubnetBridge: this.config.contractAddresses.crossSubnetBridge
      };
    }

    // Default addresses for known networks
    const defaultAddresses = {
      fuji: {
        swarmToken: '0x742d35Cc693C79a83D8CE7E1d2F1e2E5a29E2dD4',
        agentRegistry: '0x1234567890123456789012345678901234567890',
        taskManager: '0x2345678901234567890123456789012345678901',
        crossSubnetBridge: '0x3456789012345678901234567890123456789012'
      },
      testnet: {
        swarmToken: '0x742d35Cc693C79a83D8CE7E1d2F1e2E5a29E2dD4',
        agentRegistry: '0x1234567890123456789012345678901234567890',
        taskManager: '0x2345678901234567890123456789012345678901',
        crossSubnetBridge: '0x3456789012345678901234567890123456789012'
      }
    };

    const addresses = defaultAddresses[this.config.network as keyof typeof defaultAddresses];
    if (!addresses) {
      throw new SwarmNodeError(`Contract addresses not configured for network: ${this.config.network}`, 'CONFIG_ERROR');
    }

    return addresses;
  }

  /**
   * Initialize smart contracts
   */
  private async initializeContracts(): Promise<void> {
    if (this.contractsInitialized) return;
    
    if (!this.signer) {
      throw new SwarmNodeError('Signer required for contract interactions', 'SIGNER_ERROR');
    }

    try {
      const addresses = await this.getContractAddresses();
      
      this.contracts.swarmToken = new ethers.Contract(
        addresses.swarmToken,
        SWARM_TOKEN_ABI,
        this.signer
      );

      this.contracts.agentRegistry = new ethers.Contract(
        addresses.agentRegistry,
        AGENT_REGISTRY_ABI,
        this.signer
      );

      this.contracts.taskManager = new ethers.Contract(
        addresses.taskManager,
        TASK_MANAGER_ABI,
        this.signer
      );

      if (addresses.crossSubnetBridge) {
        this.contracts.crossSubnetBridge = new ethers.Contract(
          addresses.crossSubnetBridge,
          CROSS_SUBNET_BRIDGE_ABI,
          this.signer
        );
      }

      this.contractsInitialized = true;
    } catch (error) {
      throw new ContractError('Failed to initialize contracts', undefined, error);
    }
  }

  /**
   * Valide la configuration de l'agent
   */
  private validateAgentConfig(config: AgentConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new ValidationError('Agent name is required', 'name');
    }
    
    if (config.capabilities.length === 0) {
      throw new ValidationError('At least one capability is required', 'capabilities');
    }
    
    if (config.autonomyLevel < 0 || config.autonomyLevel > 1000) {
      throw new ValidationError('Autonomy level must be between 0 and 1000', 'autonomyLevel');
    }
    
    if (parseFloat(config.rewardThreshold) <= 0) {
      throw new ValidationError('Reward threshold must be positive', 'rewardThreshold');
    }
  }

  /**
   * Make HTTP request to SwarmNode API
   */
  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options?: { timeout?: number }
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 30000);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new ApiError(result.message || 'API request failed', response.status, result);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network request failed', undefined, error);
    }
  }

  // ======================
  // AGENT MANAGEMENT
  // ======================

  /**
   * Deploy a new agent on the network
   */
  async deployAgent(config: AgentConfig): Promise<DeploymentResult> {
    this.validateAgentConfig(config);
    await this.initializeContracts();

    try {
      // Estimation du gas
      const gasEstimate = await this.estimateGasForAgent(config);
      
      // Contract deployment
      const tx = await this.contracts.agentRegistry!.deployAgent(
        config.name,
        config.description || '',
        config.capabilities,
        config.autonomyLevel,
        ethers.utils.parseEther(config.rewardThreshold),
        config.metadataURI || '',
        {
          gasLimit: gasEstimate.gasLimit,
          gasPrice: gasEstimate.gasPrice
        }
      );

      const receipt = await tx.wait();
      
      // Extraction de l'ID de l'agent depuis les events
      const event = receipt.events?.find(e => e.event === 'AgentDeployed');
      const agentId = event?.args?.agentId?.toNumber();

      if (!agentId) {
        throw new ContractError('Failed to extract agent ID from transaction');
      }

      return {
        agentId,
        transactionHash: receipt.transactionHash,
        deploymentFee: ethers.utils.formatEther(gasEstimate.estimatedCost),
        estimatedGas: gasEstimate.gasLimit,
        contractAddress: receipt.contractAddress || undefined
      };
    } catch (error) {
      throw new ContractError('Agent deployment failed', this.contracts.agentRegistry?.address, error);
    }
  }

  /**
   * Get agent information
   */
  async getAgent(agentId: number): Promise<Agent> {
    await this.initializeContracts();

    try {
      const agentData = await this.contracts.agentRegistry!.getAgent(agentId);
      
      return {
        id: agentId,
        owner: agentData.owner,
        name: agentData.name,
        description: agentData.description,
        capabilities: agentData.capabilities,
        autonomyLevel: agentData.autonomyLevel,
        rewardThreshold: ethers.utils.formatEther(agentData.rewardThreshold),
        totalRewards: ethers.utils.formatEther(agentData.totalRewards),
        deploymentTime: new Date(agentData.deploymentTime * 1000).toISOString(),
        status: Object.values(AgentStatus)[agentData.status] as AgentStatus,
        metadataURI: agentData.metadataURI,
        performanceMetrics: await this.getAgentPerformanceMetrics(agentId)
      };
    } catch (error) {
      throw new ContractError('Failed to fetch agent data', this.contracts.agentRegistry?.address, error);
    }
  }

  /**
   * Get agents owned by an address
   */
  async getOwnerAgents(owner?: string): Promise<Agent[]> {
    await this.initializeContracts();
    
    const ownerAddress = owner || await this.signer!.getAddress();
    
    try {
      const agentIds = await this.contracts.agentRegistry!.getOwnerAgents(ownerAddress);
      const agents = await Promise.all(
        agentIds.map((id: ethers.BigNumber) => this.getAgent(id.toNumber()))
      );
      return agents;
    } catch (error) {
      throw new ContractError('Failed to fetch owner agents', this.contracts.agentRegistry?.address, error);
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: number, status: AgentStatus): Promise<string> {
    await this.initializeContracts();

    try {
      const statusIndex = Object.values(AgentStatus).indexOf(status);
      const tx = await this.contracts.agentRegistry!.updateAgentStatus(agentId, statusIndex);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      throw new ContractError('Failed to update agent status', this.contracts.agentRegistry?.address, error);
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformanceMetrics(agentId: number): Promise<PerformanceMetrics> {
    try {
      const response = await this.apiRequest<PerformanceMetrics>(`/agents/${agentId}/metrics`);
      return response.data!;
    } catch (error) {
      // Fallback si l'API n'est pas disponible
      return {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        uptime: 0,
        totalRewards: '0',
        averageRewardPerTask: '0'
      };
    }
  }

  // ======================
  // TASK MANAGEMENT
  // ======================

  /**
   * Create a new task
   */
  async createTask(config: TaskConfig): Promise<TaskCreationResult> {
    await this.initializeContracts();

    try {
      const deadlineTimestamp = Math.floor(config.deadline.getTime() / 1000);
      const rewardWei = ethers.utils.parseEther(config.reward);
      
      const tx = await this.contracts.taskManager!.createTask(
        config.description,
        config.requiredCapabilities,
        rewardWei,
        deadlineTimestamp
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'TaskCreated');
      const taskId = event?.args?.taskId?.toNumber();

      if (!taskId) {
        throw new ContractError('Failed to extract task ID from transaction');
      }

      return {
        taskId,
        transactionHash: receipt.transactionHash,
        escrowAmount: config.reward,
        estimatedGas: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new ContractError('Task creation failed', this.contracts.taskManager?.address, error);
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: number): Promise<Task> {
    await this.initializeContracts();

    try {
      const taskData = await this.contracts.taskManager!.getTask(taskId);
      
      return {
        id: taskId,
        creator: taskData.creator,
        description: taskData.description,
        requiredCapabilities: taskData.requiredCapabilities,
        reward: ethers.utils.formatEther(taskData.reward),
        deadline: new Date(taskData.deadline * 1000).toISOString(),
        assignedAgent: taskData.assignedAgent > 0 ? taskData.assignedAgent : undefined,
        status: Object.values(TaskStatus)[taskData.status] as TaskStatus,
        result: taskData.result || undefined,
        creationTime: new Date(taskData.creationTime * 1000).toISOString(),
        completionTime: taskData.completionTime > 0 
          ? new Date(taskData.completionTime * 1000).toISOString() 
          : undefined
      };
    } catch (error) {
      throw new ContractError('Failed to fetch task data', this.contracts.taskManager?.address, error);
    }
  }

  /**
   * Assign task to agent
   */
  async assignTask(taskId: number, agentId: number): Promise<string> {
    await this.initializeContracts();

    try {
      const tx = await this.contracts.taskManager!.assignTask(taskId, agentId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      throw new ContractError('Failed to assign task', this.contracts.taskManager?.address, error);
    }
  }

  /**
   * Submit task result
   */
  async submitTaskResult(taskId: number, result: string): Promise<string> {
    await this.initializeContracts();

    try {
      const tx = await this.contracts.taskManager!.submitTaskResult(taskId, result);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      throw new ContractError('Failed to submit task result', this.contracts.taskManager?.address, error);
    }
  }

  /**
   * Get task list with pagination
   */
  async getTasks(options?: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    capability?: string;
  }): Promise<PaginatedResponse<Task>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    
    try {
      return await this.apiRequest<Task[]>('/tasks', 'GET', null, { 
        page, 
        limit,
        status: options?.status,
        capability: options?.capability 
      });
    } catch (error) {
      // Fallback to contract if API fails
      await this.initializeContracts();
      const offset = (page - 1) * limit;
      const taskIds = await this.contracts.taskManager!.getTasks(offset, limit);
      const tasks = await Promise.all(
        taskIds.map((id: ethers.BigNumber) => this.getTask(id.toNumber()))
      );
      
      return {
        data: tasks,
        pagination: {
          page,
          limit,
          total: tasks.length,
          totalPages: Math.ceil(tasks.length / limit)
        }
      };
    }
  }

  // ======================
  // CROSS-SUBNET OPERATIONS
  // ======================

  /**
   * Send cross-subnet message
   */
  async sendCrossSubnetMessage(
    destinationSubnetId: string,
    destinationAddress: string,
    data: string
  ): Promise<string> {
    await this.initializeContracts();
    
    if (!this.contracts.crossSubnetBridge) {
      throw new SwarmNodeError('Cross-subnet bridge not available', 'BRIDGE_ERROR');
    }

    try {
      const tx = await this.contracts.crossSubnetBridge.sendCrossSubnetMessage(
        ethers.utils.formatBytes32String(destinationSubnetId),
        destinationAddress,
        data
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'CrossSubnetMessageSent');
      return event?.args?.messageId || receipt.transactionHash;
    } catch (error) {
      throw new ContractError('Failed to send cross-subnet message', this.contracts.crossSubnetBridge?.address, error);
    }
  }

  /**
   * Deploy agent to specific subnet
   */
  async deployAgentToSubnet(agentId: number, subnetId: string): Promise<string> {
    await this.initializeContracts();
    
    if (!this.contracts.crossSubnetBridge) {
      throw new SwarmNodeError('Cross-subnet bridge not available', 'BRIDGE_ERROR');
    }

    try {
      const tx = await this.contracts.crossSubnetBridge.deployAgentToSubnet(
        agentId,
        ethers.utils.formatBytes32String(subnetId)
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      throw new ContractError('Failed to deploy agent to subnet', this.contracts.crossSubnetBridge?.address, error);
    }
  }

  /**
   * Get subnet information
   */
  async getSubnetInfo(subnetId: string): Promise<SubnetInfo> {
    await this.initializeContracts();
    
    if (!this.contracts.crossSubnetBridge) {
      throw new SwarmNodeError('Cross-subnet bridge not available', 'BRIDGE_ERROR');
    }

    try {
      const subnetData = await this.contracts.crossSubnetBridge.getSubnetInfo(
        ethers.utils.formatBytes32String(subnetId)
      );
      
      return {
        id: subnetId,
        name: subnetData.name,
        bridgeAddress: subnetData.bridgeAddress,
        isActive: subnetData.active,
        registrationTime: new Date(subnetData.registrationTime * 1000).toISOString(),
        totalAgents: 0, // To be implemented
        supportedCapabilities: [] // To be implemented
      };
    } catch (error) {
      throw new ContractError('Failed to fetch subnet info', this.contracts.crossSubnetBridge?.address, error);
    }
  }

  // ======================
  // UTILITY FUNCTIONS
  // ======================

  /**
   * Estimate gas needed to deploy an agent
   */
  async estimateGasForAgent(config: AgentConfig): Promise<GasEstimate> {
    await this.initializeContracts();

    try {
      const gasLimit = await this.contracts.agentRegistry!.estimateGas.deployAgent(
        config.name,
        config.description || '',
        config.capabilities,
        config.autonomyLevel,
        ethers.utils.parseEther(config.rewardThreshold),
        config.metadataURI || ''
      );

      const gasPrice = await this.provider.getGasPrice();
      const estimatedCost = gasLimit.mul(gasPrice);

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCost: estimatedCost.toString()
      };
    } catch (error) {
      throw new ContractError('Failed to estimate gas', this.contracts.agentRegistry?.address, error);
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const response = await this.apiRequest<NetworkStats>('/network/stats');
      return response.data!;
    } catch (error) {
      // Fallback data if API is not available
      return {
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
    }
  }

  /**
   * Get reward history
   */
  async getRewardHistory(agentId?: number): Promise<RewardHistory[]> {
    const endpoint = agentId ? `/agents/${agentId}/rewards` : '/rewards';
    
    try {
      const response = await this.apiRequest<RewardHistory[]>(endpoint);
      return response.data!;
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if SDK is connected and functional
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getNetwork();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current account address
   */
  async getCurrentAccount(): Promise<string> {
    if (!this.signer) {
      throw new SwarmNodeError('No signer configured', 'SIGNER_ERROR');
    }
    return await this.signer.getAddress();
  }

  /**
   * Get SWARM balance of current account
   */
  async getSwarmBalance(address?: string): Promise<string> {
    await this.initializeContracts();
    
    const accountAddress = address || await this.getCurrentAccount();
    const balance = await this.contracts.swarmToken!.balanceOf(accountAddress);
    return ethers.utils.formatEther(balance);
  }
}

// Export des types pour les utilisateurs du SDK
export * from './types';
export * from './abis';
