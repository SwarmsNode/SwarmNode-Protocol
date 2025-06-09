import { ethers } from 'hardhat';
import subnetConfig from '../config/subnets.json';

/**
 * Configure supported subnets for SwarmNode Protocol
 * This script adds subnet support to the CrossSubnetBridge contract
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Configuring subnets with account:', deployer.address);
    
    // Get deployed bridge contract address
    const bridgeAddress = process.env.BRIDGE_CONTRACT_ADDRESS;
    if (!bridgeAddress) {
        throw new Error('BRIDGE_CONTRACT_ADDRESS environment variable not set');
    }
    
    const CrossSubnetBridge = await ethers.getContractFactory('CrossSubnetBridge');
    const bridge = CrossSubnetBridge.attach(bridgeAddress);
    
    console.log('Connected to CrossSubnetBridge at:', bridgeAddress);
    
    // Configure each subnet
    console.log('\n=== Configuring Subnets ===');
    
    const subnets = subnetConfig.subnets;
    
    for (const [subnetKey, subnetData] of Object.entries(subnets)) {
        try {
            console.log(`\nConfiguring ${subnetData.name}...`);
            
            // Convert chainId to bytes32 format
            const subnetId = ethers.zeroPadValue(subnetData.chainId, 32);
            
            // Check if subnet is already supported
            const isSupported = await bridge.supportedSubnets(subnetId);
            
            if (isSupported) {
                console.log(`${subnetData.name} is already configured`);
                continue;
            }
            
            // Add subnet
            const tx = await bridge.addSubnet(subnetId);
            await tx.wait();
            
            console.log(`✅ Added ${subnetData.name}`);
            console.log(`   Chain ID: ${subnetData.chainId}`);
            console.log(`   Subnet ID: ${subnetId}`);
            console.log(`   Type: ${subnetData.type}`);
            console.log(`   Features: ${subnetData.features.join(', ')}`);
            console.log(`   Gas Token: ${subnetData.gasToken}`);
            console.log(`   Transaction: ${tx.hash}`);
            
        } catch (error) {
            console.error(`❌ Failed to configure ${subnetData.name}:`, error.message);
        }
    }
    
    // Verify configuration
    console.log('\n=== Verifying Configuration ===');
    
    for (const [subnetKey, subnetData] of Object.entries(subnets)) {
        const subnetId = ethers.zeroPadValue(subnetData.chainId, 32);
        const isSupported = await bridge.supportedSubnets(subnetId);
        
        if (isSupported) {
            console.log(`✅ ${subnetData.name} - Configured`);
        } else {
            console.log(`❌ ${subnetData.name} - Not configured`);
        }
    }
    
    // Deploy example agents on each subnet
    console.log('\n=== Deploying Example Agents ===');
    
    const agentTemplates = subnetConfig.agents.templates;
    
    for (const [templateKey, template] of Object.entries(agentTemplates)) {
        console.log(`\nDeploying ${template.name}...`);
        
        try {
            const CrossSubnetAgent = await ethers.getContractFactory('CrossSubnetAgent');
            const agent = await CrossSubnetAgent.deploy(bridgeAddress);
            await agent.waitForDeployment();
            
            const agentAddress = await agent.getAddress();
            console.log(`Agent deployed at: ${agentAddress}`);
            
            // Configure agent for supported subnets
            for (const subnetKey of template.supportedSubnets) {
                const subnetData = subnets[subnetKey];
                if (!subnetData) continue;
                
                const subnetId = ethers.zeroPadValue(subnetData.chainId, 32);
                
                // In production, this would be the actual deployed agent address on the subnet
                const subnetAgentAddress = ethers.Wallet.createRandom().address;
                
                await agent.configureSubnet(subnetId, subnetAgentAddress, 500000);
                console.log(`   Configured for ${subnetData.name}: ${subnetAgentAddress}`);
            }
            
            console.log(`✅ ${template.name} configured successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to deploy ${template.name}:`, error.message);
        }
    }
    
    // Generate updated configuration
    console.log('\n=== Generating Updated Configuration ===');
    
    const updatedConfig = {
        ...subnetConfig,
        deployment: {
            ...subnetConfig.deployment,
            mainnet: {
                ...subnetConfig.deployment.mainnet,
                crossSubnetBridge: bridgeAddress,
                lastUpdated: new Date().toISOString()
            }
        }
    };
    
    // Save updated configuration
    const fs = require('fs');
    fs.writeFileSync(
        './config/deployed-subnets.json',
        JSON.stringify(updatedConfig, null, 2)
    );
    
    console.log('Updated configuration saved to ./config/deployed-subnets.json');
    
    // Output summary
    console.log('\n=== Configuration Summary ===');
    console.log(`Bridge Contract: ${bridgeAddress}`);
    console.log(`Configured Subnets: ${Object.keys(subnets).length}`);
    console.log(`Agent Templates: ${Object.keys(agentTemplates).length}`);
    console.log('Deployment completed successfully!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
