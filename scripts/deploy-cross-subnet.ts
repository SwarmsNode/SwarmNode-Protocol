import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * Deploy SwarmNode cross-subnet infrastructure
 * This script deploys the core contracts on C-Chain and configures subnet bridges
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying cross-subnet infrastructure with account:', deployer.address);
    
    // Deploy on C-Chain (Mainnet)
    console.log('\n=== Deploying on Avalanche C-Chain ===');
    
    // 1. Deploy Cross-Subnet Bridge
    const CrossSubnetBridge = await ethers.getContractFactory('CrossSubnetBridge');
    const teleporterAddress = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'; // Mainnet Teleporter
    
    const bridge = await CrossSubnetBridge.deploy(teleporterAddress);
    await bridge.waitForDeployment();
    console.log('Cross-Subnet Bridge deployed to:', await bridge.getAddress());
    
    // 2. Deploy SwarmNode Token (if not already deployed)
    const SwarmNodeToken = await ethers.getContractFactory('SwarmNodeToken');
    const token = await SwarmNodeToken.deploy(
        deployer.address, // treasury
        deployer.address, // team
        deployer.address  // advisors
    );
    await token.waitForDeployment();
    console.log('SwarmNode Token deployed to:', await token.getAddress());
    
    // 3. Deploy Agent Registry with cross-subnet capabilities
    const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
    const registry = await AgentRegistry.deploy(
        await token.getAddress(),
        await bridge.getAddress()
    );
    await registry.waitForDeployment();
    console.log('Agent Registry deployed to:', await registry.getAddress());
    
    // 4. Configure supported subnets
    console.log('\n=== Configuring Supported Subnets ===');
    
    const supportedSubnets = [
        {
            name: 'Dexalot',
            id: '0x8c3607d3d60b0d86581e7d12adeb65f4e2b02e1d7a68b07af74d3dfa5c7b8c2e',
            endpoint: 'https://subnets.avax.network/dexalot/rpc'
        },
        {
            name: 'Degen Chain',
            id: '0x5c7b9d3a5c8e4f6e3a2b1d9c7f8e5a4b3c2d1e9f8c7b6a5d4e3f2a1b9c8d7e6f',
            endpoint: 'https://subnets.avax.network/degen/rpc'
        },
        {
            name: 'Beam',
            id: '0x9f2e1d5c8b7a6e4f3a2b1d9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
            endpoint: 'https://subnets.avax.network/beam/rpc'
        }
    ];
    
    for (const subnet of supportedSubnets) {
        await bridge.addSubnet(subnet.id);
        console.log(`Added ${subnet.name} subnet: ${subnet.id}`);
    }
    
    // 5. Deploy example cross-subnet agent
    console.log('\n=== Deploying Example Cross-Subnet Agent ===');
    
    const CrossSubnetAgent = await ethers.getContractFactory('CrossSubnetAgent');
    const exampleAgent = await CrossSubnetAgent.deploy(await bridge.getAddress());
    await exampleAgent.waitForDeployment();
    console.log('Example Cross-Subnet Agent deployed to:', await exampleAgent.getAddress());
    
    // 6. Initialize agent for all subnets
    for (const subnet of supportedSubnets) {
        // In a real deployment, this would be the actual deployed agent address on each subnet
        const subnetAgentAddress = ethers.Wallet.createRandom().address;
        
        await exampleAgent.configureSubnet(
            subnet.id,
            subnetAgentAddress,
            500000 // Gas limit
        );
        console.log(`Configured agent for ${subnet.name}: ${subnetAgentAddress}`);
    }
    
    // 7. Output deployment summary
    console.log('\n=== Deployment Summary ===');
    console.log(`Cross-Subnet Bridge: ${await bridge.getAddress()}`);
    console.log(`SwarmNode Token: ${await token.getAddress()}`);
    console.log(`Agent Registry: ${await registry.getAddress()}`);
    console.log(`Example Agent: ${await exampleAgent.getAddress()}`);
    
    // 8. Generate deployment config for frontend
    const deploymentConfig = {
        network: 'avalanche-mainnet',
        contracts: {
            bridge: await bridge.getAddress(),
            token: await token.getAddress(),
            registry: await registry.getAddress(),
            exampleAgent: await exampleAgent.getAddress()
        },
        subnets: supportedSubnets,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n=== Frontend Configuration ===');
    console.log(JSON.stringify(deploymentConfig, null, 2));
    
    // Save configuration to file
    const fs = require('fs');
    fs.writeFileSync(
        './deployments/cross-subnet-config.json',
        JSON.stringify(deploymentConfig, null, 2)
    );
    console.log('\nConfiguration saved to ./deployments/cross-subnet-config.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
