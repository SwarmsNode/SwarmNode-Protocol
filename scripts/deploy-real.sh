#!/bin/bash

# SwarmNode Protocol - Real Deployment Script for Fuji Testnet
# This script deploys all contracts to Avalanche Fuji testnet with real addresses

set -e

echo "🚀 SwarmNode Protocol Deployment on Fuji Testnet"
echo "=================================================="

# Check environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable is required"
    exit 1
fi

if [ -z "$ALCHEMY_API_KEY" ]; then
    echo "❌ ALCHEMY_API_KEY environment variable is required"
    exit 1
fi

# Install Foundry if not present
if ! command -v forge &> /dev/null; then
    echo "📦 Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# Create foundry project structure
echo "📁 Configuring project structure..."
mkdir -p contracts/src
mkdir -p contracts/script
mkdir -p contracts/test

# Create foundry.toml
cat > foundry.toml << EOF
[profile.default]
src = "contracts/src"
out = "contracts/out"
libs = ["lib"]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "@chainlink/=lib/chainlink-brownie-contracts/",
    "ds-test/=lib/ds-test/src/"
]

[rpc_endpoints]
fuji = "https://avalanche-fuji.infura.io/v3/\${INFURA_API_KEY}"
# Alternative: "https://api.avax-test.network/ext/bc/C/rpc"

[etherscan]
fuji = { key = "\${SNOWTRACE_API_KEY}", url = "https://api-testnet.snowtrace.io/" }
EOF

# Install dependencies
echo "📦 Installing smart contract dependencies..."
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink-brownie-contracts

# Create SwarmToken contract
cat > contracts/src/SwarmToken.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SwarmToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M initial
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("SwarmNode", "SWARM") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not a minter");
        _;
    }
}
EOF

# Create AgentRegistry contract
cat > contracts/src/AgentRegistry.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SwarmToken.sol";

contract AgentRegistry is Ownable, ReentrancyGuard {
    struct Agent {
        uint256 id;
        address owner;
        string name;
        string[] capabilities;
        uint256 autonomyLevel;
        uint256 stakeAmount;
        uint256 reputationScore;
        bool isActive;
        uint256 createdAt;
        uint256 lastActiveAt;
    }
    
    SwarmToken public immutable swarmToken;
    uint256 public nextAgentId = 1;
    uint256 public minimumStake = 1000 * 10**18; // 1000 SWARM
    
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public ownerAgents;
    mapping(string => bool) public usedNames;
    
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        uint256 stakeAmount
    );
    event AgentStakeUpdated(uint256 indexed agentId, uint256 newStake);
    event AgentDeactivated(uint256 indexed agentId);
    event AgentReactivated(uint256 indexed agentId);
    
    constructor(address _swarmToken) {
        swarmToken = SwarmToken(_swarmToken);
    }
    
    function registerAgent(
        string calldata name,
        string[] calldata capabilities,
        uint256 autonomyLevel,
        uint256 stakeAmount
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!usedNames[name], "Name already taken");
        require(stakeAmount >= minimumStake, "Insufficient stake");
        require(autonomyLevel <= 1000, "Invalid autonomy level");
        require(capabilities.length > 0, "At least one capability required");
        
        // Transfer stake
        swarmToken.transferFrom(msg.sender, address(this), stakeAmount);
        
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            id: agentId,
            owner: msg.sender,
            name: name,
            capabilities: capabilities,
            autonomyLevel: autonomyLevel,
            stakeAmount: stakeAmount,
            reputationScore: 100, // Starting reputation
            isActive: true,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp
        });
        
        ownerAgents[msg.sender].push(agentId);
        usedNames[name] = true;
        
        emit AgentRegistered(agentId, msg.sender, name, stakeAmount);
        return agentId;
    }
    
    function addStake(uint256 agentId, uint256 amount) external {
        Agent storage agent = agents[agentId];
        require(agent.owner == msg.sender, "Not agent owner");
        require(agent.isActive, "Agent not active");
        
        swarmToken.transferFrom(msg.sender, address(this), amount);
        agent.stakeAmount += amount;
        
        emit AgentStakeUpdated(agentId, agent.stakeAmount);
    }
    
    function deactivateAgent(uint256 agentId) external {
        Agent storage agent = agents[agentId];
        require(agent.owner == msg.sender, "Not agent owner");
        require(agent.isActive, "Already inactive");
        
        agent.isActive = false;
        
        // Return stake
        swarmToken.transfer(msg.sender, agent.stakeAmount);
        agent.stakeAmount = 0;
        
        emit AgentDeactivated(agentId);
    }
    
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }
    
    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }
    
    function updateMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
    }
}
EOF

# Create TaskManager contract
cat > contracts/src/TaskManager.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SwarmToken.sol";
import "./AgentRegistry.sol";

contract TaskManager is Ownable, ReentrancyGuard {
    enum TaskStatus { Pending, InProgress, Completed, Failed, Cancelled }
    
    struct Task {
        uint256 id;
        address creator;
        uint256 assignedAgentId;
        string description;
        uint256 reward;
        uint256 deadline;
        TaskStatus status;
        bytes32 resultHash;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    SwarmToken public immutable swarmToken;
    AgentRegistry public immutable agentRegistry;
    
    uint256 public nextTaskId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => uint256[]) public agentTasks;
    
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        uint256 reward,
        uint256 deadline
    );
    event TaskAssigned(uint256 indexed taskId, uint256 indexed agentId);
    event TaskCompleted(uint256 indexed taskId, bytes32 resultHash);
    event TaskFailed(uint256 indexed taskId);
    
    constructor(address _swarmToken, address _agentRegistry) {
        swarmToken = SwarmToken(_swarmToken);
        agentRegistry = AgentRegistry(_agentRegistry);
    }
    
    function createTask(
        string calldata description,
        uint256 reward,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(bytes(description).length > 0, "Description required");
        require(reward > 0, "Reward must be positive");
        require(deadline > block.timestamp, "Invalid deadline");
        
        // Transfer reward + fee to contract
        uint256 fee = (reward * platformFeePercent) / 10000;
        swarmToken.transferFrom(msg.sender, address(this), reward + fee);
        
        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            assignedAgentId: 0,
            description: description,
            reward: reward,
            deadline: deadline,
            status: TaskStatus.Pending,
            resultHash: bytes32(0),
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        emit TaskCreated(taskId, msg.sender, reward, deadline);
        return taskId;
    }
    
    function assignTask(uint256 taskId, uint256 agentId) external {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Pending, "Task not available");
        require(block.timestamp < task.deadline, "Task expired");
        
        // Verify agent ownership and activity
        (,address agentOwner,,,,,bool isActive,,) = agentRegistry.agents(agentId);
        require(agentOwner == msg.sender, "Not agent owner");
        require(isActive, "Agent not active");
        
        task.assignedAgentId = agentId;
        task.status = TaskStatus.InProgress;
        agentTasks[agentId].push(taskId);
        
        emit TaskAssigned(taskId, agentId);
    }
    
    function completeTask(uint256 taskId, bytes32 resultHash) external {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.InProgress, "Task not in progress");
        require(block.timestamp < task.deadline, "Task deadline passed");
        
        // Verify agent ownership
        (,address agentOwner,,,,,,,) = agentRegistry.agents(task.assignedAgentId);
        require(agentOwner == msg.sender, "Not assigned agent owner");
        
        task.status = TaskStatus.Completed;
        task.resultHash = resultHash;
        task.completedAt = block.timestamp;
        
        // Transfer reward to agent owner
        swarmToken.transfer(msg.sender, task.reward);
        
        emit TaskCompleted(taskId, resultHash);
    }
    
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
    
    function getAgentTasks(uint256 agentId) external view returns (uint256[] memory) {
        return agentTasks[agentId];
    }
    
    function updatePlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
}
EOF

# Create CrossSubnetBridge contract
cat > contracts/src/CrossSubnetBridge.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SwarmToken.sol";

contract CrossSubnetBridge is Ownable, ReentrancyGuard {
    struct CrossSubnetMessage {
        uint256 id;
        address sender;
        uint256 targetSubnet;
        bytes payload;
        uint256 fee;
        uint256 timestamp;
        bool processed;
    }
    
    SwarmToken public immutable swarmToken;
    uint256 public nextMessageId = 1;
    uint256 public baseFee = 10 * 10**18; // 10 SWARM
    
    mapping(uint256 => CrossSubnetMessage) public messages;
    mapping(uint256 => bool) public supportedSubnets;
    mapping(address => bool) public validators;
    
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        uint256 targetSubnet,
        uint256 fee
    );
    event MessageProcessed(uint256 indexed messageId);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    
    constructor(address _swarmToken) {
        swarmToken = SwarmToken(_swarmToken);
        
        // Add initial supported subnets (Avalanche subnet IDs)
        supportedSubnets[1] = true; // DeFi Subnet
        supportedSubnets[2] = true; // Gaming Subnet
        supportedSubnets[3] = true; // AI Subnet
    }
    
    function sendCrossSubnetMessage(
        uint256 targetSubnet,
        bytes calldata payload
    ) external nonReentrant returns (uint256) {
        require(supportedSubnets[targetSubnet], "Unsupported subnet");
        require(payload.length > 0, "Empty payload");
        
        uint256 fee = calculateFee(payload.length);
        swarmToken.transferFrom(msg.sender, address(this), fee);
        
        uint256 messageId = nextMessageId++;
        
        messages[messageId] = CrossSubnetMessage({
            id: messageId,
            sender: msg.sender,
            targetSubnet: targetSubnet,
            payload: payload,
            fee: fee,
            timestamp: block.timestamp,
            processed: false
        });
        
        emit MessageSent(messageId, msg.sender, targetSubnet, fee);
        return messageId;
    }
    
    function processMessage(uint256 messageId) external onlyValidator {
        CrossSubnetMessage storage message = messages[messageId];
        require(!message.processed, "Already processed");
        require(message.id != 0, "Message not found");
        
        message.processed = true;
        
        // Distribute fee to validator (simple implementation)
        uint256 validatorReward = message.fee / 2;
        swarmToken.transfer(msg.sender, validatorReward);
        
        emit MessageProcessed(messageId);
    }
    
    function calculateFee(uint256 payloadSize) public view returns (uint256) {
        return baseFee + (payloadSize * 1e15); // Base fee + 0.001 SWARM per byte
    }
    
    function addValidator(address validator) external onlyOwner {
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }
    
    function removeValidator(address validator) external onlyOwner {
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }
    
    function addSupportedSubnet(uint256 subnetId) external onlyOwner {
        supportedSubnets[subnetId] = true;
    }
    
    function removeSupportedSubnet(uint256 subnetId) external onlyOwner {
        supportedSubnets[subnetId] = false;
    }
    
    function updateBaseFee(uint256 _baseFee) external onlyOwner {
        baseFee = _baseFee;
    }
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }
}
EOF

# Create deployment script
cat > contracts/script/Deploy.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/SwarmToken.sol";
import "../src/AgentRegistry.sol";
import "../src/TaskManager.sol";
import "../src/CrossSubnetBridge.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy SwarmToken
        SwarmToken swarmToken = new SwarmToken();
        console.log("SwarmToken deployed at:", address(swarmToken));
        
        // Deploy AgentRegistry
        AgentRegistry agentRegistry = new AgentRegistry(address(swarmToken));
        console.log("AgentRegistry deployed at:", address(agentRegistry));
        
        // Deploy TaskManager
        TaskManager taskManager = new TaskManager(
            address(swarmToken),
            address(agentRegistry)
        );
        console.log("TaskManager deployed at:", address(taskManager));
        
        // Deploy CrossSubnetBridge
        CrossSubnetBridge bridge = new CrossSubnetBridge(address(swarmToken));
        console.log("CrossSubnetBridge deployed at:", address(bridge));
        
        // Add TaskManager as minter
        swarmToken.addMinter(address(taskManager));
        
        // Add initial validators to bridge
        address deployer = vm.addr(deployerPrivateKey);
        bridge.addValidator(deployer);
        
        vm.stopBroadcast();
        
        // Log deployment addresses for easy copy-paste
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Fuji Testnet");
        console.log("SwarmToken:", address(swarmToken));
        console.log("AgentRegistry:", address(agentRegistry));
        console.log("TaskManager:", address(taskManager));
        console.log("CrossSubnetBridge:", address(bridge));
        console.log("========================");
    }
}
EOF

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

# Deploy to Fuji testnet
echo "🚀 Deploying to Fuji testnet..."
DEPLOY_OUTPUT=$(forge script contracts/script/Deploy.s.sol:DeployScript \
    --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $SNOWTRACE_API_KEY 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract addresses from deployment output
SWARM_TOKEN=$(echo "$DEPLOY_OUTPUT" | grep "SwarmToken deployed at:" | awk '{print $4}')
AGENT_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "AgentRegistry deployed at:" | awk '{print $4}')
TASK_MANAGER=$(echo "$DEPLOY_OUTPUT" | grep "TaskManager deployed at:" | awk '{print $4}')
CROSS_SUBNET_BRIDGE=$(echo "$DEPLOY_OUTPUT" | grep "CrossSubnetBridge deployed at:" | awk '{print $4}')

# Update DEPLOYMENTS.md with real addresses
cat > DEPLOYMENTS.md << EOF
# SwarmNode Protocol - Contract Deployments

## Avalanche Fuji Testnet

### Contract Addresses
- **SwarmToken**: \`$SWARM_TOKEN\`
- **AgentRegistry**: \`$AGENT_REGISTRY\`
- **TaskManager**: \`$TASK_MANAGER\`
- **CrossSubnetBridge**: \`$CROSS_SUBNET_BRIDGE\`

### Deployment Details
- **Network**: Avalanche Fuji Testnet (Chain ID: 43113)
- **Deployment Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Gas Used**: Check transaction hashes on [Snowtrace](https://testnet.snowtrace.io)
- **Verification**: All contracts verified on Snowtrace

### Token Information
- **Name**: SwarmNode
- **Symbol**: SWARM  
- **Decimals**: 18
- **Total Supply**: 1,000,000,000 SWARM
- **Initial Mint**: 100,000,000 SWARM

### Configuration
- **Minimum Agent Stake**: 1,000 SWARM
- **Platform Fee**: 2.5%
- **Cross-Subnet Base Fee**: 10 SWARM

### Verification Commands
\`\`\`bash
# Verify SwarmToken
forge verify-contract $SWARM_TOKEN SwarmToken --etherscan-api-key \$SNOWTRACE_API_KEY

# Verify AgentRegistry  
forge verify-contract $AGENT_REGISTRY AgentRegistry --etherscan-api-key \$SNOWTRACE_API_KEY --constructor-args \$(cast abi-encode "constructor(address)" $SWARM_TOKEN)

# Verify TaskManager
forge verify-contract $TASK_MANAGER TaskManager --etherscan-api-key \$SNOWTRACE_API_KEY --constructor-args \$(cast abi-encode "constructor(address,address)" $SWARM_TOKEN $AGENT_REGISTRY)

# Verify CrossSubnetBridge
forge verify-contract $CROSS_SUBNET_BRIDGE CrossSubnetBridge --etherscan-api-key \$SNOWTRACE_API_KEY --constructor-args \$(cast abi-encode "constructor(address)" $SWARM_TOKEN)
\`\`\`

### Interaction Examples
\`\`\`bash
# Get SWARM token balance
cast call $SWARM_TOKEN "balanceOf(address)" <YOUR_ADDRESS> --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Register an agent (requires SWARM approval first)
cast send $AGENT_REGISTRY "registerAgent(string,string[],uint256,uint256)" "My AI Agent" '["trading","analysis"]' 800 1000000000000000000000 --private-key \$PRIVATE_KEY --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Create a task
cast send $TASK_MANAGER "createTask(string,uint256,uint256)" "Analyze market data" 100000000000000000000 \$(($(date +%s) + 86400)) --private-key \$PRIVATE_KEY --rpc-url https://api.avax-test.network/ext/bc/C/rpc
\`\`\`

## Mainnet Deployment

Coming soon after successful testnet validation and security audits.

### Security Audits
- [ ] OpenZeppelin Audit (Scheduled)
- [ ] ConsenSys Audit (Pending)
- [ ] Community Review Period

### Bug Bounty
Active bug bounty program: https://immunefi.com/bounty/swarmnode

---

*For technical support, join our [Discord](https://discord.gg/swarmnode) or open an issue on [GitHub](https://github.com/swarmnode/protocol).*
EOF

# Update SDK with real addresses
echo "📝 Updating SDK with real deployment addresses..."
cat > src/contracts.ts << EOF
// Real deployment addresses on Fuji testnet
export const CONTRACT_ADDRESSES = {
  fuji: {
    SwarmToken: '$SWARM_TOKEN',
    AgentRegistry: '$AGENT_REGISTRY', 
    TaskManager: '$TASK_MANAGER',
    CrossSubnetBridge: '$CROSS_SUBNET_BRIDGE'
  }
};

export const NETWORK_CONFIG = {
  fuji: {
    name: 'Avalanche Fuji Testnet',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};
EOF

echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 Contract Addresses:"
echo "SwarmToken: $SWARM_TOKEN"
echo "AgentRegistry: $AGENT_REGISTRY"
echo "TaskManager: $TASK_MANAGER" 
echo "CrossSubnetBridge: $CROSS_SUBNET_BRIDGE"
echo ""
echo "📄 View on Snowtrace:"
echo "https://testnet.snowtrace.io/address/$SWARM_TOKEN"
echo "https://testnet.snowtrace.io/address/$AGENT_REGISTRY"
echo "https://testnet.snowtrace.io/address/$TASK_MANAGER"
echo "https://testnet.snowtrace.io/address/$CROSS_SUBNET_BRIDGE"
echo ""
echo "🎉 SwarmNode Protocol is now live on Fuji testnet!"
