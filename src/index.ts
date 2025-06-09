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
  TaskStatus
} from './types';

export class SwarmNodeSDK {
  private config: SwarmNodeConfig;
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private apiBaseUrl: string;

  constructor(config: SwarmNodeConfig) {
    this.config = config;
    this.apiBaseUrl = config.network === 'mainnet' 
      ? 'https://api.swarmnode.ai/v1'
      : config.network === 'testnet'
      ? 'https://testnet-api.swarmnode.ai/v1'
      : 'http://localhost:3000/v1';

    // Initialize provider
    if (config.rpcUrl) {
      this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    } else {
      const networkUrls = {
        mainnet: 'https://api.avax.network/ext/bc/C/rpc',
        testnet: 'https://api.avax-test.network/ext/bc/C/rpc',
        localhost: 'http://localhost:8545'
      };
      this.provider = new ethers.providers.JsonRpcProvider(networkUrls[config.network]);
    }

    // Initialize signer if private key provided
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  // Agent Management
  public get agents() {
    return {
      list: async (options?: {
        page?: number;
        limit?: number;
        status?: AgentStatus;
        capability?: string;
      }): Promise<PaginatedResponse<Agent>> => {
        return this.apiRequest('/agents', 'GET', null, options);
      },

      get: async (agentId: number): Promise<Agent> => {
        const response = await this.apiRequest(`/agents/${agentId}`, 'GET');
        return response.data;
      },

      deploy: async (config: AgentConfig): Promise<DeploymentResult> => {
        if (!this.signer) {
          throw new Error('Signer required for agent deployment');
        }
        
        // First, call API to prepare deployment
        const response = await this.apiRequest('/agents', 'POST', config);
        return response.data;
      },

      connect: async (fromAgentId: number, toAgentId: number): Promise<void> => {
        await this.apiRequest(`/agents/${fromAgentId}/connect`, 'POST', {
          targetAgentId: toAgentId
        });
      },

      disconnect: async (fromAgentId: number, toAgentId: number): Promise<void> => {
        await this.apiRequest(`/agents/${fromAgentId}/connect/${toAgentId}`, 'DELETE');
      },

      updateStatus: async (agentId: number, status: AgentStatus): Promise<void> => {
        await this.apiRequest(`/agents/${agentId}/status`, 'PUT', { status });
      },

      getPerformance: async (agentId: number): Promise<PerformanceMetrics> => {
        const response = await this.apiRequest(`/stats/agent/${agentId}`, 'GET');
        return response.data;
      },

      getNetwork: async (agentId: number): Promise<number[]> => {
        const response = await this.apiRequest(`/agents/${agentId}/network`, 'GET');
        return response.data;
      }
    };
  }

  // Task Management
  public get tasks() {
    return {
      list: async (options?: {
        page?: number;
        limit?: number;
        status?: TaskStatus;
        creator?: string;
        assignedAgent?: number;
      }): Promise<PaginatedResponse<Task>> => {
        return this.apiRequest('/tasks', 'GET', null, options);
      },

      get: async (taskId: number): Promise<Task> => {
        const response = await this.apiRequest(`/tasks/${taskId}`, 'GET');
        return response.data;
      },

      create: async (config: TaskConfig): Promise<TaskCreationResult> => {
        if (!this.signer) {
          throw new Error('Signer required for task creation');
        }

        const taskData = {
          ...config,
          deadline: config.deadline.toISOString()
        };

        const response = await this.apiRequest('/tasks', 'POST', taskData);
        return response.data;
      },

      assign: async (taskId: number, agentId: number): Promise<void> => {
        await this.apiRequest(`/tasks/${taskId}/assign`, 'POST', { agentId });
      },

      start: async (taskId: number): Promise<void> => {
        await this.apiRequest(`/tasks/${taskId}/start`, 'POST');
      },

      complete: async (taskId: number, result: string, metadata?: any): Promise<void> => {
        await this.apiRequest(`/tasks/${taskId}/complete`, 'POST', {
          result,
          metadata
        });
      },

      fail: async (taskId: number, reason?: string): Promise<void> => {
        await this.apiRequest(`/tasks/${taskId}/fail`, 'POST', { reason });
      },

      cancel: async (taskId: number): Promise<void> => {
        await this.apiRequest(`/tasks/${taskId}/cancel`, 'DELETE');
      }
    };
  }

  // Network Statistics
  public get stats() {
    return {
      network: async (): Promise<NetworkStats> => {
        const response = await this.apiRequest('/stats', 'GET');
        return response.data;
      },

      agent: async (agentId: number): Promise<PerformanceMetrics> => {
        const response = await this.apiRequest(`/stats/agent/${agentId}`, 'GET');
        return response.data;
      }
    };
  }

  // Rewards Management
  public get rewards() {
    return {
      getHistory: async (address: string): Promise<{
        totalRewards: string;
        pendingRewards: string;
        claimableRewards: string;
        rewardHistory: RewardHistory[];
      }> => {
        const response = await this.apiRequest(`/rewards/${address}`, 'GET');
        return response.data;
      },

      claim: async (agentIds: number[]): Promise<void> => {
        await this.apiRequest('/rewards/claim', 'POST', { agentIds });
      }
    };
  }

  // Token Operations
  public get token() {
    return {
      getBalance: async (address: string): Promise<string> => {
        if (!this.config.contractAddresses?.swarmToken) {
          throw new Error('SwarmToken contract address not configured');
        }

        const tokenContract = new ethers.Contract(
          this.config.contractAddresses.swarmToken,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        );

        const balance = await tokenContract.balanceOf(address);
        return ethers.utils.formatEther(balance);
      },

      transfer: async (to: string, amount: string): Promise<string> => {
        if (!this.signer) {
          throw new Error('Signer required for token transfer');
        }

        if (!this.config.contractAddresses?.swarmToken) {
          throw new Error('SwarmToken contract address not configured');
        }

        const tokenContract = new ethers.Contract(
          this.config.contractAddresses.swarmToken,
          ['function transfer(address,uint256) returns (bool)'],
          this.signer
        );

        const tx = await tokenContract.transfer(to, ethers.utils.parseEther(amount));
        await tx.wait();
        return tx.hash;
      },

      approve: async (spender: string, amount: string): Promise<string> => {
        if (!this.signer) {
          throw new Error('Signer required for token approval');
        }

        if (!this.config.contractAddresses?.swarmToken) {
          throw new Error('SwarmToken contract address not configured');
        }

        const tokenContract = new ethers.Contract(
          this.config.contractAddresses.swarmToken,
          ['function approve(address,uint256) returns (bool)'],
          this.signer
        );

        const tx = await tokenContract.approve(spender, ethers.utils.parseEther(amount));
        await tx.wait();
        return tx.hash;
      },

      getVestingSchedule: async (beneficiary: string): Promise<VestingSchedule> => {
        const response = await this.apiRequest(`/token/vesting/${beneficiary}`, 'GET');
        return response.data;
      },

      releaseVestedTokens: async (): Promise<string> => {
        if (!this.signer) {
          throw new Error('Signer required for vesting release');
        }

        const response = await this.apiRequest('/token/vesting/release', 'POST');
        return response.data.transactionHash;
      }
    };
  }

  // WebSocket Connection
  public connectWebSocket(): WebSocket {
    const wsUrl = this.apiBaseUrl.replace('http', 'ws') + '/ws';
    return new WebSocket(wsUrl);
  }

  // Utility Methods
  private async apiRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    params?: any
  ): Promise<any> {
    const url = new URL(this.apiBaseUrl + endpoint);
    
    if (params && method === 'GET') {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    } else if (this.signer) {
      // Wallet signature authentication
      const message = `SwarmNode API Access\nTimestamp: ${Date.now()}`;
      const signature = await this.signer.signMessage(message);
      headers['X-Wallet-Address'] = await this.signer.getAddress();
      headers['X-Signature'] = signature;
      headers['X-Timestamp'] = Date.now().toString();
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Contract Interaction Helpers
  public async getContractAddress(contractName: 'swarmToken' | 'agentRegistry' | 'taskManager'): Promise<string> {
    if (this.config.contractAddresses?.[contractName]) {
      return this.config.contractAddresses[contractName];
    }

    // Fetch from deployment registry
    const response = await this.apiRequest('/contracts/addresses', 'GET');
    return response.data[contractName];
  }

  public async estimateGas(contractName: string, method: string, params: any[]): Promise<string> {
    const response = await this.apiRequest('/contracts/estimate-gas', 'POST', {
      contractName,
      method,
      params
    });
    return response.data.gasEstimate;
  }
}

// Export convenience function
export function createSwarmNodeSDK(config: SwarmNodeConfig): SwarmNodeSDK {
  return new SwarmNodeSDK(config);
}

// Export all types
export * from './types';
