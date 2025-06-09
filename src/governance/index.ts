import { ethers } from 'ethers';
import { SwarmNodeGovernor, SwarmNodeToken, SwarmNodeTimelock } from '../typechain-types';

export interface ProposalData {
  id: string;
  title: string;
  description: string;
  proposer: string;
  targets: string[];
  values: ethers.BigNumber[];
  calldatas: string[];
  startBlock: number;
  endBlock: number;
  forVotes: ethers.BigNumber;
  againstVotes: ethers.BigNumber;
  abstainVotes: ethers.BigNumber;
  status: ProposalStatus;
  proposalType: ProposalType;
  createdAt: Date;
  executedAt?: Date;
}


export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  DEFEATED = 'DEFEATED',
  SUCCEEDED = 'SUCCEEDED',
  QUEUED = 'QUEUED',
  EXPIRED = 'EXPIRED',
  EXECUTED = 'EXECUTED'
}

export enum ProposalType {
  PARAMETER_CHANGE = 0,
  AGENT_UPGRADE = 1,
  FEE_STRUCTURE = 2,
  TREASURY_ALLOCATION = 3,
  EMERGENCY_ACTION = 4
}

export class SwarmNodeGovernance {
  private governor: SwarmNodeGovernor;
  private token: SwarmNodeToken;
  private timelock: SwarmNodeTimelock;
  private provider: ethers.providers.Provider;

  constructor(
    governorAddress: string,
    tokenAddress: string,
    timelockAddress: string,
    provider: ethers.providers.Provider
  ) {
    this.provider = provider;
    // Contract instances would be initialized here
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    title: string,
    description: string,
    targets: string[],
    values: ethers.BigNumber[],
    calldatas: string[],
    proposalType: ProposalType,
    signer: ethers.Signer
  ): Promise<string> {
    const governorWithSigner = this.governor.connect(signer);
    
    const tx = await governorWithSigner.createSwarmProposal(
      targets,
      values,
      calldatas,
      `${title}\n\n${description}`,
      proposalType
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'ProposalCreated');
    
    return event?.args?.proposalId.toString() || '';
  }

  /**
   * Vote on a proposal
   */
  async vote(
    proposalId: string,
    support: 0 | 1 | 2, // 0 = against, 1 = for, 2 = abstain
    signer: ethers.Signer
  ): Promise<void> {
    const governorWithSigner = this.governor.connect(signer);
    await governorWithSigner.castVote(proposalId, support);
  }

  /**
   * Vote with reason
   */
  async voteWithReason(
    proposalId: string,
    support: 0 | 1 | 2,
    reason: string,
    signer: ethers.Signer
  ): Promise<void> {
    const governorWithSigner = this.governor.connect(signer);
    await governorWithSigner.castVoteWithReason(proposalId, support, reason);
  }

  /**
   * Queue a successful proposal
   */
  async queueProposal(
    targets: string[],
    values: ethers.BigNumber[],
    calldatas: string[],
    descriptionHash: string,
    signer: ethers.Signer
  ): Promise<void> {
    const governorWithSigner = this.governor.connect(signer);
    await governorWithSigner.queue(targets, values, calldatas, descriptionHash);
  }

  /**
   * Execute a queued proposal
   */
  async executeProposal(
    targets: string[],
    values: ethers.BigNumber[],
    calldatas: string[],
    descriptionHash: string,
    signer: ethers.Signer
  ): Promise<void> {
    const governorWithSigner = this.governor.connect(signer);
    await governorWithSigner.execute(targets, values, calldatas, descriptionHash);
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: string): Promise<ProposalData | null> {
    try {
      const proposalInfo = await this.governor.proposals(proposalId);
      const swarmProposal = await this.governor.getSwarmProposal(proposalId);
      const state = await this.governor.state(proposalId);

      return {
        id: proposalId,
        title: '', // Would need to parse from description
        description: '', // Would need to parse from description
        proposer: swarmProposal.proposer,
        targets: [], // Would need to fetch from events
        values: [], // Would need to fetch from events
        calldatas: [], // Would need to fetch from events
        startBlock: proposalInfo.voteStart.toNumber(),
        endBlock: proposalInfo.voteEnd.toNumber(),
        forVotes: swarmProposal.forVotes,
        againstVotes: swarmProposal.againstVotes,
        abstainVotes: swarmProposal.abstainVotes,
        status: this.mapProposalState(state),
        proposalType: swarmProposal.proposalType,
        createdAt: new Date(swarmProposal.createdAt.toNumber() * 1000),
        executedAt: swarmProposal.executed ? new Date() : undefined
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  /**
   * Get all proposals
   */
  async getAllProposals(): Promise<ProposalData[]> {
    // Implementation would fetch all proposal events and compile data
    const proposals: ProposalData[] = [];
    
    // Get ProposalCreated events
    const filter = this.governor.filters.SwarmProposalCreated();
    const events = await this.governor.queryFilter(filter);

    for (const event of events) {
      const proposalId = event.args?.proposalId.toString();
      if (proposalId) {
        const proposal = await this.getProposal(proposalId);
        if (proposal) {
          proposals.push(proposal);
        }
      }
    }

    return proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string, blockNumber?: number): Promise<ethers.BigNumber> {
    const currentBlock = blockNumber || await this.provider.getBlockNumber();
    return await this.token.getPastVotes(address, currentBlock - 1);
  }

  /**
   * Delegate voting power
   */
  async delegate(delegatee: string, signer: ethers.Signer): Promise<void> {
    const tokenWithSigner = this.token.connect(signer);
    await tokenWithSigner.delegate(delegatee);
  }

  /**
   * Get delegation info
   */
  async getDelegation(address: string): Promise<string> {
    return await this.token.delegates(address);
  }

  /**
   * Get governance parameters
   */
  async getGovernanceParams(): Promise<{
    votingDelay: number;
    votingPeriod: number;
    proposalThreshold: ethers.BigNumber;
    quorumFraction: number;
    timelockDelay: number;
  }> {
    const [votingDelay, votingPeriod, proposalThreshold, quorumFraction, timelockDelay] = 
      await Promise.all([
        this.governor.votingDelay(),
        this.governor.votingPeriod(),
        this.governor.proposalThreshold(),
        this.governor.quorumNumerator(),
        this.timelock.getMinDelay()
      ]);

    return {
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
      proposalThreshold,
      quorumFraction: quorumFraction.toNumber(),
      timelockDelay: timelockDelay.toNumber()
    };
  }

  /**
   * Check if address can propose
   */
  async canPropose(address: string): Promise<boolean> {
    const votingPower = await this.getVotingPower(address);
    const threshold = await this.governor.proposalThreshold();
    return votingPower.gte(threshold);
  }

  /**
   * Check if address has voted on proposal
   */
  async hasVoted(proposalId: string, address: string): Promise<boolean> {
    return await this.governor.hasVoted(proposalId, address);
  }

  /**
   * Get quorum for specific block
   */
  async getQuorum(blockNumber: number): Promise<ethers.BigNumber> {
    return await this.governor.quorum(blockNumber);
  }

  private mapProposalState(state: number): ProposalStatus {
    const states = [
      ProposalStatus.PENDING,
      ProposalStatus.ACTIVE,
      ProposalStatus.CANCELED,
      ProposalStatus.DEFEATED,
      ProposalStatus.SUCCEEDED,
      ProposalStatus.QUEUED,
      ProposalStatus.EXPIRED,
      ProposalStatus.EXECUTED
    ];
    return states[state] || ProposalStatus.PENDING;
  }
}

// Proposal templates
export const ProposalTemplates = {
  /**
   * Parameter change proposal
   */
  parameterChange: (
    parameterName: string,
    oldValue: string,
    newValue: string,
    reasoning: string
  ) => ({
    title: `Change ${parameterName} Parameter`,
    description: `
# Parameter Change Proposal

## Summary
This proposal changes the ${parameterName} parameter from ${oldValue} to ${newValue}.

## Reasoning
${reasoning}

## Impact
- Current value: ${oldValue}
- Proposed value: ${newValue}
- Expected impact: [Describe expected impact]

## Implementation
The change will be implemented through the governance timelock mechanism.
    `,
    type: ProposalType.PARAMETER_CHANGE
  }),

  /**
   * Treasury allocation proposal
   */
  treasuryAllocation: (
    recipient: string,
    amount: string,
    purpose: string
  ) => ({
    title: `Treasury Allocation: ${amount} SWARM`,
    description: `
# Treasury Allocation Proposal

## Summary
Allocate ${amount} SWARM tokens from the treasury to ${recipient}.

## Purpose
${purpose}

## Details
- Recipient: ${recipient}
- Amount: ${amount} SWARM
- Funding source: Protocol Treasury

## Justification
[Provide detailed justification for this allocation]
    `,
    type: ProposalType.TREASURY_ALLOCATION
  }),

  /**
   * Agent upgrade proposal
   */
  agentUpgrade: (
    agentType: string,
    version: string,
    changes: string[]
  ) => ({
    title: `Upgrade ${agentType} Agent to v${version}`,
    description: `
# Agent Upgrade Proposal

## Summary
Upgrade the ${agentType} agent system to version ${version}.

## Changes
${changes.map(change => `- ${change}`).join('\n')}

## Benefits
- Improved performance
- Enhanced security
- New features

## Risk Assessment
[Include risk assessment and mitigation strategies]
    `,
    type: ProposalType.AGENT_UPGRADE
  })
};
