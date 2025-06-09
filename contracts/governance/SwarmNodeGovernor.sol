// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title SwarmNodeGovernor
 * @dev Governance contract for SwarmNode Protocol
 * Enables token holders to propose and vote on protocol changes
 */
contract SwarmNodeGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("SwarmNodeGovernor")
        GovernorSettings(7200, 50400, 1000e18) // 1 day, 1 week, 1000 tokens
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    // Governance parameters
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Custom proposal types for SwarmNode Protocol
     */
    enum ProposalType {
        PARAMETER_CHANGE,
        AGENT_UPGRADE,
        FEE_STRUCTURE,
        TREASURY_ALLOCATION,
        EMERGENCY_ACTION
    }

    struct SwarmProposal {
        ProposalType proposalType;
        address proposer;
        uint256 createdAt;
        mapping(address => bool) hasVoted;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bytes executionData;
    }

    mapping(uint256 => SwarmProposal) public swarmProposals;
    
    event SwarmProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        address indexed proposer,
        string description
    );

    /**
     * @dev Create a SwarmNode-specific proposal
     */
    function createSwarmProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        ProposalType proposalType
    ) external returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        SwarmProposal storage proposal = swarmProposals[proposalId];
        proposal.proposalType = proposalType;
        proposal.proposer = msg.sender;
        proposal.createdAt = block.timestamp;

        emit SwarmProposalCreated(proposalId, proposalType, msg.sender, description);
        
        return proposalId;
    }

    /**
     * @dev Get proposal details
     */
    function getSwarmProposal(uint256 proposalId)
        external
        view
        returns (
            ProposalType proposalType,
            address proposer,
            uint256 createdAt,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            bool executed
        )
    {
        SwarmProposal storage proposal = swarmProposals[proposalId];
        return (
            proposal.proposalType,
            proposal.proposer,
            proposal.createdAt,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed
        );
    }
}
