// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ITeleporterMessenger.sol";
import "./interfaces/ITeleporterReceiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CrossSubnetBridge
 * @dev Enables AI agents to communicate and transfer state across Avalanche subnets
 */
contract CrossSubnetBridge is ITeleporterReceiver, Ownable, ReentrancyGuard {
    ITeleporterMessenger public immutable teleporterMessenger;
    
    struct AgentMessage {
        address sourceAgent;
        address targetAgent;
        bytes32 subnetId;
        bytes payload;
        uint256 timestamp;
    }
    
    struct CrossSubnetAgent {
        address mainnetAddress;
        mapping(bytes32 => address) subnetAddresses;
        bool isActive;
        uint256 lastSync;
    }
    
    mapping(address => CrossSubnetAgent) public agents;
    mapping(bytes32 => bool) public supportedSubnets;
    mapping(bytes32 => uint256) public messageNonces;
    
    event AgentRegistered(address indexed agent, bytes32 indexed subnetId);
    event CrossSubnetMessage(address indexed from, address indexed to, bytes32 indexed subnetId);
    event SubnetAdded(bytes32 indexed subnetId);
    
    constructor(address _teleporterMessenger) {
        teleporterMessenger = ITeleporterMessenger(_teleporterMessenger);
    }
    
    /**
     * @dev Register an agent for cross-subnet operations
     */
    function registerAgent(bytes32 subnetId, address subnetAddress) external {
        require(supportedSubnets[subnetId], "Subnet not supported");
        
        agents[msg.sender].mainnetAddress = msg.sender;
        agents[msg.sender].subnetAddresses[subnetId] = subnetAddress;
        agents[msg.sender].isActive = true;
        agents[msg.sender].lastSync = block.timestamp;
        
        emit AgentRegistered(msg.sender, subnetId);
    }
    
    /**
     * @dev Send message to agent on different subnet
     */
    function sendCrossSubnetMessage(
        bytes32 targetSubnetId,
        address targetAgent,
        bytes calldata payload
    ) external payable nonReentrant {
        require(agents[msg.sender].isActive, "Agent not registered");
        require(supportedSubnets[targetSubnetId], "Target subnet not supported");
        
        AgentMessage memory message = AgentMessage({
            sourceAgent: msg.sender,
            targetAgent: targetAgent,
            subnetId: targetSubnetId,
            payload: payload,
            timestamp: block.timestamp
        });
        
        bytes memory encodedMessage = abi.encode(message);
        
        teleporterMessenger.sendCrossChainMessage{value: msg.value}(
            TeleporterMessageInput({
                destinationBlockchainID: targetSubnetId,
                destinationAddress: address(this),
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: 500000,
                allowedRelayerAddresses: new address[](0),
                message: encodedMessage
            })
        );
        
        emit CrossSubnetMessage(msg.sender, targetAgent, targetSubnetId);
    }
    
    /**
     * @dev Receive message from Teleporter (cross-subnet)
     */
    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        require(msg.sender == address(teleporterMessenger), "Only Teleporter");
        
        AgentMessage memory agentMessage = abi.decode(message, (AgentMessage));
        
        // Forward message to target agent
        (bool success,) = agentMessage.targetAgent.call(
            abi.encodeWithSignature(
                "receiveMessage(address,bytes32,bytes)",
                agentMessage.sourceAgent,
                sourceBlockchainID,
                agentMessage.payload
            )
        );
        
        require(success, "Message delivery failed");
    }
    
    /**
     * @dev Add supported subnet
     */
    function addSubnet(bytes32 subnetId) external onlyOwner {
        supportedSubnets[subnetId] = true;
        emit SubnetAdded(subnetId);
    }
    
    /**
     * @dev Get agent's subnet address
     */
    function getAgentSubnetAddress(address agent, bytes32 subnetId) 
        external 
        view 
        returns (address) 
    {
        return agents[agent].subnetAddresses[subnetId];
    }
}
