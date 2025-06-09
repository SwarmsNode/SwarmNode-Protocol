import { CrossSubnetDeFiAgent } from './examples/agents/CrossSubnetDeFiAgent';
import { CrossSubnetGamingAgent } from './examples/agents/CrossSubnetGamingAgent';

/**
 * Example usage of SwarmNode Protocol cross-subnet agents
 * This demonstrates how to deploy and manage AI agents across Avalanche subnets
 */

async function main() {
    console.log('SwarmNode Protocol - Cross-Subnet Agent Example');
    console.log('================================================');
    
    // Configuration from environment
    const config = {
        mainnetRPC: 'https://api.avax.network/ext/bc/C/rpc',
        privateKey: process.env.PRIVATE_KEY!,
        bridgeContract: process.env.BRIDGE_CONTRACT_ADDRESS!,
        agentContract: process.env.AGENT_CONTRACT_ADDRESS!
    };
    
    // Subnet RPC endpoints
    const subnetRPCs = {
        'DEXALOT': 'https://subnets.avax.network/dexalot/mainnet/rpc',
        'DEFIKINGDOMS': 'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc',
        'BEAM': 'https://subnets.avax.network/beam/mainnet/rpc',
        'DEGEN': 'https://rpc.degen.tips'
    };
    
    try {
        // Example 1: DeFi Arbitrage Agent
        console.log('\n1. Deploying DeFi Arbitrage Agent');
        console.log('-'.repeat(40));
        
        const defiAgent = new CrossSubnetDeFiAgent(
            config.mainnetRPC,
            subnetRPCs,
            config.privateKey,
            config.agentContract
        );
        
        await defiAgent.initialize();
        console.log('✅ DeFi Agent initialized successfully');
        
        // Start monitoring (non-blocking)
        defiAgent.monitorArbitrage().catch(console.error);
        console.log('🔍 Started arbitrage monitoring');
        
        // Example 2: Gaming Asset Manager
        console.log('\n2. Deploying Gaming Asset Manager');
        console.log('-'.repeat(40));
        
        const gamingAgent = new CrossSubnetGamingAgent(
            config.mainnetRPC,
            subnetRPCs,
            config.privateKey,
            config.agentContract
        );
        
        await gamingAgent.initialize();
        console.log('✅ Gaming Agent initialized successfully');
        
        // Start asset management (non-blocking)
        gamingAgent.manageAssets().catch(console.error);
        console.log('🎮 Started gaming asset management');
        
        // Example 3: Manual Cross-Subnet Operation
        console.log('\n3. Manual Cross-Subnet Operation Example');
        console.log('-'.repeat(40));
        
        await demonstrateManualOperation(config);
        
        // Keep the process running
        console.log('\n🚀 All agents are now running...');
        console.log('Press Ctrl+C to stop');
        
        // Prevent process from exiting
        process.stdin.resume();
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        process.exit(1);
    }
}

/**
 * Demonstrate manual cross-subnet operations
 */
async function demonstrateManualOperation(config: any) {
    const { ethers } = await import('ethers');
    
    // Connect to mainnet
    const provider = new ethers.JsonRpcProvider(config.mainnetRPC);
    const wallet = new ethers.Wallet(config.privateKey, provider);
    
    // Get agent contract
    const agentABI = [
        "function executeOnSubnet(bytes32 subnetId, string action, bytes params) external payable",
        "function getSupportedSubnetsCount() external view returns (uint256)"
    ];
    
    const agent = new ethers.Contract(config.agentContract, agentABI, wallet);
    
    try {
        // Check supported subnets
        const subnetCount = await agent.getSupportedSubnetsCount();
        console.log(`Agent supports ${subnetCount} subnets`);
        
        // Example: Execute a simple action on Dexalot subnet
        const dexalotSubnetId = '0x114C6A90000000000000000000000000000000000000000000000000000000000000';
        const action = 'GET_PRICE';
        const params = ethers.AbiCoder.defaultAbiCoder().encode(['string'], ['USDC']);
        
        console.log('Executing price query on Dexalot subnet...');
        
        const tx = await agent.executeOnSubnet(
            dexalotSubnetId,
            action,
            params,
            { value: ethers.parseEther('0.01') } // Bridge fee
        );
        
        console.log(`Transaction sent: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Operation completed in block ${receipt.blockNumber}`);
        
    } catch (error) {
        console.error('Manual operation failed:', error.message);
    }
}

/**
 * Graceful shutdown handler
 */
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down agents...');
    console.log('Thank you for using SwarmNode Protocol!');
    process.exit(0);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

export { main };
