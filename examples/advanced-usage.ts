/**
 * SwarmNode Protocol SDK - Advanced Usage Examples
 * 
 * This file demonstrates advanced features and patterns for using the SwarmNode SDK
 * including error handling, event monitoring, batch operations, and complex workflows.
 */

import { 
  SwarmNodeSDK, 
  AgentCapability, 
  AgentStatus, 
  TaskStatus,
  SwarmNodeError,
  ContractError,
  ApiError,
  ValidationError
} from '../src';

/**
 * Advanced DeFi Trading Strategy Implementation
 */
export class AdvancedDeFiStrategy {
  private sdk: SwarmNodeSDK;
  private agentId?: number;
  private isRunning = false;
  private strategies: Map<string, any> = new Map();

  constructor(sdk: SwarmNodeSDK) {
    this.sdk = sdk;
  }

  /**
   * Initialize the trading strategy with a specialized agent
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Advanced DeFi Strategy...');

    try {
      // Deploy a highly autonomous agent
      const deployResult = await this.sdk.deployAgent({
        name: 'Advanced Multi-Protocol DeFi Agent',
        description: 'Autonomous agent capable of executing complex DeFi strategies across multiple protocols',
        capabilities: [
          AgentCapability.TRADING,
          AgentCapability.ARBITRAGE,
          AgentCapability.YIELD_FARMING,
          AgentCapability.RISK_ASSESSMENT,
          AgentCapability.ANALYTICS,
          AgentCapability.PRICE_MONITORING,
          AgentCapability.CROSS_SUBNET_ARBITRAGE
        ],
        autonomyLevel: 950, // Very high autonomy
        rewardThreshold: '250' // Higher threshold for premium strategies
      });

      this.agentId = deployResult.agentId;
      console.log(`✅ Agent deployed successfully: ID ${this.agentId}`);

      // Initialize trading strategies
      await this.setupTradingStrategies();
      
    } catch (error) {
      this.handleError('Failed to initialize strategy', error);
      throw error;
    }
  }

  /**
   * Setup multiple trading strategies
   */
  private async setupTradingStrategies(): Promise<void> {
    if (!this.agentId) throw new Error('Agent not initialized');

    console.log('📊 Setting up trading strategies...');

    // Strategy 1: Cross-DEX Arbitrage
    const arbitrageStrategy = {
      name: 'Cross-DEX Arbitrage',
      exchanges: ['traderjoe', 'pangolin', 'sushiswap'],
      pairs: ['AVAX/USDC', 'JOE/AVAX', 'PNG/AVAX'],
      minProfitMargin: 0.3, // 0.3% minimum profit
      maxPositionSize: '10000', // USDC
      riskLevel: 'low'
    };

    // Strategy 2: Yield Farming Optimizer
    const yieldStrategy = {
      name: 'Yield Farming Optimizer',
      protocols: ['aave', 'benqi', 'bankerjoe'],
      assets: ['AVAX', 'USDC', 'USDT'],
      autoCompound: true,
      riskTolerance: 'medium',
      rebalanceFrequency: '6h'
    };

    // Strategy 3: Cross-Subnet Opportunities
    const crossSubnetStrategy = {
      name: 'Cross-Subnet Arbitrage',
      subnets: ['c-chain', 'dexalot-subnet', 'defi-kingdoms'],
      assets: ['AVAX'],
      maxSlippage: 0.5,
      bridgeFees: true
    };

    this.strategies.set('arbitrage', arbitrageStrategy);
    this.strategies.set('yield', yieldStrategy);
    this.strategies.set('cross-subnet', crossSubnetStrategy);

    // Create tasks for each strategy
    await this.createStrategyTasks();
  }

  /**
   * Create tasks for each trading strategy
   */
  private async createStrategyTasks(): Promise<void> {
    if (!this.agentId) throw new Error('Agent not initialized');

    for (const [strategyType, strategy] of this.strategies) {
      try {
        const task = await this.sdk.createTask({
          description: `Execute ${strategy.name} strategy with automated decision making`,
          requiredCapabilities: this.getRequiredCapabilities(strategyType),
          reward: this.calculateReward(strategyType),
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          metadata: {
            strategy: strategy,
            strategyType,
            automated: true,
            priority: this.getStrategyPriority(strategyType)
          }
        });

        await this.sdk.assignTask(task.taskId, this.agentId);
        console.log(`✅ ${strategy.name} task created and assigned: ${task.taskId}`);

      } catch (error) {
        console.error(`❌ Failed to create task for ${strategy.name}:`, error);
      }
    }
  }

  /**
   * Get required capabilities for strategy type
   */
  private getRequiredCapabilities(strategyType: string): AgentCapability[] {
    const baseCapabilities = [AgentCapability.ANALYTICS, AgentCapability.RISK_ASSESSMENT];
    
    switch (strategyType) {
      case 'arbitrage':
        return [...baseCapabilities, AgentCapability.ARBITRAGE, AgentCapability.TRADING, AgentCapability.PRICE_MONITORING];
      case 'yield':
        return [...baseCapabilities, AgentCapability.YIELD_FARMING, AgentCapability.TRADING];
      case 'cross-subnet':
        return [...baseCapabilities, AgentCapability.CROSS_SUBNET_ARBITRAGE, AgentCapability.TRADING];
      default:
        return baseCapabilities;
    }
  }

  /**
   * Calculate reward based on strategy complexity
   */
  private calculateReward(strategyType: string): string {
    const baseReward = 50;
    const multipliers = {
      'arbitrage': 1.2,
      'yield': 1.5,
      'cross-subnet': 2.0
    };
    
    const multiplier = multipliers[strategyType as keyof typeof multipliers] || 1.0;
    return (baseReward * multiplier).toString();
  }

  /**
   * Get strategy priority
   */
  private getStrategyPriority(strategyType: string): number {
    const priorities = {
      'arbitrage': 8, // High priority - quick opportunities
      'yield': 5,     // Medium priority - longer term
      'cross-subnet': 9 // Highest priority - rare opportunities
    };
    
    return priorities[strategyType as keyof typeof priorities] || 5;
  }

  /**
   * Start monitoring and execution
   */
  async startExecution(): Promise<void> {
    if (!this.agentId) throw new Error('Strategy not initialized');
    
    this.isRunning = true;
    console.log('🔄 Starting strategy execution and monitoring...');

    // Monitor every 30 seconds
    const monitoringInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(monitoringInterval);
        return;
      }

      try {
        await this.monitorAndOptimize();
      } catch (error) {
        console.error('❌ Monitoring error:', error);
      }
    }, 30000);

    // Performance analysis every 5 minutes
    const analysisInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(analysisInterval);
        return;
      }

      try {
        await this.analyzePerformance();
      } catch (error) {
        console.error('❌ Analysis error:', error);
      }
    }, 5 * 60 * 1000);

    console.log('✅ Strategy execution started');
  }

  /**
   * Monitor performance and optimize strategies
   */
  private async monitorAndOptimize(): Promise<void> {
    if (!this.agentId) return;

    try {
      // Get current agent metrics
      const metrics = await this.sdk.getAgentPerformanceMetrics(this.agentId);
      const agent = await this.sdk.getAgent(this.agentId);

      console.log(`📊 Agent ${this.agentId} Performance:`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Tasks Completed: ${metrics.tasksCompleted}`);
      console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
      console.log(`   Total Rewards: ${agent.totalRewards} SWARM`);

      // Check if agent needs optimization
      if (metrics.successRate < 0.8) {
        console.log('⚠️  Performance below threshold, optimizing strategies...');
        await this.optimizeStrategies();
      }

      // Check for new opportunities
      await this.checkForNewOpportunities();

    } catch (error) {
      this.handleError('Monitoring failed', error);
    }
  }

  /**
   * Optimize strategies based on performance
   */
  private async optimizeStrategies(): Promise<void> {
    console.log('🔧 Optimizing trading strategies...');

    // Adjust risk parameters based on recent performance
    for (const [strategyType, strategy] of this.strategies) {
      if (strategyType === 'arbitrage') {
        // Reduce minimum profit margin if success rate is low
        strategy.minProfitMargin = Math.max(0.1, strategy.minProfitMargin * 0.8);
        console.log(`📉 Reduced arbitrage profit margin to ${strategy.minProfitMargin}%`);
      }
      
      if (strategyType === 'yield') {
        // Adjust risk tolerance
        if (strategy.riskTolerance === 'high') {
          strategy.riskTolerance = 'medium';
          console.log('📉 Reduced yield farming risk tolerance to medium');
        }
      }
    }
  }

  /**
   * Check for new trading opportunities
   */
  private async checkForNewOpportunities(): Promise<void> {
    try {
      // Simulate checking for new opportunities
      const networkStats = await this.sdk.getNetworkStats();
      
      // If network activity is high, create additional tasks
      if (networkStats.networkActivity.tasksCreatedToday > 50) {
        console.log('🔥 High network activity detected - creating additional arbitrage task');
        
        if (this.agentId) {
          const urgentTask = await this.sdk.createTask({
            description: 'Urgent arbitrage opportunity - high network activity',
            requiredCapabilities: [AgentCapability.ARBITRAGE, AgentCapability.TRADING],
            reward: '75', // Higher reward for urgent tasks
            deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            metadata: {
              priority: 'urgent',
              opportunityType: 'high-activity-arbitrage'
            }
          });

          await this.sdk.assignTask(urgentTask.taskId, this.agentId);
          console.log(`✅ Urgent task created: ${urgentTask.taskId}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check for new opportunities:', error);
    }
  }

  /**
   * Analyze performance and generate reports
   */
  private async analyzePerformance(): Promise<void> {
    if (!this.agentId) return;

    try {
      console.log('📈 Generating performance analysis...');

      const metrics = await this.sdk.getAgentPerformanceMetrics(this.agentId);
      const rewardHistory = await this.sdk.getRewardHistory(this.agentId);

      // Calculate strategy-specific metrics
      const analysis = {
        totalProfit: rewardHistory.reduce((sum, reward) => sum + parseFloat(reward.amount), 0),
        avgProfitPerTask: rewardHistory.length > 0 ? 
          rewardHistory.reduce((sum, reward) => sum + parseFloat(reward.amount), 0) / rewardHistory.length : 0,
        tasksPerHour: metrics.tasksCompleted / (Date.now() / (1000 * 60 * 60)),
        riskAdjustedReturn: metrics.successRate * parseFloat(metrics.totalRewards),
        uptime: metrics.uptime
      };

      console.log('📊 Performance Analysis:');
      console.log(`   Total Profit: ${analysis.totalProfit.toFixed(2)} SWARM`);
      console.log(`   Avg Profit/Task: ${analysis.avgProfitPerTask.toFixed(2)} SWARM`);
      console.log(`   Tasks/Hour: ${analysis.tasksPerHour.toFixed(2)}`);
      console.log(`   Risk-Adjusted Return: ${analysis.riskAdjustedReturn.toFixed(2)}`);
      console.log(`   Uptime: ${(analysis.uptime * 100).toFixed(2)}%`);

      // Generate recommendations
      this.generateRecommendations(analysis);

    } catch (error) {
      this.handleError('Performance analysis failed', error);
    }
  }

  /**
   * Generate strategic recommendations
   */
  private generateRecommendations(analysis: any): void {
    console.log('💡 Strategic Recommendations:');

    if (analysis.avgProfitPerTask < 30) {
      console.log('   • Consider focusing on higher-value arbitrage opportunities');
    }

    if (analysis.uptime < 0.95) {
      console.log('   • Investigate agent reliability issues');
    }

    if (analysis.tasksPerHour < 0.5) {
      console.log('   • Increase task frequency or reduce complexity');
    }

    if (analysis.riskAdjustedReturn > 100) {
      console.log('   • Performance excellent - consider increasing position sizes');
    }
  }

  /**
   * Stop execution
   */
  async stopExecution(): Promise<void> {
    this.isRunning = false;
    console.log('🛑 Strategy execution stopped');

    if (this.agentId) {
      // Optionally pause the agent
      await this.sdk.updateAgentStatus(this.agentId, AgentStatus.INACTIVE);
      console.log('💤 Agent set to inactive status');
    }
  }

  /**
   * Handle errors with detailed logging
   */
  private handleError(context: string, error: any): void {
    console.error(`❌ ${context}:`);
    
    if (error instanceof ValidationError) {
      console.error(`   Validation Error: ${error.message}`);
      console.error(`   Field: ${error.field}`);
    } else if (error instanceof ContractError) {
      console.error(`   Contract Error: ${error.message}`);
      console.error(`   Contract: ${error.contractAddress}`);
    } else if (error instanceof ApiError) {
      console.error(`   API Error: ${error.message}`);
      console.error(`   Status Code: ${error.statusCode}`);
    } else if (error instanceof SwarmNodeError) {
      console.error(`   SwarmNode Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
    } else {
      console.error(`   Unknown Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }
  }
}

/**
 * Cross-Subnet Gaming Agent Example
 */
export class CrossSubnetGamingAgent {
  private sdk: SwarmNodeSDK;
  private agentId?: number;

  constructor(sdk: SwarmNodeSDK) {
    this.sdk = sdk;
  }

  async deployToGamingEcosystem(): Promise<void> {
    console.log('🎮 Deploying Cross-Subnet Gaming Agent...');

    try {
      // Deploy agent with gaming-specific capabilities
      const deployResult = await this.sdk.deployAgent({
        name: 'Cross-Subnet Gaming Asset Manager',
        description: 'Specialized agent for managing gaming assets across different subnets',
        capabilities: [
          AgentCapability.NFT_TRADING,
          AgentCapability.GAMING_ANALYTICS,
          AgentCapability.MARKETPLACE_MONITORING,
          AgentCapability.CROSS_SUBNET_COMMUNICATION,
          AgentCapability.RISK_ASSESSMENT
        ],
        autonomyLevel: 700,
        rewardThreshold: '100'
      });

      this.agentId = deployResult.agentId;
      console.log(`✅ Gaming agent deployed: ${this.agentId}`);

      // Deploy to gaming subnets
      await this.deployToSubnets();
      
    } catch (error) {
      console.error('❌ Failed to deploy gaming agent:', error);
      throw error;
    }
  }

  private async deployToSubnets(): Promise<void> {
    if (!this.agentId) return;

    const gamingSubnets = [
      'defi-kingdoms-subnet',
      'crabada-subnet',
      'castle-crush-subnet'
    ];

    for (const subnetId of gamingSubnets) {
      try {
        await this.sdk.deployAgentToSubnet(this.agentId, subnetId);
        console.log(`✅ Agent deployed to ${subnetId}`);
      } catch (error) {
        console.error(`❌ Failed to deploy to ${subnetId}:`, error);
      }
    }
  }
}

/**
 * Batch Operations Example
 */
export class BatchOperationsManager {
  private sdk: SwarmNodeSDK;

  constructor(sdk: SwarmNodeSDK) {
    this.sdk = sdk;
  }

  /**
   * Deploy multiple agents in batch
   */
  async deployAgentFleet(configs: any[]): Promise<number[]> {
    console.log(`🚀 Deploying fleet of ${configs.length} agents...`);
    
    const deploymentPromises = configs.map(config => 
      this.sdk.deployAgent(config).catch(error => ({ error, config }))
    );

    const results = await Promise.allSettled(deploymentPromises);
    const agentIds: number[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && 'agentId' in result.value) {
        agentIds.push(result.value.agentId);
        console.log(`✅ Agent ${index + 1} deployed: ${result.value.agentId}`);
      } else {
        console.error(`❌ Agent ${index + 1} failed:`, result);
      }
    });

    console.log(`🎉 Successfully deployed ${agentIds.length}/${configs.length} agents`);
    return agentIds;
  }

  /**
   * Create and assign multiple tasks
   */
  async createTaskBatch(tasks: any[], agentIds: number[]): Promise<void> {
    console.log(`📋 Creating ${tasks.length} tasks for ${agentIds.length} agents...`);

    for (let i = 0; i < tasks.length; i++) {
      try {
        const task = await this.sdk.createTask(tasks[i]);
        const assignedAgent = agentIds[i % agentIds.length]; // Round-robin assignment
        
        await this.sdk.assignTask(task.taskId, assignedAgent);
        console.log(`✅ Task ${task.taskId} assigned to agent ${assignedAgent}`);
        
      } catch (error) {
        console.error(`❌ Failed to create/assign task ${i}:`, error);
      }
    }
  }
}

// Example usage function
export async function runAdvancedExamples(): Promise<void> {
  console.log('🚀 Running Advanced SwarmNode SDK Examples');
  console.log('=========================================');

  try {
    // Initialize SDK
    const sdk = new SwarmNodeSDK({
      network: 'fuji',
      privateKey: process.env.PRIVATE_KEY!,
      apiKey: process.env.SWARMNODE_API_KEY
    });

    // Example 1: Advanced DeFi Strategy
    console.log('\n🔹 Example 1: Advanced DeFi Strategy');
    const defiStrategy = new AdvancedDeFiStrategy(sdk);
    await defiStrategy.initialize();
    await defiStrategy.startExecution();

    // Run for 2 minutes then stop
    setTimeout(async () => {
      await defiStrategy.stopExecution();
    }, 2 * 60 * 1000);

    // Example 2: Cross-Subnet Gaming
    console.log('\n🔹 Example 2: Cross-Subnet Gaming Agent');
    const gamingAgent = new CrossSubnetGamingAgent(sdk);
    await gamingAgent.deployToGamingEcosystem();

    // Example 3: Batch Operations
    console.log('\n🔹 Example 3: Batch Operations');
    const batchManager = new BatchOperationsManager(sdk);
    
    const agentConfigs = [
      {
        name: 'Arbitrage Bot 1',
        capabilities: [AgentCapability.ARBITRAGE, AgentCapability.TRADING],
        autonomyLevel: 800,
        rewardThreshold: '50'
      },
      {
        name: 'Yield Optimizer 1',
        capabilities: [AgentCapability.YIELD_FARMING, AgentCapability.ANALYTICS],
        autonomyLevel: 750,
        rewardThreshold: '75'
      }
    ];

    const agentIds = await batchManager.deployAgentFleet(agentConfigs);

    const taskConfigs = [
      {
        description: 'Monitor AVAX/USDC arbitrage',
        requiredCapabilities: [AgentCapability.ARBITRAGE],
        reward: '25',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000)
      },
      {
        description: 'Optimize AAVE yields',
        requiredCapabilities: [AgentCapability.YIELD_FARMING],
        reward: '40',
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000)
      }
    ];

    await batchManager.createTaskBatch(taskConfigs, agentIds);

    console.log('\n🎉 All advanced examples completed successfully!');

  } catch (error) {
    console.error('❌ Advanced examples failed:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runAdvancedExamples().catch(console.error);
}
