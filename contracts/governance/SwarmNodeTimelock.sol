// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title SwarmNodeTimelock
 * @dev Timelock controller for SwarmNode Protocol governance
 * Ensures there's a delay between proposal execution
 */
contract SwarmNodeTimelock is TimelockController {
    // Roles
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    constructor(
        uint256 minDelay,        // 2 days minimum delay
        address[] memory proposers, // Governor contract
        address[] memory executors, // Can be empty to allow anyone
        address admin              // Should be governance contract
    ) TimelockController(minDelay, proposers, executors, admin) {}

    /**
     * @dev Emergency functions that can be called by admin
     */
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Implementation for emergency pause
        // This would interact with main protocol contracts
    }

    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Implementation for emergency unpause
    }

    /**
     * @dev Batch execute multiple operations
     */
    function batchExecute(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata payloads,
        bytes32[] calldata predecessors,
        bytes32[] calldata salts
    ) external {
        require(targets.length == values.length, "SwarmNodeTimelock: length mismatch");
        require(targets.length == payloads.length, "SwarmNodeTimelock: length mismatch");
        require(targets.length == predecessors.length, "SwarmNodeTimelock: length mismatch");
        require(targets.length == salts.length, "SwarmNodeTimelock: length mismatch");

        for (uint256 i = 0; i < targets.length; i++) {
            execute(targets[i], values[i], payloads[i], predecessors[i], salts[i]);
        }
    }

    /**
     * @dev Get minimum delay for proposals
     */
    function getMinDelay() external view returns (uint256) {
        return super.getMinDelay();
    }

    /**
     * @dev Update minimum delay (only through governance)
     */
    function updateDelay(uint256 newDelay) external onlyRole(TIMELOCK_ADMIN_ROLE) {
        super.updateDelay(newDelay);
    }
}
