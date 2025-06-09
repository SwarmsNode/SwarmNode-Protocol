// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CrossSubnetBridge.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossSubnetAgent
 * @dev Base contract for AI agents that operate across multiple Avalanche subnets
 */
contract CrossSubnetAgent is Ownable {
    CrossSubnetBridge public immutable bridge;
    
    struct SubnetConfig {
        bytes32 subnetId;
        address agentAddress;
        uint256 gasLimit;
        bool isActive;
    }
    
    struct AgentState {
        uint256 lastUpdate;
        bytes32 stateHash;
        mapping(string => bytes) variables;
    }
    
    mapping(bytes32 => SubnetConfig) public subnetConfigs;
    mapping(bytes32 => AgentState) public subnetStates;
    bytes32[] public supportedSubnets;
    
    event StateSync(bytes32 indexed subnetId, bytes32 stateHash);
    event CrossSubnetExecution(bytes32 indexed subnetId, string action);
    event AgentMigration(bytes32 indexed fromSubnet, bytes32 indexed toSubnet);
    
    modifier onlyBridge() {
        require(msg.sender == address(bridge), "Only bridge can call");
        _;
    }
    
    constructor(address _bridge) {
        bridge = CrossSubnetBridge(_bridge);
    }
    
    /**
     * @dev Configure agent for specific subnet
     */
    function configureSubnet(
        bytes32 subnetId,
        address agentAddress,
        uint256 gasLimit
    ) external onlyOwner {
        subnetConfigs[subnetId] = SubnetConfig({
            subnetId: subnetId,
            agentAddress: agentAddress,
            gasLimit: gasLimit,
            isActive: true
        });
        
        supportedSubnets.push(subnetId);
        bridge.registerAgent(subnetId, agentAddress);
    }
    
    /**
     * @dev Execute action on specific subnet
     */
    function executeOnSubnet(
        bytes32 subnetId,
        string calldata action,
        bytes calldata params
    ) external payable onlyOwner {
        require(subnetConfigs[subnetId].isActive, "Subnet not configured");
        
        bytes memory payload = abi.encode(action, params, block.timestamp);
        
        bridge.sendCrossSubnetMessage{value: msg.value}(
            subnetId,
            subnetConfigs[subnetId].agentAddress,
            payload
        );
        
        emit CrossSubnetExecution(subnetId, action);
    }
    
    /**
     * @dev Receive message from other subnet
     */
    function receiveMessage(
        address sourceAgent,
        bytes32 sourceSubnetId,
        bytes calldata payload
    ) external onlyBridge {
        (string memory action, bytes memory params, uint256 timestamp) = 
            abi.decode(payload, (string, bytes, uint256));
        
        _handleCrossSubnetAction(sourceSubnetId, action, params, timestamp);
    }
    
    /**
     * @dev Synchronize state across all subnets
     */
    function syncState() external onlyOwner {
        bytes32 currentStateHash = _getCurrentStateHash();
        
        for (uint i = 0; i < supportedSubnets.length; i++) {
            bytes32 subnetId = supportedSubnets[i];
            if (subnetConfigs[subnetId].isActive) {
                bytes memory syncPayload = abi.encode("STATE_SYNC", currentStateHash);
                
                bridge.sendCrossSubnetMessage(
                    subnetId,
                    subnetConfigs[subnetId].agentAddress,
                    syncPayload
                );
                
                subnetStates[subnetId].lastUpdate = block.timestamp;
                subnetStates[subnetId].stateHash = currentStateHash;
                
                emit StateSync(subnetId, currentStateHash);
            }
        }
    }
    
    /**
     * @dev Migrate agent to different subnet
     */
    function migrateToSubnet(bytes32 targetSubnetId) external onlyOwner {
        require(subnetConfigs[targetSubnetId].isActive, "Target subnet not configured");
        
        // Prepare migration data
        bytes memory migrationData = abi.encode(
            "MIGRATE",
            _getCurrentStateHash(),
            _getAgentData()
        );
        
        bridge.sendCrossSubnetMessage(
            targetSubnetId,
            subnetConfigs[targetSubnetId].agentAddress,
            migrationData
        );
    }
    
    /**
     * @dev Handle actions from other subnets
     */
    function _handleCrossSubnetAction(
        bytes32 sourceSubnetId,
        string memory action,
        bytes memory params,
        uint256 timestamp
    ) internal virtual {
        if (keccak256(bytes(action)) == keccak256(bytes("STATE_SYNC"))) {
            bytes32 newStateHash = abi.decode(params, (bytes32));
            subnetStates[sourceSubnetId].stateHash = newStateHash;
            subnetStates[sourceSubnetId].lastUpdate = timestamp;
        }
        // Additional action handlers can be implemented by inheriting contracts
    }
    
    /**
     * @dev Get current state hash
     */
    function _getCurrentStateHash() internal view virtual returns (bytes32) {
        return keccak256(abi.encode(block.timestamp, address(this)));
    }
    
    /**
     * @dev Get agent data for migration
     */
    function _getAgentData() internal view virtual returns (bytes memory) {
        return abi.encode(owner(), supportedSubnets.length);
    }
    
    /**
     * @dev Get supported subnets count
     */
    function getSupportedSubnetsCount() external view returns (uint256) {
        return supportedSubnets.length;
    }
}
