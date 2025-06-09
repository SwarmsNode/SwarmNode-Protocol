import { ethers } from "hardhat";
import { SwarmToken, AgentRegistry, TaskManager } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying SwarmNode Protocol contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy SwarmToken
  console.log("\n📄 Deploying SwarmToken...");
  const SwarmTokenFactory = await ethers.getContractFactory("SwarmToken");
  const swarmToken: SwarmToken = await SwarmTokenFactory.deploy();
  await swarmToken.deployed();
  console.log("✅ SwarmToken deployed to:", swarmToken.address);

  // Deploy AgentRegistry
  console.log("\n🤖 Deploying AgentRegistry...");
  const AgentRegistryFactory = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry: AgentRegistry = await AgentRegistryFactory.deploy(swarmToken.address);
  await agentRegistry.deployed();
  console.log("✅ AgentRegistry deployed to:", agentRegistry.address);

  // Deploy TaskManager
  console.log("\n📋 Deploying TaskManager...");
  const TaskManagerFactory = await ethers.getContractFactory("TaskManager");
  const taskManager: TaskManager = await TaskManagerFactory.deploy(
    agentRegistry.address,
    swarmToken.address
  );
  await taskManager.deployed();
  console.log("✅ TaskManager deployed to:", taskManager.address);

  // Setup initial distribution
  console.log("\n💰 Setting up initial token distribution...");
  
  // Distribute tokens to treasury (for rewards and operations)
  const treasuryAmount = ethers.utils.parseEther("200000000"); // 200M tokens
  await swarmToken.distributeTokens(deployer.address, treasuryAmount);
  console.log("✅ Treasury tokens distributed");

  // Setup some initial configurations
  await agentRegistry.setDeploymentFee(ethers.utils.parseEther("1"));
  console.log("✅ Agent deployment fee set to 1 SWARM");

  await taskManager.setMinTaskReward(ethers.utils.parseEther("0.1"));
  console.log("✅ Minimum task reward set to 0.1 SWARM");

  // Verification information
  console.log("\n📝 Contract Deployment Summary:");
  console.log("=====================================");
  console.log("SwarmToken:    ", swarmToken.address);
  console.log("AgentRegistry: ", agentRegistry.address);
  console.log("TaskManager:   ", taskManager.address);
  console.log("=====================================");

  console.log("\n🔗 Verification commands:");
  console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${swarmToken.address}`);
  console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${agentRegistry.address} "${swarmToken.address}"`);
  console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${taskManager.address} "${agentRegistry.address}" "${swarmToken.address}"`);

  // Save deployment addresses
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "localhost",
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      SwarmToken: swarmToken.address,
      AgentRegistry: agentRegistry.address,
      TaskManager: taskManager.address
    },
    deploymentTime: new Date().toISOString()
  };

  console.log("\n📁 Saving deployment info...");
  const fs = require("fs");
  fs.writeFileSync(
    `./deployments/${deploymentInfo.network}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
