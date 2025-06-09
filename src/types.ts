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
  CONTENT_GENERATION = "content_generation"
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

export interface SwarmNodeConfig {
  apiKey?: string;
  network: 'mainnet' | 'testnet' | 'localhost';
  rpcUrl?: string;
  privateKey?: string;
  contractAddresses?: {
    swarmToken: string;
    agentRegistry: string;
    taskManager: string;
  };
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
