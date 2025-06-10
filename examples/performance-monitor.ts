import { SwarmNodeSDK } from '../src/sdk';
import { ethers } from 'ethers';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

/**
 * Advanced Real-Time Performance Monitor
 * Collects and analyzes real-time metrics from SwarmNode Protocol
 */
export class SwarmNodeMonitor extends EventEmitter {
  private sdk: SwarmNodeSDK;
  private ws: WebSocket | null = null;
  private metrics: Map<string, any> = new Map();
  private isRunning: boolean = false;
  private intervals: NodeJS.Timeout[] = [];

  constructor(sdk: SwarmNodeSDK) {
    super();
    this.sdk = sdk;
  }

  /**
   * Start comprehensive monitoring
   */
  async start(): Promise<void> {
    console.log('🔍 Starting SwarmNode Performance Monitor...');
    this.isRunning = true;

    // Initialize WebSocket connection for real-time data
    await this.initializeWebSocket();

    // Start various monitoring tasks
    this.startNetworkMonitoring();
    this.startAgentMonitoring();
    this.startTaskMonitoring();
    this.startCrossSubnetMonitoring();
    this.startPerformanceMetrics();

    console.log('✅ SwarmNode Monitor started successfully');
  }

  /**
   * Stop all monitoring activities
   */
  stop(): void {
    console.log('🛑 Stopping SwarmNode Monitor...');
    this.isRunning = false;

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('✅ SwarmNode Monitor stopped');
  }

  /**
   * Initialize WebSocket for real-time updates
   */
  private async initializeWebSocket(): Promise<void> {
    try {
      this.ws = new WebSocket('wss://api.swarmnode.io/ws');

      this.ws.on('open', () => {
        console.log('🔗 WebSocket connected to SwarmNode API');
        this.ws?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['agents', 'tasks', 'network', 'performance']
        }));
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (this.isRunning) {
          // Attempt to reconnect after 5 seconds
          setTimeout(() => this.initializeWebSocket(), 5000);
        }
      });

    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'agent_update':
        this.updateAgentMetrics(message.data);
        break;
      case 'task_update':
        this.updateTaskMetrics(message.data);
        break;
      case 'network_stats':
        this.updateNetworkMetrics(message.data);
        break;
      case 'performance':
        this.updatePerformanceMetrics(message.data);
        break;
    }
  }

  /**
   * Start network-level monitoring
   */
  private startNetworkMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const networkStats = await this.collectNetworkStats();
        this.metrics.set('network', networkStats);
        this.emit('networkUpdate', networkStats);

        console.log(`📊 Network Stats: ${networkStats.totalAgents} agents, ${networkStats.totalTasks} tasks`);
      } catch (error) {
        console.error('Network monitoring error:', error);
      }
    }, 30000); // Every 30 seconds

    this.intervals.push(interval);
  }

  /**
   * Start agent performance monitoring
   */
  private startAgentMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const agentStats = await this.collectAgentStats();
        this.metrics.set('agents', agentStats);
        this.emit('agentUpdate', agentStats);

        console.log(`🤖 Agent Stats: ${agentStats.active}/${agentStats.total} active, avg reputation: ${agentStats.avgReputation}`);
      } catch (error) {
        console.error('Agent monitoring error:', error);
      }
    }, 60000); // Every minute

    this.intervals.push(interval);
  }

  /**
   * Start task execution monitoring
   */
  private startTaskMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const taskStats = await this.collectTaskStats();
        this.metrics.set('tasks', taskStats);
        this.emit('taskUpdate', taskStats);

        console.log(`📋 Task Stats: ${taskStats.completed}/${taskStats.total} completed, success rate: ${taskStats.successRate}%`);
      } catch (error) {
        console.error('Task monitoring error:', error);
      }
    }, 45000); // Every 45 seconds

    this.intervals.push(interval);
  }

  /**
   * Start cross-subnet communication monitoring
   */
  private startCrossSubnetMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const crossSubnetStats = await this.collectCrossSubnetStats();
        this.metrics.set('crossSubnet', crossSubnetStats);
        this.emit('crossSubnetUpdate', crossSubnetStats);

        console.log(`🌐 Cross-Subnet: ${crossSubnetStats.messagesSent} messages, avg latency: ${crossSubnetStats.avgLatency}ms`);
      } catch (error) {
        console.error('Cross-subnet monitoring error:', error);
      }
    }, 120000); // Every 2 minutes

    this.intervals.push(interval);
  }

  /**
   * Start performance metrics collection
   */
  private startPerformanceMetrics(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const perfMetrics = await this.collectPerformanceMetrics();
        this.metrics.set('performance', perfMetrics);
        this.emit('performanceUpdate', perfMetrics);

        console.log(`⚡ Performance: ${perfMetrics.tps} TPS, ${perfMetrics.gasPrice} gwei avg gas`);
      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    }, 15000); // Every 15 seconds

    this.intervals.push(interval);
  }

  /**
   * Collect comprehensive network statistics
   */
  private async collectNetworkStats(): Promise<any> {
    const stats = await this.sdk.getNetworkStats();
    
    return {
      timestamp: Date.now(),
      totalAgents: stats.totalAgents || 0,
      activeAgents: stats.activeAgents || 0,
      totalTasks: stats.totalTasks || 0,
      completedTasks: stats.completedTasks || 0,
      totalRewards: stats.totalRewards || '0',
      totalStaked: stats.totalStaked || '0',
      networkHealth: this.calculateNetworkHealth(stats),
      blockNumber: await this.getLatestBlockNumber(),
      gasPrice: await this.getCurrentGasPrice(),
      tokenPrice: await this.getSwarmTokenPrice()
    };
  }

  /**
   * Collect agent performance statistics
   */
  private async collectAgentStats(): Promise<any> {
    const agents = await this.sdk.agents.list({ limit: 100 });
    
    const active = agents.data.filter(a => a.status === 'active').length;
    const totalReputation = agents.data.reduce((sum, a) => sum + a.reputationScore, 0);
    const avgReputation = agents.data.length > 0 ? totalReputation / agents.data.length : 0;

    // Calculate performance distribution
    const performanceRanges = {
      excellent: agents.data.filter(a => a.reputationScore >= 900).length,
      good: agents.data.filter(a => a.reputationScore >= 700 && a.reputationScore < 900).length,
      average: agents.data.filter(a => a.reputationScore >= 500 && a.reputationScore < 700).length,
      poor: agents.data.filter(a => a.reputationScore < 500).length
    };

    return {
      timestamp: Date.now(),
      total: agents.data.length,
      active,
      inactive: agents.data.length - active,
      avgReputation: Math.round(avgReputation),
      performanceDistribution: performanceRanges,
      topPerformers: agents.data
        .sort((a, b) => b.reputationScore - a.reputationScore)
        .slice(0, 10)
        .map(a => ({ id: a.id, name: a.name, reputation: a.reputationScore }))
    };
  }

  /**
   * Collect task execution statistics
   */
  private async collectTaskStats(): Promise<any> {
    const tasks = await this.sdk.tasks.list({ limit: 200 });
    
    const completed = tasks.data.filter(t => t.status === 'completed').length;
    const failed = tasks.data.filter(t => t.status === 'failed').length;
    const inProgress = tasks.data.filter(t => t.status === 'in_progress').length;
    const pending = tasks.data.filter(t => t.status === 'pending').length;

    const successRate = tasks.data.length > 0 ? (completed / tasks.data.length) * 100 : 0;

    // Calculate average completion time
    const completedTasks = tasks.data.filter(t => t.status === 'completed' && t.completedAt);
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, t) => sum + (t.completedAt! - t.createdAt), 0) / completedTasks.length
      : 0;

    return {
      timestamp: Date.now(),
      total: tasks.data.length,
      completed,
      failed,
      inProgress,
      pending,
      successRate: Math.round(successRate * 100) / 100,
      avgCompletionTime: Math.round(avgCompletionTime / 1000), // Convert to seconds
      rewardPool: tasks.data.reduce((sum, t) => sum + parseFloat(t.reward || '0'), 0)
    };
  }

  /**
   * Collect cross-subnet communication statistics
   */
  private async collectCrossSubnetStats(): Promise<any> {
    // Simulate cross-subnet stats collection
    // In real implementation, this would query the CrossSubnetBridge contract
    
    return {
      timestamp: Date.now(),
      messagesSent: Math.floor(Math.random() * 1000) + 5000,
      messagesDelivered: Math.floor(Math.random() * 950) + 4800,
      avgLatency: Math.floor(Math.random() * 2000) + 500, // milliseconds
      failedMessages: Math.floor(Math.random() * 50) + 10,
      subnetActivity: {
        'defi-subnet': Math.floor(Math.random() * 300) + 1500,
        'gaming-subnet': Math.floor(Math.random() * 200) + 800,
        'ai-subnet': Math.floor(Math.random() * 400) + 2000
      },
      bridgeFees: {
        collected: ethers.formatEther(BigInt(Math.floor(Math.random() * 1000) + 5000) * BigInt(10**18)),
        distributed: ethers.formatEther(BigInt(Math.floor(Math.random() * 800) + 4000) * BigInt(10**18))
      }
    };
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<any> {
    const gasPrice = await this.getCurrentGasPrice();
    const blockNumber = await this.getLatestBlockNumber();
    
    // Calculate TPS (simplified)
    const tps = Math.random() * 100 + 50; // Simulate 50-150 TPS
    
    return {
      timestamp: Date.now(),
      blockNumber,
      gasPrice: parseFloat(ethers.formatUnits(gasPrice, 'gwei')),
      tps: Math.round(tps * 100) / 100,
      blockTime: 2000, // 2 seconds average for Avalanche
      memPoolSize: Math.floor(Math.random() * 1000) + 500,
      networkHashrate: Math.floor(Math.random() * 1000000) + 5000000,
      activeValidators: Math.floor(Math.random() * 50) + 1200
    };
  }

  /**
   * Calculate overall network health score
   */
  private calculateNetworkHealth(stats: any): number {
    let health = 100;
    
    // Reduce health based on various factors
    const agentUtilization = stats.activeAgents / Math.max(stats.totalAgents, 1);
    if (agentUtilization < 0.7) health -= (0.7 - agentUtilization) * 50;
    
    const taskSuccessRate = stats.completedTasks / Math.max(stats.totalTasks, 1);
    if (taskSuccessRate < 0.8) health -= (0.8 - taskSuccessRate) * 30;
    
    return Math.max(0, Math.min(100, Math.round(health)));
  }

  /**
   * Get latest block number
   */
  private async getLatestBlockNumber(): Promise<number> {
    try {
      const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
      return await provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting block number:', error);
      return 0;
    }
  }

  /**
   * Get current gas price
   */
  private async getCurrentGasPrice(): Promise<bigint> {
    try {
      const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
      const feeData = await provider.getFeeData();
      return feeData.gasPrice || BigInt(25000000000); // 25 gwei default
    } catch (error) {
      console.error('Error getting gas price:', error);
      return BigInt(25000000000);
    }
  }

  /**
   * Get SWARM token price (mock implementation)
   */
  private async getSwarmTokenPrice(): Promise<number> {
    try {
      // In real implementation, would fetch from DEX or price oracle
      return Math.random() * 0.5 + 0.1; // $0.10 - $0.60
    } catch (error) {
      console.error('Error getting token price:', error);
      return 0.25; // Default price
    }
  }

  /**
   * Update agent metrics from WebSocket
   */
  private updateAgentMetrics(data: any): void {
    const current = this.metrics.get('agents') || {};
    this.metrics.set('agents', { ...current, ...data, timestamp: Date.now() });
  }

  /**
   * Update task metrics from WebSocket
   */
  private updateTaskMetrics(data: any): void {
    const current = this.metrics.get('tasks') || {};
    this.metrics.set('tasks', { ...current, ...data, timestamp: Date.now() });
  }

  /**
   * Update network metrics from WebSocket
   */
  private updateNetworkMetrics(data: any): void {
    const current = this.metrics.get('network') || {};
    this.metrics.set('network', { ...current, ...data, timestamp: Date.now() });
  }

  /**
   * Update performance metrics from WebSocket
   */
  private updatePerformanceMetrics(data: any): void {
    const current = this.metrics.get('performance') || {};
    this.metrics.set('performance', { ...current, ...data, timestamp: Date.now() });
  }

  /**
   * Get all current metrics
   */
  getCurrentMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): string {
    const metrics = this.getCurrentMetrics();
    
    let report = `
# SwarmNode Protocol Performance Report
Generated: ${new Date().toISOString()}

## Network Overview
- Total Agents: ${metrics.network?.totalAgents || 0}
- Active Agents: ${metrics.network?.activeAgents || 0}
- Total Tasks: ${metrics.network?.totalTasks || 0}
- Completed Tasks: ${metrics.network?.completedTasks || 0}
- Network Health: ${metrics.network?.networkHealth || 0}%

## Agent Performance
- Average Reputation: ${metrics.agents?.avgReputation || 0}
- Excellent Performers: ${metrics.agents?.performanceDistribution?.excellent || 0}
- Good Performers: ${metrics.agents?.performanceDistribution?.good || 0}
- Average Performers: ${metrics.agents?.performanceDistribution?.average || 0}

## Task Execution
- Success Rate: ${metrics.tasks?.successRate || 0}%
- Average Completion Time: ${metrics.tasks?.avgCompletionTime || 0}s
- Tasks In Progress: ${metrics.tasks?.inProgress || 0}
- Pending Tasks: ${metrics.tasks?.pending || 0}

## Cross-Subnet Activity
- Messages Sent: ${metrics.crossSubnet?.messagesSent || 0}
- Messages Delivered: ${metrics.crossSubnet?.messagesDelivered || 0}
- Average Latency: ${metrics.crossSubnet?.avgLatency || 0}ms
- Failed Messages: ${metrics.crossSubnet?.failedMessages || 0}

## Performance Metrics
- Current TPS: ${metrics.performance?.tps || 0}
- Gas Price: ${metrics.performance?.gasPrice || 0} gwei
- Block Number: ${metrics.performance?.blockNumber || 0}
- Block Time: ${metrics.performance?.blockTime || 0}ms

## Token Economics
- SWARM Price: $${metrics.network?.tokenPrice || 0}
- Total Staked: ${metrics.network?.totalStaked || '0'} SWARM
- Total Rewards: ${metrics.network?.totalRewards || '0'} SWARM
`;

    return report;
  }
}

// Example usage
export async function runPerformanceMonitoring() {
  try {
    const sdk = new SwarmNodeSDK({
      network: 'fuji',
      apiKey: process.env.SWARMNODE_API_KEY
    });

    const monitor = new SwarmNodeMonitor(sdk);

    // Set up event listeners
    monitor.on('networkUpdate', (stats) => {
      console.log('🌐 Network update:', stats);
    });

    monitor.on('agentUpdate', (stats) => {
      console.log('🤖 Agent update:', stats);
    });

    monitor.on('taskUpdate', (stats) => {
      console.log('📋 Task update:', stats);
    });

    monitor.on('performanceUpdate', (stats) => {
      console.log('⚡ Performance update:', stats);
    });

    // Start monitoring
    await monitor.start();

    // Generate report every 5 minutes
    setInterval(() => {
      const report = monitor.generateReport();
      console.log(report);
    }, 300000);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down monitor...');
      monitor.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Monitoring initialization error:', error);
  }
}

// Run monitoring if this file is executed directly
if (require.main === module) {
  runPerformanceMonitoring().catch(console.error);
}
