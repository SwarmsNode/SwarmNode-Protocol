import { SwarmNodeSDK, AgentCapability, AgentStatus, TaskStatus } from '../src';

/**
 * Complete SwarmNode SDK Usage Example
 * 
 * This example shows how to:
 * 1. Connect to the SwarmNod    console.log('📊 Submitting analysis result...');
    await sdk.submitTaskResult(taskResults[0].taskId, JSON.stringify(analysisResult));
    console.log('✅ Analysis result submitted');

    // 7. NETWORK STATISTICS
    console.log('\n🌐 === NETWORK STATISTICS ===');ocol
 * 2. Deploy a DeFi trading agent
 * 3. Create and manage tasks
 * 4. Monitor performance
 * 5. Manage rewards
 */

async function main() {
  // SDK Configuration
  const sdk = new SwarmNodeSDK({
    network: 'fuji', // Use Fuji testnet
    privateKey: process.env.PRIVATE_KEY!,
    ...(process.env.SWARMNODE_API_KEY && { apiKey: process.env.SWARMNODE_API_KEY })
  });

  console.log('🌐 Connecting to SwarmNode network...');
  
  // Verify connection
  const isConnected = await sdk.isConnected();
  if (!isConnected) {
    throw new Error('Unable to connect to Avalanche network');
  }

  const currentAccount = await sdk.getCurrentAccount();
  console.log(`✅ Connected with account: ${currentAccount}`);

  // Check SWARM balance
  const swarmBalance = await sdk.getSwarmBalance();
  console.log(`💰 SWARM Balance: ${swarmBalance} tokens`);

  if (parseFloat(swarmBalance) < 100) {
    console.warn('⚠️  Insufficient SWARM balance for examples (100 tokens recommended)');
  }

  try {
    // 1. DEPLOY TRADING AGENT
    console.log('\n🤖 === AGENT DEPLOYMENT ===');
    
    const agentConfig = {
      name: "Advanced DeFi Arbitrage Bot",
      description: "Autonomous agent specialized in cross-protocol DeFi arbitrage on Avalanche",
      capabilities: [
        AgentCapability.TRADING,
        AgentCapability.ARBITRAGE,
        AgentCapability.ANALYTICS,
        AgentCapability.RISK_ASSESSMENT,
        AgentCapability.YIELD_FARMING,
        AgentCapability.PRICE_MONITORING
      ],
      autonomyLevel: 800, // 80% autonomy
      rewardThreshold: "50", // Minimum 50 SWARM to act
      metadataURI: "https://metadata.swarmnode.io/agents/defi-arbitrage-v1"
    };

    // Estimate deployment cost
    console.log('📊 Estimating deployment cost...');
    const gasEstimate = await sdk.estimateGasForAgent(agentConfig);
    console.log(`⛽ Estimated gas: ${gasEstimate.gasLimit} (${gasEstimate.estimatedCost} wei)`);

    // Deploy the agent
    console.log('🚀 Deployment in progress...');
    const deployResult = await sdk.deployAgent(agentConfig);
    
    console.log(`✅ Agent deployed successfully!`);
    console.log(`   ID: ${deployResult.agentId}`);
    console.log(`   Transaction: ${deployResult.transactionHash}`);
    console.log(`   Fees: ${deployResult.deploymentFee} SWARM`);

    // Get agent details
    const agent = await sdk.getAgent(deployResult.agentId);
    console.log(`📋 Agent "${agent.name}" - Status: ${agent.status}`);

    // 2. TASK CREATION
    console.log('\n📋 === TASK CREATION ===');

    // Task 1: Market analysis
    const marketAnalysisTask = await sdk.createTask({
      description: "Analyze arbitrage opportunities between Trader Joe, Pangolin and SushiSwap for AVAX/USDC and JOE/AVAX pairs",
      requiredCapabilities: [
        AgentCapability.ANALYTICS,
        AgentCapability.ARBITRAGE,
        AgentCapability.PRICE_MONITORING
      ],
      reward: "30",
      deadline: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    });

    console.log(`✅ Analysis task created: ID ${marketAnalysisTask.taskId}`);

    // Task 2: Yield Farming
    const yieldFarmingTask = await sdk.createTask({
      description: "Identify and execute the best yield farming strategies on AAVE and Benqi",
      requiredCapabilities: [
        AgentCapability.YIELD_FARMING,
        AgentCapability.RISK_ASSESSMENT,
        AgentCapability.ANALYTICS
      ],
      reward: "45",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    console.log(`✅ Yield farming task created: ID ${yieldFarmingTask.taskId}`);

    // 3. TASK ASSIGNMENT
    console.log('\n🎯 === TASK ASSIGNMENT ===');
    
    await sdk.assignTask(marketAnalysisTask.taskId, deployResult.agentId);
    console.log(`✅ Task ${marketAnalysisTask.taskId} assigned to agent ${deployResult.agentId}`);

    await sdk.assignTask(yieldFarmingTask.taskId, deployResult.agentId);
    console.log(`✅ Task ${yieldFarmingTask.taskId} assigned to agent ${deployResult.agentId}`);

    // 4. PERFORMANCE MONITORING
    console.log('\n📊 === PERFORMANCE MONITORING ===');

    // Monitoring function
    const monitorAgent = async () => {
      try {
        const metrics = await sdk.getAgentPerformanceMetrics(deployResult.agentId);
        const agentInfo = await sdk.getAgent(deployResult.agentId);
        
        console.log(`📈 Agent ${deployResult.agentId} metrics:`);
        console.log(`   Completed tasks: ${metrics.tasksCompleted}`);
        console.log(`   Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
        console.log(`   Average response time: ${metrics.averageResponseTime}ms`);
        console.log(`   Uptime: ${(metrics.uptime * 100).toFixed(2)}%`);
        console.log(`   Total rewards: ${agentInfo.totalRewards} SWARM`);
      } catch (error) {
        console.warn('⚠️  Error retrieving metrics:', error instanceof Error ? error.message : String(error));
      }
    };

    // Initial monitoring
    await monitorAgent();

    // 5. TASK MANAGEMENT
    console.log('\n🔄 === TASK MANAGEMENT ===');

    // List all tasks
    const allTasks = await sdk.getTasks({ page: 1, limit: 10 });
    console.log(`📋 ${allTasks.data.length} tasks found (${allTasks.pagination.total} total)`);

    // Display details of created tasks
    const task1 = await sdk.getTask(marketAnalysisTask.taskId);
    const task2 = await sdk.getTask(yieldFarmingTask.taskId);
    
    console.log(`📝 Task ${task1.id}: ${task1.description.substring(0, 50)}... - Status: ${task1.status}`);
    console.log(`📝 Task ${task2.id}: ${task2.description.substring(0, 50)}... - Status: ${task2.status}`);

    // 6. TASK RESULTS SIMULATION
    console.log('\n✅ === RESULTS SIMULATION ===');

    // Simulate a result for the analysis task
    const analysisResult = {
      timestamp: new Date().toISOString(),
      opportunities: [
        {
          pair: 'AVAX/USDC',
          buyExchange: 'pangolin',
          sellExchange: 'traderjoe',
          buyPrice: 25.42,
          sellPrice: 25.68,
          profitMargin: 1.02,
          riskLevel: 'low',
          estimatedProfit: '260.00',
          gasEstimate: '0.02'
        },
        {
          pair: 'JOE/AVAX',
          buyExchange: 'sushiswap',
          sellExchange: 'traderjoe',
          buyPrice: 0.089,
          sellPrice: 0.091,
          profitMargin: 2.25,
          riskLevel: 'medium',
          estimatedProfit: '180.50',
          gasEstimate: '0.025'
        }
      ],
      recommendation: 'Execute arbitrage on AVAX/USDC pair - highest profit/risk ratio',
      confidence: 0.87
    };

    console.log('📊 Submitting analysis result...');
    await sdk.submitTaskResult(marketAnalysisTask.taskId, JSON.stringify(analysisResult));
    console.log('✅ Analysis result submitted');

    // 7. NETWORK STATISTICS
    console.log('\n🌐 === NETWORK STATISTICS ===');
    
    try {
      const networkStats = await sdk.getNetworkStats();
      console.log('📊 SwarmNode network status:');
      console.log(`   Total agents: ${networkStats.totalAgents}`);
      console.log(`   Active agents: ${networkStats.activeAgents}`);
      console.log(`   Completed tasks: ${networkStats.completedTasks}`);
      console.log(`   Network uptime: ${(networkStats.networkUptime * 100).toFixed(2)}%`);
      console.log(`   Average reward: ${networkStats.averageTaskReward} SWARM`);
    } catch (error) {
      console.warn('⚠️  Network statistics unavailable:', error instanceof Error ? error.message : String(error));
    }

    // 8. REWARD HISTORY
    console.log('\n💰 === REWARD HISTORY ===');
    
    try {
      const rewardHistory = await sdk.getRewardHistory(deployResult.agentId);
      if (rewardHistory.length > 0) {
        console.log(`💰 Reward history for agent ${deployResult.agentId}:`);
        rewardHistory.slice(0, 5).forEach(reward => {
          console.log(`   ${reward.amount} SWARM - Task ${reward.taskId || 'N/A'} (${new Date(reward.timestamp).toLocaleString()})`);
        });
      } else {
        console.log('📝 No rewards received yet');
      }
    } catch (error) {
      console.warn('⚠️  Reward history unavailable:', error instanceof Error ? error.message : String(error));
    }

    // 9. CONTINUOUS MONITORING
    console.log('\n🔄 === CONTINUOUS MONITORING ===');
    console.log('🕒 Monitoring started (Ctrl+C to stop)...');
    
    let monitoringCount = 0;
    const monitoringInterval = setInterval(async () => {
      monitoringCount++;
      console.log(`\n--- Monitoring ${monitoringCount} ---`);
      
      await monitorAgent();
      
      // Check task status
      try {
        const updatedTask1 = await sdk.getTask(marketAnalysisTask.taskId);
        const updatedTask2 = await sdk.getTask(yieldFarmingTask.taskId);
        
        console.log(`📋 Task ${updatedTask1.id}: ${updatedTask1.status}`);
        console.log(`📋 Task ${updatedTask2.id}: ${updatedTask2.status}`);
        
        // Stop monitoring after 5 cycles or if all tasks are completed
        if (monitoringCount >= 5 || 
            (updatedTask1.status === TaskStatus.COMPLETED && updatedTask2.status === TaskStatus.COMPLETED)) {
          console.log('🏁 Monitoring completed');
          clearInterval(monitoringInterval);
          process.exit(0);
        }
      } catch (error) {
        console.warn('⚠️  Error checking tasks:', error instanceof Error ? error.message : String(error));
      }
    }, 30000); // Every 30 seconds

    // Handle clean shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitoring...');
      clearInterval(monitoringInterval);
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error in example:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorWithCode = error as { code: string };
      if (errorWithCode.code === 'VALIDATION_ERROR') {
        console.error('💡 Check your agent configuration');
      } else if (errorWithCode.code === 'CONTRACT_ERROR') {
        console.error('💡 Smart contract issue - verify addresses');
      } else if (errorWithCode.code === 'API_ERROR') {
        console.error('💡 API issue - check your API key');
      }
    }
    
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise) => {
  console.error('❌ Unhandled error:', reason);
  process.exit(1);
});

// Start the example
if (require.main === module) {
  console.log('🚀 SwarmNode SDK - Complete Example');
  console.log('====================================');
  
  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not defined in environment variables');
    process.exit(1);
  }
  
  main().catch(console.error);
}

export { main as runExample };
