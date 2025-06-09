// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AgentRegistry.sol";

/**
 * @title TaskManager
 * @dev Manages task creation, assignment, and execution for AI agents
 * @author SwarmNode Protocol Team
 */
contract TaskManager is Ownable, ReentrancyGuard {
    AgentRegistry public immutable agentRegistry;
    SwarmToken public immutable swarmToken;
   
    
    struct Task {
        uint256 id;
        address creator;
        string description;
        string[] requiredCapabilities;
        uint256 reward;
        uint256 deadline;
        uint256 assignedAgent;
        TaskStatus status;
        bytes result;
        uint256 creationTime;
        uint256 completionTime;
    }
    
    enum TaskStatus {
        Open,
        Assigned,
        InProgress,
        Completed,
        Failed,
        Cancelled
    }
    
    // State variables
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => uint256[]) public agentTasks; // agentId => taskIds
    mapping(address => uint256[]) public creatorTasks;
    
    uint256 public nextTaskId = 1;
    uint256 public totalTasks;
    uint256 public completedTasks;
    uint256 public minTaskReward = 0.1 ether; // 0.1 SWARM
    
    // Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        uint256 reward,
        uint256 deadline
    );
    event TaskAssigned(uint256 indexed taskId, uint256 indexed agentId);
    event TaskCompleted(uint256 indexed taskId, uint256 indexed agentId);
    event TaskFailed(uint256 indexed taskId, uint256 indexed agentId);
    event TaskCancelled(uint256 indexed taskId);
    
    // Modifiers
    modifier validTask(uint256 taskId) {
        require(taskId < nextTaskId && taskId > 0, "Invalid task ID");
        _;
    }
    
    modifier onlyTaskCreator(uint256 taskId) {
        require(tasks[taskId].creator == msg.sender, "Not task creator");
        _;
    }
    
    constructor(address _agentRegistry, address _swarmToken) {
        agentRegistry = AgentRegistry(_agentRegistry);
        swarmToken = SwarmToken(_swarmToken);
    }
    
    /**
     * @dev Create a new task
     */
    function createTask(
        string memory description,
        string[] memory requiredCapabilities,
        uint256 reward,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(reward >= minTaskReward, "Reward too low");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(requiredCapabilities.length > 0, "Must specify capabilities");
        
        // Transfer reward to contract
        require(
            swarmToken.transferFrom(msg.sender, address(this), reward),
            "Reward transfer failed"
        );
        
        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            description: description,
            requiredCapabilities: requiredCapabilities,
            reward: reward,
            deadline: deadline,
            assignedAgent: 0,
            status: TaskStatus.Open,
            result: "",
            creationTime: block.timestamp,
            completionTime: 0
        });
        
        creatorTasks[msg.sender].push(taskId);
        totalTasks++;
        
        emit TaskCreated(taskId, msg.sender, reward, deadline);
        
        return taskId;
    }
    
    /**
     * @dev Assign task to an agent
     */
    function assignTask(uint256 taskId, uint256 agentId) 
        external 
        validTask(taskId) 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "Task not available");
        require(block.timestamp < task.deadline, "Task deadline passed");
        
        // Verify agent exists and is active
        (address agentOwner,,,,,,,, AgentRegistry.AgentStatus status,) = 
            agentRegistry.agents(agentId);
        require(agentOwner == msg.sender, "Not agent owner");
        require(status == AgentRegistry.AgentStatus.Active, "Agent not active");
        
        // Verify agent has required capabilities
        string[] memory agentCapabilities = agentRegistry.getAgentCapabilities(agentId);
        require(hasRequiredCapabilities(agentCapabilities, task.requiredCapabilities), 
                "Agent lacks required capabilities");
        
        task.assignedAgent = agentId;
        task.status = TaskStatus.Assigned;
        agentTasks[agentId].push(taskId);
        
        emit TaskAssigned(taskId, agentId);
    }
    
    /**
     * @dev Start task execution
     */
    function startTask(uint256 taskId) 
        external 
        validTask(taskId) 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Assigned, "Task not assigned");
        require(block.timestamp < task.deadline, "Task deadline passed");
        
        // Verify caller owns assigned agent
        (address agentOwner,,,,,,,,, ) = agentRegistry.agents(task.assignedAgent);
        require(agentOwner == msg.sender, "Not assigned agent owner");
        
        task.status = TaskStatus.InProgress;
    }
    
    /**
     * @dev Complete a task and submit result
     */
    function completeTask(uint256 taskId, bytes memory result) 
        external 
        validTask(taskId) 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.InProgress, "Task not in progress");
        require(block.timestamp < task.deadline, "Task deadline passed");
        
        // Verify caller owns assigned agent
        (address agentOwner,,,,,,,,, ) = agentRegistry.agents(task.assignedAgent);
        require(agentOwner == msg.sender, "Not assigned agent owner");
        
        task.status = TaskStatus.Completed;
        task.result = result;
        task.completionTime = block.timestamp;
        completedTasks++;
        
        // Transfer reward to agent owner
        require(swarmToken.transfer(msg.sender, task.reward), "Reward transfer failed");
        
        emit TaskCompleted(taskId, task.assignedAgent);
    }
    
    /**
     * @dev Mark task as failed
     */
    function failTask(uint256 taskId) 
        external 
        validTask(taskId) 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.InProgress, "Task not in progress");
        
        // Verify caller owns assigned agent
        (address agentOwner,,,,,,,,, ) = agentRegistry.agents(task.assignedAgent);
        require(agentOwner == msg.sender, "Not assigned agent owner");
        
        task.status = TaskStatus.Failed;
        
        // Return reward to task creator
        require(swarmToken.transfer(task.creator, task.reward), "Refund transfer failed");
        
        emit TaskFailed(taskId, task.assignedAgent);
    }
    
    /**
     * @dev Cancel an open task
     */
    function cancelTask(uint256 taskId) 
        external 
        validTask(taskId) 
        onlyTaskCreator(taskId) 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "Cannot cancel assigned task");
        
        task.status = TaskStatus.Cancelled;
        
        // Return reward to creator
        require(swarmToken.transfer(task.creator, task.reward), "Refund transfer failed");
        
        emit TaskCancelled(taskId);
    }
    
    /**
     * @dev Get tasks created by address
     */
    function getCreatorTasks(address creator) external view returns (uint256[] memory) {
        return creatorTasks[creator];
    }
    
    /**
     * @dev Get tasks assigned to agent
     */
    function getAgentTasks(uint256 agentId) external view returns (uint256[] memory) {
        return agentTasks[agentId];
    }
    
    /**
     * @dev Get task required capabilities
     */
    function getTaskCapabilities(uint256 taskId) 
        external 
        view 
        validTask(taskId) 
        returns (string[] memory) 
    {
        return tasks[taskId].requiredCapabilities;
    }
    
    /**
     * @dev Check if agent has required capabilities
     */
    function hasRequiredCapabilities(
        string[] memory agentCapabilities,
        string[] memory requiredCapabilities
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < requiredCapabilities.length; i++) {
            bool hasCapability = false;
            for (uint256 j = 0; j < agentCapabilities.length; j++) {
                if (keccak256(bytes(requiredCapabilities[i])) == 
                    keccak256(bytes(agentCapabilities[j]))) {
                    hasCapability = true;
                    break;
                }
            }
            if (!hasCapability) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @dev Update minimum task reward
     */
    function setMinTaskReward(uint256 newMinReward) external onlyOwner {
        minTaskReward = newMinReward;
    }
    
    /**
     * @dev Emergency function to handle expired tasks
     */
    function handleExpiredTask(uint256 taskId) 
        external 
        onlyOwner 
        validTask(taskId) 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(block.timestamp >= task.deadline, "Task not expired");
        require(task.status == TaskStatus.InProgress || 
                task.status == TaskStatus.Assigned, "Invalid task status");
        
        task.status = TaskStatus.Failed;
        
        // Return reward to creator
        require(swarmToken.transfer(task.creator, task.reward), "Refund transfer failed");
        
        emit TaskFailed(taskId, task.assignedAgent);
    }
}
