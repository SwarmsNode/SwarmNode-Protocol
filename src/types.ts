export interface SwarmNodeConfig {
  network: 'mainnet' | 'testnet' | 'fuji' | 'localhost';
  privateKey?: string;
  rpcUrl?: string;
  apiKey?: string;
  contractAddresses?: {
    swarmToken?: string;
    agentRegistry?: string;
    taskManager?: string;
    crossSubnetBridge?: string;
  };
}

export interface AgentConfig {
  name: string;
  description?: string;
  capabilities: AgentCapability[];
  autonomyLevel: number; // 0-1000
  rewardThreshold: string; // In SWARM tokens
  metadataURI?: string;
}

export interface Agent {
  id: number;
  owner: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  autonomyLevel: number;
  rewardThreshold: string;
  totalRewards: string;
  deploymentTime: string;
  status: AgentStatus;
  metadataURI: string;
  performanceMetrics?: PerformanceMetrics;
  network?: number[];
}

export interface TaskConfig {
  description: string;
  requiredCapabilities: AgentCapability[];
  reward: string; // In SWARM tokens
  deadline: Date;
}

export interface Task {
  id: number;
  creator: string;
  description: string;
  requiredCapabilities: AgentCapability[];
  reward: string;
  deadline: string;
  assignedAgent?: number;
  status: TaskStatus;
  result?: string;
  creationTime: string;
  completionTime?: string;
}

export interface CrossSubnetMessage {
  id: string;
  sourceSubnet: string;
  destinationSubnet: string;
  sourceAddress: string;
  destinationAddress: string;
  data: string;
  timestamp: number;
  status: 'pending' | 'delivered' | 'failed';
}

export interface AIAnalysisResult {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  riskLevel: number;
  expectedReturn?: number;
  timeframe?: string;
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number; // in milliseconds
  uptime: number; // 0-1
  totalRewards: string;
}

export interface NetworkStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  networkUptime: number;
  averageTaskReward: string;
  topCapabilities: CapabilityStats[];
  networkActivity: NetworkActivity;
}

export interface CapabilityStats {
  capability: AgentCapability;
  agentCount: number;
}

export interface NetworkActivity {
  tasksCreatedToday: number;
  agentsDeployedToday: number;
  totalRewardsDistributed: string;
}

export enum AgentCapability {
  // Core AI capabilities
  DATA_PROCESSING = "data_processing",
  PATTERN_RECOGNITION = "pattern_recognition",
  NATURAL_LANGUAGE = "natural_language",
  DECISION_MAKING = "decision_making",
  EXECUTION = "execution",
  COMMUNICATION = "communication",
  MACHINE_LEARNING = "machine_learning",
  ANALYTICS = "analytics",
  OPTIMIZATION = "optimization",
  FORECASTING = "forecasting",
  RISK_ASSESSMENT = "risk_assessment",
  CONTENT_GENERATION = "content_generation",
  
  // DeFi specific capabilities
  TRADING = "trading",
  ARBITRAGE = "arbitrage",
  YIELD_FARMING = "yield_farming",
  LIQUIDITY_PROVISION = "liquidity_provision",
  PRICE_MONITORING = "price_monitoring",
  
  // Cross-subnet specific capabilities
  CROSS_SUBNET_COMMUNICATION = "cross_subnet_communication",
  CROSS_SUBNET_ARBITRAGE = "cross_subnet_arbitrage",
  SUBNET_MONITORING = "subnet_monitoring",
  
  // Gaming and NFT capabilities
  NFT_TRADING = "nft_trading",
  GAMING_ANALYTICS = "gaming_analytics",
  MARKETPLACE_MONITORING = "marketplace_monitoring"
}

export enum AgentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TERMINATED = "terminated"
}

export enum TaskStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export interface DeploymentResult {
  agentId: number;
  transactionHash: string;
  deploymentFee: string;
  estimatedGas: string;
}

export interface TaskCreationResult {
  taskId: number;
  transactionHash: string;
  escrowAmount: string;
  estimatedGas: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'event' | 'error';
  channel?: string;
  data?: any;
  timestamp?: string;
}

export interface AgentConnection {
  fromAgent: number;
  toAgent: number;
  establishedAt: string;
  messageCount: number;
  lastActivity: string;
}

export interface RewardHistory {
  agentId: number;
  taskId: number;
  amount: string;
  timestamp: string;
  transactionHash: string;
  type: 'task_completion' | 'performance_bonus' | 'staking_reward';
}

export interface VestingSchedule {
  beneficiary: string;
  totalAmount: string;
  releasedAmount: string;
  startTime: string;
  duration: number; // in seconds
  cliffDuration: number; // in seconds
  nextRelease: string;
  releasableAmount: string;
}

// Base Agent class for examples
export abstract class BaseAgent {
  protected sdk: any; // SwarmNodeSDK will be imported later
  protected name: string;
  protected capabilities: string[];
  
  constructor(sdk: any, name: string, capabilities: string[]) {
    this.sdk = sdk;
    this.name = name;
    this.capabilities = capabilities;
  }
  
  abstract execute(task: Task): Promise<boolean>;
  
  // Optional methods that can be overridden
  async deploy(options?: any): Promise<any> {
    throw new Error('Deploy method not implemented');
  }
  
  async scheduleTask(options?: any): Promise<any> {
    throw new Error('ScheduleTask method not implemented');
  }
}

// Enhanced Task interface for examples
export interface TaskExecution extends Task {
  type?: string;
  params?: any;
  result?: any;
  error?: string;
}
