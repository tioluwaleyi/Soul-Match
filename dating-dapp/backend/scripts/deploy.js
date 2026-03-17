// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    console.log("Deploying SoulboundNFT contract...");
    
    const SoulboundNFT = await hre.ethers.getContractFactory("SoulboundNFT");
    const soulboundNFT = await SoulboundNFT.deploy();
    await soulboundNFT.deployed();
    
    console.log(`SoulboundNFT deployed to: ${soulboundNFT.address}`);

    console.log("Deploying DatingEscrow contract...");
    
    const DatingEscrow = await hre.ethers.getContractFactory("DatingEscrow");
    const datingEscrow = await DatingEscrow.deploy(soulboundNFT.address);
    await datingEscrow.deployed();
    
    console.log(`DatingEscrow deployed to: ${datingEscrow.address}`);
    
    // Transfer ownership of SoulboundNFT to DatingEscrow or a multi-sig
    console.log("Transferring SoulboundNFT ownership to DatingEscrow...");
    await soulboundNFT.transferOwnership(datingEscrow.address);
    
    console.log("Deployment complete!");
    
    // Save contract addresses
    const fs = require("fs");
    const config = {
        soulboundNFT: soulboundNFT.address,
        datingEscrow: datingEscrow.address,
        network: hre.network.name
    };
    
    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(config, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });