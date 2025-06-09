// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SwarmToken.sol";

/**
 * @title AgentRegistry
 * @dev Core registry for managing AI agents on the SwarmNode Protocol
 * @author SwarmNode Protocol Team
 */
contract AgentRegistry is Ownable, ReentrancyGuard, Pausable {
    SwarmToken public immutable swarmToken;
    
    // Agent structure
    struct Agent {
        address owner;
        string name;
        string description;
        string[] capabilities;
        uint256 autonomyLevel; // 0-1000 (0-100%)
        uint256 rewardThreshold;
        uint256 totalRewards;
        uint256 deploymentTime;
        AgentStatus status;
        string metadataURI;
    }
    
    enum AgentStatus {
        Active,
        Inactive,
        Suspended,
        Terminated
    }
    
    // State variables
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public ownerAgents;
    mapping(string => bool) public nameExists;
    
    uint256 public nextAgentId = 1;
    uint256 public deploymentFee = 1 ether; // 1 SWARM token
    uint256 public protocolFeePercentage = 250; // 2.5%
    uint256 public totalAgents;
    uint256 public activeAgents;
    
    // Communication system
    mapping(uint256 => mapping(uint256 => bool)) public agentConnections;
    mapping(uint256 => uint256[]) public agentNetwork;
    
    // Events
    event AgentDeployed(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        uint256 autonomyLevel
    );
    event AgentStatusChanged(uint256 indexed agentId, AgentStatus status);
    event AgentReward(uint256 indexed agentId, uint256 amount);
    event AgentConnection(uint256 indexed fromAgent, uint256 indexed toAgent);
    event AgentDisconnection(uint256 indexed fromAgent, uint256 indexed toAgent);
    
    // Modifiers
    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }
    
    modifier validAgent(uint256 agentId) {
        require(agentId < nextAgentId && agentId > 0, "Invalid agent ID");
        _;
    }
    
    constructor(address _swarmToken) {
        swarmToken = SwarmToken(_swarmToken);
    }
    
    /**
     * @dev Deploy a new AI agent
     */
    function deployAgent(
        string memory name,
        string memory description,
        string[] memory capabilities,
        uint256 autonomyLevel,
        uint256 rewardThreshold,
        string memory metadataURI
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!nameExists[name], "Name already exists");
        require(autonomyLevel <= 1000, "Invalid autonomy level");
        require(capabilities.length > 0, "Must have at least one capability");
        
        // Transfer deployment fee
        require(
            swarmToken.transferFrom(msg.sender, address(this), deploymentFee),
            "Fee transfer failed"
        );
        
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            owner: msg.sender,
            name: name,
            description: description,
            capabilities: capabilities,
            autonomyLevel: autonomyLevel,
            rewardThreshold: rewardThreshold,
            totalRewards: 0,
            deploymentTime: block.timestamp,
            status: AgentStatus.Active,
            metadataURI: metadataURI
        });
        
        ownerAgents[msg.sender].push(agentId);
        nameExists[name] = true;
        totalAgents++;
        activeAgents++;
        
        emit AgentDeployed(agentId, msg.sender, name, autonomyLevel);
        
        return agentId;
    }
    
    /**
     * @dev Connect two agents for communication
     */
    function connectAgents(uint256 fromAgent, uint256 toAgent) 
        external 
        onlyAgentOwner(fromAgent) 
        validAgent(fromAgent) 
        validAgent(toAgent) 
    {
        require(fromAgent != toAgent, "Cannot connect to self");
        require(!agentConnections[fromAgent][toAgent], "Already connected");
        require(agents[fromAgent].status == AgentStatus.Active, "Agent not active");
        require(agents[toAgent].status == AgentStatus.Active, "Target agent not active");
        
        agentConnections[fromAgent][toAgent] = true;
        agentNetwork[fromAgent].push(toAgent);
        
        emit AgentConnection(fromAgent, toAgent);
    }
    
    /**
     * @dev Disconnect two agents
     */
    function disconnectAgents(uint256 fromAgent, uint256 toAgent) 
        external 
        onlyAgentOwner(fromAgent) 
        validAgent(fromAgent) 
        validAgent(toAgent) 
    {
        require(agentConnections[fromAgent][toAgent], "Not connected");
        
        agentConnections[fromAgent][toAgent] = false;
        
        // Remove from network array
        uint256[] storage network = agentNetwork[fromAgent];
        for (uint256 i = 0; i < network.length; i++) {
            if (network[i] == toAgent) {
                network[i] = network[network.length - 1];
                network.pop();
                break;
            }
        }
        
        emit AgentDisconnection(fromAgent, toAgent);
    }
    
    /**
     * @dev Reward an agent for successful task completion
     */
    function rewardAgent(uint256 agentId, uint256 amount) 
        external 
        onlyOwner 
        validAgent(agentId) 
    {
        require(agents[agentId].status == AgentStatus.Active, "Agent not active");
        require(amount > 0, "Reward must be positive");
        
        agents[agentId].totalRewards += amount;
        
        // Transfer reward to agent owner
        require(
            swarmToken.transfer(agents[agentId].owner, amount),
            "Reward transfer failed"
        );
        
        emit AgentReward(agentId, amount);
    }
    
    /**
     * @dev Change agent status
     */
    function setAgentStatus(uint256 agentId, AgentStatus status) 
        external 
        onlyAgentOwner(agentId) 
        validAgent(agentId) 
    {
        AgentStatus oldStatus = agents[agentId].status;
        agents[agentId].status = status;
        
        // Update active count
        if (oldStatus == AgentStatus.Active && status != AgentStatus.Active) {
            activeAgents--;
        } else if (oldStatus != AgentStatus.Active && status == AgentStatus.Active) {
            activeAgents++;
        }
        
        emit AgentStatusChanged(agentId, status);
    }
    
    /**
     * @dev Get agent network connections
     */
    function getAgentNetwork(uint256 agentId) 
        external 
        view 
        validAgent(agentId) 
        returns (uint256[] memory) 
    {
        return agentNetwork[agentId];
    }
    
    /**
     * @dev Get agents owned by address
     */
    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }
    
    /**
     * @dev Get agent capabilities
     */
    function getAgentCapabilities(uint256 agentId) 
        external 
        view 
        validAgent(agentId) 
        returns (string[] memory) 
    {
        return agents[agentId].capabilities;
    }
    
    /**
     * @dev Update deployment fee (onlyOwner)
     */
    function setDeploymentFee(uint256 newFee) external onlyOwner {
        deploymentFee = newFee;
    }
    
    /**
     * @dev Update protocol fee percentage (onlyOwner)
     */
    function setProtocolFeePercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 1000, "Fee too high"); // Max 10%
        protocolFeePercentage = newPercentage;
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = swarmToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(swarmToken.transfer(owner(), balance), "Withdrawal failed");
    }
}
