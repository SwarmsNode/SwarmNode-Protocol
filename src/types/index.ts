// Types and interfaces for SwarmNode Protocol SDK
// Complete and consistent version

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
  subnetIds?: string[];
}

export interface TaskConfig {
  description: string;
  requiredCapabilities: AgentCapability[];
  reward: string; // In SWARM tokens
  deadline: Date;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
  gasUsed?: string;
  fee?: string;
}

export interface AIAnalysisResult {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  riskLevel: number;
  expectedReturn?: number;
  timeframe?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number; // in milliseconds
  uptime: number; // 0-1
  totalRewards: string;
  averageRewardPerTask: string;
  crossSubnetOperations?: number;
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
  crossSubnetActivity?: CrossSubnetStats;
}

export interface CrossSubnetStats {
  totalMessages: number;
  successfulMessages: number;
  averageDeliveryTime: number;
  activeSubnets: number;
  bridgedValue: string;
}

export interface CapabilityStats {
  capability: AgentCapability;
  agentCount: number;
  averagePerformance: number;
  totalTasksCompleted: number;
}

export interface NetworkActivity {
  tasksCreatedToday: number;
  agentsDeployedToday: number;
  totalRewardsDistributed: string;
  crossSubnetMessagesToday?: number;
}

export interface SubnetInfo {
  id: string;
  name: string;
  bridgeAddress: string;
  isActive: boolean;
  registrationTime: string;
  totalAgents: number;
  supportedCapabilities: AgentCapability[];
}

export interface DeploymentResult {
  agentId: number;
  transactionHash: string;
  deploymentFee: string;
  estimatedGas: string;
  contractAddress?: string;
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
  timestamp: number;
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
  timestamp?: number;
}

export interface RewardHistory {
  agentId: number;
  amount: string;
  taskId?: number;
  timestamp: string;
  transactionHash: string;
  reason: string;
}

export interface VestingSchedule {
  beneficiary: string;
  totalAmount: string;
  releasedAmount: string;
  startTime: string;
  duration: string;
  cliffDuration: string;
  isRevocable: boolean;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCost: string;
}

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  agentId?: number;
  taskId?: number;
  address?: string;
  topics?: string[];
}

// Enums
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
  
  // DeFi specific
  TRADING = "trading",
  ARBITRAGE = "arbitrage",
  YIELD_FARMING = "yield_farming",
  LIQUIDITY_PROVISION = "liquidity_provision",
  PRICE_MONITORING = "price_monitoring",
  
  // Cross-subnet specific
  CROSS_SUBNET_COMMUNICATION = "cross_subnet_communication",
  CROSS_SUBNET_ARBITRAGE = "cross_subnet_arbitrage",
  SUBNET_MONITORING = "subnet_monitoring",
  
  // Gaming and NFT
  NFT_TRADING = "nft_trading",
  GAMING_ANALYTICS = "gaming_analytics",
  MARKETPLACE_MONITORING = "marketplace_monitoring"
}

export enum AgentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
  MIGRATING = "migrating" // For cross-subnet operations
}

export enum TaskStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired"
}

export enum MessageStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
  TIMEOUT = "timeout"
}

export enum NetworkType {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  FUJI = "fuji",
  LOCALHOST = "localhost"
}

// Error types
export class SwarmNodeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SwarmNodeError';
  }
}

export class ContractError extends SwarmNodeError {
  constructor(message: string, public contractAddress?: string, details?: any) {
    super(message, 'CONTRACT_ERROR', details);
    this.name = 'ContractError';
  }
}

export class ApiError extends SwarmNodeError {
  constructor(message: string, public statusCode?: number, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiError';
  }
}

export class ValidationError extends SwarmNodeError {
  constructor(message: string, public field?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
