// contracts/SoulboundNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SoulboundNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    struct Profile {
        uint256 tokenId;
        address userAddress;
        uint256 timestamp;
        string metadataURI;
        bool isVerified;
        uint256 reputation;
    }

    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256) public userToTokenId;
    mapping(address => bool) public hasProfile;

    event ProfileCreated(address indexed user, uint256 tokenId, string metadataURI);
    event ProfileVerified(uint256 tokenId, bool verified);
    event ReputationUpdated(uint256 tokenId, uint256 newReputation);
    event ProfileBurned(address indexed user, uint256 tokenId);

    // FIX: Pass owner to Ownable constructor
    constructor() ERC721("Soulbound Dating Profile", "SDP") Ownable(msg.sender) {}

    // ===== Soulbound enforcement (OpenZeppelin v5 style) =====
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        require(from == address(0) || to == address(0), "Soulbound: non-transferable");
        return from;
    }

    
    
    // ===== Disable approvals (silence warnings by removing parameter names) =====
    function approve(address, uint256) public virtual override {
        revert("Soulbound: Cannot approve transfers");
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert("Soulbound: Cannot set approvals");
    }
    // ===== Create profile =====
    function createProfile(string memory metadataURI) external returns (uint256) {
        require(!hasProfile[msg.sender], "Profile already exists");

        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);

        profiles[newTokenId] = Profile({
            tokenId: newTokenId,
            userAddress: msg.sender,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            isVerified: false,
            reputation: 0
        });

        userToTokenId[msg.sender] = newTokenId;
        hasProfile[msg.sender] = true;

        emit ProfileCreated(msg.sender, newTokenId, metadataURI);

        return newTokenId;
    }

    // ===== Verify profile =====
    function verifyProfile(uint256 tokenId, bool verified) external onlyOwner {
        require(_existsProfile(tokenId), "Profile does not exist");

        profiles[tokenId].isVerified = verified;

        emit ProfileVerified(tokenId, verified);
    }

    // ===== Update reputation =====
    function updateReputation(uint256 tokenId, uint256 newReputation) external onlyOwner {
        require(_existsProfile(tokenId), "Profile does not exist");

        profiles[tokenId].reputation = newReputation;

        emit ReputationUpdated(tokenId, newReputation);
    }

    // ===== Burn profile (user exit) =====
    function burnProfile() external {
        uint256 tokenId = userToTokenId[msg.sender];
        require(tokenId != 0, "No profile");

        _burn(tokenId);

        delete profiles[tokenId];
        delete userToTokenId[msg.sender];
        hasProfile[msg.sender] = false;

        emit ProfileBurned(msg.sender, tokenId);
    }

    // ===== Helpers =====
    function _existsProfile(uint256 tokenId) internal view returns (bool) {
        return profiles[tokenId].userAddress != address(0);
    }

    function getProfileByAddress(address user) external view returns (Profile memory) {
        require(hasProfile[user], "Profile does not exist");
        return profiles[userToTokenId[user]];
    }

    // ===== Additional helper functions for DatingEscrow =====
    function getReputation(address user) external view returns (uint256) {
        if (!hasProfile[user]) return 0;
        return profiles[userToTokenId[user]].reputation;
    }

    function isVerified(address user) external view returns (bool) {
        if (!hasProfile[user]) return false;
        return profiles[userToTokenId[user]].isVerified;
    }
}