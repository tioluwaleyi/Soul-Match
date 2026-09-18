const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatingEscrow", function () {
    let soulboundNFT;
    let datingEscrow;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        const SoulboundNFT = await ethers.getContractFactory("SoulboundNFT");
        soulboundNFT = await SoulboundNFT.deploy();
        await soulboundNFT.deployed();

        const DatingEscrow = await ethers.getContractFactory("DatingEscrow");
        datingEscrow = await DatingEscrow.deploy(soulboundNFT.address);
        await datingEscrow.deployed();

        // Create profiles
        await soulboundNFT.connect(addr1).createProfile("ipfs://QmTest1");
        await soulboundNFT.connect(addr2).createProfile("ipfs://QmTest2");
        await soulboundNFT.connect(addr3).createProfile("ipfs://QmTest3");

        // Transfer ownership to escrow
        await soulboundNFT.transferOwnership(datingEscrow.address);
    });

    describe("Liking and Matching", function () {

        it("Should create a like", async function () {
            await datingEscrow.connect(addr1).like(addr2.address);

            const status = await datingEscrow.getMatchStatus(
                addr1.address,
                addr2.address
            );

            expect(status).to.equal(1);
        });

        it("Should create a match when mutual likes", async function () {
            await datingEscrow.connect(addr1).like(addr2.address);
            await datingEscrow.connect(addr2).like(addr1.address);

            const status = await datingEscrow.getMatchStatus(
                addr1.address,
                addr2.address
            );

            expect(status).to.equal(2);
        });
    });
});