// contracts/DatingEscrow.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;  // Changed from 0.8.20 to 0.8.19 for consistency

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SoulboundNFT.sol";

contract DatingEscrow is Ownable, ReentrancyGuard {
    SoulboundNFT public soulboundNFT;
    
    enum EscrowStatus { Pending, Active, Completed, Disputed, Refunded }
    enum MatchStatus { None, Liked, Matched, Rejected }
    
    struct Match {
        address user1;
        address user2;
        uint256 timestamp;
        bool isActive;
    }
    
    struct Escrow {
        uint256 matchId;
        address initiator;
        address counterparty;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 meetingTime;
        string meetingProof;
    }
    
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => mapping(address => MatchStatus)) public matchStatus;
    mapping(address => uint256[]) public userMatches;
    mapping(uint256 => uint256) public matchToEscrow;
    
    uint256 public matchCounter;
    uint256 public escrowCounter;
    uint256 public escrowDuration = 7 days;
    uint256 public disputePeriod = 3 days;
    
    event Liked(address indexed from, address indexed to);
    event Matched(address indexed user1, address indexed user2, uint256 matchId);
    event EscrowCreated(uint256 indexed escrowId, uint256 indexed matchId, address initiator, uint256 amount);
    event EscrowCompleted(uint256 indexed escrowId);
    event DisputeRaised(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);
    
    // FIX: Pass owner to Ownable constructor
    constructor(address _soulboundNFT) Ownable(msg.sender) {
        soulboundNFT = SoulboundNFT(_soulboundNFT);
    }
    
    modifier hasProfile(address user) {
        require(soulboundNFT.hasProfile(user), "User must have a profile");
        _;
    }
    
    // Like another user
    function like(address to) external hasProfile(msg.sender) hasProfile(to) {
        require(msg.sender != to, "Cannot like yourself");
        
        matchStatus[msg.sender][to] = MatchStatus.Liked;
        
        // Check if it's a mutual match
        if (matchStatus[to][msg.sender] == MatchStatus.Liked) {
            _createMatch(msg.sender, to);
        }
        
        emit Liked(msg.sender, to);
    }
    
    // Internal function to create a match
    function _createMatch(address user1, address user2) internal {
        matchCounter++;
        
        matches[matchCounter] = Match({
            user1: user1,
            user2: user2,
            timestamp: block.timestamp,
            isActive: true
        });
        
        matchStatus[user1][user2] = MatchStatus.Matched;
        matchStatus[user2][user1] = MatchStatus.Matched;
        
        userMatches[user1].push(matchCounter);
        userMatches[user2].push(matchCounter);
        
        emit Matched(user1, user2, matchCounter);
    }
    
    // Create escrow for a date
    function createEscrow(
        uint256 matchId,
        uint256 meetingTime,
        uint256 amount
    ) external payable nonReentrant hasProfile(msg.sender) {
        require(matches[matchId].isActive, "Match not active");
        require(matches[matchId].user1 == msg.sender || matches[matchId].user2 == msg.sender, "Not part of match");
        require(msg.value == amount, "Incorrect amount sent");
        require(amount > 0, "Amount must be greater than 0");
        require(meetingTime > block.timestamp, "Meeting time must be in future");
        
        address counterparty = matches[matchId].user1 == msg.sender ? 
            matches[matchId].user2 : matches[matchId].user1;
        
        escrowCounter++;
        
        escrows[escrowCounter] = Escrow({
            matchId: matchId,
            initiator: msg.sender,
            counterparty: counterparty,
            amount: amount,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + escrowDuration,
            meetingTime: meetingTime,
            meetingProof: ""
        });
        
        matchToEscrow[matchId] = escrowCounter;
        
        emit EscrowCreated(escrowCounter, matchId, msg.sender, amount);
    }
    
    // Accept escrow (counterparty)
    function acceptEscrow(uint256 escrowId) external nonReentrant hasProfile(msg.sender) {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");
        require(escrow.counterparty == msg.sender, "Not the counterparty");
        require(block.timestamp < escrow.meetingTime, "Meeting time passed");
        
        escrow.status = EscrowStatus.Active;
    }
    
    // Complete escrow (both parties)
    function completeEscrow(uint256 escrowId, string memory meetingProof) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.initiator || msg.sender == escrow.counterparty, "Not authorized");
        require(block.timestamp >= escrow.meetingTime, "Meeting hasn't occurred yet");
        
        escrow.status = EscrowStatus.Completed;
        escrow.meetingProof = meetingProof;
        
        // Transfer funds to counterparty (or split logic)
        payable(escrow.counterparty).transfer(escrow.amount);
        
        // Update reputation
        _updateReputation(escrow.initiator, true);
        _updateReputation(escrow.counterparty, true);
        
        emit EscrowCompleted(escrowId);
    }
    
    // Raise dispute
    function raiseDispute(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.initiator || msg.sender == escrow.counterparty, "Not authorized");
        require(block.timestamp > escrow.meetingTime, "Meeting hasn't occurred yet");
        
        escrow.status = EscrowStatus.Disputed;
        
        emit DisputeRaised(escrowId);
    }
    
    // Resolve dispute (admin function)
    function resolveDispute(
        uint256 escrowId, 
        address winner, 
        uint256 winnerAmount
    ) external onlyOwner nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(winner == escrow.initiator || winner == escrow.counterparty, "Invalid winner");
        require(winnerAmount <= escrow.amount, "Amount too high");
        
        uint256 loserAmount = escrow.amount - winnerAmount;
        
        if (winnerAmount > 0) {
            payable(winner).transfer(winnerAmount);
        }
        
        if (loserAmount > 0) {
            address loser = winner == escrow.initiator ? escrow.counterparty : escrow.initiator;
            payable(loser).transfer(loserAmount);
        }
        
        escrow.status = EscrowStatus.Completed;
        
        // Update reputation based on dispute resolution
        _updateReputation(winner, true);
        _updateReputation(winner == escrow.initiator ? escrow.counterparty : escrow.initiator, false);
        
        emit EscrowCompleted(escrowId);
    }
    
    // Refund escrow (if counterparty never accepts)
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");
        require(msg.sender == escrow.initiator, "Only initiator can refund");
        require(block.timestamp > escrow.meetingTime, "Meeting time not passed");
        
        escrow.status = EscrowStatus.Refunded;
        
        payable(escrow.initiator).transfer(escrow.amount);
        
        emit EscrowRefunded(escrowId);
    }
    
    // Internal function to update reputation - FIXED to use getProfileByAddress
    function _updateReputation(address user, bool positive) internal {
        uint256 tokenId = soulboundNFT.userToTokenId(user);
        // FIX: Use getProfileByAddress instead of direct profiles access
        SoulboundNFT.Profile memory profile = soulboundNFT.getProfileByAddress(user);
        uint256 currentRep = profile.reputation;
        
        uint256 newRep = positive ? currentRep + 1 : (currentRep > 0 ? currentRep - 1 : 0);
        soulboundNFT.updateReputation(tokenId, newRep);
    }
    
    // Get user's active matches
    function getUserMatches(address user) external view returns (uint256[] memory) {
        return userMatches[user];
    }
    
    // Get match status between two users
    function getMatchStatus(address user1, address user2) external view returns (MatchStatus) {
        return matchStatus[user1][user2];
    }
}