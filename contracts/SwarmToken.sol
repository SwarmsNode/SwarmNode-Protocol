// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SwarmToken
 * @dev ERC20 token for the SwarmNode Protocol ecosystem
 * @author SwarmNode Protocol Team
 */
contract SwarmToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Tokenomics allocation
    uint256 public constant AGENT_REWARDS_ALLOCATION = 300_000_000 * 10**18; // 30%
    uint256 public constant TEAM_ALLOCATION = 250_000_000 * 10**18; // 25%
    uint256 public constant TREASURY_ALLOCATION = 200_000_000 * 10**18; // 20%
    uint256 public constant PARTNERS_ALLOCATION = 150_000_000 * 10**18; // 15%
    uint256 public constant PRIVATE_SALE_ALLOCATION = 100_000_000 * 10**18; // 10%
    
    // Vesting
    mapping(address => VestingSchedule) public vestingSchedules;
    
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliffDuration;
    }
    
    // Events
    event TokensVested(address indexed beneficiary, uint256 amount);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    
    constructor() ERC20("SwarmNode Token", "SWARM") {
        // Mint initial supply to contract for controlled distribution
        _mint(address(this), MAX_SUPPLY);
    }
    
    /**
     * @dev Create vesting schedule for team members
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 cliffDuration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be greater than 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule already exists");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: startTime,
            duration: duration,
            cliffDuration: cliffDuration
        });
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    /**
     * @dev Release vested tokens
     */
    function releaseVestedTokens() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        
        uint256 vestedAmount = getVestedAmount(msg.sender);
        uint256 releasableAmount = vestedAmount - schedule.releasedAmount;
        
        require(releasableAmount > 0, "No tokens to release");
        
        schedule.releasedAmount += releasableAmount;
        
        require(transfer(msg.sender, releasableAmount), "Transfer failed");
        
        emit TokensVested(msg.sender, releasableAmount);
    }
    
    /**
     * @dev Calculate vested amount for beneficiary
     */
    function getVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount;
        }
        
        uint256 timeVested = block.timestamp - schedule.startTime - schedule.cliffDuration;
        uint256 vestingDuration = schedule.duration - schedule.cliffDuration;
        
        return (schedule.totalAmount * timeVested) / vestingDuration;
    }
    
    /**
     * @dev Distribute tokens for specific allocation
     */
    function distributeTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        require(transfer(to, amount), "Transfer failed");
    }
    
    /**
     * @dev Emergency pause functionality
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer functions to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers are paused");
    }
}
