import { expect } from "chai";
import { ethers } from "hardhat";
import { SwarmToken, AgentRegistry, TaskManager } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SwarmNode Protocol", function () {
  let swarmToken: SwarmToken;
  let agentRegistry: AgentRegistry;
  let taskManager: TaskManager;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy SwarmToken
    const SwarmTokenFactory = await ethers.getContractFactory("SwarmToken");
    swarmToken = await SwarmTokenFactory.deploy();
    await swarmToken.deployed();

    // Deploy AgentRegistry
    const AgentRegistryFactory = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistryFactory.deploy(swarmToken.address);
    await agentRegistry.deployed();

    // Deploy TaskManager
    const TaskManagerFactory = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManagerFactory.deploy(
      agentRegistry.address,
      swarmToken.address
    );
    await taskManager.deployed();

    // Setup initial token distribution
    const initialAmount = ethers.utils.parseEther("1000000");
    await swarmToken.distributeTokens(owner.address, initialAmount);
    await swarmToken.transfer(user1.address, ethers.utils.parseEther("10000"));
    await swarmToken.transfer(user2.address, ethers.utils.parseEther("10000"));
  });

  describe("SwarmToken", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await swarmToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000000"));
    });

    it("Should distribute tokens correctly", async function () {
      const balance = await swarmToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.utils.parseEther("10000"));
    });

    it("Should create vesting schedule", async function () {
      const amount = ethers.utils.parseEther("1000");
      const startTime = Math.floor(Date.now() / 1000);
      const duration = 365 * 24 * 60 * 60; // 1 year
      const cliffDuration = 30 * 24 * 60 * 60; // 30 days

      await swarmToken.createVestingSchedule(
        user1.address,
        amount,
        startTime,
        duration,
        cliffDuration
      );

      const schedule = await swarmToken.vestingSchedules(user1.address);
      expect(schedule.totalAmount).to.equal(amount);
    });
  });

  describe("AgentRegistry", function () {
    beforeEach(async function () {
      // Approve tokens for agent deployment
      await swarmToken.connect(user1).approve(
        agentRegistry.address,
        ethers.utils.parseEther("100")
      );
    });

    it("Should deploy agent successfully", async function () {
      const deploymentFee = await agentRegistry.deploymentFee();
      
      const tx = await agentRegistry.connect(user1).deployAgent(
        "TestAgent",
        "A test AI agent",
        ["data_processing", "analytics"],
        750, // 75% autonomy
        ethers.utils.parseEther("10"), // reward threshold
        "ipfs://QmTestHash"
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "AgentDeployed");
      expect(event).to.not.be.undefined;

      const agentId = event?.args?.agentId;
      const agent = await agentRegistry.agents(agentId);
      expect(agent.name).to.equal("TestAgent");
      expect(agent.owner).to.equal(user1.address);
    });

    it("Should connect agents", async function () {
      // Deploy two agents
      await agentRegistry.connect(user1).deployAgent(
        "Agent1",
        "First agent",
        ["data_processing"],
        500,
        ethers.utils.parseEther("5"),
        "ipfs://hash1"
      );

      await swarmToken.connect(user2).approve(
        agentRegistry.address,
        ethers.utils.parseEther("100")
      );

      await agentRegistry.connect(user2).deployAgent(
        "Agent2",
        "Second agent",
        ["analytics"],
        600,
        ethers.utils.parseEther("7"),
        "ipfs://hash2"
      );

      // Connect agents
      await agentRegistry.connect(user1).connectAgents(1, 2);

      const isConnected = await agentRegistry.agentConnections(1, 2);
      expect(isConnected).to.be.true;

      const network = await agentRegistry.getAgentNetwork(1);
      expect(network.length).to.equal(1);
      expect(network[0]).to.equal(2);
    });

    it("Should reward agent", async function () {
      // Deploy agent
      await agentRegistry.connect(user1).deployAgent(
        "RewardAgent",
        "Agent for rewards",
        ["execution"],
        800,
        ethers.utils.parseEther("1"),
        "ipfs://reward"
      );

      const rewardAmount = ethers.utils.parseEther("50");
      const initialBalance = await swarmToken.balanceOf(user1.address);

      await agentRegistry.rewardAgent(1, rewardAmount);

      const finalBalance = await swarmToken.balanceOf(user1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(rewardAmount);

      const agent = await agentRegistry.agents(1);
      expect(agent.totalRewards).to.equal(rewardAmount);
    });
  });

  describe("TaskManager", function () {
    let agentId: number;

    beforeEach(async function () {
      // Deploy an agent first
      await swarmToken.connect(user1).approve(
        agentRegistry.address,
        ethers.utils.parseEther("100")
      );

      const tx = await agentRegistry.connect(user1).deployAgent(
        "TaskAgent",
        "Agent for tasks",
        ["data_processing", "analytics"],
        700,
        ethers.utils.parseEther("5"),
        "ipfs://taskagent"
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "AgentDeployed");
      agentId = event?.args?.agentId.toNumber();

      // Approve tokens for task creation
      await swarmToken.connect(user2).approve(
        taskManager.address,
        ethers.utils.parseEther("100")
      );
    });

    it("Should create task successfully", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const reward = ethers.utils.parseEther("25");

      const tx = await taskManager.connect(user2).createTask(
        "Process dataset",
        ["data_processing"],
        reward,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TaskCreated");
      expect(event).to.not.be.undefined;

      const taskId = event?.args?.taskId;
      const task = await taskManager.tasks(taskId);
      expect(task.creator).to.equal(user2.address);
      expect(task.reward).to.equal(reward);
    });

    it("Should assign and complete task", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      const reward = ethers.utils.parseEther("30");

      // Create task
      await taskManager.connect(user2).createTask(
        "Analytics task",
        ["data_processing", "analytics"],
        reward,
        deadline
      );

      // Assign task to agent
      await taskManager.connect(user1).assignTask(1, agentId);

      let task = await taskManager.tasks(1);
      expect(task.assignedAgent).to.equal(agentId);
      expect(task.status).to.equal(1); // TaskStatus.Assigned

      // Start task
      await taskManager.connect(user1).startTask(1);

      task = await taskManager.tasks(1);
      expect(task.status).to.equal(2); // TaskStatus.InProgress

      // Complete task
      const resultData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Task completed successfully")
      );
      const initialBalance = await swarmToken.balanceOf(user1.address);

      await taskManager.connect(user1).completeTask(1, resultData);

      const finalBalance = await swarmToken.balanceOf(user1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(reward);

      task = await taskManager.tasks(1);
      expect(task.status).to.equal(3); // TaskStatus.Completed
    });

    it("Should cancel task", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      const reward = ethers.utils.parseEther("15");

      // Create task
      await taskManager.connect(user2).createTask(
        "Cancellable task",
        ["data_processing"],
        reward,
        deadline
      );

      const initialBalance = await swarmToken.balanceOf(user2.address);

      // Cancel task
      await taskManager.connect(user2).cancelTask(1);

      const finalBalance = await swarmToken.balanceOf(user2.address);
      expect(finalBalance.sub(initialBalance)).to.equal(reward);

      const task = await taskManager.tasks(1);
      expect(task.status).to.equal(5); // TaskStatus.Cancelled
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete workflow", async function () {
      // 1. Deploy multiple agents
      await swarmToken.connect(user1).approve(
        agentRegistry.address,
        ethers.utils.parseEther("10")
      );

      await agentRegistry.connect(user1).deployAgent(
        "WorkflowAgent1",
        "First workflow agent",
        ["data_processing", "communication"],
        650,
        ethers.utils.parseEther("3"),
        "ipfs://workflow1"
      );

      await swarmToken.connect(user2).approve(
        agentRegistry.address,
        ethers.utils.parseEther("10")
      );

      await agentRegistry.connect(user2).deployAgent(
        "WorkflowAgent2",
        "Second workflow agent",
        ["analytics", "execution"],
        750,
        ethers.utils.parseEther("4"),
        "ipfs://workflow2"
      );

      // 2. Connect agents
      await agentRegistry.connect(user1).connectAgents(1, 2);

      // 3. Create multiple tasks
      await swarmToken.connect(user1).approve(
        taskManager.address,
        ethers.utils.parseEther("100")
      );

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await taskManager.connect(user1).createTask(
        "Data processing task",
        ["data_processing"],
        ethers.utils.parseEther("20"),
        deadline
      );

      await taskManager.connect(user1).createTask(
        "Analytics task",
        ["analytics"],
        ethers.utils.parseEther("25"),
        deadline
      );

      // 4. Assign and complete tasks
      await taskManager.connect(user1).assignTask(1, 1);
      await taskManager.connect(user2).assignTask(2, 2);

      await taskManager.connect(user1).startTask(1);
      await taskManager.connect(user2).startTask(2);

      const result1 = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Data processed")
      );
      const result2 = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Analysis complete")
      );

      await taskManager.connect(user1).completeTask(1, result1);
      await taskManager.connect(user2).completeTask(2, result2);

      // 5. Verify final state
      const totalTasks = await taskManager.totalTasks();
      const completedTasks = await taskManager.completedTasks();
      
      expect(totalTasks).to.equal(2);
      expect(completedTasks).to.equal(2);

      const activeAgents = await agentRegistry.activeAgents();
      expect(activeAgents).to.equal(2);
    });
  });
});
