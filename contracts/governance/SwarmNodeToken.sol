// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SwarmNodeToken
 * @dev Governance token for SwarmNode Protocol with voting capabilities
 */
contract SwarmNodeToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens
    
    // Token distribution
    uint256 public constant COMMUNITY_ALLOCATION = 400_000_000 * 1e18; // 40%
    uint256 public constant TEAM_ALLOCATION = 200_000_000 * 1e18;      // 20%
    uint256 public constant TREASURY_ALLOCATION = 200_000_000 * 1e18;  // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = 100_000_000 * 1e18; // 10%
    uint256 public constant ADVISORS_ALLOCATION = 50_000_000 * 1e18;   // 5%
    uint256 public constant ECOSYSTEM_ALLOCATION = 50_000_000 * 1e18;  // 5%

    mapping(address => bool) public minters;
    mapping(address => uint256) public vestingSchedules;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensVested(address indexed beneficiary, uint256 amount);

    constructor(
        address _treasury,
        address _team,
        address _advisors
    ) ERC20("SwarmNode Token", "SWARM") ERC20Permit("SwarmNode Token") {
        // Mint initial allocations
        _mint(_treasury, TREASURY_ALLOCATION);
        _mint(_team, TEAM_ALLOCATION);
        _mint(_advisors, ADVISORS_ALLOCATION);
        _mint(address(this), COMMUNITY_ALLOCATION + LIQUIDITY_ALLOCATION + ECOSYSTEM_ALLOCATION);
    }

    /**
     * @dev Add authorized minter
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens (only authorized minters)
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "SwarmNodeToken: caller is not a minter");
        require(totalSupply() + amount <= MAX_SUPPLY, "SwarmNodeToken: exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from sender
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from account (with allowance)
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    /**
     * @dev Setup vesting schedule
     */
    function setupVesting(
        address beneficiary,
        uint256 amount,
        uint256 cliff,
        uint256 duration
    ) external onlyOwner {
        require(beneficiary != address(0), "SwarmNodeToken: zero address");
        require(amount > 0, "SwarmNodeToken: zero amount");
        require(duration > 0, "SwarmNodeToken: zero duration");
        require(cliff <= duration, "SwarmNodeToken: cliff exceeds duration");

        vestingSchedules[beneficiary] = amount;
        // Implementation would include full vesting logic
    }

    /**
     * @dev Claim vested tokens
     */
    function claimVested() external {
        uint256 vested = vestingSchedules[msg.sender];
        require(vested > 0, "SwarmNodeToken: no tokens to claim");
        
        vestingSchedules[msg.sender] = 0;
        _transfer(address(this), msg.sender, vested);
        
        emit TokensVested(msg.sender, vested);
    }

    /**
     * @dev Distribute community rewards
     */
    function distributeCommunityRewards(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "SwarmNodeToken: arrays length mismatch");
        
        for (uint i = 0; i < recipients.length; i++) {
            _transfer(address(this), recipients[i], amounts[i]);
        }
    }

    // Override required functions
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
