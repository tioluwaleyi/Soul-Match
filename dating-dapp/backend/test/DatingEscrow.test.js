// test/SoulboundNFT.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundNFT", function () {
    let SoulboundNFT;
    let soulboundNFT;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        
        SoulboundNFT = await ethers.getContractFactory("SoulboundNFT");
        soulboundNFT = await SoulboundNFT.deploy();
        await soulboundNFT.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await soulboundNFT.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await soulboundNFT.name()).to.equal("Soulbound Dating Profile");
            expect(await soulboundNFT.symbol()).to.equal("SDP");
        });
    });

    describe("Profile Creation", function () {
        it("Should create a profile", async function () {
            const metadataURI = "ipfs://QmTest";
            
            await soulboundNFT.connect(addr1).createProfile(metadataURI);
            
            const profile = await soulboundNFT.getProfileByAddress(addr1.address);
            expect(profile.userAddress).to.equal(addr1.address);
            expect(profile.metadataURI).to.equal(metadataURI);
            expect(profile.isVerified).to.equal(false);
        });

        it("Should not allow duplicate profiles", async function () {
            await soulboundNFT.connect(addr1).createProfile("ipfs://QmTest1");
            
            await expect(
                soulboundNFT.connect(addr1).createProfile("ipfs://QmTest2")
            ).to.be.revertedWith("Profile already exists");
        });

        it("Should not allow transfers", async function () {
            await soulboundNFT.connect(addr1).createProfile("ipfs://QmTest");
            
            const tokenId = await soulboundNFT.userToTokenId(addr1.address);
            
            await expect(
                soulboundNFT.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId)
            ).to.be.revertedWith("Soulbound: Token cannot be transferred");
        });
    });

    describe("Verification", function () {
        it("Should verify profile", async function () {
            await soulboundNFT.connect(addr1).createProfile("ipfs://QmTest");
            
            const tokenId = await soulboundNFT.userToTokenId(addr1.address);
            await soulboundNFT.verifyProfile(tokenId, true);
            
            const profile = await soulboundNFT.profiles(tokenId);
            expect(profile.isVerified).to.equal(true);
        });

        it("Should only allow owner to verify", async function () {
            await soulboundNFT.connect(addr1).createProfile("ipfs://QmTest");
            
            const tokenId = await soulboundNFT.userToTokenId(addr1.address);
            
            await expect(
                soulboundNFT.connect(addr1).verifyProfile(tokenId, true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});